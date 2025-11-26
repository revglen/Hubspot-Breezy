import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { HubSpotContact } from '../interface/hub-spot-contact';
import { HubSpotContactsResponse } from '../interface/hub-spot-contacts-response';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  getContactDeals(id: string) {
    throw new Error('Method not implemented.');
  }
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3001/api';
  private selectedContact = signal<HubSpotContact | null>(null);

  getContacts(): Observable<HubSpotContact[]> {
    return this.http.get<HubSpotContactsResponse>(`${this.apiUrl}/contacts`).pipe(
      map(response => (response as HubSpotContactsResponse).results || []),
      catchError(this.handleError)
    );
  }

  createContact(contact: HubSpotContact): Observable<HubSpotContact> {
    return this.http.post<HubSpotContact>(`${this.apiUrl}/contacts`, contact).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || error.message || `Server error: ${error.status}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }  

  setSelectedContact(contact: HubSpotContact): void {
    this.selectedContact.set(contact);
  }

  getSelectedContact(): HubSpotContact | null {
    return this.selectedContact();
  }

  clearSelectedContact(): void {
    this.selectedContact.set(null);
  }
}
