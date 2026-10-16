import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface OrderFormProduct {
  id: string;
  name: string;
  size: string;
  priceKsh: number;
  description?: string;
  tag?: string;
}

export interface OrderFormEvent {
  product: OrderFormProduct;
  quantity: number;
}

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-form.html',
})
export class OrderForm {
  @Input() layout: 'card' | 'inline' = 'card';
  @Input() title = 'Order Water';
  @Input() subtitle = '';
  @Input() set products(val: OrderFormProduct[]) {
    this._products.set(val ?? []);
    if (val?.length) this.selectedProduct.set(val[0]);
  }

  @Output() addToCart = new EventEmitter<OrderFormEvent>();
  @Output() directCheckout = new EventEmitter<OrderFormEvent>();

  readonly _products = signal<OrderFormProduct[]>([]);
  readonly selectedProduct = signal<OrderFormProduct | null>(null);
  readonly quantity = signal<number>(1);

  readonly sizes = [
    { label: '20L Refill', size: '20L', category: '20L refill jug' },
    { label: '20L New Jug', size: '20L new', category: '20L new jug' },
    { label: '10L', size: '10L', category: '10L bottle' },
    { label: '5L', size: '5L', category: '5L bottle' },
    { label: '500ml Case', size: '500ml', category: '500ml case' },
    { label: 'Bulk Tank', size: 'bulk', category: 'Tank / bulk delivery' },
  ];

  selectedSize = signal<string>('20L');

  selectSize(size: string): void {
    this.selectedSize.set(size);
    const match = this._products().find(p =>
      size === 'bulk' ? p.size.includes('000') : p.size === size
    );
    if (match) this.selectedProduct.set(match);
  }

  increment(): void { this.quantity.update(q => q + 1); }
  decrement(): void { this.quantity.update(q => Math.max(1, q - 1)); }

  onAddToCart(): void {
    const p = this.selectedProduct();
    if (!p) return;
    this.addToCart.emit({ product: p, quantity: this.quantity() });
  }

  onDirectCheckout(): void {
    const p = this.selectedProduct();
    if (!p) return;
    this.directCheckout.emit({ product: p, quantity: this.quantity() });
  }
}
