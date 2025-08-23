import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import {environment} from '../../../../environments/environment';

export interface StoreSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  storeCurrency: string;
  storeTimeZone: string;
  enableTax: boolean;
  taxRate: number;
  enableShipping: boolean;
  flatShippingRate: number;
  enableDiscounts: boolean;
  enableProductReviews: boolean;
  orderConfirmationEmail: boolean;
  shippingConfirmationEmail: boolean;
  deliveryConfirmationEmail: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StoreSettingsService {
  private apiUrl = `${environment.apiUrl}${environment.apiVersion}/store`;

  // Cache the settings to avoid unnecessary API calls
  private cachedSettings: StoreSettings | null = null;

  constructor(private http: HttpClient) { }

  getStoreSettings(): Observable<StoreSettings> {
    // If we have cached settings, return them
    if (this.cachedSettings) {
      return of(this.cachedSettings);
    }

    // Use real API call to backend store endpoint
    return this.http.get<StoreSettings>(`${this.apiUrl}/`).pipe(
      tap(settings => this.cachedSettings = settings),
      catchError(this.handleError<StoreSettings>('getStoreSettings'))
    );
  }

  updateStoreSettings(settings: StoreSettings): Observable<any> {
    // Update the cache
    this.cachedSettings = settings;

    // Use real API call to update store settings
    return this.http.patch<any>(`${this.apiUrl}/`, settings).pipe(
      tap(_ => this.cachedSettings = settings),
      catchError(this.handleError<any>('updateStoreSettings'))
    );
  }

  // Helper method to handle HTTP errors
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result
      return of(result as T);
    };
  }

  // Method to clear the cache (useful for refreshing data)
  clearCache(): void {
    this.cachedSettings = null;
  }
}
