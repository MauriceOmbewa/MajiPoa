import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendorSidebar } from '../../../shared/layout/vendor-sidebar/vendor-sidebar';
import { VendorApiService } from '../../../shared/services/vendor-api.service';
import { PayoutsResponse, SettlementLine, PayoutRecordDto } from '../../../shared/models/api.models';

/** Shape the template reads for each payout row */
interface PayoutRow {
  date:       string;
  period:     string;
  orders:     number;
  gross:      number;
  deductions: number;
  paid:       number;
  reference:  string;
}

@Component({
  selector: 'app-vendor-payouts',
  standalone: true,
  imports: [CommonModule, FormsModule, VendorSidebar],
  templateUrl: './vendor-payouts.html',
})
export class VendorPayouts implements OnInit {
  private readonly api = inject(VendorApiService);

  loading = signal(true);
  error   = signal<string | null>(null);
  Math    = Math;

  rangeOptions = ['This month', 'Last month', 'Last 3 months'];
  range        = signal(this.rangeOptions[0]);

  private _data = signal<PayoutsResponse | null>(null);

  // ── Signals the template reads directly ───────────────────────────────────
  nextPayout        = computed(() => this._data()?.nextPayout        ?? 0);
  pendingClearance  = computed(() => this._data()?.pendingClearance  ?? 0);
  paidThisMonth     = computed(() => this._data()?.paidThisMonth     ?? 0);
  heldForDisputes   = computed(() => this._data()?.heldForDisputes   ?? 0);
  settlement        = computed((): SettlementLine[] => this._data()?.settlement ?? []);
  payable           = computed(() => this._data()?.payable           ?? 0);
  history           = computed((): PayoutRow[] =>
    (this._data()?.history ?? []).map(p => ({
      date:       this.fmtDate(p.paidOn),
      period:     `${this.fmtDate(p.periodStart)} – ${this.fmtDate(p.periodEnd)}`,
      orders:     p.orders,
      gross:      p.gross,
      deductions: p.deductions,
      paid:       p.paid,
      reference:  p.reference,
    }))
  );

  ngOnInit(): void {
    this.api.getPayouts().subscribe({
      next: d  => { this._data.set(d); this.loading.set(false); },
      error: () => { this.error.set('Failed to load payouts.'); this.loading.set(false); },
    });
  }

  private fmtDate(d: string | null | undefined): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }
}
