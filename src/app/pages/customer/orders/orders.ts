// ==========================================================================
// MajiSafi - Standalone Angular Orders Component
// Framework: Angular 17 / 18 / 19 Standalone Component
// Selector: app-orders
// File: src/app/pages/orders/orders.ts
// ==========================================================================

import { Component, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export type OrdersTab = 'active' | 'past' | 'recurring' | 'cancelled' | 'all';

export interface OrderItemSummary {
  orderNumber: string;
  timestampText: string;
  vendorName: string;
  status: 'on-the-way' | 'preparing' | 'delivered' | 'refunded' | 'cancelled';
  statusLabel: string;
  itemsDescription: string;
  addressSummary: string;
  etaOrDeliveredText: string;
  amountKsh: number;
  canTrack: boolean;
  canReorder: boolean;
  hasReceipt: boolean;
  caseSupportLink?: boolean;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class Orders {
  // Outputs for host integration
  @Output() trackOrderRequested = new EventEmitter<string>();
  @Output() reorderRequested = new EventEmitter<string>();
  @Output() viewReceiptRequested = new EventEmitter<string>();
  @Output() viewSupportCaseRequested = new EventEmitter<string>();
  @Output() manageRecurringRequested = new EventEmitter<void>();

  // Current tab signal
  currentTab = signal<OrdersTab>('active');

  // Orders lists
  orders = signal<OrderItemSummary[]>([
    {
      orderNumber: 'WM10248',
      timestampText: 'today, 3:42 pm',
      vendorName: 'ABC Water',
      status: 'on-the-way',
      statusLabel: 'On the way',
      itemsDescription: '2 × 20L refill, 1 × 500ml case',
      addressSummary: 'Riverside Court, Kilimani',
      etaOrDeliveredText: 'arriving ~4:35 pm',
      amountKsh: 1120,
      canTrack: true,
      canReorder: false,
      hasReceipt: false,
    },
    {
      orderNumber: 'WM10249',
      timestampText: 'today, 3:42 pm',
      vendorName: 'Blue Spring Water',
      status: 'preparing',
      statusLabel: 'Preparing',
      itemsDescription: '1 × 10L bottle',
      addressSummary: 'Riverside Court, Kilimani',
      etaOrDeliveredText: 'arriving ~5:10 pm',
      amountKsh: 260,
      canTrack: true,
      canReorder: false,
      hasReceipt: false,
    },
    {
      orderNumber: 'WM10192',
      timestampText: '8 Sep',
      vendorName: 'ABC Water',
      status: 'delivered',
      statusLabel: 'Delivered',
      itemsDescription: '2 × 20L refill',
      addressSummary: 'Delivered 4:02 pm · rated 5 ★',
      etaOrDeliveredText: 'Delivered',
      amountKsh: 580,
      canTrack: false,
      canReorder: true,
      hasReceipt: true,
    },
    {
      orderNumber: 'WM10121',
      timestampText: '1 Sep',
      vendorName: 'Aqua Fresh',
      status: 'delivered',
      statusLabel: 'Delivered',
      itemsDescription: '1 × 20L refill, 1 × 5L pack',
      addressSummary: 'Delivered 11:20 am',
      etaOrDeliveredText: 'Delivered',
      amountKsh: 850,
      canTrack: false,
      canReorder: true,
      hasReceipt: true,
    },
    {
      orderNumber: 'WM10088',
      timestampText: '25 Aug',
      vendorName: 'Blue Spring Water',
      status: 'refunded',
      statusLabel: 'Refunded',
      itemsDescription: '1 × 20L refill',
      addressSummary: 'Vendor could not deliver · KSh 340 returned to M-Pesa on 25 Aug',
      etaOrDeliveredText: 'Refunded',
      amountKsh: 0,
      canTrack: false,
      canReorder: false,
      hasReceipt: false,
      caseSupportLink: true,
    },
  ]);

  // Derived filtered collections
  activeOrders = computed(() =>
    this.orders().filter((o) => o.status === 'on-the-way' || o.status === 'preparing')
  );

  pastOrders = computed(() =>
    this.orders().filter((o) => o.status === 'delivered')
  );

  cancelledOrders = computed(() =>
    this.orders().filter((o) => o.status === 'refunded' || o.status === 'cancelled')
  );

  // Actions
  setTab(tab: OrdersTab) {
    this.currentTab.set(tab);
  }

  trackOrder(orderNumber: string) {
    this.trackOrderRequested.emit(orderNumber);
  }

  reorder(orderNumber: string) {
    this.reorderRequested.emit(orderNumber);
  }

  viewReceipt(orderNumber: string) {
    this.viewReceiptRequested.emit(orderNumber);
  }

  viewSupportCase(orderNumber: string) {
    this.viewSupportCaseRequested.emit(orderNumber);
  }

  manageRecurringSchedule() {
    this.manageRecurringRequested.emit();
  }
}
