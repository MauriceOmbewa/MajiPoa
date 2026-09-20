import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

export interface ProductItem {
  id: string;
  name: string;
  size: string;
  category: '20L refill jug' | '20L new jug' | '10L bottle' | '5L bottle' | '500ml case' | 'Tank / bulk delivery';
  vendor: string;
  estate: string;
  distanceKm: number;
  deliveryTimeMins: number;
  priceKsh: number;
  verified: boolean;
  kebsCertified: boolean;
  labTestUnder30Days?: boolean;
  rating?: number;
  tag?: string;
  tagType?: 'ok' | 'info' | 'warn';
  source?: string;
  treatment?: string;
  ph: number;
  tds: number;
  batchCode?: string;
}

export interface VendorItem {
  id: string;
  name: string;
  logoText: string;
  estate: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  process: string;
  isOpen: boolean;
  statusText: string;
  verified: boolean;
  kebsCertified: boolean;
  labTestDate: string;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

export interface LocationEstate {
  id: string;
  name: string;
  subCounty: string;
}

@Component({
  selector: 'app-find-water',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './find-water.html',
  styleUrl: './find-water.scss',
})
export class FindWater {
  // Current Selected Location
  readonly currentEstate = signal<LocationEstate>({
    id: 'kilimani',
    name: 'Kilimani, Nairobi',
    subCounty: 'Dagoretti North',
  });

  // Size Filter Options
  readonly sizeFilters = [
    { label: 'All sizes', value: 'all' },
    { label: '20L', value: '20L' },
    { label: '10L', value: '10L' },
    { label: '5L', value: '5L' },
    { label: '500ml case', value: '500ml' },
    { label: 'Bulk / tank', value: 'bulk' },
  ];

  // Secondary Filter Chips
  readonly featureFilters = [
    { id: 'refill_only', label: 'Refill only' },
    { id: 'new_jug', label: 'New jug' },
    { id: 'fast_delivery', label: 'Delivers in 1 hr' },
    { id: 'kebs_certified', label: 'KEBS certified' },
    { id: 'fresh_lab_test', label: 'Lab test under 30 days' },
    { id: 'high_rated', label: 'Rated 4.5+' },
  ];

  // Active Filter Signals
  readonly selectedSize = signal<string>('all');
  readonly activeFilters = signal<Set<string>>(new Set());
  readonly selectedSort = signal<string>('recommended');

  // UI Interactive States
  readonly toastMessage = signal<string | null>(null);
  readonly promoCopied = signal<boolean>(false);

  // Cart State (Reactive)
  readonly cartItems = signal<CartItem[]>([
    {
      product: {
        id: 'p1',
        name: '20L refill — hard jug',
        size: '20L',
        category: '20L refill jug',
        vendor: 'ABC Water',
        estate: 'Kilimani',
        distanceKm: 1.2,
        deliveryTimeMins: 45,
        priceKsh: 250,
        verified: true,
        kebsCertified: true,
        labTestUnder30Days: true,
        rating: 4.8,
        tag: 'Cheapest',
        tagType: 'ok',
        source: 'Natural Deep Aquifer, Tigoni Kiambu',
        treatment: '7-Stage Reverse Osmosis + UV Sterilization',
        ph: 7.2,
        tds: 68,
        batchCode: 'ABC-2026-NBI-084',
      },
      quantity: 1,
    },
  ]);

  // Initial Products Catalog
  readonly products = signal<ProductItem[]>([
    {
      id: 'p1',
      name: '20L refill — hard jug',
      size: '20L',
      category: '20L refill jug',
      vendor: 'ABC Water',
      estate: 'Kilimani',
      distanceKm: 1.2,
      deliveryTimeMins: 45,
      priceKsh: 250,
      verified: true,
      kebsCertified: true,
      labTestUnder30Days: true,
      rating: 4.8,
      tag: 'Cheapest',
      tagType: 'ok',
      source: 'Natural Deep Aquifer, Tigoni Kiambu',
      treatment: '7-Stage Reverse Osmosis + UV Sterilization',
      ph: 7.2,
      tds: 68,
      batchCode: 'ABC-2026-NBI-084',
    },
    {
      id: 'p2',
      name: '20L refill — soft bottle',
      size: '20L',
      category: '20L refill jug',
      vendor: 'Aqua Fresh',
      estate: 'Hurlingham',
      distanceKm: 2.4,
      deliveryTimeMins: 60,
      priceKsh: 290,
      verified: true,
      kebsCertified: true,
      labTestUnder30Days: true,
      rating: 4.6,
      source: 'Aberdare Mountain Springs via Spring Valley',
      treatment: 'Microfiltration + Activated Carbon + UV Protection',
      ph: 7.0,
      tds: 54,
      batchCode: 'AF-2026-NBI-911',
    },
    {
      id: 'p3',
      name: '20L new jug + water',
      size: '20L',
      category: '20L new jug',
      vendor: 'Blue Spring',
      estate: 'Yaya',
      distanceKm: 0.9,
      deliveryTimeMins: 40,
      priceKsh: 1150,
      verified: true,
      kebsCertified: true,
      labTestUnder30Days: true,
      rating: 4.4,
      tag: '2 left today',
      tagType: 'warn',
      source: 'Mount Kenya Foothills Artesian Well',
      treatment: 'Ozone Sanitized & Mineral Balanced',
      ph: 7.4,
      tds: 71,
      batchCode: 'BS-2026-NBI-332',
    },
    {
      id: 'p4',
      name: '10L bottle',
      size: '10L',
      category: '10L bottle',
      vendor: 'Blue Spring',
      estate: 'Yaya',
      distanceKm: 0.9,
      deliveryTimeMins: 40,
      priceKsh: 180,
      verified: true,
      kebsCertified: true,
      labTestUnder30Days: true,
      rating: 4.4,
      source: 'Mount Kenya Foothills Artesian Well',
      treatment: 'Ozone Sanitized & Mineral Balanced',
      ph: 7.4,
      tds: 71,
      batchCode: 'BS-2026-NBI-332',
    },
    {
      id: 'p5',
      name: '5L bottle, pack of 4',
      size: '5L',
      category: '5L bottle',
      vendor: 'Aqua Fresh',
      estate: 'Hurlingham',
      distanceKm: 2.4,
      deliveryTimeMins: 60,
      priceKsh: 480,
      verified: true,
      kebsCertified: true,
      labTestUnder30Days: true,
      rating: 4.6,
      source: 'Aberdare Mountain Springs via Spring Valley',
      treatment: 'Microfiltration + Activated Carbon + UV Protection',
      ph: 7.0,
      tds: 54,
      batchCode: 'AF-2026-NBI-911',
    },
    {
      id: 'p6',
      name: '500ml bottled water',
      size: '500ml',
      category: '500ml case',
      vendor: 'ABC Water',
      estate: 'Kilimani',
      distanceKm: 1.2,
      deliveryTimeMins: 45,
      priceKsh: 620,
      verified: true,
      kebsCertified: true,
      labTestUnder30Days: true,
      rating: 4.8,
      tag: 'Case of 24',
      tagType: 'info',
      source: 'Natural Deep Aquifer, Tigoni Kiambu',
      treatment: 'Double RO Filtration & Mineralized',
      ph: 7.2,
      tds: 68,
      batchCode: 'ABC-2026-NBI-084C',
    },
    {
      id: 'p7',
      name: '10,000L Bulk Clean Tanker',
      size: '10,000L',
      category: 'Tank / bulk delivery',
      vendor: 'Nairobi Clean Water Fleet',
      estate: 'Kilimani',
      distanceKm: 3.8,
      deliveryTimeMins: 90,
      priceKsh: 6500,
      verified: true,
      kebsCertified: true,
      labTestUnder30Days: true,
      rating: 4.9,
      tag: 'Bulk Tanker',
      tagType: 'warn',
      source: 'Government Verified Deep Borehole, Kikuyu',
      treatment: 'Chlorination + Sand Media Filtration',
      ph: 7.1,
      tds: 72,
      batchCode: 'TANK-2026-004',
    },
  ]);

  // Verified Vendors Catalog
  readonly vendors = signal<VendorItem[]>([
    {
      id: 'v1',
      name: 'ABC Water',
      logoText: 'AW',
      estate: 'Kilimani',
      distanceKm: 1.2,
      rating: 4.8,
      reviewCount: 612,
      process: 'Borehole, reverse osmosis',
      isOpen: true,
      statusText: 'Open · closes 8pm',
      verified: true,
      kebsCertified: true,
      labTestDate: '2 Sep 2026',
    },
    {
      id: 'v2',
      name: 'Aqua Fresh Ltd',
      logoText: 'AF',
      estate: 'Hurlingham',
      distanceKm: 2.4,
      rating: 4.6,
      reviewCount: 288,
      process: 'Municipal, UV + RO',
      isOpen: true,
      statusText: 'Open · closes 9pm',
      verified: true,
      kebsCertified: true,
      labTestDate: '21 Aug 2026',
    },
    {
      id: 'v3',
      name: 'Blue Spring Water',
      logoText: 'BS',
      estate: 'Yaya',
      distanceKm: 0.9,
      rating: 4.4,
      reviewCount: 97,
      process: 'Spring, filtration',
      isOpen: false,
      statusText: 'Busy · ~1 hr 20',
      verified: true,
      kebsCertified: false,
      labTestDate: '28 Aug 2026',
    },
  ]);

  // Total Quantity in Cart
  readonly totalCartCount = computed(() => {
    return this.cartItems().reduce((sum, item) => sum + item.quantity, 0);
  });

  // Filtered & Sorted Products
  readonly filteredProducts = computed(() => {
    let list = [...this.products()];
    const size = this.selectedSize();
    const filters = this.activeFilters();
    const sort = this.selectedSort();

    // 1. Filter by Size
    if (size !== 'all') {
      if (size === '20L') {
        list = list.filter((p) => p.size === '20L');
      } else if (size === '10L') {
        list = list.filter((p) => p.size === '10L');
      } else if (size === '5L') {
        list = list.filter((p) => p.size === '5L');
      } else if (size === '500ml') {
        list = list.filter((p) => p.size === '500ml');
      } else if (size === 'bulk') {
        list = list.filter((p) => p.category === 'Tank / bulk delivery');
      }
    }

    // 2. Filter by Feature Chips
    if (filters.has('refill_only')) {
      list = list.filter((p) => p.category === '20L refill jug');
    }
    if (filters.has('new_jug')) {
      list = list.filter((p) => p.category === '20L new jug');
    }
    if (filters.has('fast_delivery')) {
      list = list.filter((p) => p.deliveryTimeMins <= 60);
    }
    if (filters.has('kebs_certified')) {
      list = list.filter((p) => p.kebsCertified);
    }
    if (filters.has('fresh_lab_test')) {
      list = list.filter((p) => p.labTestUnder30Days);
    }
    if (filters.has('high_rated')) {
      list = list.filter((p) => (p.rating ?? 0) >= 4.5);
    }

    // 3. Sorting
    if (sort === 'price_low') {
      list.sort((a, b) => a.priceKsh - b.priceKsh);
    } else if (sort === 'fastest') {
      list.sort((a, b) => a.deliveryTimeMins - b.deliveryTimeMins);
    } else if (sort === 'nearest') {
      list.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sort === 'rating') {
      list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }

    return list;
  });

  // Size Filter Click
  selectSize(sizeValue: string): void {
    this.selectedSize.set(sizeValue);
  }

  // Feature Filter Toggle
  toggleFilter(filterId: string): void {
    this.activeFilters.update((set) => {
      const next = new Set(set);
      if (next.has(filterId)) {
        next.delete(filterId);
      } else {
        next.add(filterId);
      }
      return next;
    });
  }

  isFilterActive(filterId: string): boolean {
    return this.activeFilters().has(filterId);
  }

  // Sort Selection
  onSortChange(newSort: string): void {
    this.selectedSort.set(newSort);
  }

  // Reset Filters
  resetAllFilters(): void {
    this.selectedSize.set('all');
    this.activeFilters.set(new Set());
    this.selectedSort.set('recommended');
    this.showToast('All filters have been reset');
  }

  // Cart Management
  addToCart(product: ProductItem): void {
    this.cartItems.update((items) => {
      const existing = items.find((i) => i.product.id === product.id);
      if (existing) {
        return items.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...items, { product, quantity: 1 }];
    });
    this.showToast(`Added ${product.name} to cart`);
  }

  updateQuantity(productId: string, delta: number): void {
    this.cartItems.update((items) => {
      return items
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  }

  getCartQuantity(productId: string): number {
    const item = this.cartItems().find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  }

  // Promo Code Copy
  copyPromoCode(code: string): void {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
    }
    this.promoCopied.set(true);
    this.showToast(`Promo code ${code} copied!`);
    setTimeout(() => this.promoCopied.set(false), 3000);
  }

  // Modal Triggers
  openLocationModal(): void {
    this.showToast('Location selector: Choose estate in Nairobi');
  }

  private router = inject(Router);

  openCart(): void {
    this.router.navigate(['/cart']);
  }

  openSignInModal(): void {
    this.showToast('Sign in modal opened');
  }

  openPassport(product: ProductItem): void {
    this.showToast(`Water Passport for ${product.name}: pH ${product.ph}, TDS ${product.tds}`);
  }

  openVendorShop(vendor: VendorItem): void {
    this.router.navigate(['/vendor-shop']);
  }

  navigateToProduct(product: ProductItem): void {
    this.router.navigate(['/product-detail']);
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      if (this.toastMessage() === msg) {
        this.toastMessage.set(null);
      }
    }, 3000);
  }
}
