import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Navbar } from '../../../shared/layout/navbar/navbar';
import { Footer } from '../../../shared/layout/footer/footer';
import {
  CartService,
  CartItemResponse,
} from '../services/cart-service';

interface AppliedDiscountModel {
  code: string;
  amountKsh: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar, Footer],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly router      = inject(Router);

  // ── Read directly from the shared CartService signal so items are never
  //    lost when navigating back to this page. The signal is kept in sync
  //    by CartService (localStorage + optional API).
  readonly cartItems = this.cartService.cartItems;

  loading        = signal(false);
  errorMessage   = signal('');
  successMessage = signal('');

  promoInput       = signal('');
  appliedDiscount  = signal<AppliedDiscountModel | null>(null);
  promoMessage     = signal('');
  promoSuccess     = signal(false);

  totalItemsCount = computed(() =>
    this.cartItems().reduce((total, item) => total + item.quantity, 0)
  );

  waterSubtotal = computed(() =>
    this.cartItems().reduce((total, item) => total + item.subtotal, 0)
  );

  deliveryFee = computed(() =>
    // Free when subtotal > KSh 2,000, otherwise KSh 80.
    this.waterSubtotal() > 2000 ? 0 : this.cartItems().length > 0 ? 80 : 0
  );

  totalDue = computed(() => {
    const discount = this.appliedDiscount()?.amountKsh ?? 0;
    return Math.max(0, this.waterSubtotal() + this.deliveryFee() - discount);
  });

  ngOnInit(): void {
    // Refresh from the API on page load to stay in sync with the backend.
    // CartService.getCart() already falls back to localStorage on failure,
    // so the cart is never blank even when offline.
    this.loadCart();
  }

  loadCart(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.cartService
      .getCart()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        // CartService.getCart() updates the shared signal via _setCart()
        // so we only need to handle the error case here.
        error: () => {
          // If it fails, CartService already served localStorage data.
          // Show a soft warning rather than a hard error.
          if (this.cartItems().length === 0) {
            this.errorMessage.set(
              'Unable to reach the server. Showing your locally saved cart.'
            );
          }
        },
      });
  }

  removeItem(productId: string): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    // CartService.removeFromCart() removes optimistically from the local
    // signal+storage first, then fires the DELETE to the backend.
    this.cartService.removeFromCart(productId).subscribe({
      next: () => {
        this.successMessage.set('Item removed from your cart.');
      },
      error: () => {
        this.errorMessage.set('Could not remove this item. Please try again.');
      },
    });
  }

  updateQuantity(productId: string, delta: number): void {
    const item = this.cartItems().find((i) => i.productId === productId);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + delta);
    this.cartService.updateQuantity(productId, newQty).subscribe();
  }

  onPromoInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.promoInput.set(target.value.trim().toUpperCase());
  }

  applyPromo(): void {
    const code = this.promoInput().trim().toUpperCase();
    if (code === 'MAJI50') {
      this.appliedDiscount.set({ code, amountKsh: 50 });
      this.promoMessage.set('Code MAJI50 applied (KSh 50 off).');
      this.promoSuccess.set(true);
    } else if (code === 'NAIROBI100') {
      this.appliedDiscount.set({ code, amountKsh: 100 });
      this.promoMessage.set('Code NAIROBI100 applied (KSh 100 off).');
      this.promoSuccess.set(true);
    } else {
      this.appliedDiscount.set(null);
      this.promoMessage.set('Invalid code. Try MAJI50 or NAIROBI100.');
      this.promoSuccess.set(false);
    }
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  keepShopping(): void {
    this.router.navigate(['/find-water']);
  }
}
