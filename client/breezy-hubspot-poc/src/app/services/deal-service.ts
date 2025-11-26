import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { CreateDealRequest } from '../interface/create-deal-request';
import { HubSpotDeal } from '../interface/hub-spot-deal';
import { HubSpotDealsResponse } from '../interface/hub-spot-deals-response';

@Injectable({
  providedIn: 'root',
})
export class DealService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3001/api';

  getAllDeals(): Observable<HubSpotDeal[]> {
    return this.http.get<HubSpotDealsResponse>(`${this.apiUrl}/deals`).pipe(
      map(response => (response as HubSpotDealsResponse).results || []),
      catchError(this.handleError)
    );
  }

  createDeal(dealData: CreateDealRequest): Observable<HubSpotDeal> {
    return this.http.post<HubSpotDeal>(`${this.apiUrl}/deals`, dealData).pipe(
      catchError(this.handleError)
    );
  }

  getDealsForContact(contactId: string): Observable<HubSpotDeal[]> {
    return this.http.get<HubSpotDealsResponse>(`${this.apiUrl}/contacts/${contactId}/deals`).pipe(
      map(response => (response as HubSpotDealsResponse).results || []),
      catchError(this.handleError)
    );
  }

  getDealStages(): string[] {
    return [
      'appointmentscheduled',
      'qualifiedtobuy',
      'presentationscheduled',
      'decisionmakerboughtin',
      'contractsent',
      'closedwon',
      'closedlost'
    ];
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Deal API Error:', error);
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || error.message || `Server error: ${error.status}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }  
}