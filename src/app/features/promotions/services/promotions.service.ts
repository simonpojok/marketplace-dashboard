import {Injectable, inject} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {
  Campaign,
  CampaignListResponse,
  CampaignCreateRequest,
  CampaignFilterParams,
} from '../models/campaign.model';
import {CampaignAnalytics} from '../models/promotion-usage.model';
import {
  Coupon,
  CouponCreateRequest,
  CouponListResponse,
  CouponValidationRequest,
  CouponValidationResponse
} from '../models/coupon.model';
import {Promotion, PromotionCreateRequest, PromotionListResponse} from '../models/promotion.model';

@Injectable({
  providedIn: 'root'
})
export class PromotionsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}${environment.apiVersion}/promotions`;

  // Campaign methods
  getCampaigns(params?: CampaignFilterParams): Observable<CampaignListResponse> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key as keyof CampaignFilterParams] !== undefined &&
          params[key as keyof CampaignFilterParams] !== null) {
          httpParams = httpParams.set(key, String(params[key as keyof CampaignFilterParams]));
        }
      });
    }

    return this.http.get<CampaignListResponse>(`${this.apiUrl}/campaigns/`, {params: httpParams});
  }

  getCampaign(id: string): Observable<Campaign> {
    return this.http.get<Campaign>(`${this.apiUrl}/campaigns/${id}/`);
  }

  createCampaign(data: CampaignCreateRequest): Observable<Campaign> {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      const value = data[key as keyof CampaignCreateRequest];
      if (value !== undefined && value !== null) {
        if (key === 'banner_image' && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    return this.http.post<Campaign>(`${this.apiUrl}/campaigns/`, formData);
  }

  updateCampaign(id: string, data: Partial<CampaignCreateRequest>): Observable<Campaign> {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      const value = data[key as keyof CampaignCreateRequest];
      if (value !== undefined && value !== null) {
        if (key === 'banner_image' && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    return this.http.patch<Campaign>(`${this.apiUrl}/campaigns/${id}/`, formData);
  }

  deleteCampaign(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/campaigns/${id}/`);
  }

  activateCampaign(id: string): Observable<{ message: string; campaign: Campaign }> {
    return this.http.post<{ message: string; campaign: Campaign }>(
      `${this.apiUrl}/campaigns/${id}/activate/`, {}
    );
  }

  deactivateCampaign(id: string): Observable<{ message: string; campaign: Campaign }> {
    return this.http.post<{ message: string; campaign: Campaign }>(
      `${this.apiUrl}/campaigns/${id}/deactivate/`, {}
    );
  }

  getCampaignAnalytics(id: string): Observable<CampaignAnalytics> {
    return this.http.get<CampaignAnalytics>(`${this.apiUrl}/campaigns/${id}/analytics/`);
  }

  getActiveCampaigns(): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(`${this.apiUrl}/campaigns/active/`);
  }

  getFeaturedCampaigns(): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(`${this.apiUrl}/campaigns/featured/`);
  }

  // Promotion methods
  getPromotions(campaignId?: string): Observable<PromotionListResponse> {
    let httpParams = new HttpParams();
    if (campaignId) {
      httpParams = httpParams.set('campaign', campaignId);
    }

    return this.http.get<PromotionListResponse>(`${this.apiUrl}/promotions/`, {params: httpParams});
  }

  getPromotion(id: string): Observable<Promotion> {
    return this.http.get<Promotion>(`${this.apiUrl}/promotions/${id}/`);
  }

  createPromotion(data: PromotionCreateRequest): Observable<Promotion> {
    return this.http.post<Promotion>(`${this.apiUrl}/promotions/`, data);
  }

  updatePromotion(id: string, data: Partial<PromotionCreateRequest>): Observable<Promotion> {
    return this.http.patch<Promotion>(`${this.apiUrl}/promotions/${id}/`, data);
  }

  deletePromotion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/promotions/${id}/`);
  }

  // Coupon methods
  getCoupons(campaignId?: string): Observable<CouponListResponse> {
    let httpParams = new HttpParams();
    if (campaignId) {
      httpParams = httpParams.set('campaign', campaignId);
    }

    return this.http.get<CouponListResponse>(`${this.apiUrl}/coupons/`, {params: httpParams});
  }

  getCoupon(id: string): Observable<Coupon> {
    return this.http.get<Coupon>(`${this.apiUrl}/coupons/${id}/`);
  }

  createCoupon(data: CouponCreateRequest): Observable<Coupon> {
    return this.http.post<Coupon>(`${this.apiUrl}/coupons/`, data);
  }

  createBulkCoupons(data: Partial<{
    campaign: string;
    count: number;
    coupon_type?: string;
    max_uses?: number;
    max_uses_per_user?: number;
    prefix?: string;
  }>): Observable<{ message: string; coupons: Coupon[] }> {
    return this.http.post<{ message: string; coupons: Coupon[] }>(
      `${this.apiUrl}/coupons/generate-bulk/`, data
    );
  }

  updateCoupon(id: string, data: Partial<CouponCreateRequest>): Observable<Coupon> {
    return this.http.patch<Coupon>(`${this.apiUrl}/coupons/${id}/`, data);
  }

  deleteCoupon(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/coupons/${id}/`);
  }

  // Public methods (for customers)
  getPublicCampaigns(): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(`${this.apiUrl}/campaigns/`);
  }

  getPublicActiveCampaigns(): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(`${this.apiUrl}/campaigns/active/`);
  }

  validateCoupon(data: CouponValidationRequest): Observable<CouponValidationResponse> {
    return this.http.post<CouponValidationResponse>(`${this.apiUrl}/coupons/validate/`, data);
  }
}
