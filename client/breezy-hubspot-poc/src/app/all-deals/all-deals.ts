import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DealService  } from '../services/deal-service';
import { HubSpotDeal } from '../interface/hub-spot-deal';

@Component({
  selector: 'app-all-deals',
  imports: [],
  templateUrl: './all-deals.html',
  styleUrl: './all-deals.css',
})
export class AllDeals {
  private dealService = inject(DealService);

  deals = signal<HubSpotDeal[]>([]);
  loading = signal(false);
  error = signal('');

  ngOnInit(): void {
    this.loadDeals();
  }

  loadDeals(): void {
    this.loading.set(true);
    this.error.set('');
    
    this.dealService.getAllDeals().subscribe({
      next: (deals) => {
        this.deals.set(deals);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(error.message);
        this.loading.set(false);
      }
    });
  }

  getDealStageClass(stage: string = ''): string {
    switch (stage) {
      case 'closedwon':
        return 'closed-won';
      case 'closedlost':
        return 'closed-lost';
      case 'contractsent':
      case 'decisionmakerboughtin':
        return 'in-progress';
      default:
        return 'early-stage';
    }
  }

  formatDealStage(stage: string = ''): string {
    return stage
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getTotalDeals(): number {
    return this.deals().length;
  }

  getTotalRevenue(): number {
    return this.deals()
      .filter(deal => deal.properties.dealstage === 'closedwon')
      .reduce((total, deal) => total + Number(deal.properties.amount || 0), 0);
  }

  getClosedWonDeals(): number {
    return this.deals().filter(deal => deal.properties.dealstage === 'closedwon').length;
  }
}
