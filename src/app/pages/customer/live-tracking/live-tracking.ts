import { Component, signal, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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

@Component({
  selector: 'app-live-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './live-tracking.html',
  styleUrl: './live-tracking.scss',
})
export class LiveTracking implements OnInit, OnDestroy {
  @Input() set orderNumber(val: string) {
    if (val) {
      this.trackingInfo.update((info) => ({ ...info, orderNumber: val }));
    }
  }

  @Output() callRiderRequested = new EventEmitter<string>();
  @Output() messageRiderRequested = new EventEmitter<string>();
  @Output() viewReceiptRequested = new EventEmitter<string>();
  @Output() trackOtherRequested = new EventEmitter<void>();
  @Output() reportProblemRequested = new EventEmitter<string>();

  trackingInfo = signal<TrackingInfo>({
    orderNumber: 'WM10248',
    vendorName: 'ABC Water',
    estimatedArrival: '4:35 pm',
    minutesAway: 8,
    riderName: 'James Kariuki',
    riderInitials: 'JK',
    riderPlate: 'KMFQ 221H',
    riderRating: 4.9,
  });

  customerAddress = signal<DeliveryAddressInfo>({
    street: 'Riverside Court',
    apartment: 'B12',
    floor: '3rd',
    area: 'Argwings Kodhek Rd, Kilimani',
    directions: "Blue gate opposite the mosque, tell security you're for B12.",
  });

  trackingSteps = signal<TrackingStep[]>([
    { id: '1', title: 'Order confirmed', subtitle: '3:42 pm · paid KSh 1,120 on M Pesa', status: 'done' },
    { id: '2', title: 'ABC Water accepted', subtitle: '3:44 pm', status: 'done' },
    { id: '3', title: 'Jugs filled and sealed', subtitle: '3:58 pm · batch AW-0915-B', status: 'done' },
    { id: '4', title: 'Picked up by James', subtitle: '4:11 pm', status: 'done' },
    { id: '5', title: 'On the way to you', subtitle: '8 min away · 2.1 km', status: 'now' },
    { id: '6', title: 'Delivered', subtitle: 'Have your empty jugs ready for the swap', status: 'pending' },
  ]);

  riderPosition = signal<{ x: number; y: number }>({ x: 58, y: 40 });
  private gpsTimer: any = null;

  ngOnInit() {
    this.gpsTimer = setInterval(() => {
      this.riderPosition.update((pos) => ({
        x: Math.min(75, Math.max(50, pos.x + (Math.random() - 0.45) * 1.2)),
        y: Math.min(50, Math.max(32, pos.y + (Math.random() - 0.45) * 1.2)),
      }));
    }, 3000);
  }

  ngOnDestroy() {
    if (this.gpsTimer) clearInterval(this.gpsTimer);
  }

  callRider() { this.callRiderRequested.emit(this.trackingInfo().riderName); }
  messageRider() { this.messageRiderRequested.emit(this.trackingInfo().riderName); }
  viewReceipt() { this.viewReceiptRequested.emit(this.trackingInfo().orderNumber); }
  trackOtherDelivery() { this.trackOtherRequested.emit(); }
  reportProblem() { this.reportProblemRequested.emit(this.trackingInfo().orderNumber); }
}
