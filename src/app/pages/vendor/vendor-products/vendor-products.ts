import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendorSidebar } from '../../../shared/layout/vendor-sidebar/vendor-sidebar';

export type ProductStatus = 'Selling' | 'Paused' | 'Out of stock';

export interface Product {
  id: string;
  name: string;
  note?: string;
  size: string;
  price: number;
  marketMin: number;
  marketMax: number;
  availableToday: number;
  soldToday: number;
  status: ProductStatus;
}

@Component({
  selector: 'app-vendor-products',
  standalone: true,
  imports: [CommonModule, FormsModule, VendorSidebar],
  templateUrl: './vendor-products.html',
})
export class VendorProducts {
  activeTab = signal<ProductStatus>('Selling');
  tabs: ProductStatus[] = ['Selling', 'Paused', 'Out of stock'];

  products = signal<Product[]>([
    { id: 'p1', name: '20L refill — hard jug', note: 'Customer returns an empty jug', size: '20 L', price: 250, marketMin: 230, marketMax: 320, availableToday: 14, soldToday: 22, status: 'Selling' },
    { id: 'p2', name: '20L new jug + water', note: 'Jug included', size: '20 L', price: 1150, marketMin: 1100, marketMax: 1400, availableToday: 2, soldToday: 3, status: 'Selling' },
    { id: 'p3', name: '500ml bottled water', note: 'Sealed case of 24', size: 'Case', price: 620, marketMin: 580, marketMax: 750, availableToday: 9, soldToday: 6, status: 'Selling' },
    { id: 'p4', name: 'Tank delivery', note: 'Quoted per request', size: '5,000 L', price: 6500, marketMin: 6000, marketMax: 9000, availableToday: 0, soldToday: 1, status: 'Selling' },
    { id: 'p5', name: '10L bottle', size: '10 L', price: 180, marketMin: 170, marketMax: 240, availableToday: 0, soldToday: 0, status: 'Paused' },
  ]);

  counts = computed(() => {
    const c: Record<ProductStatus, number> = { Selling: 0, Paused: 0, 'Out of stock': 0 };
    this.products().forEach(p => c[p.status]++);
    return c;
  });

  filtered = computed(() => this.products().filter(p => p.status === this.activeTab()));

  setTab(tab: ProductStatus): void {
    this.activeTab.set(tab);
  }

  updateStock(id: string, delta: number): void {
    this.products.update(list => list.map(p =>
      p.id === id ? { ...p, availableToday: Math.max(0, p.availableToday + delta) } : p
    ));
  }

  updatePrice(id: string, value: string): void {
    const price = Number(value);
    if (!isNaN(price)) {
      this.products.update(list => list.map(p => p.id === id ? { ...p, price } : p));
    }
  }

  togglePause(product: Product): void {
    const next: ProductStatus = product.status === 'Paused' ? 'Selling' : 'Paused';
    this.products.update(list => list.map(p => p.id === product.id ? { ...p, status: next } : p));
  }

  positionLabel(p: Product): string {
    if (p.price <= p.marketMin) return 'Cheapest in your area';
    if (p.price >= p.marketMax) return 'Highest in your area';
    return 'Mid-range for your area';
  }
}