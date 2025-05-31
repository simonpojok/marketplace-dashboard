import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CartWithPromotions {
  items: any[];
  subtotal: number;
  discount: number;
  shipping_discount: number;
  final_total: number;
  applied_promotions: any[];
  applied_coupon?: any;
  available_promotions: any[];
}

@Injectable({
  providedIn: 'root'
})
export class CartPromotionsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}${environment.apiVersion}`;

  private appliedCouponSubject = new BehaviorSubject<string | null>(null);
  public appliedCoupon$ = this.appliedCouponSubject.asObservable();

  getCartWithPromotions(): Observable<CartWithPromotions> {
    const couponCode = this.appliedCouponSubject.value;
    const params = couponCode ? { coupon_code: couponCode } : {};

    return this.http.get<CartWithPromotions>(`${this.apiUrl}/cart/with-promotions/`, { params });
  }

  applyCoupon(couponCode: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/cart/apply-coupon/`, { code: couponCode });
  }

  removeCoupon(): Observable<any> {
    this.appliedCouponSubject.next(null);
    return this.http.post(`${this.apiUrl}/cart/remove-coupon/`, {});
  }

  setAppliedCoupon(couponCode: string | null): void {
    this.appliedCouponSubject.next(couponCode);
  }

  getAppliedCoupon(): string | null {
    return this.appliedCouponSubject.value;
  }
}
