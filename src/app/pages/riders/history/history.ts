import { Component, signal, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap, tap } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar';
import { RiderApiService, HistoryItemDto } from '../../../shared/services/rider-api';

export type HistoryRangeFilter = 'today' | 'week' | 'month' | 'all';

export interface CompletedTrip {
  id: number;
  dateLabel: string;
  timeLabel: string;
  orderId: string;
  fromLabel: string;
  toLabel: string;
  distanceKm: number;
  durationMin: number;
  earned: number;
  rating: number | null;
}

@Component({
  selector: 'app-rider-history',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './history.html',
  styleUrl: './history.scss'
})
export class History {
  private api = inject(RiderApiService);

  searchTerm = signal('');
  activeRange = signal<HistoryRangeFilter>('week');

  rangeOptions: { label: string; value: HistoryRangeFilter }[] = [
    { label: 'Today', value: 'today' },
    { label: 'This week', value: 'week' },
    { label: 'This month', value: 'month' },
    { label: 'All time', value: 'all' }
  ];

  trips = signal<CompletedTrip[]>([]);
  totalTrips = signal(0);
  totalEarned = signal(0);
  averageRating = signal<number | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  private query = computed(() => ({
    period: this.activeRange(),
    q: this.searchTerm().trim()
  }));

  constructor() {
    toObservable(this.query)
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => a.period === b.period && a.q === b.q),
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap((p) =>
          this.api.history(0, p.period, p.q).pipe(
            catchError(() => {
              this.error.set('Could not load your delivery history. Please try again.');
              return of(null);
            })
          )
        ),
        takeUntilDestroyed()
      )
      .subscribe((res) => {
        this.loading.set(false);
        if (!res) {
          this.trips.set([]);
          this.totalTrips.set(0);
          this.totalEarned.set(0);
          this.averageRating.set(null);
          return;
        }
        this.trips.set(res.items.map((i) => this.toTrip(i)));
        this.totalTrips.set(res.deliveries);
        this.totalEarned.set(res.totalEarned);
        this.averageRating.set(res.averageRating);
      });
  }

  setRange(range: HistoryRangeFilter): void {
    this.activeRange.set(range);
  }

  ratingStars(rating: number | null): string[] {
    const r = rating ?? 0;
    return Array.from({ length: 5 }, (_, i) => (i < r ? '★' : '☆'));
  }

  openTrip(trip: CompletedTrip): void {
    // TODO: navigate to a trip detail view, or open a modal with full trip info
  }

  private toTrip(i: HistoryItemDto): CompletedTrip {
    const d = new Date(i.deliveredAt);
    return {
      id: i.id,
      dateLabel: this.dateLabel(d),
      timeLabel: d
        .toLocaleTimeString('en-KE', { hour: 'numeric', minute: '2-digit', hour12: true })
        .toLowerCase(),
      orderId: '#' + i.orderNumber,
      fromLabel: i.vendorName,
      toLabel: i.dropoffArea,
      distanceKm: i.distanceKm,
      durationMin: i.durationMinutes,
      earned: i.earned,
      rating: i.rating
    };
  }

  private dateLabel(d: Date): string {
    const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const days = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86_400_000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
  }
}