import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CartItemResponse {
  cartItemId: string;
  productId: string;
  productName: string;
  imageUrl: string | null;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface CartResponse {
  items: CartItemResponse[];
  totalQuantity: number;
  totalAmount: number;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
  productName?: string;
  price?: number;
}

const STORAGE_KEY = 'majisafi_cart';

const EMPTY_CART: CartResponse = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
};

/** Recompute totals from the items array so localStorage copies are always consistent. */
function recomputeTotals(items: CartItemResponse[]): CartResponse {
  const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);
  const totalAmount   = items.reduce((s, i) => s + i.subtotal, 0);
  return { items, totalQuantity, totalAmount };
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http    = inject(HttpClient);
  private readonly apiUrl  = `${environment.apiUrl}/api`;

  // ── Shared reactive cart state ────────────────────────────────────────────
  readonly cart = signal<CartResponse>(this._loadFromStorage());

  readonly cartItems     = computed(() => this.cart().items);
  readonly totalQuantity = computed(() => this.cart().totalQuantity);
  readonly totalAmount   = computed(() => this.cart().totalAmount);

  // ── API methods ───────────────────────────────────────────────────────────

  /**
   * Fetch cart from the backend. Falls back to localStorage if the request
   * fails (e.g. user is offline or not yet signed in).
   */
  getCart(): Observable<CartResponse> {
    return this.http
      .get<CartResponse>(`${this.apiUrl}/cart`, { withCredentials: true })
      .pipe(
        tap((response) => this._setCart(response)),
        catchError(() => {
          // Serve the locally-cached copy so the UI is never blank.
          const local = this._loadFromStorage();
          this._setCart(local);
          return of(local);
        })
      );
  }

  /**
   * POST a new item. On API success the backend response is the canonical
   * source. On failure we fall back to updating localStorage optimistically
   * so the user's selection is never lost.
   */
  addToCart(request: AddToCartRequest): Observable<string> {
    // Optimistic local update immediately so navigation doesn't lose the item.
    this._addItemLocally(request);

    return this.http
      .post(`${this.apiUrl}/cart`, request, {
        responseType: 'text',
        withCredentials: true,
      })
      .pipe(
        switchMap(() => this.refreshCart().pipe(map(() => 'ok'))),
        catchError(() => {
          // API unavailable – the optimistic local state is already saved.
          return of('ok (local)');
        })
      );
  }

  /**
   * DELETE an item. Falls back to removing from localStorage if the API
   * is unavailable.
   */
  removeFromCart(productId: string): Observable<void> {
    // Optimistic local removal immediately.
    this._removeItemLocally(productId);

    return this.http
      .delete<void>(
        `${this.apiUrl}/cart/items/${encodeURIComponent(productId)}`,
        { withCredentials: true }
      )
      .pipe(
        switchMap(() => this.refreshCart()),
        map(() => undefined),
        catchError(() => of(undefined))
      );
  }

  /** Re-fetch from the backend (or fall back to local cache). */
  refreshCart(): Observable<CartResponse> {
    return this.getCart();
  }

  /**
   * Update the quantity of an existing cart item locally and on the backend.
   * Used by the cart page quantity stepper.
   */
  updateQuantity(productId: string, newQty: number): Observable<void> {
    const current = this.cart();
    const updated = current.items.map((item) =>
      item.productId === productId
        ? { ...item, quantity: newQty, subtotal: item.price * newQty }
        : item
    );
    this._setCart(recomputeTotals(updated));

    // Attempt to sync with the backend (fire-and-forget – ignore errors).
    return this.http
      .patch<void>(
        `${this.apiUrl}/cart/items/${encodeURIComponent(productId)}`,
        { quantity: newQty },
        { withCredentials: true }
      )
      .pipe(catchError(() => of(undefined)));
  }

  /** Clear both the in-memory signal and localStorage (used on sign-out). */
  clearCart(): void {
    this._setCart(EMPTY_CART);
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private _setCart(cart: CartResponse): void {
    this.cart.set(cart);
    this._saveToStorage(cart);
  }

  private _loadFromStorage(): CartResponse {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return EMPTY_CART;
      const parsed = JSON.parse(raw) as CartResponse;
      // Basic validation so corrupted data doesn't crash the app.
      if (!Array.isArray(parsed?.items)) return EMPTY_CART;
      return recomputeTotals(parsed.items);
    } catch {
      return EMPTY_CART;
    }
  }

  private _saveToStorage(cart: CartResponse): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Storage quota exceeded or private-browsing restriction – ignore.
    }
  }

  private _addItemLocally(request: AddToCartRequest): void {
    const current = this.cart();
    const existing = current.items.find((i) => i.productId === request.productId);
    let items: CartItemResponse[];

    if (existing) {
      const newQty = existing.quantity + request.quantity;
      items = current.items.map((i) =>
        i.productId === request.productId
          ? { ...i, quantity: newQty, subtotal: i.price * newQty }
          : i
      );
    } else {
      const price = request.price ?? 0;
      const newItem: CartItemResponse = {
        cartItemId:  `local-${request.productId}-${Date.now()}`,
        productId:   request.productId,
        productName: request.productName ?? request.productId,
        imageUrl:    null,
        quantity:    request.quantity,
        price,
        subtotal:    price * request.quantity,
      };
      items = [...current.items, newItem];
    }

    this._setCart(recomputeTotals(items));
  }

  private _removeItemLocally(productId: string): void {
    const filtered = this.cart().items.filter((i) => i.productId !== productId);
    this._setCart(recomputeTotals(filtered));
  }
}
