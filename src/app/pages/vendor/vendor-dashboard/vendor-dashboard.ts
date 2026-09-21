import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VendorSidebar } from '../../../shared/layout/vendor-sidebar/vendor-sidebar';

export interface IncomingOrder {
  id: string; items: string; area: string; distanceKm: number; total: number; minutesAgo: number;
}
export interface ActiveOrder {
  id: string; items: string; area: string; stage: 'On the way' | 'Rider assigned' | 'Preparing';
}

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, VendorSidebar],
  templateUrl: './vendor-dashboard.html',
})
export class VendorDashboard {
  salesToday = signal(8420);
  ordersToday = signal(38);
  completedToday = signal(32);

  incoming = signal<IncomingOrder[]>([
    { id: '#WM10262', items: '2 × 20L refill', area: 'Kilimani, 1.4 km', distanceKm: 1.4, total: 580, minutesAgo: 2 },
    { id: '#WM10261', items: '1 × 500ml case', area: 'Westlands, 5.2 km', distanceKm: 5.2, total: 700, minutesAgo: 6 },
  ]);

  active = signal<ActiveOrder[]>([
    { id: '#WM10248', items: '2 × 20L, 1 case', area: 'Kilimani', stage: 'On the way' },
    { id: '#WM10251', items: '1 × 20L soft', area: 'Westlands', stage: 'Rider assigned' },
    { id: '#WM10254', items: '3 × 20L refill', area: 'Yaya', stage: 'Preparing' },
  ]);

  jugsInStock = signal(14);
  jugsCapacity = signal(24);
  stockPct = computed(() => Math.round((this.jugsInStock() / this.jugsCapacity()) * 100));

  needsAction = computed(() => this.incoming().length);

  accept(orderId: string): void {
    this.incoming.set(this.incoming().filter(o => o.id !== orderId));
    this.active.update(list => [...list, { id: orderId, items: '—', area: '—', stage: 'Preparing' }]);
  }

  decline(orderId: string): void {
    this.incoming.set(this.incoming().filter(o => o.id !== orderId));
  }

  stageClasses(stage: ActiveOrder['stage']): string {
    return stage === 'On the way'
      ? 'bg-[#E8F2FC] text-[#1464B4] border-[#c9e0f7]'
      : 'bg-[#FDF1DE] text-[#C77A11] border-[#f2ddb8]';
  }
}