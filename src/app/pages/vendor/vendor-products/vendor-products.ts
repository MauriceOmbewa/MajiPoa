import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendorSidebar } from '../../../shared/layout/vendor-sidebar/vendor-sidebar';
import { VendorApiService } from '../../../shared/services/vendor-api.service';
import { ProductDto, ProductStatus } from '../../../shared/models/api.models';

const STATUS_DISPLAY: Record<ProductStatus, string> = {
  SELLING: 'Selling', PAUSED: 'Paused', OUT_OF_STOCK: 'Out of stock',
};

@Component({
  selector: 'app-vendor-products',
  standalone: true,
  imports: [CommonModule, FormsModule, VendorSidebar],
  templateUrl: './vendor-products.html',
})
export class VendorProducts implements OnInit {
  private readonly api = inject(VendorApiService);

  loading   = signal(true);
  error     = signal<string | null>(null);
  activeTab = signal<ProductStatus>('SELLING');
  tabs: ProductStatus[] = ['SELLING', 'PAUSED', 'OUT_OF_STOCK'];
  readonly tabLabels = STATUS_DISPLAY;

  products = signal<ProductDto[]>([]);

  counts = computed(() => {
    const c = { SELLING: 0, PAUSED: 0, OUT_OF_STOCK: 0 } as Record<ProductStatus, number>;
    this.products().forEach(p => c[p.status]++);
    return c;
  });

  filtered = computed(() => this.products().filter(p => p.status === this.activeTab()));

  ngOnInit(): void {
    this.api.getProducts().subscribe({
      next: ps => { this.products.set(ps); this.loading.set(false); },
      error: () => { this.error.set('Failed to load products.'); this.loading.set(false); },
    });
  }

  setTab(tab: ProductStatus): void { this.activeTab.set(tab); }

  updateStock(id: number, delta: number): void {
    this.api.updateStock(id, delta).subscribe({
      next: updated => this.products.update(list => list.map(x => x.id === updated.id ? updated : x)),
    });
  }

  updatePrice(id: number, value: string): void {
    const price = Number(value);
    if (!isNaN(price) && price >= 0) {
      this.api.updatePrice(id, price).subscribe({
        next: updated => this.products.update(list => list.map(x => x.id === updated.id ? updated : x)),
      });
    }
  }

  togglePause(p: ProductDto): void {
    this.api.togglePause(p.id).subscribe({
      next: updated => this.products.update(list => list.map(x => x.id === updated.id ? updated : x)),
    });
  }

  positionLabel(p: ProductDto): string {
    if (p.price <= p.marketMin) return 'Cheapest in your area';
    if (p.price >= p.marketMax) return 'Highest in your area';
    return 'Mid-range for your area';
  }

  statusLabel(s: ProductStatus): string { return STATUS_DISPLAY[s]; }
}
