import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError, from } from 'rxjs';
import { CustomerAnalysis } from '../interface/customer-analysis';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3001/api';

  // Method to analyse customer data and generate insights
  analyseCustomerWithDeals(contact: any, deals: any[]): Observable<CustomerAnalysis> {
    return this.http.post<CustomerAnalysis>(`${this.apiUrl}/ai/analyse-customer`, {
      contact,
      deals
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Method to analyse all customers for business intelligence
  analyseBusinessIntelligence(contacts: any[], deals: any[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ai/analyse-business`, {
      contacts,
      deals
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Check if AI service is available
  checkAIStatus(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ai/status`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('AI Service Error:', error);
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.error?.message || error.error?.message || error.message || `Server error: ${error.status}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
