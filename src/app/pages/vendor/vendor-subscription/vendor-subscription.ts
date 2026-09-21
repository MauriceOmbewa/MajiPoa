import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorSidebar } from '../../../shared/layout/vendor-sidebar/vendor-sidebar';

export interface PlanFeature {
  text: string;
}

@Component({
  selector: 'app-vendor-subscription',
  standalone: true,
  imports: [CommonModule, VendorSidebar],
  templateUrl: './vendor-subscription.html',
})
export class VendorSubscription {
  currentPlan = signal<'Free' | 'Pro'>('Free');

  freeFeatures: PlanFeature[] = [
    { text: 'Receive marketplace orders' },
    { text: 'Accept, prepare and fulfil orders' },
    { text: 'Products, prices and availability' },
    { text: 'Platform riders and your own delivery' },
    { text: 'Basic sales history, last 30 days' },
    { text: 'Weekly payouts and statements' },
    { text: 'Verification and water quality records' },
    { text: 'Ratings and reviews' },
  ];

  proFeatures: PlanFeature[] = [
    { text: 'Full analytics: sales, products, areas, hours, retention' },
    { text: 'Off-platform sales tracking' },
    { text: 'Inventory: jugs, seals, stock counts and alerts' },
    { text: 'Expense tracking and profit per product' },
    { text: 'M-Pesa reconciliation against your statements' },
    { text: 'Staff accounts with roles and permissions' },
    { text: 'Reports and CSV exports' },
    { text: 'Multiple branches under one business' },
  ];

  upgrading = signal(false);

  upgrade(): void {
    this.upgrading.set(true);
    // Simulated approval — replace with a real M-Pesa/subscription API call.
    setTimeout(() => {
      this.currentPlan.set('Pro');
      this.upgrading.set(false);
    }, 1200);
  }
}