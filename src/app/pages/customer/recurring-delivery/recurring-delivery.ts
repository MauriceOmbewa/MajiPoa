// ==========================================================================
// MajiSafi - Standalone Angular Recurring Delivery Component
// Framework: Angular 17 / 18 / 19 Standalone Component
// Selector: app-recurring-delivery
// File: src/app/pages/recurring-delivery/recurring-delivery.ts
// ==========================================================================

import { Component, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

export interface RecurringScheduleItem {
  id: string;
  productTitle: string;
  frequencyLabel: string;
  addressLabel: string;
  status: 'active' | 'paused' | 'cancelled';
  nextDeliveryDate: string;
  skipShortDate: string;
  priceKsh: number;
  paymentMethod: string;
  deliveriesCompletedCount: number;
}

export interface NewScheduleForm {
  product: string;
  address: string;
  startDate: string;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'custom';
  deliveryWindow: string;
}

@Component({
  selector: 'app-recurring-delivery',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './recurring-delivery.html',
  styleUrl: './recurring-delivery.scss',
})
export class RecurringDelivery {
  // Outputs for parent router or integration
  @Output() scheduleCreated = new EventEmitter<NewScheduleForm>();
  @Output() scheduleUpdated = new EventEmitter<{ id: string; action: string }>();

  // Schedules state signal
  schedules = signal<RecurringScheduleItem[]>([
    {
      id: 'sub-101',
      productTitle: '2 × 20L refill — ABC Water',
      frequencyLabel: 'Every Friday',
      addressLabel: 'Home, Kilimani',
      status: 'active',
      nextDeliveryDate: 'Fri 18 Sep, 8–10 am',
      skipShortDate: '18 Sep',
      priceKsh: 580,
      paymentMethod: 'M Pesa 0712 345 678',
      deliveriesCompletedCount: 11,
    },
  ]);

  // Form model
  newSchedule: NewScheduleForm = {
    product: '2x20l-abc',
    address: 'home',
    startDate: '2026-09-18',
    frequency: 'weekly',
    deliveryWindow: '8-10',
  };

  // Actions
  scrollToNewSchedule() {
    const el = document.getElementById('new-schedule-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  skipDelivery(scheduleId: string) {
    this.scheduleUpdated.emit({ id: scheduleId, action: 'skip' });
    this.schedules.update((items) =>
      items.map((item) =>
        item.id === scheduleId
          ? {
              ...item,
              nextDeliveryDate: 'Fri 25 Sep, 8–10 am',
              skipShortDate: '25 Sep',
            }
          : item
      )
    );
  }

  changeDayOrTime(scheduleId: string) {
    this.scheduleUpdated.emit({ id: scheduleId, action: 'change-time' });
  }

  changeQuantity(scheduleId: string) {
    this.scheduleUpdated.emit({ id: scheduleId, action: 'change-qty' });
  }

  togglePauseSchedule(scheduleId: string) {
    this.schedules.update((items) =>
      items.map((item) => {
        if (item.id === scheduleId) {
          const nextStatus = item.status === 'active' ? 'paused' : 'active';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
    this.scheduleUpdated.emit({ id: scheduleId, action: 'toggle-pause' });
  }

  cancelSchedule(scheduleId: string) {
    if (confirm('Are you sure you want to cancel this recurring water delivery schedule?')) {
      this.schedules.update((items) => items.filter((item) => item.id !== scheduleId));
      this.scheduleUpdated.emit({ id: scheduleId, action: 'cancel' });
    }
  }

  createSchedule() {
    let title = '2 × 20L refill — ABC Water';
    let price = 580;
    if (this.newSchedule.product === '1x20l-abc') {
      title = '1 × 20L refill — ABC Water';
      price = 330;
    } else if (this.newSchedule.product === '1x10l-blue') {
      title = '1 × 10L bottle — Blue Spring';
      price = 260;
    }

    const freqMap: Record<string, string> = {
      weekly: 'Every week',
      biweekly: 'Every two weeks',
      monthly: 'Every month',
      custom: 'Custom schedule',
    };

    const addrMap: Record<string, string> = {
      home: 'Riverside Court B12, Kilimani',
      office: 'Sanlam Tower, Westlands',
    };

    const newId = 'sub-' + Date.now().toString().slice(-4);
    const newEntry: RecurringScheduleItem = {
      id: newId,
      productTitle: title,
      frequencyLabel: freqMap[this.newSchedule.frequency] || 'Weekly',
      addressLabel: addrMap[this.newSchedule.address] || 'Kilimani',
      status: 'active',
      nextDeliveryDate: this.newSchedule.startDate + ', 8–10 am',
      skipShortDate: 'Next',
      priceKsh: price,
      paymentMethod: 'M Pesa 0712 345 678',
      deliveriesCompletedCount: 0,
    };

    this.schedules.update((prev) => [newEntry, ...prev]);
    this.scheduleCreated.emit(this.newSchedule);
  }
}
