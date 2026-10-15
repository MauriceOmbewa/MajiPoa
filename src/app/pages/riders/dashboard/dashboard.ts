import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {  Observable, Subject, catchError, interval, merge, of, switchMap, timer } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar';
import { RiderApiService, DashboardDto } from '../../../shared/services/rider-api';

@Component({
  selector: 'app-rider-today',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  private api = inject(RiderApiService);
  private router = inject(Router);

  private refresh$ = new Subject<void>();
  private expiredFor: number | null = null;

  data = signal<DashboardDto | null>(null);
  loading = signal(true);
  loadError = signal<string | null>(null);
  actionError = signal<string | null>(null);
  acting = signal(false);

  // drives the offer countdown
  private now = signal(Date.now());
  private receivedAt = signal(Date.now());

  // ---- values the template reads ------------------------------------------

  isAvailable = computed(() => this.data()?.online ?? false);

  statusText = computed(() => {
    switch (this.data()?.status) {
      case 'AVAILABLE': return 'Available';
      case 'BUSY': return 'Busy';
      default: return 'Offline';
    }
  });

  earnedToday = computed(() => this.data()?.earnedToday ?? 0);
  deliveriesToday = computed(() => this.data()?.deliveriesToday ?? 0);

  onlineDuration = computed(() => {
    const d = this.data();
    if (!d || !d.onlineSince) return '—';
    const h = Math.floor(d.onlineMinutes / 60);
    const m = d.onlineMinutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  });

  onlineSince = computed(() => {
    const iso = this.data()?.onlineSince;
    return iso ? this.timeLabel(iso) : '—';
  });

  rating = computed(() => {
    const r = this.data()?.rating;
    return r == null ? '—' : String(r);
  });

  ratingSampleLabel = computed(() => {
    const n = this.data()?.ratingSampleSize ?? 0;
    return n > 0 ? `Last ${n} deliveries` : 'No ratings yet';
  });

  currentOffer = computed(() => {
    const o = this.data()?.currentOffer;
    if (!o) return null;
    return {
      id: o.deliveryId,
      price: o.fee,
      distanceKm: o.totalDistanceKm,
      etaMin: o.estimatedMinutes,
      tags: [
        ...o.items.map((i) => `${i.quantity} × ${i.name}`),
        ...(o.heavyLoad ? ['Heavy load'] : [])
      ],
      pickupName: o.vendorName,
      pickupLocation: o.pickupAddress,
      pickupDistanceKm: o.distanceToPickupKm,
      dropoffName: o.customerName,
      dropoffLocation: o.dropoffArea ?? '',
      dropoffDistanceKm: o.pickupToDropoffKm
    };
  });

  offerSecondsLeft = computed(() => {
    const o = this.data()?.currentOffer;
    if (!o) return 0;
    const elapsed = Math.floor((this.now() - this.receivedAt()) / 1000);
    return Math.max(0, o.secondsLeft - elapsed);
  });

  offerExpiresLabel = computed(() => {
    const s = this.offerSecondsLeft();
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  });

  currentDelivery = computed(() => {
    const d = this.data()?.currentDelivery;
    if (!d) return null;
    return {
      orderId: '#' + d.orderNumber,
      from: d.vendorName,
      to: d.dropoffArea ?? '',
      status: d.statusLabel,
      itemsLabel: d.items.map((i) => `${i.quantity} × ${i.name}`).join(', '),
      etaMin: d.etaMinutes,
      price: d.fee
    };
  });

  completedToday = computed(() =>
    (this.data()?.completedToday ?? []).map((c) => ({
      id: c.id,
      time: this.timeLabel(c.deliveredAt),
      orderId: '#' + c.orderNumber,
      from: c.vendorName,
      to: c.dropoffArea ?? '',
      distanceKm: c.distanceKm,
      earned: c.earned
    }))
  );

  constructor() {
    // load now, then every 15 s, and whenever an action asks for a refresh
    merge(timer(0, 15000), this.refresh$)
      .pipe(
        switchMap(() => this.api.dashboard(0).pipe(catchError(() => of(null)))),
        takeUntilDestroyed()
      )
      .subscribe((d) => {
        this.loading.set(false);
        if (!d) {
          // keep showing the last good data if a background refresh fails
          if (!this.data()) this.loadError.set('Could not load your dashboard. Please try again.');
          return;
        }
        this.loadError.set(null);
        this.data.set(d);
        this.receivedAt.set(Date.now());
      });

    // one-second tick for the countdown; refresh once when an offer runs out
    interval(1000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.now.set(Date.now());
        const offer = this.data()?.currentOffer;
        if (offer && this.offerSecondsLeft() === 0 && this.expiredFor !== offer.deliveryId) {
          this.expiredFor = offer.deliveryId;
          this.refresh$.next();
        }
      });
  }

  retry(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.refresh$.next();
  }

  // ---- actions ------------------------------------------------------------

  toggleAvailability(): void {
    this.run(this.api.setStatus(0, !this.isAvailable()), 'Could not change your availability');
  }

  acceptOffer(): void {
    const offer = this.data()?.currentOffer;
    if (!offer) return;
    this.acting.set(true);
    this.actionError.set(null);
    this.api.accept(0, offer.deliveryId).subscribe({
      next: () => {
        this.acting.set(false);
        this.router.navigateByUrl('/riders/active-delivery');
      },
      error: (err) => {
        this.acting.set(false);
        this.actionError.set(this.errorMessage(err, 'Could not accept this delivery'));
        this.refresh$.next(); // the offer may have expired
      }
    });
  }

  declineOffer(): void {
    const offer = this.data()?.currentOffer;
    if (!offer) return;
    this.run(this.api.decline(0, offer.deliveryId), 'Could not decline this delivery');
  }

  openCurrentDelivery(): void {
    this.router.navigateByUrl('/riders/active-delivery');
  }

  // ---- helpers ------------------------------------------------------------

private run(call: Observable<unknown>, fallback: string): void {
  this.acting.set(true);
  this.actionError.set(null);
  call.subscribe({
    next: () => {
      this.acting.set(false);
      this.refresh$.next();
    },
    error: (err: any) => {
      this.acting.set(false);
      this.actionError.set(this.errorMessage(err, fallback));
      this.refresh$.next();
    }
  });
  }

  private timeLabel(iso: string): string {
    return new Date(iso)
      .toLocaleTimeString('en-KE', { hour: 'numeric', minute: '2-digit', hour12: true })
      .toLowerCase();
  }

  private errorMessage(err: any, fallback: string): string {
    return err?.error?.message || err?.error?.error || fallback;
  }
}