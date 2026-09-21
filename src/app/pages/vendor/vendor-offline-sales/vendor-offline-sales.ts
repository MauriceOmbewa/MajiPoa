import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VendorSidebar } from '../../../shared/layout/vendor-sidebar/vendor-sidebar';

export interface OfflineSale {
  date: string;
  product: string;
  qty: number;
  amount: number;
  channel: string;
}

@Component({
  selector: 'app-vendor-offline-sales',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, VendorSidebar],
  templateUrl: './vendor-offline-sales.html',
})
export class VendorOfflineSales {
  products = ['20L refill', '20L new bottle', '10L refill'];
  channels = ['Walk-in customer', 'Standing office client', 'Another delivery app', 'Other'];

  formDate = signal(new Date().toISOString().slice(0, 10));
  formProduct = signal(this.products[0]);
  formQty = signal(1);
  formAmount = signal<number | null>(null);
  formChannel = signal(this.channels[0]);

  sales = signal<OfflineSale[]>([
    { date: '15 Sep', product: '20L refill', qty: 6, amount: 1740, channel: 'Walk-in customer' },
    { date: '14 Sep', product: '20L new bottle', qty: 2, amount: 3000, channel: 'Standing office client' },
    { date: '13 Sep', product: '10L refill', qty: 10, amount: 2200, channel: 'Another delivery app' },
  ]);

  totalLogged = computed(() => this.sales().reduce((sum, s) => sum + s.amount, 0));

  addSale(): void {
    const amount = this.formAmount();
    if (!amount || amount <= 0) return;

    const d = new Date(this.formDate());
    const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

    this.sales.update(list => [
      { date: label, product: this.formProduct(), qty: this.formQty(), amount, channel: this.formChannel() },
      ...list,
    ]);

    this.formAmount.set(null);
    this.formQty.set(1);
  }

  removeSale(index: number): void {
    this.sales.update(list => list.filter((_, i) => i !== index));
  }
}