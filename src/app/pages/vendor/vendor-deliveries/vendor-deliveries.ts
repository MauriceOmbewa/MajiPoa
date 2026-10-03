import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VendorSidebar } from '../../../shared/layout/vendor-sidebar/vendor-sidebar';
import { VendorApiService } from '../../../shared/services/vendor-api.service';
import { DeliveryStage, RiderKind } from '../../../shared/models/api.models';

/** Shapes matching exactly what the HTML template accesses */
export interface UnassignedOrder {
  orderRef:   string;   // used as track key
  id:         string;   // display label (= orderRef)
  items:      string;
  area:       string;
  distanceKm: number;
  readySince: string;   // "placedAgo" from order
  assignTo:   string;
}

export interface RoadOrder {
  orderRef:    string;
  id:          string;  // display
  rider:       string;
  riderKind:   RiderKind;
  destination: string;
  stage:       DeliveryStage;
  eta:         string;
}

export interface CompletedDelivery {
  orderRef:    string;
  id:          string;  // display
  rider:       string;
  area:        string;
  deliveredAt: string;
  timeTaken:   string;
  rating:      string;
}

@Component({
  selector: 'app-vendor-deliveries',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, VendorSidebar],
  templateUrl: './vendor-deliveries.html',
})
export class VendorDeliveries implements OnInit {
  private readonly api = inject(VendorApiService);

  loading = signal(true);
  error   = signal<string | null>(null);

  assignOptions = ['Request a platform rider', 'Assign my staff rider', 'Assign to my pickup van', 'Customer collects'];

  needsRider  = signal<UnassignedOrder[]>([]);
  onRoad      = signal<RoadOrder[]>([]);
  completed   = signal<CompletedDelivery[]>([]);
  assignChoices = signal<Record<string, string>>({});

  ngOnInit(): void {
    this.api.getOrders().subscribe({
      next: orders => {
        const ready = orders.filter(o => o.status === 'READY');
        const road  = orders.filter(o => o.status === 'OUT_FOR_DELIVERY');
        const done  = orders.filter(o => o.status === 'COMPLETED');

        this.needsRider.set(ready.map(o => ({
          orderRef: o.orderRef, id: o.orderRef,
          items: o.lines.map(l => `${l.qty} × ${l.productName}`).join(', '),
          area: o.area, distanceKm: o.distanceKm,
          readySince: o.placedAgo, assignTo: this.assignOptions[0],
        })));

        this.onRoad.set(road.map(o => ({
          orderRef: o.orderRef, id: o.orderRef,
          rider: o.riderName ?? '—',
          riderKind: o.riderKind ?? 'PLATFORM',
          destination: o.area,
          stage: o.deliveryStage ?? 'EN_ROUTE',
          eta: '—',
        })));

        this.completed.set(done.map(o => ({
          orderRef: o.orderRef, id: o.orderRef,
          rider: o.riderName ?? '—',
          area: o.area,
          deliveredAt: o.placedAgo,
          timeTaken: '—',
          rating: '—',
        })));

        const choices: Record<string, string> = {};
        ready.forEach(o => choices[o.orderRef] = this.assignOptions[0]);
        this.assignChoices.set(choices);

        this.loading.set(false);
      },
      error: () => { this.error.set('Failed to load deliveries.'); this.loading.set(false); },
    });
  }

  setAssignChoice(orderRef: string, choice: string): void {
    this.assignChoices.update(c => ({ ...c, [orderRef]: choice }));
  }

  assign(order: UnassignedOrder): void {
    const choice     = this.assignChoices()[order.orderRef] ?? this.assignOptions[0];
    const isPlatform = choice === this.assignOptions[0];
    const riderName  = isPlatform ? 'Platform rider' : 'My staff';
    const riderKind: RiderKind = isPlatform ? 'PLATFORM' : 'MY_STAFF';

    this.api.assignRider(order.orderRef, riderName, riderKind).subscribe({
      next: updated => {
        this.needsRider.update(list => list.filter(o => o.orderRef !== order.orderRef));
        this.onRoad.update(list => [{
          orderRef: updated.orderRef, id: updated.orderRef,
          rider: updated.riderName ?? riderName,
          riderKind, destination: updated.area, stage: 'EN_ROUTE', eta: '—',
        }, ...list]);
      },
    });
  }

  stageClasses(stage: DeliveryStage): string {
    return stage === 'CUSTOMER_NOT_REACHABLE'
      ? 'bg-[#FDF1DE] text-[#C77A11] border-[#f2ddb8]'
      : 'bg-[#E8F2FC] text-[#1464B4] border-[#c9e0f7]';
  }

  stageLabel(stage: DeliveryStage): string {
    return stage === 'NEAR_CUSTOMER' ? 'Near customer'
         : stage === 'EN_ROUTE'      ? 'En route'
         : 'Customer not reachable';
  }

  riderKindClasses(kind: RiderKind): string {
    return kind === 'PLATFORM'
      ? 'bg-[#E8F2FC] text-[#1464B4] border-[#c9e0f7]'
      : 'bg-[#F1F6FA] text-[#5E7489] border-[#DBE7F1]';
  }

  riderKindLabel(kind: RiderKind): string {
    return kind === 'PLATFORM' ? 'Platform' : 'My staff';
  }
}
