/**
 * OrderStateService — persists the most recently placed order across navigation.
 *
 * The Angular Router's navigation state (window.history.state) is lost on a
 * hard refresh and unreliable when the user navigates back/forward. This
 * service keeps a copy in both a reactive signal and sessionStorage so that
 * the live-tracking and order-confirmed pages can always display the correct
 * order details regardless of how the user arrived.
 */
import { Injectable, signal, computed } from '@angular/core';

const STORAGE_KEY = 'majisafi_last_order';

// ── Public interfaces ──────────────────────────────────────────────────────────

export interface OrderLineItem {
  productId:   string;
  name:        string;
  quantity:    number;
  unitPrice:   number;
  subtotal:    number;
}

export interface PlacedOrderState {
  orderId:         string;
  orderNumber:     string;   // display-friendly, e.g. "WM10248"
  totalAmount:     number;
  deliveryFee:     number;
  phoneNumber:     string;
  mpesaReceiptCode: string;
  vendorName:      string;
  deliveryAddress: string;
  deliveryEstate:  string;
  estimatedMins:   number;
  items:           OrderLineItem[];
  placedAt:        string;   // ISO timestamp
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class OrderStateService {

  private readonly _order = signal<PlacedOrderState | null>(this._loadFromStorage());

  /** The last placed order, or null if none. */
  readonly order = this._order.asReadonly();

  /** Convenience: the ordered items array, or empty array. */
  readonly items = computed(() => this._order()?.items ?? []);

  /** Convenience: total amount paid. */
  readonly totalAmount = computed(() => this._order()?.totalAmount ?? 0);

  /** Convenience: delivery fee. */
  readonly deliveryFee = computed(() => this._order()?.deliveryFee ?? 0);

  // ── Mutations ─────────────────────────────────────────────────────────────

  /** Save a newly placed order. Called from checkout after POST /api/orders succeeds. */
  setOrder(state: PlacedOrderState): void {
    this._order.set(state);
    this._saveToStorage(state);
  }

  /** Clear the stored order (e.g. after user starts a new one). */
  clearOrder(): void {
    this._order.set(null);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }

  // ── Storage helpers ───────────────────────────────────────────────────────

  private _loadFromStorage(): PlacedOrderState | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as PlacedOrderState;
    } catch {
      return null;
    }
  }

  private _saveToStorage(state: PlacedOrderState): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { /* storage quota – ignore */ }
  }
}
