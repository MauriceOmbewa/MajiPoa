
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

import {
  CustomerOrder,
  OrderItemResponse,
} from '../services/order-service';

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
  orderResponse?: CustomerOrder;
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

  @Input() set initialOrder(_data: Partial<ConfirmedOrderDetails>) {
    // Retained for compatibility with existing parent components.
  }

  @Input() set initialVendorGroups(groups: VendorDeliveryGroup[]) {
    if (groups?.length) {
      this.vendorGroups.set(groups);
    }
  }

  @Output() trackRequested = new EventEmitter<string>();
  @Output() createAccountRequested = new EventEmitter<string>();
  @Output() helpRequested = new EventEmitter<string>();
  @Output() homeRequested = new EventEmitter<void>();

  orderData = signal<CustomerOrder | null>(null);
  displayItems = signal<DisplayOrderItem[]>([]);

  phoneNumber = signal('');
  mpesaReceiptCode = signal('');
  smsSent = signal(false);
  missingOrder = signal(false);

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
      (order.items ?? []).map(
        (item: OrderItemResponse): DisplayOrderItem => {
          const cartLine = checkoutLines.find(
            (line: CheckoutLineInfo) =>
              String(line.productId) === String(item.productId)
          );

          return {
            id: String(item.id),
            productId: String(item.productId),
            name: cartLine?.name ?? `Product ${item.productId}`,
            quantity: item.quantity,
            price: item.price,
            subTotal:
              item.subTotal ?? item.price * item.quantity,
          };
        }
      )
    );
  }

  trackDelivery(): void {
    const order = this.orderData();

    if (!order) {
      return;
    }

    this.trackRequested.emit(order.orderId);

    this.router.navigate(['/live-tracking'], {
      queryParams: { orderId: order.orderId },
    });
  }

  getReceiptSms(): void {
    // Connect this to a real SMS endpoint.
    // Do not report success until the backend confirms sending.
    this.smsSent.set(false);
  }

  createAccount(): void {
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
