// ==========================================================================
// MajiSafi - Standalone Angular Order Confirmed Component
// Framework: Angular 17 / 18 / 19 Standalone Component
// Selector: app-order-confirmed
// File: src/app/pages/order-confirmed/order-confirmed.ts
// ==========================================================================

import { Component, signal, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

export interface ConfirmedOrderItem {
  name: string;
  quantity: number;
  subtotalKsh: number;
}

export interface VendorDeliveryGroup {
  vendorName: string;
  etaTime: string;
  statusLabel: string;
  statusKey: 'preparing' | 'waiting' | 'dispatched';
  items: ConfirmedOrderItem[];
}

export interface ConfirmedOrderDetails {
  orderNumber: string;
  mpesaReceiptCode: string;
  totalKsh: number;
  phoneNumber: string;
}

@Component({
  selector: 'app-order-confirmed',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-confirmed.html',
  styleUrl: './order-confirmed.scss',
})
export class OrderConfirmed {
  @Input() set initialOrder(data: Partial<ConfirmedOrderDetails>) {
    if (data) {
      this.orderData.update((prev) => ({ ...prev, ...data }));
    }
  }

  @Input() set initialVendorGroups(groups: VendorDeliveryGroup[]) {
    if (groups && groups.length > 0) {
      this.vendorGroups.set(groups);
    }
  }

  @Output() trackRequested = new EventEmitter<string>();
  @Output() createAccountRequested = new EventEmitter<string>();
  @Output() helpRequested = new EventEmitter<string>();
  @Output() homeRequested = new EventEmitter<void>();

  // State Signals
  orderData = signal<ConfirmedOrderDetails>({
    orderNumber: 'WM10248',
    mpesaReceiptCode: 'SJ72K4L9QP',
    totalKsh: 1410,
    phoneNumber: '0712 345 678',
  });

  vendorGroups = signal<VendorDeliveryGroup[]>([
    {
      vendorName: 'ABC Water',
      etaTime: '4:35 pm',
      statusLabel: 'Preparing',
      statusKey: 'preparing',
      items: [
        { name: '2 × 20L refill — hard jug', quantity: 2, subtotalKsh: 500 },
        { name: '1 × 500ml case of 24', quantity: 1, subtotalKsh: 620 },
      ],
    },
    {
      vendorName: 'Blue Spring Water',
      etaTime: '5:10 pm',
      statusLabel: 'Waiting for vendor',
      statusKey: 'waiting',
      items: [
        { name: '1 × 10L bottle', quantity: 1, subtotalKsh: 180 },
      ],
    },
  ]);

  smsSent = signal<boolean>(false);

  // User Actions
  private router = inject(Router);

  trackDelivery() {
    this.router.navigate(['/live-tracking']);
  }

  getReceiptSms() {
    this.smsSent.set(true);
  }

  createAccount() {
    this.createAccountRequested.emit(this.orderData().phoneNumber);
  }

  dismissAccountPrompt() {
    this.homeRequested.emit();
  }

  getHelp() {
    this.helpRequested.emit(this.orderData().orderNumber);
  }
}
