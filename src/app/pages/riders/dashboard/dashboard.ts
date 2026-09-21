import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';

interface DeliveryOffer {
  id: string;
  price: number;
  distanceKm: number;
  etaMin: number;
  expiresInSec: number;
  tags: string[];
  pickupName: string;
  pickupLocation: string;
  pickupDistanceKm: number;
  dropoffName: string;
  dropoffLocation: string;
  dropoffDistanceKm: number;
}

interface CurrentDelivery {
  orderId: string;
  from: string;
  to: string;
  status: string;
  itemsLabel: string;
  etaFromCustomerMin: number;
  price: number;
}

interface CompletedDelivery {
  time: string;
  orderId: string;
  from: string;
  to: string;
  distanceKm: number;
  earned: number;
}

@Component({
  selector: 'app-rider-today',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  isAvailable = signal(true);

  earnedToday = signal(1240);
  deliveriesToday = signal(14);
  onlineSince = signal('8:04 am');
  onlineDuration = signal('6h 12m');
  rating = signal(4.9);
  ratingSampleLabel = signal('Last 50 deliveries');

  // TODO: replace with data from your delivery-offers service
  currentOffer = signal<DeliveryOffer | null>({
    id: 'offer-1',
    price: 110,
    distanceKm: 3.4,
    etaMin: 22,
    expiresInSec: 24,
    tags: ['3 × 20L jugs', 'Heavy load'],
    pickupName: 'ABC Water',
    pickupLocation: 'Kilimani, Ngong Rd',
    pickupDistanceKm: 0.8,
    dropoffName: 'Kevin M.',
    dropoffLocation: 'Yaya Centre area',
    dropoffDistanceKm: 2.6
  });

  // TODO: replace with data from your active-delivery service
  currentDelivery = signal<CurrentDelivery | null>({
    orderId: '#WM10248',
    from: 'ABC Water',
    to: 'Kilimani',
    status: 'On the way',
    itemsLabel: '2 × 20L, 1 case',
    etaFromCustomerMin: 8,
    price: 80
  });

  // TODO: replace with data from your history/earnings service
  completedToday = signal<CompletedDelivery[]>([
    { time: '3:18 pm', orderId: '#WM10240', from: 'ABC Water', to: 'Kileleshwa', distanceKm: 3.4, earned: 110 },
    { time: '2:44 pm', orderId: '#WM10231', from: 'ABC Water', to: 'Kilimani', distanceKm: 1.2, earned: 80 },
    { time: '1:52 pm', orderId: '#WM10228', from: 'Aqua Fresh', to: 'Hurlingham', distanceKm: 2.1, earned: 90 },
    { time: '12:30 pm', orderId: '#WM10214', from: 'Blue Spring', to: 'Yaya', distanceKm: 0.9, earned: 80 }
  ]);

  toggleAvailability(): void {
    this.isAvailable.set(!this.isAvailable());
    // TODO: call your go-online / go-offline API endpoint here
  }

  acceptOffer(): void {
    if (!this.currentOffer()) return;
    // TODO: call your accept-delivery API endpoint here
    this.currentOffer.set(null);
  }

  declineOffer(): void {
    // TODO: call your decline-delivery API endpoint here
    this.currentOffer.set(null);
  }

  openCurrentDelivery(): void {
    // TODO: navigate to '/riders/active-delivery' or open a detail view
  }
}