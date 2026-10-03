import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendorSidebar } from '../../../shared/layout/vendor-sidebar/vendor-sidebar';
import { VendorApiService } from '../../../shared/services/vendor-api.service';
import { AnalyticsResponse, DayBar, HourBar, ShareBar } from '../../../shared/models/api.models';

@Component({
  selector: 'app-vendor-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, VendorSidebar],
  templateUrl: './vendor-analytics.html',
})
export class VendorAnalytics implements OnInit {
  private readonly api = inject(VendorApiService);

  loading = signal(true);
  error   = signal<string | null>(null);

  period  = signal('Last 30 days');
  periods = ['Last 30 days', 'This month', 'Last 3 months', 'Year to date'];

  private _data = signal<AnalyticsResponse | null>(null);

  // ── Signals the template reads directly ───────────────────────────────────
  grossSales         = computed(() => this._data()?.grossSales         ?? 0);
  netAfterFees       = computed(() => this._data()?.netAfterFees       ?? 0);
  commissionPaid     = computed(() => this._data()?.commissionPaid     ?? 0);
  orders             = computed(() => this._data()?.orders             ?? 0);
  avgOrder           = computed(() => this._data()?.avgOrder           ?? 0);
  salesByDay         = computed((): DayBar[]   => this._data()?.salesByDay    ?? []);
  busiestHours       = computed((): HourBar[]  => this._data()?.busiestHours  ?? []);
  topProducts        = computed((): ShareBar[] => this._data()?.topProducts   ?? []);
  areas              = computed((): ShareBar[] => this._data()?.areas         ?? []);
  newCustomers       = computed(() => this._data()?.newCustomers       ?? 0);
  returningCustomers = computed(() => this._data()?.returningCustomers ?? 0);
  repeatRate         = computed(() => this._data()?.repeatRate         ?? 0);
  recurringCustomers = computed(() => this._data()?.recurringCustomers ?? 0);
  lostCustomers      = computed(() => this._data()?.lostCustomers      ?? 0);
  acceptanceRate     = computed(() => this._data()?.acceptanceRate     ?? 0);
  avgPrepTime        = computed(() => this._data()?.avgPrepTime        ?? 0);
  avgDeliveryTime    = computed(() => this._data()?.avgDeliveryTime    ?? 0);
  cancellationRate   = computed(() => this._data()?.cancellationRate   ?? 0);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.getAnalytics(this.period()).subscribe({
      next: d  => { this._data.set(d); this.loading.set(false); },
      error: () => { this.error.set('Failed to load analytics.'); this.loading.set(false); },
    });
  }

  onPeriodChange(p: string): void {
    this.period.set(p);
    this.load();
  }
}
