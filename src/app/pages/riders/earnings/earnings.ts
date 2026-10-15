import { Component, signal, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { catchError, forkJoin, of, switchMap, tap } from 'rxjs';
import { RiderLayoutComponent } from '../rider-layout/rider-layout';
import {
  RiderApiService,
  EarningsDto,
  EarningsDayDto,
  PayoutDto,
} from '../../../shared/services/rider-api';

export interface EarningsSummary {
  weekTotal: number;
  weekDeliveries: number;
  payoutDay: string;
  payoutPhone: string;
  avgPerDelivery: number;
  avgDeltaVsLastWeek: number;
}

export interface WeeklyEarningDay {
  day: string;
  date: string;
  deliveries: number;
  distanceKm: number;
  base: number;
  bonus: number;
  total: number;
}

export type PayoutStatus = 'Paid' | 'Pending' | 'Failed';

export interface PastPayout {
  date: string;
  period: string;
  deliveries: number;
  amount: number;
  mpesaRef: string;
  status: PayoutStatus;
}

interface RangeOption {
  label: string;
  value: string;
}

const EMPTY_SUMMARY: EarningsSummary = {
  weekTotal: 0,
  weekDeliveries: 0,
  payoutDay: '',
  payoutPhone: '',
  avgPerDelivery: 0,
  avgDeltaVsLastWeek: 0,
};

@Component({
  selector: 'app-earnings',
  standalone: true,
  imports: [CommonModule, RiderLayoutComponent],
  templateUrl: './earnings.html',
  styleUrl: './earnings.scss',
})
export class Earnings {
  private api = inject(RiderApiService);

  rangeOptions: RangeOption[] = [
    { label: 'This week', value: 'this-week' },
    { label: 'Last week', value: 'last-week' },
    { label: 'This month', value: 'this-month' },
  ];

  selectedRange = signal('this-week');

  summary = signal<EarningsSummary>(EMPTY_SUMMARY);
  weeklyBreakdown = signal<WeeklyEarningDay[]>([]);
  pastPayouts = signal<PastPayout[]>([]);
  bonusRule = signal('Bonus: KSh 100 for every 10 deliveries completed on time in a day.');
  loading = signal(true);
  error = signal<string | null>(null);

  /** "This week" / "Last week" / "This month", following the dropdown. */
  rangeLabel = computed(
    () => this.rangeOptions.find((o) => o.value === this.selectedRange())?.label ?? 'This week'
  );

  weekTotalFromBreakdown = computed(() =>
    this.weeklyBreakdown().reduce((sum, d) => sum + d.total, 0)
  );

  constructor() {
    toObservable(this.selectedRange)
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap((range) =>
          forkJoin({
            earnings: this.api.earnings(0, range),
            // the M-Pesa number lives on the profile; don't fail the page if it can't load
            profile: this.api.profile(0).pipe(catchError(() => of(null))),
          }).pipe(
            catchError(() => {
              this.error.set('Could not load your earnings. Please try again.');
              return of(null);
            })
          )
        ),
        takeUntilDestroyed()
      )
      .subscribe((res) => {
        this.loading.set(false);
        if (res) {
          this.toState(res.earnings, res.profile?.mpesaNumber ?? '');
        }
      });
  }

  onRangeChange(event: Event): void {
    this.selectedRange.set((event.target as HTMLSelectElement).value);
  }

  // ---- mapping -------------------------------------------------------------

  private toState(res: EarningsDto, phone: string): void {
    const days = (res.days ?? []).map((d) => this.toDay(d));
    const deliveries = days.reduce((s, d) => s + d.deliveries, 0);
    const total = res.total ?? 0;

    this.summary.set({
      weekTotal: total,
      weekDeliveries: deliveries,
      // backend sends "Friday 6 pm"; the template adds the time itself, so keep only the day
      payoutDay: (res.nextPayout ?? '').split(' ')[0],
      payoutPhone: this.formatPhone(phone),
      avgPerDelivery: deliveries ? Math.round(total / deliveries) : 0,
      avgDeltaVsLastWeek: 0, // backend doesn't send it, so the "vs last week" line stays hidden
    });
    this.weeklyBreakdown.set(days);
    this.bonusRule.set(res.bonusRule || this.bonusRule());
    this.pastPayouts.set((res.pastPayouts ?? []).map((p) => this.toPayout(p)));
  }

  private toDay(d: EarningsDayDto): WeeklyEarningDay {
    const dt = new Date(d.date + 'T00:00:00');
    return {
      day: dt.toLocaleDateString('en-KE', { weekday: 'short' }),
      date: String(dt.getDate()),
      deliveries: d.deliveries,
      distanceKm: d.distanceKm,
      base: d.base,
      bonus: d.bonus,
      total: d.total,
    };
  }

  private toPayout(p: PayoutDto): PastPayout {
    return {
      date: this.shortDate(p.paidAt ?? p.periodEnd),
      period: this.periodLabel(p.periodStart, p.periodEnd),
      deliveries: p.deliveries ?? 0,
      amount: p.amount,
      mpesaRef: p.mpesaReference ?? '—',
      status: this.toStatus(p.status),
    };
  }

  private toStatus(s: string): PayoutStatus {
    switch ((s ?? '').toUpperCase()) {
      case 'PAID': return 'Paid';
      case 'FAILED': return 'Failed';
      default: return 'Pending';
    }
  }

  private shortDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
  }

  private periodLabel(startIso: string, endIso: string): string {
    const s = new Date(startIso + 'T00:00:00');
    const e = new Date(endIso + 'T00:00:00');
    const month = (d: Date) => d.toLocaleDateString('en-KE', { month: 'short' });
    return s.getMonth() === e.getMonth()
      ? `${s.getDate()} – ${e.getDate()} ${month(e)}`
      : `${s.getDate()} ${month(s)} – ${e.getDate()} ${month(e)}`;
  }

  /** 0798221004 -> "0798 221 004" (leaves anything else as it is) */
  private formatPhone(p: string): string {
    const digits = (p ?? '').replace(/\s/g, '');
    return /^0\d{9}$/.test(digits)
      ? `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
      : digits;
  }
}