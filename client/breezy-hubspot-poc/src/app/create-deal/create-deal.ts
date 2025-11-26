import { Component, EventEmitter, OnInit, Output, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CreateDealRequest } from '../interface/create-deal-request';
import { HubSpotContact } from '../interface/hub-spot-contact';
import { ContactService } from '../services/contact-service';
import { DealService } from '../services/deal-service';

@Component({
  selector: 'app-create-deal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-deal.html',
  styleUrl: './create-deal.css',
})
export class CreateDeal {
  private dealService = inject(DealService);
  private contactService = inject(ContactService);
  private fb = inject(FormBuilder);

  @Output() dealCreated = new EventEmitter<any>();
  preSelectedContact = input<HubSpotContact | null>(null);

  dealForm: FormGroup;
  contacts = signal<HubSpotContact[]>([]);
  dealStages = signal<string[]>([]);
  loadingContacts = signal(false);
  submitting = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  constructor() {
    this.dealForm = this.fb.group({
      contactId: ['', [Validators.required]],
      dealname: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      dealstage: ['closedwon', [Validators.required]],
      pipeline: ['default']
    });
  }

  ngOnInit(): void {
    this.loadContacts();
    this.dealStages.set(this.dealService.getDealStages());
    
    const preselected = this.preSelectedContact();
    if (preselected?.id) {
        this.dealForm.patchValue({
            contactId: preselected.id
        });
    }
  }

  loadContacts(): void {
    this.loadingContacts.set(true);
    this.contactService.getContacts().subscribe({
      next: (contacts) => {
        this.contacts.set(contacts);
        this.loadingContacts.set(false);
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
        this.loadingContacts.set(false);
      }
    });
  }

  getSubscriptionTemplates(): { name: string; amount: string; stage: string }[] {
    return [
      { name: 'Breezy Premium - Monthly Subscription', amount: '9.99', stage: 'closedwon' },
      { name: 'Breezy Premium - Annual Subscription', amount: '99', stage: 'closedwon' },
      { name: 'Breezy Premium - Lifetime Access', amount: '299', stage: 'closedwon' },
      { name: 'Trial Extension - 60 Days', amount: '0', stage: 'presentationscheduled' },
      { name: 'Failed Conversion - Trial Expired', amount: '0', stage: 'closedlost' }
    ];
  }

  onSubscriptionTemplateChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedTemplate = this.getSubscriptionTemplates().find(
      template => template.name === selectElement.value
    );
    
    if (selectedTemplate) {
      this.dealForm.patchValue({
        dealname: selectedTemplate.name,
        amount: selectedTemplate.amount,
        dealstage: selectedTemplate.stage
      });
    }
  }

  formatDealStage(stage: string): string {
    return stage
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  onSubmit(): void {
    if (this.dealForm.valid) {
      this.submitting.set(true);
      this.successMessage.set('');
      this.errorMessage.set('');

      const dealData: CreateDealRequest = {
        dealProperties: {
          dealname: this.dealForm.value.dealname,
          amount: this.dealForm.value.amount,
          dealstage: this.dealForm.value.dealstage,
          pipeline: this.dealForm.value.pipeline
        },
        contactId: this.dealForm.value.contactId
      };

      this.dealService.createDeal(dealData).subscribe({
        next: (response) => {
          this.submitting.set(false);
          this.successMessage.set(
            `✅ Deal "${response.properties.dealname}" successfully created in HubSpot!`
          );
          this.dealForm.patchValue({
            dealname: '',
            amount: ''
          });
          
          setTimeout(() => {
            this.successMessage.set('');
          }, 5000);
        },
        error: (error) => {
          this.submitting.set(false);
          this.errorMessage.set(`❌ Failed to create deal: ${error.message}`);
        }
      });
    }
  }
}
