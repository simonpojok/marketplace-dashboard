import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
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
  private apiUrl = `${environment.apiUrl}/store/settings`;

  // Cache the settings to avoid unnecessary API calls
  private cachedSettings: StoreSettings | null = null;

  constructor(private http: HttpClient) { }

  getStoreSettings(): Observable<StoreSettings> {
    // If we have cached settings, return them
    if (this.cachedSettings) {
      return of(this.cachedSettings);
    }

    // For development purposes, we'll return mock data
    // In production, replace this with a real API call

    // Uncomment this for production use
    // return this.http.get<StoreSettings>(this.apiUrl).pipe(
    //   tap(settings => this.cachedSettings = settings),
    //   catchError(this.handleError<StoreSettings>('getStoreSettings'))
    // );

    // Mock data for development
    const mockSettings: StoreSettings = {
      storeName: 'Afrisup Market',
      storeEmail: 'info@afrisupmarket.com',
      storePhone: '+256 700 123456',
      storeAddress: 'Plot 123, Kampala Road, Kampala, Uganda',
      storeCurrency: 'UGX',
      storeTimeZone: 'Africa/Kampala',
      enableTax: true,
      taxRate: 5,
      enableShipping: true,
      flatShippingRate: 5000,
      enableDiscounts: true,
      enableProductReviews: true,
      orderConfirmationEmail: true,
      shippingConfirmationEmail: true,
      deliveryConfirmationEmail: true
    };

    this.cachedSettings = mockSettings;
    return of(mockSettings);
  }

  updateStoreSettings(settings: StoreSettings): Observable<any> {
    // Update the cache
    this.cachedSettings = settings;

    // For development purposes, we'll just return success
    // In production, replace this with a real API call

    // Uncomment this for production use
    // return this.http.put<any>(this.apiUrl, settings).pipe(
    //   tap(_ => this.cachedSettings = settings),
    //   catchError(this.handleError<any>('updateStoreSettings'))
    // );

    // Mock successful response for development
    return of({ success: true, message: 'Settings updated successfully' });
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
