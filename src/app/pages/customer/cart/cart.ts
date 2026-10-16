import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
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
  private readonly router = inject(Router);

  cartItems = signal<CartItemResponse[]>([]);
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  promoInput = signal('');
  appliedDiscount = signal<AppliedDiscountModel | null>(null);
  promoMessage = signal('');
  promoSuccess = signal(false);

  totalItemsCount = computed(() =>
    this.cartItems().reduce(
      (total, item) => total + item.quantity,
      0
    )
  );

  waterSubtotal = computed(() =>
    this.cartItems().reduce(
      (total, item) => total + item.subtotal,
      0
    )
  );

  // Delivery fees are not included in the current CartResponse DTO.
  totalDeliveryFee = computed(() => 0);

  totalDue = computed(() => {
    const discount = this.appliedDiscount()?.amountKsh ?? 0;

    return Math.max(
      0,
      this.waterSubtotal() + this.totalDeliveryFee() - discount
    );
  });

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.cartService.getCart()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (cart) => {
          this.cartItems.set(cart.items ?? []);
        },
        error: (error) => {
          console.error('Failed to load cart', error);
          this.errorMessage.set(
            'Unable to load your cart. Please sign in and try again.'
          );
        },
      });
  }

  removeItem(productId: string): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    this.cartService.removeFromCart(productId).subscribe({
      next: () => {
        this.cartItems.update(items =>
          items.filter(item => item.productId !== productId)
        );
        this.successMessage.set('Item removed from your cart.');
      },
      error: (error) => {
        console.error('Failed to remove cart item', error);
        this.errorMessage.set('Could not remove this item. Please try again.');
      },
    });
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
    this.router.navigate(['/products']);
  }
}