import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RiderLayoutComponent } from '../rider-layout/rider-layout';

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

@Component({
  selector: 'app-earnings',
  standalone: true,
  imports: [CommonModule, RiderLayoutComponent],
  templateUrl: './earnings.html',
  styleUrl: './earnings.scss',
})
export class Earnings {
  rangeOptions: RangeOption[] = [
    { label: 'This week', value: 'this-week' },
    { label: 'Last week', value: 'last-week' },
    { label: 'This month', value: 'this-month' },
  ];

  selectedRange = signal('this-week');

  summary = signal<EarningsSummary>({
    weekTotal: 7840,
    weekDeliveries: 78,
    payoutDay: 'Friday',
    payoutPhone: '0798 221 004',
    avgPerDelivery: 100,
    avgDeltaVsLastWeek: 6,
  });

  weeklyBreakdown = signal<WeeklyEarningDay[]>([
    { day: 'Mon', date: '14', deliveries: 16, distanceKm: 38, base: 1520, bonus: 0, total: 1520 },
    { day: 'Tue', date: '15', deliveries: 14, distanceKm: 31, base: 1240, bonus: 100, total: 1340 },
    { day: 'Wed', date: '16', deliveries: 15, distanceKm: 34, base: 1440, bonus: 0, total: 1440 },
    { day: 'Thu', date: '17', deliveries: 18, distanceKm: 42, base: 1760, bonus: 200, total: 1960 },
    { day: 'Fri', date: '18', deliveries: 15, distanceKm: 36, base: 1480, bonus: 100, total: 1580 },
  ]);

  weekTotalFromBreakdown = computed(() =>
    this.weeklyBreakdown().reduce((sum, d) => sum + d.total, 0)
  );

  pastPayouts = signal<PastPayout[]>([
    { date: '11 Sep', period: '1 – 7 Sep', deliveries: 81, amount: 8120, mpesaRef: 'SJ11MK22PQ', status: 'Paid' },
    { date: '4 Sep', period: '25 – 31 Aug', deliveries: 74, amount: 7280, mpesaRef: 'SJ04NN81WE', status: 'Paid' },
    { date: '28 Aug', period: '18 – 24 Aug', deliveries: 69, amount: 6900, mpesaRef: 'SH28TT19AS', status: 'Paid' },
  ]);

  onRangeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedRange.set(value);
    // TODO: refetch summary / weeklyBreakdown for the selected range from the API
  }
}