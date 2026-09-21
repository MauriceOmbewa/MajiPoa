import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SettlementLine {
  label: string;
  amount: number;
}

export interface PayoutRecord {
  date: string;
  period: string;
  orders: number;
  gross: number;
  deductions: number;
  paid: number;
  reference: string;
}

@Component({
  selector: 'app-vendor-payouts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vendor-payouts.html',
})
export class VendorPayouts {
  rangeOptions = ['This month', 'Last month', 'Last 3 months'];
  range = signal(this.rangeOptions[0]);

  nextPayout = signal(34180);
  pendingClearance = signal(6420);
  paidThisMonth = signal(168900);
  heldForDisputes = signal(580);

  settlement = signal<SettlementLine[]>([
    { label: 'Sales on delivered orders (112)', amount: 38940 },
    { label: 'Platform commission · 8%', amount: -3115 },
    { label: 'Delivery fees paid to platform riders', amount: -1600 },
    { label: 'Refunds you were responsible for (1)', amount: -580 },
    { label: 'Pro subscription · Sep', amount: -1500 },
    { label: 'Promotion you funded · buy 4 get 1', amount: -250 },
  ]);

  payable = computed(() => this.settlement().reduce((sum, l) => sum + l.amount, 0));

  history = signal<PayoutRecord[]>([
    { date: '11 Sep', period: '1 – 7 Sep', orders: 128, gross: 44120, deductions: 6240, paid: 37880, reference: 'SJ11P0K4TR' },
    { date: '4 Sep', period: '25 – 31 Aug', orders: 119, gross: 41300, deductions: 5880, paid: 35420, reference: 'SJ04LM88QW' },
    { date: '28 Aug', period: '18 – 24 Aug', orders: 102, gross: 36900, deductions: 5110, paid: 31790, reference: 'SH28RT21LK' },
    { date: '21 Aug', period: '11 – 17 Aug', orders: 98, gross: 35200, deductions: 4890, paid: 30310, reference: 'SH21QW99ZX' },
  ]);
}