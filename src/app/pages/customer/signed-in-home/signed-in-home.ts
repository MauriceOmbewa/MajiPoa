// ==========================================================================
// MajiSafi - Standalone Angular Signed-In Home Component
// Framework: Angular 17 / 18 / 19 Standalone Component
// Selector: app-signed-in-home
// File: src/app/pages/signed-in-home/signed-in-home.ts
// ==========================================================================

import { Component, signal, computed, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface CustomerProfile {
  name: string;
  phone: string;
  activeDeliveriesCount: number;
}

export interface ActiveDeliveryOrder {
  orderNumber: string;
  vendorName: string;
  estimatedArrival: string;
  minutesAway: number;
  riderName: string;
  riderInitials: string;
  itemsSummary: string;
}

export interface ReorderItem {
  id: string;
  title: string;
  vendorName: string;
  priceKsh: number;
  unit: string;
}

export interface RecurringSubscription {
  planName: string;
  frequency: string;
  nextDate: string;
  isPaused: boolean;
}

export interface LoyaltyPoints {
  points: number;
  targetPoints: number;
  pointsRemaining: number;
  progressPercentage: number;
}

export interface MonthlyStats {
  ordersCount: number;
  litresCount: number;
  spentKsh: number;
}

@Component({
  selector: 'app-signed-in-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './signed-in-home.html',
  styleUrl: './signed-in-home.scss',
})
export class SignedInHome {
  // Inputs
  @Input() set customerName(name: string) {
    if (name) {
      this.customer.update((prev) => ({ ...prev, name }));
    }
  }

  // Outputs
  @Output() trackOrderRequested = new EventEmitter<string>();
  @Output() reorderRequested = new EventEmitter<ReorderItem>();
  @Output() quickActionRequested = new EventEmitter<string>();
  @Output() viewAllOrdersRequested = new EventEmitter<void>();
  @Output() manageRecurringRequested = new EventEmitter<void>();
  @Output() skipNextRequested = new EventEmitter<void>();
  @Output() togglePauseRequested = new EventEmitter<boolean>();

  // State Signals
  customer = signal<CustomerProfile>({
    name: 'Maurice',
    phone: '0712 345 678',
    activeDeliveriesCount: 1,
  });

  activeOrder = signal<ActiveDeliveryOrder | null>({
    orderNumber: 'WM10248',
    vendorName: 'ABC Water',
    estimatedArrival: '4:35 pm',
    minutesAway: 8,
    riderName: 'James',
    riderInitials: 'JK',
    itemsSummary: '2 × 20L refill · 1 × 500ml case',
  });

  reorderItems = signal<ReorderItem[]>([
    {
      id: 're-1',
      title: '2 × 20L refill',
      vendorName: 'ABC Water',
      priceKsh: 580,
      unit: '20L',
    },
    {
      id: 're-2',
      title: '1 × 10L bottle',
      vendorName: 'Blue Spring',
      priceKsh: 260,
      unit: '10L',
    },
    {
      id: 're-3',
      title: '1 × 500ml case',
      vendorName: 'ABC Water',
      priceKsh: 700,
      unit: '500ml x 24',
    },
  ]);

  recurringSubscription = signal<RecurringSubscription>({
    planName: '2 × 20L refill from ABC Water',
    frequency: 'Every Friday',
    nextDate: '18 Sep, 8–10 am',
    isPaused: false,
  });

  loyalty = signal<LoyaltyPoints>({
    points: 340,
    targetPoints: 400,
    pointsRemaining: 60,
    progressPercentage: 85,
  });

  monthlyStats = signal<MonthlyStats>({
    ordersCount: 6,
    litresCount: 140,
    spentKsh: 3480,
  });

  isPaused = computed(() => this.recurringSubscription().isPaused);

  // Actions
  trackOrder(orderId: string) {
    this.trackOrderRequested.emit(orderId);
  }

  reorder(item: ReorderItem) {
    this.reorderRequested.emit(item);
  }

  quickAction(action: string) {
    this.quickActionRequested.emit(action);
  }

  viewAllOrders() {
    this.viewAllOrdersRequested.emit();
  }

  manageRecurring() {
    this.manageRecurringRequested.emit();
  }

  skipNext() {
    this.skipNextRequested.emit();
  }

  pauseRecurring() {
    this.recurringSubscription.update((sub) => ({
      ...sub,
      isPaused: !sub.isPaused,
    }));
    this.togglePauseRequested.emit(this.recurringSubscription().isPaused);
  }
}
