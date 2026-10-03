import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AnalyticsResponse,
  OfflineSaleDto,
  PayoutsResponse,
  ProductDto,
  SubscriptionResponse,
  VendorDashboardResponse,
  VendorOrderDto,
  VendorVerificationResponse,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class VendorApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/vendor`;
  /** All requests send session cookies so the backend session is shared. */
  private readonly opts = { withCredentials: true };

  // ── Dashboard ──────────────────────────────────────────────────────────────

  getDashboard(): Observable<VendorDashboardResponse> {
    return this.http.get<VendorDashboardResponse>(`${this.base}/dashboard`, this.opts);
  }

  // ── Orders ─────────────────────────────────────────────────────────────────

  getOrders(): Observable<VendorOrderDto[]> {
    return this.http.get<VendorOrderDto[]>(`${this.base}/orders`, this.opts);
  }

  getOrder(ref: string): Observable<VendorOrderDto> {
    return this.http.get<VendorOrderDto>(`${this.base}/orders/${ref}`, this.opts);
  }

  acceptOrder(ref: string): Observable<VendorOrderDto> {
    return this.http.post<VendorOrderDto>(`${this.base}/orders/${ref}/accept`, {}, this.opts);
  }

  declineOrder(ref: string): Observable<VendorOrderDto> {
    return this.http.post<VendorOrderDto>(`${this.base}/orders/${ref}/decline`, {}, this.opts);
  }

  markReady(ref: string): Observable<VendorOrderDto> {
    return this.http.post<VendorOrderDto>(`${this.base}/orders/${ref}/ready`, {}, this.opts);
  }

  assignRider(ref: string, riderName: string, riderKind: 'PLATFORM' | 'MY_STAFF'): Observable<VendorOrderDto> {
    return this.http.post<VendorOrderDto>(`${this.base}/orders/${ref}/assign-rider`,
      { riderName, riderKind }, this.opts);
  }

  markDelivered(ref: string): Observable<VendorOrderDto> {
    return this.http.post<VendorOrderDto>(`${this.base}/orders/${ref}/deliver`, {}, this.opts);
  }

  // ── Products ───────────────────────────────────────────────────────────────

  getProducts(): Observable<ProductDto[]> {
    return this.http.get<ProductDto[]>(`${this.base}/products`, this.opts);
  }

  updateStock(id: number, delta: number): Observable<ProductDto> {
    return this.http.patch<ProductDto>(`${this.base}/products/${id}/stock`, { delta }, this.opts);
  }

  updatePrice(id: number, price: number): Observable<ProductDto> {
    return this.http.patch<ProductDto>(`${this.base}/products/${id}/price`, { price }, this.opts);
  }

  togglePause(id: number): Observable<ProductDto> {
    return this.http.post<ProductDto>(`${this.base}/products/${id}/toggle-pause`, {}, this.opts);
  }

  // ── Analytics ──────────────────────────────────────────────────────────────

  getAnalytics(period = 'Last 30 days'): Observable<AnalyticsResponse> {
    const params = new HttpParams().set('period', period);
    return this.http.get<AnalyticsResponse>(`${this.base}/analytics`, { ...this.opts, params });
  }

  // ── Offline Sales ──────────────────────────────────────────────────────────

  getOfflineSales(): Observable<OfflineSaleDto[]> {
    return this.http.get<OfflineSaleDto[]>(`${this.base}/offline-sales`, this.opts);
  }

  createOfflineSale(body: {
    saleDate: string; product: string; qty: number; amount: number; channel: string;
  }): Observable<OfflineSaleDto> {
    return this.http.post<OfflineSaleDto>(`${this.base}/offline-sales`, body, this.opts);
  }

  deleteOfflineSale(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/offline-sales/${id}`, this.opts);
  }

  // ── Payouts ────────────────────────────────────────────────────────────────

  getPayouts(): Observable<PayoutsResponse> {
    return this.http.get<PayoutsResponse>(`${this.base}/payouts`, this.opts);
  }

  // ── Verification / Profile ─────────────────────────────────────────────────

  getVerification(): Observable<VendorVerificationResponse> {
    return this.http.get<VendorVerificationResponse>(`${this.base}/verification`, this.opts);
  }

  updateProfile(body: {
    businessName: string; waterSource: string; treatment: string;
    phValue: string; tdsValue: string; about: string;
  }): Observable<VendorVerificationResponse> {
    return this.http.put<VendorVerificationResponse>(`${this.base}/verification/profile`, body, this.opts);
  }

  // ── Subscription ───────────────────────────────────────────────────────────

  getSubscription(): Observable<SubscriptionResponse> {
    return this.http.get<SubscriptionResponse>(`${this.base}/subscription`, this.opts);
  }

  upgradeToPro(): Observable<SubscriptionResponse> {
    return this.http.post<SubscriptionResponse>(`${this.base}/subscription/upgrade`, {}, this.opts);
  }
}
