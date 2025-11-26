import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactList } from '../contact-list/contact-list';
import { ContactForm } from '../contact-form/contact-form';
import { AllDeals } from '../all-deals/all-deals';
import { CreateDeal } from '../create-deal/create-deal';
import { RouterModule } from '@angular/router';
import { HubSpotContact } from '../interface/hub-spot-contact';
import { AiInsights } from '../ai-insights/ai-insights';
import { ContactService } from '../services/contact-service';
import { ActiveSubscriptions } from '../active-subscriptions/active-subscriptions';

@Component({
  selector: 'app-main-dashboard',
  imports: [
    CommonModule, 
    RouterModule, 
    ContactList, 
    ContactForm,
    AllDeals,
    CreateDeal,
    AiInsights,
    ActiveSubscriptions
  ],
  templateUrl: './main-dashboard.html',
  styleUrl: './main-dashboard.css',
})
export class MainDashboard {
  private contactService = inject(ContactService);

  activeMenu = signal<string>('contacts');
  activeSubMenu = signal<string>('');
  openMenus = signal<Set<string>>(new Set(['contacts']));
  selectedContact = signal<HubSpotContact | null>(null);
  refreshTrigger = signal(0);
  refreshingDeals = signal(false);

  ngOnInit(): void {
   
    const savedContact = this.contactService.getSelectedContact();
    if (savedContact) {
      this.selectedContact.set(savedContact);
    }
  }

  isMenuOpen(menu: string): boolean {
    return this.openMenus().has(menu);
  }

  toggleMenu(menu: string): void {
    const currentOpenMenus = new Set(this.openMenus());
    if (currentOpenMenus.has(menu)) {
      currentOpenMenus.delete(menu);
      if (this.activeMenu() === menu) {
        this.activeSubMenu.set('');
      }
    } else {
      currentOpenMenus.add(menu);
    }
    this.openMenus.set(currentOpenMenus);
    this.activeMenu.set(menu);
  }

  setActiveSubMenu(subMenu: string): void {
    this.activeSubMenu.set(subMenu);
    
    if (subMenu === 'contact-deals' && this.selectedContact()) {
      this.refreshContactDeals();
    }
  }

  onContactSelected(contact: HubSpotContact): void {
    this.selectedContact.set(contact);
    this.contactService.setSelectedContact(contact);
    
    if (this.activeSubMenu() === 'contact-deals') {
      this.refreshContactDeals();
    }
    
    this.setActiveSubMenu('contact-deals');
  }

  onContactCreated(contact: HubSpotContact): void {
    this.selectedContact.set(contact);
    this.contactService.setSelectedContact(contact);
    this.setActiveSubMenu('contact-deals');
    this.refreshContactDeals();
  }

  onDealCreated(deal: any): void {
    if (this.activeSubMenu() === 'contact-deals' || this.activeSubMenu() === 'all-deals') {
      this.refreshContactDeals();
    }
  }

  onDealsLoadingStateChange(loading: boolean): void {
    this.refreshingDeals.set(loading);
  }

  refreshContactDeals(): void {
    if (this.selectedContact()) {
      this.refreshTrigger.update(val => val + 1);
    }
  }

  getPageTitle(): string {
    switch (this.activeSubMenu()) {
      case 'show-contacts':
        return 'Show Contacts';
      case 'add-contact':
        return 'Add Contact';
      case 'contact-deals':
        return this.selectedContact() 
          ? `Deals - ${this.selectedContact()!.properties.firstname} ${this.selectedContact()!.properties.lastname}`
          : 'Contact Deals';
      case 'all-deals':
        return 'All Deals';
      case 'create-deal':
        return 'Create Deal';
      case 'ai-insights':
        return 'AI Insights';
      case 'active-subscriptions':
        return 'Active Subscriptions';
      default:
        return 'Dashboard Overview';
    }
  }

  getPageDescription(): string {
    switch (this.activeSubMenu()) {
      case 'show-contacts':
        return 'View and manage all contacts synced with HubSpot';
      case 'add-contact':
        return 'Add a new contact to sync with HubSpot';
      case 'contact-deals':
        return this.selectedContact()
          ? `View subscription deals for ${this.selectedContact()!.properties.firstname} ${this.selectedContact()!.properties.lastname}`
          : 'Select a contact to view their subscription deals';
      case 'all-deals':
        return 'View all subscription deals and revenue';
      case 'create-deal':
        return 'Convert trial customers to paid subscriptions';
      case 'ai-insights':
        return 'Get AI-powered insights about your customers and business';
      case 'active-subscriptions':
        return 'View customers with active paid subscriptions and revenue analysis';
      default:
        return 'Manage your Breezy customer data and subscriptions';
    }
  }
}
