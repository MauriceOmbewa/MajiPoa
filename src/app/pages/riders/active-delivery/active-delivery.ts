import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar';

export type ProgressStepStatus = 'done' | 'current' | 'upcoming';

export interface ProgressStep {
  label: string;
  timestamp?: string;
  detail?: string;
  status: ProgressStepStatus;
}

export interface CarriedItem {
  label: string;
  actionLabel: string;
}

@Component({
  selector: 'app-active-delivery',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './active-delivery.html',
  styleUrl: './active-delivery.scss'
})
export class ActiveDelivery {
  orderId = signal('#WM10248');
  statusLabel = signal('On the way to customer');

  distanceRemainingKm = signal(2.1);
  etaMin = signal(8);
  destinationAddress = signal('Argwings Kodhek Rd, Kilimani');

  customerName = signal('Maurice O.');
  customerAddress = signal('Riverside Court, B12, 3rd floor');
  customerNote = signal('Blue gate opposite the mosque, tell security you\'re for B12.');
  tripEarning = signal(80);

  carriedItems = signal<CarriedItem[]>([
    { label: '2 × 20L refill — hard jug', actionLabel: 'Collect 2 empty jugs' },
    { label: '1 × 500ml case of 24', actionLabel: 'Sealed' }
  ]);

  progressSteps = signal<ProgressStep[]>([
    { label: 'Accepted', timestamp: '4:02 pm', status: 'done' },
    { label: 'Arrived at ABC Water', timestamp: '4:08 pm', status: 'done' },
    { label: 'Picked up', timestamp: '4:11 pm', detail: '3 items checked', status: 'done' },
    { label: 'On the way to customer', detail: 'Tap below when you arrive', status: 'current' },
    { label: 'Delivered', status: 'upcoming' }
  ]);

  openInMaps(): void {
    // TODO: open device/Google Maps navigation to the current destination
  }

  callCustomer(): void {
    // TODO: trigger a call to the customer via your backend/telephony integration
  }

  messageCustomer(): void {
    // TODO: open an in-app or SMS message thread with the customer
  }

  markArrived(): void {
    // TODO: call your API to advance delivery status to "Arrived" / "Delivered"
    const steps = [...this.progressSteps()];
    const currentIndex = steps.findIndex((s) => s.status === 'current');
    if (currentIndex > -1 && currentIndex + 1 < steps.length) {
      steps[currentIndex] = { ...steps[currentIndex], status: 'done' };
      steps[currentIndex + 1] = { ...steps[currentIndex + 1], status: 'current' };
      this.progressSteps.set(steps);
      this.statusLabel.set(steps[currentIndex + 1].label);
    }
  }
}