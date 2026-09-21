import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DayBar { day: string; pct: number; peak?: boolean; }
export interface HourBar { label: string; pct: number; orders: number; }
export interface ShareBar { label: string; pct: number; value: string; }

@Component({
  selector: 'app-vendor-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vendor-analytics.html',
})
export class VendorAnalytics {
  period = signal('Last 30 days');
  periods = ['Last 30 days', 'This month', 'Last 3 months', 'Year to date'];

  grossSales = signal(248600);
  netAfterFees = signal(208820);
  commissionPaid = signal(19888);
  orders = signal(742);
  avgOrder = signal(335);

  salesByDay = signal<DayBar[]>([
    { day: '2', pct: 44 }, { day: '3', pct: 52 }, { day: '4', pct: 38 }, { day: '5', pct: 61 },
    { day: '6', pct: 88, peak: true }, { day: '7', pct: 70 }, { day: '8', pct: 33 },
    { day: '9', pct: 48 }, { day: '10', pct: 57 }, { day: '11', pct: 45 }, { day: '12', pct: 66 },
    { day: '13', pct: 94, peak: true }, { day: '14', pct: 74 },
  ]);

  busiestHours = signal<HourBar[]>([
    { label: '6 – 9 am', pct: 42, orders: 104 },
    { label: '9 am – 12 pm', pct: 64, orders: 158 },
    { label: '12 – 3 pm', pct: 48, orders: 119 },
    { label: '3 – 6 pm', pct: 100, orders: 246 },
    { label: '6 – 8 pm', pct: 47, orders: 115 },
  ]);

  topProducts = signal<ShareBar[]>([
    { label: '20L refill', pct: 100, value: '512' },
    { label: '500ml case', pct: 31, value: '158' },
    { label: 'New jug', pct: 9, value: '47' },
    { label: 'Tank', pct: 5, value: '25' },
  ]);

  areas = signal<ShareBar[]>([
    { label: 'Kilimani', pct: 100, value: '38%' },
    { label: 'Hurlingham', pct: 63, value: '24%' },
    { label: 'Kileleshwa', pct: 50, value: '19%' },
    { label: 'Yaya', pct: 32, value: '12%' },
    { label: 'Westlands', pct: 18, value: '7%' },
  ]);

  newCustomers = signal(186);
  returningCustomers = signal(412);
  repeatRate = signal(69);
  recurringCustomers = signal(94);
  lostCustomers = signal(37);

  acceptanceRate = signal(96);
  avgPrepTime = signal(13);
  avgDeliveryTime = signal(38);
  cancellationRate = signal(3.1);
}