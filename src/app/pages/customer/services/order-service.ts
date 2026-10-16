import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface OrderItemResponse {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  subTotal: number;
}

export interface OrderResponse {
  orderId: string;
  totalAmount: number;
  status: string;
  items: OrderItemResponse[];
  createdAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api`;

  placeOrder(): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(
      `${this.apiUrl}/orders`,
      {},
      { withCredentials: true }
    );
  }
}