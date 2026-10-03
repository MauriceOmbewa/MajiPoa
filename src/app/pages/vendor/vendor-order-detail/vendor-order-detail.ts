import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { VendorSidebar } from '../../../shared/layout/vendor-sidebar/vendor-sidebar';
import { VendorApiService } from '../../../shared/services/vendor-api.service';
import { VendorOrderDto, OrderLineDto } from '../../../shared/models/api.models';

export interface RailStep { label: string; detail: string; state: 'done' | 'now' | 'upcoming'; }

@Component({
  selector: 'app-vendor-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, VendorSidebar],
  templateUrl: './vendor-order-detail.html',
})
export class VendorOrderDetail implements OnInit {
  private readonly api   = inject(VendorApiService);
  private readonly route = inject(ActivatedRoute);

  loading = signal(true);
  error   = signal<string | null>(null);

  private _order = signal<VendorOrderDto | null>(null);
  private _ref   = '';

  // ── Signals the template reads directly ───────────────────────────────────

  /** The order reference shown in the header, e.g. "#WM10248" */
  orderId = computed(() => this._order()?.orderRef ?? '—');

  /** Human-readable status label for the badge */
  status = computed(() => {
    const s = this._order()?.status;
    if (!s) return '—';
    return s === 'COMPLETED' ? 'Delivered'
         : s === 'OUT_FOR_DELIVERY' ? 'On the way'
         : s === 'PREPARING' ? 'Preparing'
         : s === 'READY' ? 'Ready'
         : s === 'CANCELLED' ? 'Cancelled'
         : 'New';
  });

  /** Line items */
  lines = computed((): LineRow[] =>
    (this._order()?.lines ?? []).map(l => ({
      product: l.productName,
      note:    l.note ?? null,
      qty:     l.qty,
      unit:    l.unitPrice,
    }))
  );

  orderTotal    = computed(() => this.lines().reduce((s, l) => s + l.qty * l.unit, 0));

  /** Plain numbers — NOT signals, so template accesses them as properties, not calls */
  readonly deliveryFee     = 80;
  readonly commissionRate  = 0.08;

  commission  = computed(() => Math.round(this.orderTotal() * this.commissionRate * 100) / 100);
  entitlement = computed(() => this.orderTotal() - this.deliveryFee - this.commission());

  rail = signal<RailStep[]>([]);

  ngOnInit(): void {
    this._ref = this.route.snapshot.queryParamMap.get('ref') ?? '';
    if (!this._ref) {
      // Fall back to latest order if no ref provided
      this.api.getOrders().subscribe({
        next: orders => {
          if (orders.length) {
            this._ref = orders[0].orderRef;
            this.loadOrder();
          } else {
            this.error.set('No order reference provided.');
            this.loading.set(false);
          }
        },
        error: () => { this.error.set('Failed to load order.'); this.loading.set(false); },
      });
      return;
    }
    this.loadOrder();
  }

  private loadOrder(): void {
    this.api.getOrder(this._ref).subscribe({
      next: o => {
        this._order.set(o);
        this.rail.set(this.buildRail(o));
        this.loading.set(false);
      },
      error: () => { this.error.set('Failed to load order.'); this.loading.set(false); },
    });
  }

  private buildRail(o: VendorOrderDto): RailStep[] {
    const done = (statuses: string[]) => statuses.includes(o.status);
    return [
      { label: 'Accepted',         detail: o.placedAgo,                    state: done(['PREPARING','READY','OUT_FOR_DELIVERY','COMPLETED']) ? 'done' : 'now' },
      { label: 'Prepared',         detail: 'Ready for pickup',              state: done(['READY','OUT_FOR_DELIVERY','COMPLETED']) ? 'done' : o.status === 'PREPARING' ? 'now' : 'upcoming' },
      { label: 'Picked up',        detail: o.riderName ?? '—',             state: done(['OUT_FOR_DELIVERY','COMPLETED']) ? 'done' : 'upcoming' },
      { label: 'Out for delivery', detail: o.deliveryStage?.replace(/_/g,' ').toLowerCase() ?? '—', state: o.status === 'OUT_FOR_DELIVERY' ? 'now' : o.status === 'COMPLETED' ? 'done' : 'upcoming' },
      { label: 'Delivered',        detail: 'Rider confirms with customer',  state: o.status === 'COMPLETED' ? 'done' : 'upcoming' },
    ];
  }

  markDelivered(): void {
    this.api.markDelivered(this._ref).subscribe({
      next: o => { this._order.set(o); this.rail.set(this.buildRail(o)); },
    });
  }

  lineTotal(l: LineRow): number { return l.qty * l.unit; }

  pipClasses(state: RailStep['state']): string {
    if (state === 'done') return 'bg-[#12946A] border-[#12946A] text-white';
    if (state === 'now')  return 'border-[#1877D2] text-[#1877D2] shadow-[0_0_0_5px_#E8F2FC]';
    return 'border-[#DBE7F1] text-[#5E7489] bg-white';
  }
}

/** Local shape matching what the template expects */
interface LineRow { product: string; note: string | null; qty: number; unit: number; }
