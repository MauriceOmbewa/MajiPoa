import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorSidebar } from '../../../shared/layout/vendor-sidebar/vendor-sidebar';
import { VendorApiService } from '../../../shared/services/vendor-api.service';
import { SubscriptionPlan } from '../../../shared/models/api.models';

export interface PlanFeature { text: string; }

@Component({
  selector: 'app-vendor-subscription',
  standalone: true,
  imports: [CommonModule, VendorSidebar],
  templateUrl: './vendor-subscription.html',
})
export class VendorSubscription implements OnInit {
  private readonly api = inject(VendorApiService);

  loading     = signal(true);
  error       = signal<string | null>(null);
  currentPlan = signal<SubscriptionPlan>('FREE');
  upgrading   = signal(false);

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

  ngOnInit(): void {
    this.api.getSubscription().subscribe({
      next: s  => { this.currentPlan.set(s.plan); this.loading.set(false); },
      error: () => { this.error.set('Failed to load subscription.'); this.loading.set(false); },
    });
  }

  upgrade(): void {
    this.upgrading.set(true);
    this.api.upgradeToPro().subscribe({
      next: s  => { this.currentPlan.set(s.plan); this.upgrading.set(false); },
      error: () => { this.upgrading.set(false); },
    });
  }
}
