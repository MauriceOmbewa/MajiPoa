import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VendorSidebar } from '../../../shared/layout/vendor-sidebar/vendor-sidebar';
import { VendorApiService } from '../../../shared/services/vendor-api.service';
import { VendorOrderDto, OrderStatus, PaymentStatus } from '../../../shared/models/api.models';

// Display labels for backend enum values
const STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: 'New', PREPARING: 'Preparing', READY: 'Ready',
  OUT_FOR_DELIVERY: 'Out for delivery', COMPLETED: 'Completed', CANCELLED: 'Cancelled',
};

@Component({
  selector: 'app-vendor-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, VendorSidebar],
  templateUrl: './vendor-orders.html',
})
export class VendorOrders implements OnInit {
  private readonly api = inject(VendorApiService);

  loading = signal(true);
  error   = signal<string | null>(null);
  search  = signal('');
  activeTab = signal<OrderStatus>('NEW');

  readonly tabs: OrderStatus[] = ['NEW', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'];
  readonly tabLabels = STATUS_LABELS;

  orders = signal<VendorOrderDto[]>([]);

  counts = computed(() => {
    const c = {} as Record<OrderStatus, number>;
    this.tabs.forEach(t => c[t] = 0);
    this.orders().forEach(o => c[o.status]++);
    return c;
  });

  filtered = computed(() => {
    const term = this.search().toLowerCase().trim();
    return this.orders()
      .filter(o => o.status === this.activeTab())
      .filter(o => !term || o.orderRef.toLowerCase().includes(term) || o.customerName?.toLowerCase().includes(term));
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.getOrders().subscribe({
      next: orders => { this.orders.set(orders); this.loading.set(false); },
      error: () => { this.error.set('Failed to load orders.'); this.loading.set(false); },
    });
  }

  setTab(tab: OrderStatus): void { this.activeTab.set(tab); }

  accept(ref: string): void {
    this.api.acceptOrder(ref).subscribe({
      next: updated => this.orders.update(list => list.map(o => o.orderRef === ref ? updated : o)),
    });
  }

  decline(ref: string): void {
    this.api.declineOrder(ref).subscribe({
      next: updated => this.orders.update(list => list.map(o => o.orderRef === ref ? updated : o)),
    });
  }

  itemsSummary(order: VendorOrderDto): string {
    return order.lines.map(l => `${l.qty} × ${l.productName}`).join(', ');
  }

  paymentClasses(p: PaymentStatus): string {
    if (p === 'PAID')     return 'bg-[#E3F5EE] text-[#12946A] border-[#c5e8da]';
    if (p === 'INVOICED') return 'bg-[#E8F2FC] text-[#1464B4] border-[#c9e0f7]';
    return 'bg-[#FCECEB] text-[#D6453C] border-[#f3cecb]';
  }

  statusClasses(s: OrderStatus): string {
    switch (s) {
      case 'NEW':             return 'bg-[#FDF1DE] text-[#C77A11] border-[#f2ddb8]';
      case 'PREPARING':       return 'bg-[#E8F2FC] text-[#1464B4] border-[#c9e0f7]';
      case 'READY':           return 'bg-[#E8F2FC] text-[#1464B4] border-[#c9e0f7]';
      case 'OUT_FOR_DELIVERY':return 'bg-[#E8F2FC] text-[#1464B4] border-[#c9e0f7]';
      case 'COMPLETED':       return 'bg-[#E3F5EE] text-[#12946A] border-[#c5e8da]';
      case 'CANCELLED':       return 'bg-[#FCECEB] text-[#D6453C] border-[#f3cecb]';
    }
  }

  statusLabel(s: OrderStatus): string { return STATUS_LABELS[s]; }
  paymentLabel(p: PaymentStatus): string {
    return p === 'PAID' ? 'Paid' : p === 'INVOICED' ? 'Invoiced' : 'Refunded';
  }
}
