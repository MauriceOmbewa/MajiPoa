import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VendorSidebar } from '../../../shared/layout/vendor-sidebar/vendor-sidebar';

export type OrderStatus = 'New' | 'Preparing' | 'Ready' | 'Out for delivery' | 'Completed' | 'Cancelled';

export interface VendorOrder {
  id: string;
  placed: string;
  items: string;
  customer: string;
  area: string;
  distanceKm: number;
  payment: 'Paid' | 'Invoiced' | 'Refunded';
  total: number;
  status: OrderStatus;
}

@Component({
  selector: 'app-vendor-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, VendorSidebar],
  templateUrl: './vendor-orders.html',
})
export class VendorOrders {
  search = signal('');
  activeTab = signal<OrderStatus>('New');

  tabs: OrderStatus[] = ['New', 'Preparing', 'Ready', 'Out for delivery', 'Completed', 'Cancelled'];

  orders = signal<VendorOrder[]>([
    { id: '#WM10262', placed: '2 min ago', items: '2 × 20L refill', customer: 'John Mwangi', area: 'Kilimani', distanceKm: 1.4, payment: 'Paid', total: 580, status: 'New' },
    { id: '#WM10261', placed: '6 min ago', items: '1 × 500ml case', customer: 'Sarah N.', area: 'Westlands', distanceKm: 5.2, payment: 'Paid', total: 700, status: 'New' },
    { id: '#WM10259', placed: '9 min ago', items: '4 × 20L refill', customer: 'Acme Ltd', area: 'Hurlingham', distanceKm: 2.1, payment: 'Invoiced', total: 1240, status: 'New' },
    { id: '#WM10254', placed: '22 min ago', items: '3 × 20L refill', customer: 'Kevin M.', area: 'Yaya', distanceKm: 0.8, payment: 'Paid', total: 830, status: 'Preparing' },
    { id: '#WM10251', placed: '41 min ago', items: '1 × 20L soft', customer: 'Sarah W.', area: 'Westlands', distanceKm: 5.0, payment: 'Paid', total: 370, status: 'Out for delivery' },
    { id: '#WM10248', placed: '1 hr ago', items: '2 × 20L, 1 case', customer: 'Maurice O.', area: 'Kilimani', distanceKm: 1.2, payment: 'Paid', total: 1120, status: 'Out for delivery' },
    { id: '#WM10240', placed: '2 hr ago', items: '1 × 20L refill', customer: 'Grace W.', area: 'Kileleshwa', distanceKm: 3.4, payment: 'Paid', total: 330, status: 'Completed' },
    { id: '#WM10233', placed: '3 hr ago', items: '2 × 20L refill', customer: 'Peter K.', area: 'Kilimani', distanceKm: 1.9, payment: 'Refunded', total: 0, status: 'Cancelled' },
  ]);

  counts = computed(() => {
    const c: Record<OrderStatus, number> = { New: 0, Preparing: 0, Ready: 0, 'Out for delivery': 0, Completed: 0, Cancelled: 0 };
    this.orders().forEach(o => c[o.status]++);
    return c;
  });

  filtered = computed(() => {
    const term = this.search().toLowerCase().trim();
    return this.orders()
      .filter(o => o.status === this.activeTab())
      .filter(o => !term || o.id.toLowerCase().includes(term) || o.customer.toLowerCase().includes(term));
  });

  setTab(tab: OrderStatus): void {
    this.activeTab.set(tab);
  }

  accept(id: string): void {
    this.orders.update(list => list.map(o => o.id === id ? { ...o, status: 'Preparing' } : o));
  }

  decline(id: string): void {
    this.orders.update(list => list.map(o => o.id === id ? { ...o, status: 'Cancelled' } : o));
  }

  paymentClasses(p: VendorOrder['payment']): string {
    if (p === 'Paid') return 'bg-[#E3F5EE] text-[#12946A] border-[#c5e8da]';
    if (p === 'Invoiced') return 'bg-[#E8F2FC] text-[#1464B4] border-[#c9e0f7]';
    return 'bg-[#FCECEB] text-[#D6453C] border-[#f3cecb]';
  }

  statusClasses(s: OrderStatus): string {
    switch (s) {
      case 'New': return 'bg-[#FDF1DE] text-[#C77A11] border-[#f2ddb8]';
      case 'Preparing': return 'bg-[#E8F2FC] text-[#1464B4] border-[#c9e0f7]';
      case 'Ready': return 'bg-[#E8F2FC] text-[#1464B4] border-[#c9e0f7]';
      case 'Out for delivery': return 'bg-[#E8F2FC] text-[#1464B4] border-[#c9e0f7]';
      case 'Completed': return 'bg-[#E3F5EE] text-[#12946A] border-[#c5e8da]';
      case 'Cancelled': return 'bg-[#FCECEB] text-[#D6453C] border-[#f3cecb]';
    }
  }
}