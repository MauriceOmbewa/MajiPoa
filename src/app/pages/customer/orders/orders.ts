
import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
  Output,
  EventEmitter
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { Navbar } from '../../../shared/layout/navbar/navbar';
import { Footer } from '../../../shared/layout/footer/footer';

import {
  OrderService,
  CustomerOrder,
  OrderStatus
} from '../services/order-service';

export type OrdersTab =
  | 'active'
  | 'past'
  | 'recurring'
  | 'cancelled';

export interface LoyaltyPoints {
  points: number;
  targetPoints: number;
  pointsRemaining: number;
  progressPercentage: number;
}

export interface MonthlyStats {
  ordersCount: number;
  litresCount: number;
  spentKsh: number;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    Navbar,
    Footer
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class Orders implements OnInit {
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);

  @Output() trackOrderRequested = new EventEmitter<string>();
  @Output() reorderRequested = new EventEmitter<string>();
  @Output() viewReceiptRequested = new EventEmitter<string>();
  @Output() viewSupportCaseRequested = new EventEmitter<string>();
  @Output() manageRecurringRequested = new EventEmitter<void>();
  @Output() quickActionRequested = new EventEmitter<string>();

  readonly currentTab = signal<OrdersTab>('active');
  readonly toastMessage = signal<string | null>(null);

  readonly orders = signal<CustomerOrder[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly actionMessage = signal('');
  readonly reorderingId = signal<string | null>(null);

  readonly loyalty = signal<LoyaltyPoints>({
    points: 340,
    targetPoints: 400,
    pointsRemaining: 60,
    progressPercentage: 85
  });

  /**
   * These stats are still sample values.
   * Connect them to a backend analytics endpoint when available.
   */
  readonly monthlyStats = signal<MonthlyStats>({
    ordersCount: 0,
    litresCount: 0,
    spentKsh: 0
  });

  readonly activeOrders = computed(() =>
    this.orders().filter(order =>
      this.isActiveStatus(order.status)
    )
  );

  readonly pastOrders = computed(() =>
    this.orders().filter(order =>
      order.status === 'DELIVERED'
    )
  );

  readonly cancelledOrders = computed(() =>
    this.orders().filter(order =>
      order.status === 'CANCELLED'
    )
  );

  readonly displayedOrders = computed(() => {
    switch (this.currentTab()) {
      case 'active':
        return this.activeOrders();

      case 'past':
        return this.pastOrders();

      case 'cancelled':
        return this.cancelledOrders();

      case 'recurring':
        return [];
    }
  });

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        const sortedOrders = [...orders].sort((a, b) => {
          const dateA = a.createdAt
            ? new Date(a.createdAt).getTime()
            : 0;

          const dateB = b.createdAt
            ? new Date(b.createdAt).getTime()
            : 0;

          return dateB - dateA;
        });

        this.orders.set(sortedOrders);
        this.loading.set(false);
      },

      error: (error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.errorMessage.set(
            'Your session has expired. Please sign in again.'
          );
        } else if (error.status === 403) {
          this.errorMessage.set(
            'Your account is not authorized to view these orders.'
          );
        } else {
          this.errorMessage.set(
            'We could not load your orders. Please try again.'
          );
        }

        this.loading.set(false);
      }
    });
  }

  setTab(tab: OrdersTab): void {
    this.currentTab.set(tab);
    this.actionMessage.set('');
  }

  isActiveStatus(status: OrderStatus): boolean {
    return [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'DISPATCHED',
      'SHIPPED'
    ].includes(status);
  }

  formatStatus(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      PENDING: 'Pending payment',
      CONFIRMED: 'Confirmed',
      PROCESSING: 'Preparing',
      DISPATCHED: 'Dispatched',
      SHIPPED: 'On the way',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled'
    };

    return labels[status];
  }

  statusClass(status: OrderStatus): string {
    switch (status) {
      case 'PENDING':
        return 'pending';

      case 'CONFIRMED':
      case 'PROCESSING':
        return 'preparing';

      case 'DISPATCHED':
      case 'SHIPPED':
        return 'on-the-way';

      case 'DELIVERED':
        return 'delivered';

      case 'CANCELLED':
        return 'cancelled';
    }
  }

  formatDate(date: string | null): string {
    if (!date) {
      return 'Date unavailable';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Date unavailable';
    }

    return new Intl.DateTimeFormat('en-KE', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(parsedDate);
  }

  getItemDescription(order: CustomerOrder): string {
    if (!order.items?.length) {
      return 'No item details available';
    }

    return order.items
      .map(item => `${item.quantity} × Product ${item.productId}`)
      .join(', ');
  }

  reorderOrder(order: CustomerOrder): void {
    if (this.reorderingId()) {
      return;
    }

    this.reorderingId.set(order.orderId);
    this.actionMessage.set('');

    this.orderService.reorder(order.orderId).subscribe({
      next: () => {
        this.reorderingId.set(null);

        this.reorderRequested.emit(order.orderId);

        this.showToast(
          'Previous order items have been added to your cart.'
        );

        this.actionMessage.set(
          'Items added to your cart. Review your cart before checkout.'
        );
      },

      error: (error: HttpErrorResponse) => {
        this.reorderingId.set(null);

        if (error.status === 401) {
          this.actionMessage.set(
            'Please sign in again before reordering.'
          );
        } else if (error.status === 404) {
          this.actionMessage.set(
            'This order could not be found, or it does not belong to your account.'
          );
        } else {
          this.actionMessage.set(
            'We could not reorder this order. Check product availability and try again.'
          );
        }
      }
    });
  }

  trackOrder(orderId: string): void {
    this.trackOrderRequested.emit(orderId);

    this.showToast(`Opening tracking for ${orderId}...`);

    this.router.navigate(['/live-tracking'], {
      queryParams: { orderId }
    });
  }

  viewReceipt(orderId: string): void {
    this.viewReceiptRequested.emit(orderId);

    this.router.navigate(['/receipt', orderId]);
  }

  viewSupportCase(orderId: string): void {
    this.viewSupportCaseRequested.emit(orderId);

    this.showToast(
      `Support case for ${orderId} is not connected yet.`
    );
  }

  manageRecurringSchedule(): void {
    this.manageRecurringRequested.emit();

    this.router.navigate(['/recurring-orders']);
  }

  quickAction(action: string): void {
    this.quickActionRequested.emit(action);

    const routes: Record<string, string[]> = {
      'find-water': ['/find-water'],
      accountaddress: ['/accountaddress'],
      offers: ['/offers'],
      help: ['/help']
    };

    const route = routes[action];

    if (!route) {
      this.showToast('This feature is not available yet.');
      return;
    }

    this.router.navigate(route);
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  showToast(message: string): void {
    this.toastMessage.set(message);

    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3500);
  }
}
