import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HubSpotContact } from '../interface/hub-spot-contact';
import { HubSpotDeal } from '../interface/hub-spot-deal';
import { ContactService } from '../services/contact-service';
import { DealService } from '../services/deal-service';
import { CustomerWithSubscriptions } from '../interface/customer-with-subscriptions';

@Component({
  selector: 'app-active-subscriptions',
  imports: [CommonModule, FormsModule],
  templateUrl: './active-subscriptions.html',
  styleUrl: './active-subscriptions.css',
})
export class ActiveSubscriptions {
  private contactService = inject(ContactService);
  private dealService = inject(DealService);

  contacts = signal<HubSpotContact[]>([]);
  contactsLoading = signal(false);
  subscriptionsLoading = signal(false);
  error = signal('');
  selectedCustomerId = signal<string>('');
  selectedCustomer = signal<HubSpotContact | null>(null);
  customerSubscription = signal<CustomerWithSubscriptions | null>(null);

  ngOnInit(): void {
    this.loadContacts();
  }

  async loadContacts(): Promise<void> {
    this.contactsLoading.set(true);
    this.error.set('');

    try {
      const contacts = await this.contactService.getContacts().toPromise();
      this.contacts.set(contacts || []);
    } catch (error) {
      this.error.set('Failed to load customers');
      console.error('Error loading contacts:', error);
    } finally {
      this.contactsLoading.set(false);
    }
  }

  async onCustomerSelected(): Promise<void> {
    const customerId = this.selectedCustomerId();
    if (!customerId) {
      this.selectedCustomer.set(null);
      this.customerSubscription.set(null);
      return;
    }

    this.subscriptionsLoading.set(true);
    this.error.set('');

    try {
      // Find the selected customer
      const customer = this.contacts().find(c => c.id === customerId);
      if (!customer) {
        throw new Error('Selected customer not found');
      }

      this.selectedCustomer.set(customer);

      // Load deals for this customer
      const deals = await this.dealService.getDealsForContact(customerId).toPromise();
      
      // Filter for active subscriptions (closedwon deals)
      const activeSubscriptions = (deals || []).filter(deal => 
        deal.properties?.dealstage === 'closedwon'
      );

      // Calculate total monthly revenue
      const totalMonthlyRevenue = activeSubscriptions.reduce((total, subscription) => {
        return total + Number(subscription.properties?.amount || 0);
      }, 0);

      this.customerSubscription.set({
        contact: customer,
        activeSubscriptions,
        totalMonthlyRevenue
      });

    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Failed to load subscription data');
      this.customerSubscription.set(null);
    } finally {
      this.subscriptionsLoading.set(false);
    }
  }

  formatDealStage(stage: string | undefined): string {
    if (!stage) return 'Unknown';
    
    return stage
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  clearError(): void {
    this.error.set('');
  }

  viewDealDetails(deal: HubSpotDeal): void {
    // In a real app, this would navigate to deal details
    console.log('View deal details:', deal);
    alert(`Deal Details:\nName: ${deal.properties?.dealname}\nAmount: $${deal.properties?.amount}\nStage: ${deal.properties?.dealstage}`);
  }

  manageSubscription(deal: HubSpotDeal): void {
    // In a real app, this would open a management modal
    console.log('Manage subscription:', deal);
    alert(`Managing subscription: ${deal.properties?.dealname}`);
  }

  createNewSubscription(): void {
    const customer = this.selectedCustomer();
    if (!customer) return;

    // In a real app, this would navigate to create deal page with customer pre-selected
    console.log('Create new subscription for:', customer);
    alert(`Create new subscription for: ${customer.properties?.firstname} ${customer.properties?.lastname}`);
  }

  viewAllDeals(): void {
    const customer = this.selectedCustomer();
    if (!customer) return;

    // In a real app, this would navigate to all deals for this customer
    console.log('View all deals for:', customer);
    alert(`View all deals for: ${customer.properties?.firstname} ${customer.properties?.lastname}`);
  }

  contactCustomer(): void {
    const customer = this.selectedCustomer();
    if (!customer) return;

    // In a real app, this would open email or contact modal
    console.log('Contact customer:', customer);
    alert(`Contact: ${customer.properties?.firstname} ${customer.properties?.lastname} at ${customer.properties?.email}`);
  }
}
