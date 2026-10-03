import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VendorSidebar } from '../../../shared/layout/vendor-sidebar/vendor-sidebar';
import { VendorApiService } from '../../../shared/services/vendor-api.service';
import { IncomingOrderDto, ActiveOrderDto } from '../../../shared/models/api.models';

/** Adapter shape — what the HTML template accesses */
interface IncomingRow { orderRef: string; items: string; area: string; total: number; minutesAgo: number; }
interface ActiveRow   { orderRef: string; items: string; area: string; stage: string; }

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, VendorSidebar],
  templateUrl: './vendor-dashboard.html',
})
export class VendorDashboard implements OnInit {
  private readonly api = inject(VendorApiService);

  loading  = signal(true);
  error    = signal<string | null>(null);

  salesToday     = signal(0);
  ordersToday    = signal(0);
  completedToday = signal(0);
  jugsInStock    = signal(0);
  jugsCapacity   = signal(24);
  incoming       = signal<IncomingRow[]>([]);
  active         = signal<ActiveRow[]>([]);

  stockPct    = computed(() => this.jugsCapacity() > 0
    ? Math.round((this.jugsInStock() / this.jugsCapacity()) * 100) : 0);
  needsAction = computed(() => this.incoming().length);

  ngOnInit(): void {
    this.api.getDashboard().subscribe({
      next: d => {
        this.salesToday.set(d.salesToday);
        this.ordersToday.set(d.ordersToday);
        this.completedToday.set(d.completedToday);
        this.jugsInStock.set(d.jugsInStock);
        this.jugsCapacity.set(d.jugsCapacity);
        this.incoming.set(d.incoming.map(o => ({
          orderRef: o.orderRef, items: o.items,
          area: o.area, total: o.total, minutesAgo: o.minutesAgo,
        })));
        this.active.set(d.active.map(o => ({
          orderRef: o.orderRef, items: o.items, area: o.area, stage: o.stage,
        })));
        this.loading.set(false);
      },
      error: () => { this.error.set('Failed to load dashboard.'); this.loading.set(false); },
    });
  }

  accept(orderRef: string): void {
    this.api.acceptOrder(orderRef).subscribe({
      next: updated => {
        this.incoming.update(list => list.filter(o => o.orderRef !== orderRef));
        this.active.update(list => [{
          orderRef: updated.orderRef,
          items: updated.lines.map(l => `${l.qty} × ${l.productName}`).join(', ') || '—',
          area: updated.area,
          stage: 'Preparing',
        }, ...list]);
      },
    });
  }

  decline(orderRef: string): void {
    this.api.declineOrder(orderRef).subscribe({
      next: () => this.incoming.update(list => list.filter(o => o.orderRef !== orderRef)),
    });
  }

  stageClasses(stage: string): string {
    return stage === 'On the way'
      ? 'bg-[#E8F2FC] text-[#1464B4] border-[#c9e0f7]'
      : 'bg-[#FDF1DE] text-[#C77A11] border-[#f2ddb8]';
  }
}
