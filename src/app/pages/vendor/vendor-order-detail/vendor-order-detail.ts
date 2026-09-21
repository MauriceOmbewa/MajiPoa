import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VendorSidebar } from '../../../shared/layout/vendor-sidebar/vendor-sidebar';

export interface RailStep {
  label: string;
  detail: string;
  state: 'done' | 'now' | 'upcoming';
}

export interface OrderLine {
  product: string;
  note?: string;
  qty: number;
  unit: number;
}

@Component({
  selector: 'app-vendor-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, VendorSidebar],
  templateUrl: './vendor-order-detail.html',
})
export class VendorOrderDetail {
  orderId = signal('#WM10248');
  status = signal<'On the way' | 'Delivered'>('On the way');

  lines = signal<OrderLine[]>([
    { product: '20L refill — hard jug', note: 'Customer returns 2 empty jugs', qty: 2, unit: 250 },
    { product: '500ml bottled water — case of 24', qty: 1, unit: 620 },
  ]);

  lineTotal(l: OrderLine): number {
    return l.qty * l.unit;
  }

  orderTotal = computed(() => this.lines().reduce((sum, l) => sum + this.lineTotal(l), 0));

  deliveryFee = signal(80);
  commissionRate = signal(0.08);
  commission = computed(() => Math.round(this.orderTotal() * this.commissionRate() * 100) / 100);
  entitlement = computed(() => this.orderTotal() - this.deliveryFee() - this.commission());

  rail = signal<RailStep[]>([
    { label: 'Accepted', detail: '3:44 pm · by you', state: 'done' },
    { label: 'Prepared', detail: '3:58 pm · batch AW-0915-B recorded', state: 'done' },
    { label: 'Picked up', detail: '4:11 pm · James Kariuki, platform rider', state: 'done' },
    { label: 'Out for delivery', detail: '8 min from the customer', state: 'now' },
    { label: 'Delivered', detail: 'Rider confirms with the customer', state: 'upcoming' },
  ]);

  markDelivered(): void {
    this.rail.update(steps =>
      steps.map((s, i) => i === steps.length - 1 ? { ...s, state: 'done', detail: 'Just now' }
                         : i === steps.length - 2 ? { ...s, state: 'done' } : s)
    );
    this.status.set('Delivered');
  }

  pipClasses(state: RailStep['state']): string {
    if (state === 'done') return 'bg-[#12946A] border-[#12946A] text-white';
    if (state === 'now') return 'border-[#1877D2] text-[#1877D2] shadow-[0_0_0_5px_#E8F2FC]';
    return 'border-[#DBE7F1] text-[#5E7489] bg-white';
  }
}