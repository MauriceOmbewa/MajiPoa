import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VendorSidebar } from '../../../shared/layout/vendor-sidebar/vendor-sidebar';
import { VendorApiService } from '../../../shared/services/vendor-api.service';
import { OfflineSaleDto } from '../../../shared/models/api.models';

@Component({
  selector: 'app-vendor-offline-sales',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, VendorSidebar],
  templateUrl: './vendor-offline-sales.html',
})
export class VendorOfflineSales implements OnInit {
  private readonly api = inject(VendorApiService);

  loading = signal(true);
  error   = signal<string | null>(null);

  products = ['20L refill', '20L new bottle', '10L refill'];
  channels = ['Walk-in customer', 'Standing office client', 'Another delivery app', 'Other'];

  formDate    = signal(new Date().toISOString().slice(0, 10));
  formProduct = signal(this.products[0]);
  formQty     = signal(1);
  formAmount  = signal<number | null>(null);
  formChannel = signal(this.channels[0]);

  sales        = signal<OfflineSaleDto[]>([]);
  totalLogged  = computed(() => this.sales().reduce((s, x) => s + x.amount, 0));

  ngOnInit(): void {
    this.api.getOfflineSales().subscribe({
      next: s  => { this.sales.set(s); this.loading.set(false); },
      error: () => { this.error.set('Failed to load sales.'); this.loading.set(false); },
    });
  }

  addSale(): void {
    const amount = this.formAmount();
    if (!amount || amount <= 0) return;

    this.api.createOfflineSale({
      saleDate: this.formDate(),
      product:  this.formProduct(),
      qty:      this.formQty(),
      amount,
      channel:  this.formChannel(),
    }).subscribe({
      next: sale => {
        this.sales.update(list => [sale, ...list]);
        this.formAmount.set(null);
        this.formQty.set(1);
      },
    });
  }

  removeSale(id: number): void {
    this.api.deleteOfflineSale(id).subscribe({
      next: () => this.sales.update(list => list.filter(s => s.id !== id)),
    });
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }
}
