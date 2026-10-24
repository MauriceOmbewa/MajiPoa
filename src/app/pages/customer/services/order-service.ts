
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'DISPATCHED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItemResponse {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  subTotal: number;
}

export interface CustomerOrder {
  orderId: string;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItemResponse[];
  createdAt: string | null;
}

// export interface CustomerOrder {
//   orderId: string;
//   totalAmount: number;
//   status: OrderStatus;
//   items: OrderItemResponse[];
//   createdAt: string | null;
// }

export interface CartResponse {
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl =
    `${environment.apiUrl}/api/orders`;

  /**
   * Create an order from the authenticated customer's cart.
   */
  placeOrder(): Observable<CustomerOrder> {
    return this.http.post<CustomerOrder>(
      this.baseUrl,
      {},
      { withCredentials: true }
    );
  }

  /**
   * Retrieve orders belonging to the authenticated customer.
   */
  getMyOrders(): Observable<CustomerOrder[]> {
    return this.http.get<CustomerOrder[]>(
      `${this.baseUrl}/my-orders`,
      { withCredentials: true }
    );
  }

  /**
   * Retrieve one order belonging to the authenticated customer.
   */
  getMyOrder(orderId: string): Observable<CustomerOrder> {
    return this.http.get<CustomerOrder>(
      `${this.baseUrl}/${encodeURIComponent(orderId)}`,
      { withCredentials: true }
    );
  }

  /**
   * Add the products from a previous order back to the customer's cart.
   * This does not create or pay for a new order.
   */
  reorder(orderId: string): Observable<CartResponse> {
    return this.http.post<CartResponse>(
      `${this.baseUrl}/${encodeURIComponent(orderId)}/reorder`,
      {},
      { withCredentials: true }
    );
  }
}
