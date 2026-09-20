/**
 * ============================================================================
 * MajiSafi Standalone Home Component for Angular 17+ / 18+ / 19+
 * File: src/app/pages/home/home.component.ts
 *
 * Implements:
 * - Standalone Component architecture (standalone: true)
 * - Modern Angular Signals (signal, computed) for reactive state
 * - Clean types and interfaces
 * - All interactive marketplace logic: Cart, M-Pesa, Water Passport, Location
 * ============================================================================
 */

import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

export interface WaterProduct {
  id: string;
  name: string;
  size: string;
  category: string;
  vendor: string;
  estate: string;
  distanceKm: number;
  deliveryTimeMins: number;
  priceKsh: number;
  verified: boolean;
  tag?: string;
  source?: string;
  treatment?: string;
  ph?: number;
  tds?: number;
  batchCode?: string;
}

export interface CartItem {
  product: WaterProduct;
  quantity: number;
}

export interface LocationEstate {
  id: string;
  name: string;
  vendorCount: number;
  averageDeliveryMins: number;
}

export interface WaterPassportData {
  batchNumber: string;
  testedDate: string;
  vendorName: string;
  sourceLocation: string;
  treatmentMethod: string;
  phLevel: number;
  tdsLevel: number;
  coliformCount: number;
  kebsLicenceNumber: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {
  // Navigation State
  activeNav = signal<string>('discover');
  navItems = [
    { label: 'Order water', key: 'discover' },
    { label: 'My orders', key: 'orders' },
    { label: 'Water quality', key: 'quality' },
    { label: 'Help', key: 'support' },
    { label: 'Vendor', key: 'vendor' },
    { label: 'Rider', key: 'rider' },
    { label: 'Admin', key: 'admin' }
  ];

  // Estates Available in Nairobi
  nairobiEstates: LocationEstate[] = [
    { id: 'kilimani', name: 'Kilimani, Nairobi', vendorCount: 47, averageDeliveryMins: 35 },
    { id: 'kileleshwa', name: 'Kileleshwa, Nairobi', vendorCount: 38, averageDeliveryMins: 40 },
    { id: 'westlands', name: 'Westlands, Nairobi', vendorCount: 52, averageDeliveryMins: 30 },
    { id: 'lavington', name: 'Lavington, Nairobi', vendorCount: 31, averageDeliveryMins: 45 },
    { id: 'south-b', name: 'South B & C, Nairobi', vendorCount: 29, averageDeliveryMins: 40 },
    { id: 'karen', name: 'Karen & Langata', vendorCount: 24, averageDeliveryMins: 50 },
  ];

  // Current Active Delivery Location
  currentEstate = signal<LocationEstate>(this.nairobiEstates[0]);
  searchLocation = signal<string>('Kilimani, Argwings Kodhek Rd');

  // Filter Categories
  selectedNeed = signal<string>('all');
  activeFilterChip = signal<string>('all');
  filterChips = [
    { label: 'All Items', value: 'all' },
    { label: '20L Refills', value: 'refills' },
    { label: 'Bottles (10L / 5L)', value: 'bottles' },
    { label: 'Cases (500ml)', value: 'cases' },
    { label: 'Bulk Tanker', value: 'bulk' },
  ];

  // Products Catalog
  products = signal<WaterProduct[]>([
    {
      id: 'p1',
      name: '20L refill — hard jug',
      size: '20L',
      category: '20L refill jug',
      vendor: 'ABC Water Kenya',
      estate: 'Kilimani',
      distanceKm: 1.2,
      deliveryTimeMins: 45,
      priceKsh: 250,
      verified: true,
      tag: 'Cheapest nearby',
      source: 'Tigoni Protected Aquifer',
      treatment: '7-Stage Reverse Osmosis + UV Sterilization',
      ph: 7.34,
      tds: 38.2,
      batchCode: 'KLI-2026-0915'
    },
    {
      id: 'p2',
      name: '20L refill — soft bottle',
      size: '20L',
      category: '20L refill jug',
      vendor: 'Aqua Fresh Springs',
      estate: 'Hurlingham',
      distanceKm: 2.4,
      deliveryTimeMins: 60,
      priceKsh: 290,
      verified: true,
      source: 'Kikuyu Deep Well (180m)',
      treatment: 'Ultrafiltration + Activated Carbon + Ozone',
      ph: 7.20,
      tds: 42.0,
      batchCode: 'AQF-2026-0914'
    },
    {
      id: 'p3',
      name: '10L bottle (easy carry)',
      size: '10L',
      category: '10L bottle',
      vendor: 'Blue Spring Ltd',
      estate: 'Yaya Centre',
      distanceKm: 0.9,
      deliveryTimeMins: 40,
      priceKsh: 180,
      verified: true,
      source: 'Aberdare Highland Reserve',
      treatment: 'Natural Mineral Spring Micro-Filtration',
      ph: 7.50,
      tds: 55.1,
      batchCode: 'BLS-2026-0912'
    },
    {
      id: 'p4',
      name: '500ml bottled water (Case of 24)',
      size: '500ml',
      category: '500ml case',
      vendor: 'ABC Water Kenya',
      estate: 'Kilimani',
      distanceKm: 1.2,
      deliveryTimeMins: 45,
      priceKsh: 620,
      verified: true,
      tag: 'Case of 24',
      source: 'Tigoni Protected Aquifer',
      treatment: '7-Stage RO + UV + Remineralized',
      ph: 7.34,
      tds: 38.2,
      batchCode: 'KLI-2026-0915'
    },
    {
      id: 'p5',
      name: '20L new hard jug (filled)',
      size: '20L',
      category: '20L new jug',
      vendor: 'CleanDrop Oasis',
      estate: 'Kileleshwa',
      distanceKm: 1.8,
      deliveryTimeMins: 50,
      priceKsh: 1200,
      verified: true,
      tag: 'Includes Jug',
      source: 'Oloolua Natural Spring',
      treatment: 'Multi-Barrier Ceramic + Reverse Osmosis',
      ph: 7.42,
      tds: 45.0,
      batchCode: 'CDO-2026-0913'
    },
    {
      id: 'p6',
      name: '5L compact bottle',
      size: '5L',
      category: '5L bottle',
      vendor: 'PureFlow Nairobi',
      estate: 'Lavington',
      distanceKm: 2.1,
      deliveryTimeMins: 55,
      priceKsh: 120,
      verified: true,
      source: 'Mount Kenya Foothills',
      treatment: 'UV + Carbon Polish',
      ph: 7.28,
      tds: 49.0,
      batchCode: 'PFN-2026-0911'
    },
    {
      id: 'p7',
      name: '5,000L Residential Water Tanker',
      size: '5,000L',
      category: 'Tank / bulk delivery',
      vendor: 'Nairobi Bulk Maji Bowsers',
      estate: 'Industrial Area',
      distanceKm: 4.5,
      deliveryTimeMins: 90,
      priceKsh: 4500,
      verified: true,
      tag: 'Bulk Bowser',
      source: 'Thika Municipal High Capacity Well',
      treatment: 'Chlorinated & Pressure Sand Filtered',
      ph: 7.15,
      tds: 72.0,
      batchCode: 'NBM-2026-0910'
    },
  ]);

  // Reactive Computed Filtered Products
  filteredProducts = computed(() => {
    let result = this.products();

    // Filter by dropdown category
    const need = this.selectedNeed();
    if (need !== 'all') {
      result = result.filter((p) => p.category === need);
    }

    // Filter by quick pill chip
    const chip = this.activeFilterChip();
    if (chip === 'refills') {
      result = result.filter((p) => p.category === '20L refill jug');
    } else if (chip === 'bottles') {
      result = result.filter((p) => p.category === '10L bottle' || p.category === '5L bottle');
    } else if (chip === 'cases') {
      result = result.filter((p) => p.category === '500ml case');
    } else if (chip === 'bulk') {
      result = result.filter((p) => p.category === 'Tank / bulk delivery');
    }

    return result;
  });

  // Reactive Cart State
  cartItems = signal<CartItem[]>([
    { product: this.products()[0], quantity: 1 },
    { product: this.products()[3], quantity: 1 }
  ]);

  totalCartCount = computed(() => {
    return this.cartItems().reduce((sum, item) => sum + item.quantity, 0);
  });

  cartSubtotal = computed(() => {
    return this.cartItems().reduce((sum, item) => sum + item.product.priceKsh * item.quantity, 0);
  });

  // Modals Visibility
  isCartOpen = signal<boolean>(false);
  isPassportOpen = signal<boolean>(false);
  activePassport = signal<WaterPassportData | null>(null);
  isMpesaOpen = signal<boolean>(false);
  mpesaStep = signal<'input' | 'prompt' | 'success'>('input');
  mpesaPhone = signal<string>('0712345678');
  isLocationOpen = signal<boolean>(false);
  isRecurringOpen = signal<boolean>(false);
  isVendorOpen = signal<boolean>(false);
  toastMessage = signal<string | null>(null);

  // Methods
  setActiveNav(key: string): void {
    this.activeNav.set(key);
  }

  setFilterChip(chip: string): void {
    this.activeFilterChip.set(chip);
    this.selectedNeed.set('all');
  }

  resetFilters(): void {
    this.activeFilterChip.set('all');
    this.selectedNeed.set('all');
  }

  onFilterSubmit(): void {
    const el = document.getElementById('popular-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  useCurrentLocation(): void {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          this.currentEstate.set({
            id: 'kilimani',
            name: 'Kilimani, Nairobi (Detected)',
            vendorCount: 47,
            averageDeliveryMins: 35
          });
          this.searchLocation.set('Kilimani, Argwings Kodhek Rd');
          this.showToast('Location updated to Kilimani via GPS');
        },
        () => {
          this.showToast('Location set to Kilimani, Nairobi');
        }
      );
    }
  }

  getCartItemQuantity(productId: string): number {
    const found = this.cartItems().find((i) => i.product.id === productId);
    return found ? found.quantity : 0;
  }

  addToCart(product: WaterProduct): void {
    const items = [...this.cartItems()];
    const existingIndex = items.findIndex((i) => i.product.id === product.id);

    if (existingIndex > -1) {
      items[existingIndex] = {
        ...items[existingIndex],
        quantity: items[existingIndex].quantity + 1
      };
    } else {
      items.push({ product, quantity: 1 });
    }

    this.cartItems.set(items);
    this.showToast(`Added ${product.name} to cart`);
  }

  updateCartQuantity(productId: string, delta: number): void {
    const items = this.cartItems()
      .map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter((item): item is CartItem => item !== null);

    this.cartItems.set(items);
  }

  removeFromCart(productId: string): void {
    this.cartItems.set(this.cartItems().filter((i) => i.product.id !== productId));
  }

  openCart(): void {
    this.isCartOpen.set(true);
  }

  closeCart(): void {
    this.isCartOpen.set(false);
  }

  openPassportModal(product?: WaterProduct): void {
    const target = product || this.products()[0];
    this.activePassport.set({
      batchNumber: target.batchCode || 'KLI-2026-0915',
      testedDate: '15 Sep 2026 · 08:30 EAT',
      vendorName: target.vendor,
      sourceLocation: target.source || 'Tigoni Protected Natural Aquifer (Depth: 240m)',
      treatmentMethod: target.treatment || '7-Stage Reverse Osmosis & UV Sterilization',
      phLevel: target.ph || 7.34,
      tdsLevel: target.tds || 38.2,
      coliformCount: 0,
      kebsLicenceNumber: 'KEBS/SM-PVOC-2026/8849'
    });
    this.isPassportOpen.set(true);
  }

  proceedToMpesa(): void {
    this.isCartOpen.set(false);
    this.mpesaStep.set('input');
    this.isMpesaOpen.set(true);
  }

  sendMpesaPrompt(): void {
    this.mpesaStep.set('prompt');
  }

  confirmMpesaSuccess(): void {
    this.mpesaStep.set('success');
  }

  finishOrder(): void {
    this.cartItems.set([]);
    this.isMpesaOpen.set(false);
    this.showToast('Order confirmed! Water is dispatching to your door.');
  }

  openLocationModal(): void {
    this.isLocationOpen.set(true);
  }

  selectEstate(estate: LocationEstate): void {
    this.currentEstate.set(estate);
    this.searchLocation.set(estate.name);
    this.isLocationOpen.set(false);
    this.showToast(`Delivery area set to ${estate.name}`);
  }

  openRecurringModal(): void {
    this.isRecurringOpen.set(true);
  }

  saveRecurring(): void {
    this.isRecurringOpen.set(false);
    this.showToast('Recurring water subscription activated!');
  }

  openVendorModal(): void {
    this.isVendorOpen.set(true);
  }

  submitVendor(): void {
    this.isVendorOpen.set(false);
    this.showToast('Vendor registration submitted for KEBS verification');
  }

  openSignInModal(): void {
    this.showToast('Sign-in via M-Pesa phone number');
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3500);
  }

  private router = inject(Router);

  navigateToFindWater(): void {
    this.router.navigate(['/find-water']);
  }

  navigateToProduct(product: WaterProduct): void {
    this.router.navigate(['/product-detail']);
  }

  navigateToCart(): void {
    this.router.navigate(['/cart']);
  }
}
