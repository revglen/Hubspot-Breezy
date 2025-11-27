import { Component, OnInit, inject, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DealService } from '../services/deal-service';
import { HubSpotContact } from '../interface/hub-spot-contact';
import { HubSpotDeal } from '../interface/hub-spot-deal';
import { ContactService } from '../services/contact-service';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-contact-deals',
  imports: [CommonModule],
  templateUrl: './contact-deals.html',
  styleUrl: './contact-deals.css',
})
export class ContactDeals {
  private dealService = inject(DealService);
  private contactService = inject(ContactService);
  @Output() dealCreated = new EventEmitter<any>();

  contact = input.required<HubSpotContact>();
  refreshTrigger = input(0); 
  loadingStateChange = output<boolean>();

  deals = signal<HubSpotDeal[]>([]);
  loading = signal(false);
  error = signal('');

  ngOnInit(): void {
    this.loadDeals();
  }

  ngOnChanges(changes: any): void {
    if (changes.refreshTrigger && !changes.refreshTrigger.firstChange) {
      this.loadDeals();
    }
    if (changes.contact && !changes.contact.firstChange) {
      this.loadDeals();
    }
  }

  loadDeals(): void {
    const contactId = this.contact().id;
    if (!contactId) return;

    this.loading.set(true);
    this.error.set('');
    this.loadingStateChange.emit(true);
    
    this.dealService.getDealsForContact(contactId).subscribe({
      next: (deals) => {
        this.deals.set(deals);
        this.loading.set(false);
        this.loadingStateChange.emit(false);
      },
      error: (error) => {
        this.error.set(error.message);
        this.loading.set(false);
        this.loadingStateChange.emit(false);
      }
    });
  }

  getDealStageClass(stage: string = ''): string {
    switch (stage) {
      case 'closedwon':
        return 'closed-won';
      case 'closedlost':
        return 'closed-lost';
      default:
        return 'in-progress';
    }
  }

  formatDealStage(stage: string = ''): string {
    return stage
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  }

  getTotalRevenue(): number {
    return this.deals()
      .filter(deal => deal.properties.dealstage === 'closedwon')
      .reduce((total, deal) => total + Number(deal.properties.amount || 0), 0);
  }

  getActiveSubscriptions(): number {
    return this.deals().filter(deal => deal.properties.dealstage === 'closedwon').length;
  }

  getMonthlyRevenue(): number {
    const monthlyDeals = this.deals().filter(deal => 
      deal.properties.dealstage === 'closedwon' && 
      deal.properties.dealname?.includes('Monthly')
    );
    return monthlyDeals.reduce((total, deal) => total + Number(deal.properties.amount || 0), 0);
  }

  getConversionRate(): number {
    const totalDeals = this.deals().length;
    const wonDeals = this.getActiveSubscriptions();
    return totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0;
  }

  viewDealDetails(deal: HubSpotDeal): void {
    console.log('View deal details:', deal);
    alert(`Deal Details:\nName: ${deal.properties.dealname}\nAmount: $${deal.properties.amount}\nStage: ${deal.properties.dealstage}`);
  }

  navigateToCreateDeal(): void {
    this.contactService.setSelectedContact(this.contact());
    console.log('Navigate to create deal for contact:', this.contact());
  }
}
