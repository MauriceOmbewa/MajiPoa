
// ==========================================================================
// MajiSafi - Standalone Angular Order Confirmed Component
// File: src/app/pages/order-confirmed/order-confirmed.ts
// ==========================================================================

import {
  Component,
  signal,
  inject,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { Navbar } from '../../../shared/layout/navbar/navbar';
import { Footer } from '../../../shared/layout/footer/footer';
import { OrderResponse } from '../services/order-service';

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

interface CheckoutLineInfo {
  productId: string;
  name: string;
}

interface DisplayOrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  subTotal: number;
}

interface OrderNavigationState {
  orderResponse?: OrderResponse;
  checkoutLines?: CheckoutLineInfo[];
  phoneNumber?: string;
  mpesaReceiptCode?: string;
}

@Component({
  selector: 'app-order-confirmed',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar, Footer],
  templateUrl: './order-confirmed.html',
  styleUrl: './order-confirmed.scss',
})
export class OrderConfirmed {
  private readonly router = inject(Router);

  @Input() set initialOrder(data: Partial<ConfirmedOrderDetails>) {
    // Retained for compatibility with existing parent components.
    // The API response is the source of truth for the confirmed order.
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

  // Real order response returned by POST /api/orders.
  orderData = signal<OrderResponse | null>(null);

  // Product names are matched from the checkout cart because
  // the current OrderResponse contains product IDs, not product names.
  displayItems = signal<DisplayOrderItem[]>([]);

  phoneNumber = signal('');
  mpesaReceiptCode = signal('');
  smsSent = signal(false);
  missingOrder = signal(false);

  // Do not display fake vendor names or estimated delivery times.
  // Supply actual groups here when the backend supports them.
  vendorGroups = signal<VendorDeliveryGroup[]>([]);

  constructor() {
    const state = window.history.state as OrderNavigationState | null;

    if (!state?.orderResponse) {
      this.missingOrder.set(true);
      return;
    }

    const order = state.orderResponse;
    const checkoutLines = state.checkoutLines ?? [];

    this.orderData.set(order);
    this.phoneNumber.set(state.phoneNumber ?? '');
    this.mpesaReceiptCode.set(state.mpesaReceiptCode ?? '');

    this.displayItems.set(
      (order.items ?? []).map((item) => {
        const cartLine = checkoutLines.find(
          (line) => line.productId === item.productId
        );

        return {
          ...item,
          name: cartLine?.name ?? item.productId,
        };
      })
    );
  }

  trackDelivery(): void {
    const order = this.orderData();

    if (!order) {
      return;
    }

    this.router.navigate(['/live-tracking'], {
      queryParams: { orderId: order.orderId },
    });
  }

  getReceiptSms(): void {
    // Connect this action to a real receipt-SMS backend endpoint.
    // Do not show success until the backend confirms the SMS was sent.
    this.smsSent.set(false);
  }

  createAccount(): void {
    // Connect this action to the account creation flow.
    this.createAccountRequested.emit(this.phoneNumber());
  }

  dismissAccountPrompt(): void {
    this.homeRequested.emit();
    this.router.navigate(['/']);
  }

  getHelp(): void {
    const order = this.orderData();

    if (!order) {
      return;
    }

    this.helpRequested.emit(order.orderId);

    this.router.navigate(['/support'], {
      queryParams: { orderId: order.orderId },
    });
  }
}
