import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';



// ---- history -------------------------------------------------------------

export interface HistoryItemDto {
  id: number;
  deliveredAt: string;          // ISO, e.g. "2026-10-15T15:18:00"
  orderNumber: string;          // stored without "#", e.g. "WM10240"
  vendorName: string;
  dropoffArea: string;
  distanceKm: number;
  durationMinutes: number;
  earned: number;
  rating: number | null;        // null until the customer rates
}

export interface HistoryDto {
  deliveries: number;
  totalEarned: number;
  averageRating: number | null; // null if nothing is rated yet
  items: HistoryItemDto[];
}

// ---- earnings ------------------------------------------------------------

export interface EarningsDayDto {
  date: string;                 // "2026-10-15"
  deliveries: number;
  distanceKm: number;
  base: number;
  bonus: number;
  total: number;
}

export interface PayoutDto {
  id: number;
  periodStart: string;          // "2026-09-01"
  periodEnd: string;
  deliveries: number;
  amount: number;
  status: string;               // PAID | PENDING | FAILED
  paidAt: string | null;
  mpesaReference: string | null;
}

export interface EarningsDto {
  period: string;
  from: string;
  to: string;
  days: EarningsDayDto[];
  total: number;
  nextPayout: string;           // e.g. "Friday 6 pm"
  bonusRule: string;
  pastPayouts: PayoutDto[];
}
// ---- profile -------------------------------------------------------------

export interface ProfileDto {
  id: number;
  riderCode: string;            // "RDR-0001"
  fullName: string;
  phone: string | null;
  email: string | null;
  vehicleType: string | null;
  plateNumber: string | null;
  capacity: number | null;
  mpesaNumber: string | null;
  verified: boolean;
  online: boolean;
  status: string;               // AVAILABLE | BUSY | OFFLINE
  memberSince: string | null;   // "2026-10-15"
  rating: number | null;
  totalDeliveries: number;
  onTimeRate: number;           // 0-100
  notifyNewOrders: boolean;
  notifyPayouts: boolean;
  notifySms: boolean;
}

export interface ProfileUpdateRequest {
  fullName: string;
  phone: string;
  email: string | null;
  vehicleType: string;
  plateNumber: string;
  capacity: number;
  mpesaNumber: string | null;
  notifyNewOrders: boolean;
  notifyPayouts: boolean;
  notifySms: boolean;
}

// ---- dashboard -----------------------------------------------------------

export interface ItemDto {
  id: number;
  quantity: number;
  name: string;
  note: string | null;
  checked: boolean;
}

export interface OfferDto {
  deliveryId: number;
  orderNumber: string;
  fee: number;
  totalDistanceKm: number;
  estimatedMinutes: number;
  heavyLoad: boolean;
  items: ItemDto[];
  vendorName: string;
  pickupAddress: string;
  distanceToPickupKm: number;
  customerName: string;
  dropoffArea: string;
  pickupToDropoffKm: number;
  expiresAt: string;
  secondsLeft: number;
}

export interface ActiveDeliverySummaryDto {
  id: number;
  orderNumber: string;
  status: string;
  statusLabel: string;
  vendorName: string;
  dropoffArea: string | null;
  distanceRemainingKm: number;
  etaMinutes: number;
  fee: number;
  items: ItemDto[];
}

export interface CompletedDto {
  id: number;
  deliveredAt: string;
  orderNumber: string;
  vendorName: string;
  dropoffArea: string | null;
  distanceKm: number;
  durationMinutes: number;
  earned: number;
  rating: number | null;
}

export interface DashboardDto {
  status: string;               // AVAILABLE | BUSY | OFFLINE
  online: boolean;
  riderName: string;
  earnedToday: number;
  deliveriesToday: number;
  onlineMinutes: number;
  onlineSince: string | null;
  rating: number | null;
  ratingSampleSize: number;
  currentOffer: OfferDto | null;
  currentDelivery: ActiveDeliverySummaryDto | null;
  completedToday: CompletedDto[];
}
/**
 * The backend works out which rider this is from the login session, so every call goes to
 * /api/riders/me/... The first `_id` argument is ignored. It is only kept so pages that still
 * pass an id keep compiling; remove it from the callers when you tidy up.
 */
@Injectable({ providedIn: 'root' })
export class RiderApiService {
  private http = inject(HttpClient);

  // apiUrl has no /api suffix, so it is added here.
  private base = () => `${environment.apiUrl}/api/riders/me`;

 dashboard(_id: number): Observable<DashboardDto> {
  return this.http.get<DashboardDto>(`${this.base()}/dashboard`);
}
  // 204 = no active delivery, so observe the full response
  activeDelivery(_id: number) {
    return this.http.get<any>(`${this.base()}/active-delivery`, { observe: 'response' });
  }

  accept(_id: number, deliveryId: number) {
  return this.http.post<any>(`${this.base()}/deliveries/${deliveryId}/accept`, {});
}

  
decline(_id: number, deliveryId: number) {
  return this.http.post<void>(`${this.base()}/deliveries/${deliveryId}/decline`, {});
}

  advance(_id: number, deliveryId: number, status: string) {
    return this.http.post<any>(`${this.base()}/deliveries/${deliveryId}/advance`, { status });
  }

  checkItem(_id: number, deliveryId: number, itemId: number, checked: boolean) {
    return this.http.patch<any>(`${this.base()}/deliveries/${deliveryId}/items/${itemId}`, { checked });
  }

  updateLocation(_id: number, latitude: number, longitude: number) {
    return this.http.put<void>(`${this.base()}/location`, { latitude, longitude });
  }

  /** period = today | week | month | all. q matches order number, vendor or area. */
  history(_id: number, period: string, q: string = ''): Observable<HistoryDto> {
    let params = new HttpParams().set('period', period);
    const search = q.trim();
    if (search) {
      params = params.set('q', search);
    }
    return this.http.get<HistoryDto>(`${this.base()}/history`, { params });
  }

  /** range = this-week | last-week | this-month */
  earnings(_id: number, range: string): Observable<EarningsDto> {
    return this.http.get<EarningsDto>(`${this.base()}/earnings`, { params: { range } });
  }

  // shared so the sidebar and the Profile page always show the same rider
currentProfile = signal<ProfileDto | null>(null);

profile(_id: number): Observable<ProfileDto> {
  return this.http
    .get<ProfileDto>(`${this.base()}/profile`)
    .pipe(tap((p) => this.currentProfile.set(p)));
}

saveProfile(_id: number, body: ProfileUpdateRequest): Observable<ProfileDto> {
  return this.http
    .put<ProfileDto>(`${this.base()}/profile`, body)
    .pipe(tap((p) => this.currentProfile.set(p)));
}

setStatus(_id: number, online: boolean): Observable<ProfileDto> {
  return this.http
    .put<ProfileDto>(`${this.base()}/status`, { online })
    .pipe(tap((p) => this.currentProfile.set(p)));
}

/** Same endpoint as the "Switch Role" request in Postman. */
switchRole(role: string) {
  return this.http.post<any>(`${environment.apiUrl}/api/auth/role`, { role });
}

/** ASSUMPTION: Spring Security's default POST /logout. */
logout() {
  return this.http.post(`${environment.apiUrl}/logout`, {}, { responseType: 'text' });
}
}