import { Component, inject, signal } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { ContactService } from '../services/contact-service';
import { HubSpotContact } from '../interface/hub-spot-contact';

// Ireland phone validation function
function irelandPhoneValidator(control: AbstractControl): { [key: string]: any } | null {
  if (!control.value) {
    return null; 
  }
  
  const phoneRegex = /^(\+353|0)(\s?[1-9]{1}[\d\s]{8,9})$/;
  const isValid = phoneRegex.test(control.value.replace(/\s/g, ''));  
  return isValid ? null : { irelandPhone: true };
}

@Component({
  selector: 'app-contact-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.css',
})
export class ContactForm {
  private contactService = inject(ContactService);
  private fb = inject(FormBuilder);
  @Output() contactCreated = new EventEmitter<HubSpotContact>();

  contactForm: FormGroup;
  submitting = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  constructor() {
    this.contactForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [irelandPhoneValidator]],
      address: ['']
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.submitting.set(true);
      this.successMessage.set('');
      this.errorMessage.set('');

      const contactData: HubSpotContact = {
        properties: {
          firstname: this.contactForm.value.firstname,
          lastname: this.contactForm.value.lastname,
          email: this.contactForm.value.email,
          phone: this.contactForm.value.phone || undefined,
          address: this.contactForm.value.address || undefined
        }
      };

      this.contactService.createContact(contactData).subscribe({
        next: (response) => {
          this.submitting.set(false);
          this.successMessage.set(
            `Customer ${response.properties.firstname} ${response.properties.lastname} has been successfully registered and synced to HubSpot.`
          );

          this.contactForm.reset();
          this.contactCreated.emit(response);
          
          setTimeout(() => {
            this.successMessage.set('');
          }, 5000);
        },
        error: (error) => {
          this.submitting.set(false);
          this.errorMessage.set(`Failed to sync customer to HubSpot: ${error.message}. Please try again.`);
        }
      });
    } else {
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }

  onReset(): void {
    this.contactForm.reset();
    this.successMessage.set('');
    this.errorMessage.set('');
  }
}
