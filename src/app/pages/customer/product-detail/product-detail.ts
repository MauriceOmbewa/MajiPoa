import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

export interface ProductOriginInfo {
  source: string;
  treatment: string;
  certification: string;
  ph: number;
  tds: number;
  lastLabTest: string;
}

export interface ProductDetailData {
  id: string;
  name: string;
  size: string;
  vendor: string;
  vendorId: string;
  rating: number;
  reviewCount: number;
  deliveryMinutes: number;
  priceKsh: number;
  origin: ProductOriginInfo;
}

export interface ReviewItem {
  id: string;
  author: string;
  stars: number;
  dateAgo: string;
  comment: string;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  // Active Product Specification
  readonly product = signal<ProductDetailData>({
    id: 'p1',
    name: '20L refill — hard jug',
    size: '20L',
    vendor: 'ABC Water',
    vendorId: 'abc-water',
    rating: 4.8,
    reviewCount: 612,
    deliveryMinutes: 45,
    priceKsh: 250,
    origin: {
      source: 'Licensed borehole, Ngong Rd',
      treatment: 'Reverse osmosis + UV',
      certification: 'KEBS S-Mark · valid to Mar 2027',
      ph: 7.2,
      tds: 68,
      lastLabTest: '2 Sep 2026 · SGS Kenya',
    },
  });

  // Customer Reviews
  readonly reviews = signal<ReviewItem[]>([
    {
      id: 'r1',
      author: 'Grace W.',
      stars: 5,
      dateAgo: '3 days ago',
      comment: 'Arrived in 35 minutes and the rider carried it up to the third floor. Water tastes clean.',
    },
    {
      id: 'r2',
      author: 'Peter M.',
      stars: 4,
      dateAgo: '1 week ago',
      comment: 'Good price for the area. Delivery was a bit late on a Sunday but they called ahead.',
    },
  ]);

  // Order & Stepper State
  readonly quantity = signal<number>(2);
  readonly stockLeft = signal<number>(14);
  readonly totalStock = signal<number>(24);
  readonly deliveryFee = signal<number>(80);
  readonly locationName = signal<string>('Kilimani');

  // Timing: 'asap' | 'today' | 'repeat'
  readonly timing = signal<'asap' | 'today' | 'repeat'>('asap');

  // Cart & UI Feedback
  readonly cartCount = signal<number>(2);
  readonly toastMessage = signal<string | null>(null);

  // Computed Totals
  readonly totalPrice = computed(() => {
    return this.product().priceKsh * this.quantity();
  });

  readonly stockPercentage = computed(() => {
    return Math.min(100, Math.round((this.stockLeft() / this.totalStock()) * 100));
  });

  // Quantity Stepper Controls
  incrementQty(): void {
    if (this.quantity() < this.stockLeft()) {
      this.quantity.update((q) => q + 1);
    } else {
      this.showToast(`Maximum ${this.stockLeft()} jugs available today`);
    }
  }

  decrementQty(): void {
    if (this.quantity() > 1) {
      this.quantity.update((q) => q - 1);
    }
  }

  // Delivery Timing Selection
  setTiming(selected: 'asap' | 'today' | 'repeat'): void {
    this.timing.set(selected);
    if (selected === 'asap') {
      this.showToast('Selected: Dispatch ASAP (~45 min)');
    } else if (selected === 'today') {
      this.showToast('Selected: Choose a 2-hour window today');
    } else {
      this.showToast('Selected: Repeat order (weekly / fortnight)');
    }
  }

  // Add to Cart
  addToCart(): void {
    this.cartCount.update((c) => c + this.quantity());
    this.showToast(`Added ${this.quantity()}x ${this.product().name} to cart (KSh ${this.totalPrice()})`);
  }

  // Buy Now with M-Pesa
  buyWithMpesa(): void {
    this.showToast(`Prompting M-Pesa STK push for KSh ${this.totalPrice() + this.deliveryFee()}...`);
  }

  // Navigation & Modals
  navigateTo(destination: 'discover' | 'home'): void {
    this.showToast(`Navigating to ${destination === 'discover' ? 'Find Water catalog' : 'Home'}...`);
  }

  private router = inject(Router);

  openVendor(): void {
    this.router.navigate(['/vendor-shop']);
  }

  openPassport(): void {
    this.showToast(`Opening Verified Water Passport for ${this.product().vendor} (pH ${this.product().origin.ph}, TDS ${this.product().origin.tds} ppm)`);
  }

  openCart(): void {
    this.router.navigate(['/cart']);
  }

  selectNewJugBundle(): void {
    this.showToast('Redirecting to 20L new jug + water bundle (KSh 1,150)');
  }

  showToast(message: string): void {
    this.toastMessage.set(message);
    setTimeout(() => {
      if (this.toastMessage() === message) {
        this.toastMessage.set(null);
      }
    }, 3000);
  }
}
