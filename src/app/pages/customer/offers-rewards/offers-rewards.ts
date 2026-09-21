// ==========================================================================
// MajiSafi - Standalone Angular Offers & Rewards Component
// Framework: Angular 17 / 18 / 19 Standalone Component
// Selector: app-offers-rewards
// File: src/app/pages/offers-rewards/offers-rewards.ts
// ==========================================================================

import { Component, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface PointsHistoryEntry {
  id: string;
  date: string;
  activity: string;
  orderRef?: string;
  pointsDelta: number;
}

export interface PromoOffer {
  id: string;
  title: string;
  sponsor: 'MajiSafi' | 'Vendor';
  vendorName?: string;
  description: string;
  code?: string;
  progressCurrent?: number;
  progressTarget?: number;
  autoApplied?: boolean;
}

@Component({
  selector: 'app-offers-rewards',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './offers-rewards.html',
  styleUrl: './offers-rewards.scss',
})
export class OffersRewards {
  // Outputs for parent router or toast/sharing notifications
  @Output() orderSelected = new EventEmitter<string>();
  @Output() codeCopied = new EventEmitter<string>();
  @Output() referralShared = new EventEmitter<string>();

  // State Signals
  points = signal<number>(340);
  targetGoal = signal<number>(400);
  copiedCode = signal<string | null>(null);

  // Computed signals
  pointsToNextReward = computed(() => {
    const diff = this.targetGoal() - this.points();
    return diff > 0 ? diff : 0;
  });

  progressPercent = computed(() => {
    const p = (this.points() / this.targetGoal()) * 100;
    return Math.min(Math.max(p, 0), 100);
  });

  // Points history records
  history = signal<PointsHistoryEntry[]>([
    {
      id: 'ph-1',
      date: '15 Sep',
      activity: 'Order delivered',
      orderRef: '#WM10248',
      pointsDelta: 112,
    },
    {
      id: 'ph-2',
      date: '8 Sep',
      activity: 'Order delivered',
      orderRef: '#WM10192',
      pointsDelta: 58,
    },
    {
      id: 'ph-3',
      date: '2 Sep',
      activity: 'Redeemed free 20L refill',
      orderRef: '#WM10140',
      pointsDelta: -400,
    },
    {
      id: 'ph-4',
      date: '1 Sep',
      activity: 'Referral · Grace W.',
      pointsDelta: 100,
    },
  ]);

  // Methods
  async copyCode(code: string) {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(code);
      }
      this.copiedCode.set(code);
      this.codeCopied.emit(code);
      setTimeout(() => {
        if (this.copiedCode() === code) {
          this.copiedCode.set(null);
        }
      }, 2500);
    } catch {
      this.copiedCode.set(code);
    }
  }

  async shareReferralCode(code: string) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join MajiSafi and get KSh 50 off',
          text: `Use my referral code ${code} to get KSh 50 off clean drinking water delivery!`,
          url: window.location.origin,
        });
        this.referralShared.emit(code);
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    this.copyCode(code);
    this.referralShared.emit(code);
  }

  viewOrder(orderRef: string) {
    const cleanId = orderRef.replace('#', '');
    this.orderSelected.emit(cleanId);
  }
}
