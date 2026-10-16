import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api`;

  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(
      `${this.apiUrl}/cart`,
      { withCredentials: true }
    );
  }

  addToCart(request: AddToCartRequest): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/cart`,
      request,
      {
        responseType: 'text',
        withCredentials: true
      }
    );
  }

  removeFromCart(productId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/cart/items/${encodeURIComponent(productId)}`,
      { withCredentials: true }
    );
  }
}