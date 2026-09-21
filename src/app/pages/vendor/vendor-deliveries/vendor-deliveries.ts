import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VendorSidebar } from '../../../shared/layout/vendor-sidebar/vendor-sidebar';

export interface UnassignedOrder {
  id: string;
  items: string;
  area: string;
  distanceKm: number;
  readySince: string;
  assignTo: string;
}

export interface RoadOrder {
  id: string;
  rider: string;
  riderKind: 'Platform' | 'My staff';
  destination: string;
  stage: 'Near customer' | 'En route' | 'Customer not reachable';
  eta: string;
}

export interface CompletedDelivery {
  id: string;
  rider: string;
  area: string;
  deliveredAt: string;
  timeTaken: string;
  rating: string;
}

@Component({
  selector: 'app-vendor-deliveries',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, VendorSidebar],
  templateUrl: './vendor-deliveries.html',
})
export class VendorDeliveries {
  assignOptions = ['Request a platform rider', 'Assign Peter (my staff)', 'Assign to my pickup van', 'Customer collects'];

  needsRider = signal<UnassignedOrder[]>([
    { id: '#WM10254', items: '3 × 20L refill', area: 'Yaya, 0.8 km', distanceKm: 0.8, readySince: '4:22 pm', assignTo: this.assignOptions[0] },
    { id: '#WM10259', items: '4 × 20L refill', area: 'Hurlingham, 2.1 km', distanceKm: 2.1, readySince: '4:30 pm', assignTo: this.assignOptions[0] },
  ]);

  onRoad = signal<RoadOrder[]>([
    { id: '#WM10248', rider: 'James K.', riderKind: 'Platform', destination: 'Kilimani', stage: 'Near customer', eta: '4:35 pm' },
    { id: '#WM10251', rider: 'Peter O.', riderKind: 'My staff', destination: 'Westlands', stage: 'En route', eta: '5:05 pm' },
    { id: '#WM10244', rider: 'James K.', riderKind: 'Platform', destination: 'Kileleshwa', stage: 'Customer not reachable', eta: '—' },
  ]);

  completed = signal<CompletedDelivery[]>([
    { id: '#WM10240', rider: 'Peter O.', area: 'Kileleshwa', deliveredAt: '3:18 pm', timeTaken: '41 min', rating: '5 ★' },
    { id: '#WM10231', rider: 'James K.', area: 'Kilimani', deliveredAt: '2:44 pm', timeTaken: '28 min', rating: '5 ★' },
    { id: '#WM10228', rider: 'Peter O.', area: 'Hurlingham', deliveredAt: '1:52 pm', timeTaken: '1 hr 6 min', rating: '3 ★' },
  ]);

  setAssignChoice(orderId: string, choice: string): void {
    this.needsRider.update(list => list.map(o => o.id === orderId ? { ...o, assignTo: choice } : o));
  }

  assign(order: UnassignedOrder): void {
    this.needsRider.update(list => list.filter(o => o.id !== order.id));
    const isPlatform = order.assignTo === this.assignOptions[0];
    this.onRoad.update(list => [
      { id: order.id, rider: isPlatform ? 'James K.' : 'Peter O.', riderKind: isPlatform ? 'Platform' : 'My staff', destination: order.area.split(',')[0], stage: 'En route', eta: '—' },
      ...list,
    ]);
  }

  stageClasses(stage: RoadOrder['stage']): string {
    return stage === 'Customer not reachable'
      ? 'bg-[#FDF1DE] text-[#C77A11] border-[#f2ddb8]'
      : 'bg-[#E8F2FC] text-[#1464B4] border-[#c9e0f7]';
  }

  riderKindClasses(kind: RoadOrder['riderKind']): string {
    return kind === 'Platform'
      ? 'bg-[#E8F2FC] text-[#1464B4] border-[#c9e0f7]'
      : 'bg-[#F1F6FA] text-[#5E7489] border-[#DBE7F1]';
  }
}