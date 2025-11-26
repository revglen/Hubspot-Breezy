import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../services/contact-service';
import { DealService } from '../services/deal-service';
import { CustomerAnalysis } from '../interface/customer-analysis';
import { HubSpotContact } from '../interface/hub-spot-contact';
import { HubSpotDeal } from '../interface/hub-spot-deal';
import { AiService } from '../services/ai-service';

@Component({
  selector: 'app-ai-insights',
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-insights.html',
  styleUrl: './ai-insights.css',
})
export class AiInsights {
  protected aiService = inject(AiService);
  private contactService = inject(ContactService);
  private dealService = inject(DealService);

  contacts = signal<HubSpotContact[]>([]);
  deals = signal<HubSpotDeal[]>([]);
  loading = signal(false);
  error = signal('');
  aiStatus = signal<'connected' | 'disconnected' | 'checking'>('checking');
  customerAnalysis = signal<CustomerAnalysis | null>(null);
  businessInsights = signal<any>(null);
  
  selectedAnalysisType = 'customer';
  selectedContactId = '';

  ngOnInit(): void {
    this.loadData();
    this.checkAIConnection();
  }

  async loadData(): Promise<void> {
    try {
      this.loading.set(true);
      const contacts = await this.contactService.getContacts().toPromise();
      const deals = await this.dealService.getAllDeals().toPromise();
      
      this.contacts.set(contacts || []);
      this.deals.set(deals || []);
    } catch (error) {
      console.error('Error loading data for AI analysis:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async checkAIConnection(): Promise<void> {
    try {
      this.aiStatus.set('checking');
      await this.aiService.checkAIStatus().toPromise();
      this.aiStatus.set('connected');
    } catch (error) {
      this.aiStatus.set('disconnected');
      console.error('AI service connection failed:', error);
    }
  }

  canGenerateInsights(): boolean {
    if (this.aiStatus() !== 'connected') return false;
    
    if (this.selectedAnalysisType === 'customer') {
      return !!this.selectedContactId;
    }
    
    return true;
  }

  async generateInsights(): Promise<void> {
    if (!this.canGenerateInsights()) return;

    this.loading.set(true);
    this.error.set('');
    this.customerAnalysis.set(null);
    this.businessInsights.set(null);

    try {
      if (this.selectedAnalysisType === 'customer') {
        const contact = this.contacts().find(c => c.id === this.selectedContactId);
        if (!contact) {
          throw new Error('Contact not found');
        }

        const contactDeals = this.deals().filter(deal => 
          deal.associations?.contacts?.results?.some((c: any) => c.id === contact.id)
        );

        const analysis = await this.aiService.analyseCustomerWithDeals(contact, contactDeals).toPromise();
        if (analysis) {
          this.customerAnalysis.set(analysis);
        } else {
          throw new Error('No analysis data received from server');
        }
      } else {
        const insights = await this.aiService.analyseBusinessIntelligence(this.contacts(), this.deals()).toPromise();
        if (insights) {
          this.businessInsights.set(insights);
        } else {
          throw new Error('No business insights data received from server');
        }
      }
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Failed to generate insights');
    } finally {
      this.loading.set(false);
    }
  }

  clearError(): void {
    this.error.set('');
  }

  getInsightIcon(type: string): string {
    const icons: { [key: string]: string } = {
      upsell_opportunity: '📈',
      retention_risk: '⚠️',
      expansion_opportunity: '🏠',
      loyalty_identified: '⭐'
    };
    return icons[type] || '💡';
  }

  formatInsightType(type: string): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getConfidenceLevel(confidence: number): string {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  }

  getActiveSubscriptions(deals: any[]): number {
    return deals.filter(deal => deal.properties?.dealstage === 'closedwon').length;
  }

  getTotalRevenue(deals: any[]): number {
    return deals
      .filter(deal => deal.properties?.dealstage === 'closedwon')
      .reduce((total, deal) => total + Number(deal.properties?.amount || 0), 0);
  }
}
