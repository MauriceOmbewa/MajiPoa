import { Component, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface VendorProfile {
  id: string;
  name: string;
  initials: string;
  estate: string;
  distanceKm: number;
  closingTime: string;
  rating: number;
  reviewCount: number;
  deliveryTimeMins: number;
  sinceYear: number;
  verified: boolean;
  phone: string;
  source: string;
  treatment: string;
  ph: number;
  tds: number;
  lastLabTest: string;
  labAgency: string;
}

export interface VendorProductItem {
  id: string;
  name: string;
  size: string;
  category: string;
  vendor: string;
  priceKsh: number;
  tag?: string;
  tagType?: 'ok' | 'info' | 'warn';
  description: string;
}

@Component({
  selector: 'app-vendor-shop',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './vendor-shop.html',
  styleUrl: './vendor-shop.scss',
})
export class VendorShop {
  @Input() set vendorInput(v: Partial<VendorProfile>) {
    if (v) {
      this.vendor.update(current => ({ ...current, ...v }));
    }
  }

  @Output() cartAdded = new EventEmitter<VendorProductItem>();
  @Output() productSelected = new EventEmitter<VendorProductItem>();
  @Output() viewPassport = new EventEmitter<VendorProfile>();
  @Output() backRequested = new EventEmitter<void>();
  @Output() quoteRequested = new EventEmitter<string>();

  activeTab = signal<'products' | 'quality' | 'reviews' | 'delivery'>('products');

  vendor = signal<VendorProfile>({
    id: 'v-abc',
    name: 'ABC Water',
    initials: 'AW',
    estate: 'Kilimani',
    distanceKm: 1.2,
    closingTime: '8:00 pm',
    rating: 4.8,
    reviewCount: 612,
    deliveryTimeMins: 45,
    sinceYear: 2021,
    verified: true,
    phone: '+254 700 123 456',
    source: 'Licensed borehole, Ngong Rd',
    treatment: 'RO + UV',
    ph: 7.2,
    tds: 68,
    lastLabTest: '2 Sep 2026',
    labAgency: 'SGS Kenya'
  });

  vendorProducts = signal<VendorProductItem[]>([
    { id: 'p1', name: '20L refill — hard jug', size: '20L', category: '20L refill jug', vendor: 'ABC Water', priceKsh: 250, description: 'Bring your own jug' },
    { id: 'p2', name: '20L new jug + water', size: '20L', category: '20L new jug', vendor: 'ABC Water', priceKsh: 1150, description: 'Jug is yours to keep' },
    { id: 'p3', name: '500ml bottled water', size: '500ml', category: '500ml case', vendor: 'ABC Water', priceKsh: 620, tag: 'Case of 24', tagType: 'info', description: 'Sealed case' },
    { id: 'p4', name: 'Tank delivery', size: '5,000L', category: 'Tank / bulk delivery', vendor: 'ABC Water', priceKsh: 6500, description: 'Quote within 30 min' }
  ]);

  setTab(tab: 'products' | 'quality' | 'reviews' | 'delivery') {
    this.activeTab.set(tab);
  }

  onProductClick(product: VendorProductItem) {
    this.productSelected.emit(product);
  }

  addProductToCart(product: VendorProductItem) {
    this.cartAdded.emit(product);
  }

  openPassport() {
    this.viewPassport.emit(this.vendor());
  }

  requestTankQuote() {
    this.quoteRequested.emit(this.vendor().name);
  }

  goBack() {
    this.backRequested.emit();
  }

  scrollToProducts() {
    this.activeTab.set('products');
    const el = document.getElementById('vendor-products-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  showToast(message: string) {
    console.log(message);
  }
}
