import {
  Component,
  signal,
  computed,
  inject,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Navbar } from '../../../shared/layout/navbar/navbar';
import { Footer } from '../../../shared/layout/footer/footer';
import {
  OrderStateService,
  OrderLineItem,
} from '../services/order-state.service';
import { Map as MapComponent } from '../../../shared/map/map';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface TrackingStep {
  id: string;
  title: string;
  subtitle: string;
  status: 'done' | 'now' | 'pending';
}

export interface DeliveryAddressInfo {
  street: string;
  apartment: string;
  floor: string;
  area: string;
  directions: string;
}

export interface TrackingInfo {
  orderNumber: string;
  vendorName: string;
  estimatedArrival: string;
  minutesAway: number;
  riderName: string;
  riderInitials: string;
  riderPlate: string;
  riderRating: number;
}

// ── Component ─────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-live-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar, Footer, MapComponent],
  templateUrl: './live-tracking.html',
  styleUrl: './live-tracking.scss',
})
export class LiveTracking implements OnInit, OnDestroy {

  private readonly orderState = inject(OrderStateService);
  private readonly route      = inject(ActivatedRoute);

  // ── @Input kept for host-component embedding compatibility ────────────────
  @Input() set orderNumber(val: string) {
    if (val) this.trackingInfo.update((info) => ({ ...info, orderNumber: val }));
  }

  @Output() callRiderRequested    = new EventEmitter<string>();
  @Output() messageRiderRequested = new EventEmitter<string>();
  @Output() viewReceiptRequested  = new EventEmitter<string>();
  @Output() trackOtherRequested   = new EventEmitter<void>();
  @Output() reportProblemRequested = new EventEmitter<string>();

  // ── Tracking header info ─────────────────────────────────────────────────
  trackingInfo = signal<TrackingInfo>({
    orderNumber:     'WM10248',
    vendorName:      'ABC Water',
    estimatedArrival: '—',
    minutesAway:     45,
    riderName:       'James Kariuki',
    riderInitials:   'JK',
    riderPlate:      'KMFQ 221H',
    riderRating:     4.9,
  });

  // ── Delivery address ──────────────────────────────────────────────────────
  customerAddress = signal<DeliveryAddressInfo>({
    street:     'Riverside Court',
    apartment:  'B12',
    floor:      '3rd',
    area:       'Argwings Kodhek Rd, Kilimani',
    directions: "Blue gate opposite the mosque, tell security you're for B12.",
  });

  // ── Order line items (from OrderStateService) ─────────────────────────────
  /** Items ordered — populated from the persisted OrderStateService. */
  readonly orderItems = computed<OrderLineItem[]>(() =>
    this.orderState.items()
  );

  /** Whether we have real order data to display. */
  readonly hasOrderData = computed(() => this.orderItems().length > 0);

  /** Items subtotal (sum of each line's subtotal). */
  readonly itemsSubtotal = computed(() =>
    this.orderItems().reduce((s, i) => s + i.subtotal, 0)
  );

  /** Delivery fee from the stored order state. */
  readonly deliveryFee = computed(() =>
    this.orderState.deliveryFee()
  );

  /** Grand total. */
  readonly grandTotal = computed(() =>
    this.orderState.totalAmount()
  );

  // ── Tracking steps ────────────────────────────────────────────────────────
  trackingSteps = signal<TrackingStep[]>([
    { id: '1', title: 'Order confirmed',        subtitle: 'Payment received',             status: 'done'    },
    { id: '2', title: 'Vendor accepted',         subtitle: 'Preparing your order',         status: 'done'    },
    { id: '3', title: 'Jugs filled and sealed',  subtitle: 'Quality checked',              status: 'done'    },
    { id: '4', title: 'Picked up by rider',      subtitle: 'On the way',                   status: 'done'    },
    { id: '5', title: 'On the way to you',       subtitle: '~45 min away',                 status: 'now'     },
    { id: '6', title: 'Delivered',               subtitle: 'Have your empty jugs ready',   status: 'pending' },
  ]);

  // ── Simulated GPS ─────────────────────────────────────────────────────────
  riderPosition = signal<{ x: number; y: number }>({ x: 58, y: 40 });
  private gpsTimer: any = null;

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    // 1. Try to read orderId from the route query param (?orderId=…)
    const queryOrderId = this.route.snapshot.queryParamMap.get('orderId');

    // 2. Pull persisted order from OrderStateService
    const saved = this.orderState.order();

    if (saved) {
      // Populate tracking header from saved state
      this.trackingInfo.update((info) => ({
        ...info,
        orderNumber: saved.orderNumber || saved.orderId || info.orderNumber,
        vendorName:  saved.vendorName  || info.vendorName,
        minutesAway: saved.estimatedMins || info.minutesAway,
        estimatedArrival: this._calcArrival(saved.estimatedMins ?? 45),
      }));

      // Populate delivery address from saved state if available
      if (saved.deliveryAddress) {
        this.customerAddress.update((addr) => ({
          ...addr,
          area: saved.deliveryEstate || addr.area,
        }));
      }

      // Update tracking steps to reflect the placed order
      this._buildTrackingSteps(saved);
    } else if (queryOrderId) {
      // No OrderStateService data but we have an orderId — update display number
      this.trackingInfo.update((info) => ({
        ...info,
        orderNumber: queryOrderId,
      }));
    }

    // 3. Start simulated GPS movement
    this.gpsTimer = setInterval(() => {
      this.riderPosition.update((pos) => ({
        x: Math.min(75, Math.max(50, pos.x + (Math.random() - 0.45) * 1.2)),
        y: Math.min(50, Math.max(32, pos.y + (Math.random() - 0.45) * 1.2)),
      }));
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.gpsTimer) clearInterval(this.gpsTimer);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private _calcArrival(minsFromNow: number): string {
    const d = new Date(Date.now() + minsFromNow * 60 * 1000);
    let h = d.getHours(), m = d.getMinutes();
    const ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
  }

  private _buildTrackingSteps(saved: ReturnType<OrderStateService['order']>): void {
    if (!saved) return;
    const now = new Date(saved.placedAt);
    const fmt = (d: Date) => `${d.getHours() % 12 || 12}:${d.getMinutes().toString().padStart(2, '0')} ${d.getHours() >= 12 ? 'pm' : 'am'}`;

    const t0 = fmt(now);
    const t1 = fmt(new Date(now.getTime() + 2  * 60000));
    const t2 = fmt(new Date(now.getTime() + 16 * 60000));
    const t3 = fmt(new Date(now.getTime() + 29 * 60000));

    this.trackingSteps.set([
      { id: '1', title: 'Order confirmed',       subtitle: `${t0} · paid KSh ${saved.totalAmount.toLocaleString()} on M-Pesa`, status: 'done'    },
      { id: '2', title: `${saved.vendorName} accepted`, subtitle: t1, status: 'done' },
      { id: '3', title: 'Jugs filled and sealed', subtitle: `${t2} · batch ${saved.orderId.slice(-8).toUpperCase()}`,           status: 'done'    },
      { id: '4', title: 'Picked up by rider',     subtitle: t3,                                                                  status: 'done'    },
      { id: '5', title: 'On the way to you',       subtitle: `${saved.estimatedMins ?? 45} min away · ${saved.deliveryEstate}`, status: 'now'     },
      { id: '6', title: 'Delivered',               subtitle: 'Have your empty jugs ready for the swap',                         status: 'pending' },
    ]);
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  callRider()         { this.callRiderRequested.emit(this.trackingInfo().riderName); }
  messageRider()      { this.messageRiderRequested.emit(this.trackingInfo().riderName); }
  viewReceipt()       { this.viewReceiptRequested.emit(this.trackingInfo().orderNumber); }
  trackOtherDelivery() { this.trackOtherRequested.emit(); }
  reportProblem()     { this.reportProblemRequested.emit(this.trackingInfo().orderNumber); }
}
