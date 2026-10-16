// ==========================================================================
// MajiSafi - Standalone Angular Checkout Component
// Framework: Angular 17 / 18 / 19 Standalone Component
// Selector: app-checkout
// File: src/app/pages/checkout/checkout.ts
// ==========================================================================

import {
  Component, signal, computed, inject, Input, Output,
  EventEmitter, OnDestroy, OnInit
} from '@angular/core';
import { finalize } from 'rxjs';
import { CartService } from '../services/cart-service';
import { OrderService } from '../services/order-service';
import { OrderResponse } from '../services/order-service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Navbar } from '../../../shared/layout/navbar/navbar';
import { Footer } from '../../../shared/layout/footer/footer';

export interface CheckoutOrderLine {
  id: string;
  productId: string;
  name: string;
  vendor: string;
  quantity: number;
  unitPriceKsh: number;
  subtotalKsh: number;
}

export type DeliverySlot = 'asap' | 'today_evening' | 'tomorrow_morning';
export type PaymentMethod = 'mpesa' | 'cod';


@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar, Footer],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout implements OnInit, OnDestroy {
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);

  orderLines = signal<CheckoutOrderLine[]>([]);
  loadingCart = signal(false);
  placingOrder = signal(false);
  checkoutError = signal('');
  checkoutSuccess = signal('');

  ngOnInit(): void {
  this.loadCart();
}

loadCart(): void {
  this.loadingCart.set(true);
  this.checkoutError.set('');

  this.cartService.getCart()
    .pipe(finalize(() => this.loadingCart.set(false)))
    .subscribe({
      next: (cart) => {
        this.orderLines.set(
          (cart.items ?? []).map((item) => ({
            id: item.cartItemId,
            productId: item.productId,
            name: item.productName,
            vendor: 'Water delivery',
            quantity: item.quantity,
            unitPriceKsh: item.price,
            subtotalKsh: item.subtotal
          }))
        );
      },
      error: (error) => {
        console.error('Failed to load checkout cart', error);
        this.checkoutError.set(
          'Unable to load your cart. Please sign in and try again.'
        );
      }
    });
}

placeOrder(): void {
  if (this.placingOrder()) return;

  if (this.orderLines().length === 0) {
    this.checkoutError.set('Your cart is empty.');
    return;
  }

  this.checkoutError.set('');
  this.checkoutSuccess.set('');
  this.placingOrder.set(true);

  // Preserve the product names before the backend clears the cart.
  const checkoutLines = this.orderLines().map((line) => ({ ...line }));

  this.orderService.placeOrder()
    .pipe(finalize(() => this.placingOrder.set(false)))
    .subscribe({
      next: (order) => {
        this.closeStkModal();

        this.router.navigate(['/order-confirmed'], {
          state: {
            orderResponse: order,
            checkoutLines,
            phoneNumber: this.phoneNumber()
          }
        });
      },
      error: (error) => {
        console.error('Failed to place order', error);

        this.checkoutError.set(
          error.status === 401
            ? 'Your session has expired. Please sign in again.'
            : error.status === 400
              ? 'Your cart may be empty. Refresh the cart and try again.'
              : 'We could not place your order. Please try again.'
        );
      }
    });
}
  // Inputs for host integration
  @Input() set initialLines(lines: CheckoutOrderLine[]) {
    if (lines && lines.length > 0) {
      this.orderLines.set(lines);
    }
  }

  @Output() orderCompleted = new EventEmitter<{
    orderId: string;
    totalAmountKsh: number;
    phoneNumber: string;
    address: string;
    slot: DeliverySlot;
  }>();

  @Output() signInRequested = new EventEmitter<void>();

  // Form Signals
  deliveryAddress = signal<string>('Riverside Court, Argwings Kodhek Rd, Kilimani');
  apartmentNo = signal<string>('B12');
  floor = signal<string>('3rd');
  riderDirections = signal<string>('');
  pinPosition = signal<{ x: number; y: number }>({ x: 52, y: 52 });

  customerName = signal<string>('Maurice O.');
  phoneNumber = signal<string>('0712 345 678');
  someoneElseReceives = signal<boolean>(false);

  selectedSlot = signal<DeliverySlot>('asap');
  paymentMethod = signal<PaymentMethod>('mpesa');
  mpesaNumber = signal<string>('0712 345 678');
  saveForLater = signal<boolean>(true);

  // Cart & Discount Signals
  // orderLines = signal<CheckoutOrderLine[]>([
    
  // ]);

  promoCode = signal<string>('MAJI50');
  discountAmount = signal<number>(50);

  // STK Push Waiting State
  showStkModal = signal<boolean>(false);
  stkRemainingSeconds = signal<number>(102); // 1:42
  stkProgressPercent = signal<number>(35);
  private timerRef: any = null;

  // Computeds
  // waterSubtotal = computed(() => {
  //   return this.orderLines().reduce((acc, line) => acc + line.subtotalKsh, 0);
  // });
  waterSubtotal = computed(() =>
  this.orderLines().reduce((total, line) => total + line.subtotalKsh, 0)
);

 totalDue = computed(() => this.waterSubtotal());

  vendorCount = computed(() => {
    const vendors = new Set(this.orderLines().map((l) => l.vendor));
    return vendors.size || 2;
  });

  deliveryFee = computed(() => {
    // 80 KSh per vendor, with a 20 KSh discount on tomorrow morning slot
    const base = this.vendorCount() * 80;
    return this.selectedSlot() === 'tomorrow_morning' ? Math.max(0, base - 20) : base;
  });

  // totalDue = computed(() => {
  //   return Math.max(0, this.waterSubtotal() + this.deliveryFee() - this.discountAmount());
  // });

  countdownText = computed(() => {
    const s = this.stkRemainingSeconds();
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  });

  // Action methods
  updateDeliveryAddress(e: Event) {
    const target = e.target as HTMLInputElement;
    this.deliveryAddress.set(target.value);
  }

  updateApartmentNo(e: Event) {
    const target = e.target as HTMLInputElement;
    this.apartmentNo.set(target.value);
  }

  updateFloor(e: Event) {
    const target = e.target as HTMLInputElement;
    this.floor.set(target.value);
  }

  updateRiderDirections(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    this.riderDirections.set(target.value);
  }

  onMapPinMoved(e: MouseEvent) {
    const container = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.round(((e.clientX - container.left) / container.width) * 100);
    const y = Math.round(((e.clientY - container.top) / container.height) * 100);
    this.pinPosition.set({ x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) });
  }

  updateCustomerName(e: Event) {
    const target = e.target as HTMLInputElement;
    this.customerName.set(target.value);
  }

  updatePhoneNumber(e: Event) {
    const target = e.target as HTMLInputElement;
    this.phoneNumber.set(target.value);
    if (this.paymentMethod() === 'mpesa' && (!this.mpesaNumber() || this.mpesaNumber() === this.phoneNumber())) {
      this.mpesaNumber.set(target.value);
    }
  }

  toggleSomeoneElse() {
    this.someoneElseReceives.update((v) => !v);
  }

  selectSlot(slot: DeliverySlot) {
    this.selectedSlot.set(slot);
  }

  selectPaymentMethod(pay: PaymentMethod) {
    this.paymentMethod.set(pay);
  }

  updateMpesaNumber(e: Event) {
    const target = e.target as HTMLInputElement;
    this.mpesaNumber.set(target.value);
  }

  toggleSaveForLater() {
    this.saveForLater.update((v) => !v);
  }

  triggerMpesaPayment() {
    this.showStkModal.set(true);
    this.stkRemainingSeconds.set(102);
    this.stkProgressPercent.set(35);

    if (this.timerRef) clearInterval(this.timerRef);

    this.timerRef = setInterval(() => {
      this.stkRemainingSeconds.update((s) => {
        if (s <= 1) {
          clearInterval(this.timerRef);
          return 0;
        }
        return s - 1;
      });

      this.stkProgressPercent.update((p) => Math.min(100, p + 0.6));
    }, 1000);
  }

  closeStkModal() {
    this.showStkModal.set(false);
    if (this.timerRef) clearInterval(this.timerRef);
  }

  resendPrompt() {
    this.stkRemainingSeconds.set(102);
    this.stkProgressPercent.set(15);
  }

  private router = inject(Router);

  confirmPaid() {
    this.closeStkModal();
    this.router.navigate(['/order-confirmed']);
  }

  onSignInClick() {
    this.signInRequested.emit();
  }

  ngOnDestroy() {
    if (this.timerRef) clearInterval(this.timerRef);
  }
}
