import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService } from '../services/contact-service';
import { HubSpotContact } from '../interface/hub-spot-contact';
import { HubSpotDeal } from '../interface/hub-spot-deal';
import { DealService } from '../services/deal-service';

@Component({
  selector: 'app-contact-list',
  imports: [],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.css',
})
export class ContactList {
  private contactService = inject(ContactService);
  private dealService = inject(DealService);
  @Input() showSelection = false;

  contacts = signal<HubSpotContact[]>([]);
  loading = signal(false);
  error = signal('');
  loadingDeals = signal<{ [key: string]: boolean }>({});
  selectedContactDeals = signal<{ [key: string]: HubSpotDeal[] }>({});
  @Output() contactSelected = new EventEmitter<HubSpotContact>();

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.loading.set(true);
    this.error.set('');
    
    this.contactService.getContacts().subscribe({
      next: (contacts) => {
        console.log("Inside...")
        console.log(contacts.length)
        this.contacts.set(contacts);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(error.message);
        this.loading.set(false);
      }
    });
  } 

  selectContact(contact: HubSpotContact): void {
    this.contactSelected.emit(contact);
  }

  toggleDeals(contact: HubSpotContact): void {
    if (!contact.id) return;

    console.log(contact);
    console.log("11111");
    
    const currentDeals = this.selectedContactDeals();

      console.log("22222");
    
     if (currentDeals[contact.id]) {
      const newDeals = { ...currentDeals };
      delete newDeals[contact.id];
      this.selectedContactDeals.set(newDeals);
      return;
    }

    console.log("33333");
    this.loadingDeals.update(loading => ({ ...loading, [contact.id!]: true }));
    
    this.dealService.getDealsForContact(contact.id).subscribe({
      next: (deals: any) => {
        console.log("44444");
        console.log(deals)
        this.selectedContactDeals.update(current => ({ 
          ...current, 
          [contact.id!]: deals 
        }));
        this.loadingDeals.update(loading => ({ ...loading, [contact.id!]: false }));
      },
      error: (error: any) => {
        console.error('Error loading deals:', error);
        this.loadingDeals.update(loading => ({ ...loading, [contact.id!]: false }));
      }
    });
  }
}

