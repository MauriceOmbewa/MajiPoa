// ==========================================================================
// MajiSafi - Standalone Angular Cart Component
// Framework: Angular 17 / 18 / 19 Standalone Component
// Selector: app-cart
// File: src/app/pages/cart/cart.ts
// ==========================================================================

import { Component, signal, computed, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

export interface CartItemModel {
  id: string;
  name: string;
  size: string;
  unitPriceKsh: number;
  quantity: number;
}

export interface VendorGroupModel {
  vendorId: string;
  vendorName: string;
  vendorInitials: string;
  estate: string;
  deliveryTimeText: string;
  status: 'Open' | 'Busy' | 'Closed';
  deliveryFeeKsh: number;
  items: CartItemModel[];
}

export interface AppliedDiscountModel {
  code: string;
  amountKsh: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  // Configurable input for external parent components
  @Input() set initialVendors(groups: VendorGroupModel[]) {
    if (groups && groups.length > 0) {
      this.vendorGroups.set(groups);
    }
  }

  @Output() checkoutRequested = new EventEmitter<{
    totalKsh: number;
    groups: VendorGroupModel[];
    discount: AppliedDiscountModel | null;
  }>();

  @Output() continueShoppingRequested = new EventEmitter<void>();
  @Output() cartItemUpdated = new EventEmitter<{ vendorId: string; itemId: string; quantity: number }>();

  // State signals
  vendorGroups = signal<VendorGroupModel[]>([
    {
      vendorId: 'v-abc',
      vendorName: 'ABC Water',
      vendorInitials: 'AW',
      estate: 'Kilimani',
      deliveryTimeText: '45 min',
      status: 'Open',
      deliveryFeeKsh: 80,
      items: [
        {
          id: 'item-1',
          name: '20L refill — hard jug',
          size: '20L',
          unitPriceKsh: 250,
          quantity: 2,
        },
        {
          id: 'item-2',
          name: '500ml bottled water · case of 24',
          size: '500ml',
          unitPriceKsh: 620,
          quantity: 1,
        },
      ],
    },
    {
      vendorId: 'v-blue',
      vendorName: 'Blue Spring Water',
      vendorInitials: 'BS',
      estate: 'Yaya',
      deliveryTimeText: '1 hr 20',
      status: 'Busy',
      deliveryFeeKsh: 80,
      items: [
        {
          id: 'item-3',
          name: '10L bottle',
          size: '10L',
          unitPriceKsh: 180,
          quantity: 1,
        },
      ],
    },
  ]);

  promoInput = signal<string>('MAJI50');
  appliedDiscount = signal<AppliedDiscountModel | null>({
    code: 'MAJI50',
    amountKsh: 50,
  });
  promoMessage = signal<string>('Promo code MAJI50 applied (KSh 50 off)');
  promoSuccess = signal<boolean>(true);

  // Computeds
  totalItemsCount = computed(() => {
    return this.vendorGroups().reduce((acc, v) => {
      return acc + v.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);
  });

  waterSubtotal = computed(() => {
    return this.vendorGroups().reduce((acc, v) => {
      return acc + v.items.reduce((itemSum, item) => itemSum + item.unitPriceKsh * item.quantity, 0);
    }, 0);
  });

  totalDeliveryFee = computed(() => {
    return this.vendorGroups().reduce((acc, v) => acc + v.deliveryFeeKsh, 0);
  });

  vendorCount = computed(() => this.vendorGroups().length);

  hasMultipleVendors = computed(() => this.vendorGroups().length > 1);

  totalDue = computed(() => {
    const discount = this.appliedDiscount()?.amountKsh || 0;
    const rawTotal = this.waterSubtotal() + this.totalDeliveryFee() - discount;
    return Math.max(0, rawTotal);
  });

  getVendorSubtotal(vendor: VendorGroupModel): number {
    return vendor.items.reduce((acc, item) => acc + item.unitPriceKsh * item.quantity, 0);
  }

  updateQuantity(vendorId: string, itemId: string, delta: number) {
    this.vendorGroups.update((groups) => {
      return groups
        .map((group) => {
          if (group.vendorId !== vendorId) return group;
          const updatedItems = group.items
            .map((item) => {
              if (item.id !== itemId) return item;
              const newQty = item.quantity + delta;
              return { ...item, quantity: newQty };
            })
            .filter((item) => item.quantity > 0);

          return { ...group, items: updatedItems };
        })
        .filter((group) => group.items.length > 0);
    });

    // Notify listeners
    const group = this.vendorGroups().find((g) => g.vendorId === vendorId);
    const item = group?.items.find((i) => i.id === itemId);
    this.cartItemUpdated.emit({
      vendorId,
      itemId,
      quantity: item ? item.quantity : 0,
    });
  }

  removeVendor(vendorId: string) {
    this.vendorGroups.update((groups) => groups.filter((g) => g.vendorId !== vendorId));
  }

  onPromoInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.promoInput.set(target.value.trim().toUpperCase());
  }

  applyPromo() {
    const code = this.promoInput().trim().toUpperCase();
    if (!code) {
      this.promoMessage.set('Please enter a valid coupon code.');
      this.promoSuccess.set(false);
      return;
    }

    if (code === 'MAJI50') {
      this.appliedDiscount.set({ code: 'MAJI50', amountKsh: 50 });
      this.promoMessage.set('Code MAJI50 applied (KSh 50 off)!');
      this.promoSuccess.set(true);
    } else if (code === 'NAIROBI100') {
      this.appliedDiscount.set({ code: 'NAIROBI100', amountKsh: 100 });
      this.promoMessage.set('Code NAIROBI100 applied (KSh 100 off)!');
      this.promoSuccess.set(true);
    } else if (code === 'SAFIFREE') {
      const fee = this.totalDeliveryFee();
      this.appliedDiscount.set({ code: 'SAFIFREE', amountKsh: fee });
      this.promoMessage.set('Free delivery applied!');
      this.promoSuccess.set(true);
    } else {
      this.promoMessage.set('Invalid code. Try MAJI50 or NAIROBI100.');
      this.promoSuccess.set(false);
    }
  }

  private router = inject(Router);

  proceedToCheckout() {
    this.router.navigate(['/checkout']);
  }

  keepShopping() {
    this.continueShoppingRequested.emit();
  }
}
