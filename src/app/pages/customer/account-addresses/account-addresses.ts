// ==========================================================================
// MajiSafi - Standalone Angular Account & Addresses Component
// Framework: Angular 17 / 18 / 19 Standalone Component
// Selector: app-account-addresses
// File: src/app/pages/account-addresses/account-addresses.ts
// ==========================================================================

import { Component, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

export type AccountTab = 'profile' | 'addresses' | 'payment' | 'notifications' | 'privacy';

export interface SavedAddressItem {
  id: string;
  label: string;
  isDefault: boolean;
  details: string;
}

export interface UserProfileData {
  fullName: string;
  phone: string;
  email: string;
}

export interface NotificationSettings {
  smsUpdates: boolean;
  recurringReminders: boolean;
  offersAndRewards: boolean;
  qualityAlerts: boolean;
}

@Component({
  selector: 'app-account-addresses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './account-addresses.html',
  styleUrl: './account-addresses.scss',
})
export class AccountAddresses {
  // Outputs for host integration
  @Output() profileSaved = new EventEmitter<UserProfileData>();
  @Output() addressAdded = new EventEmitter<void>();
  @Output() addressEdited = new EventEmitter<string>();
  @Output() addressRemoved = new EventEmitter<string>();
  @Output() businessAdded = new EventEmitter<void>();
  @Output() dataDownloadRequested = new EventEmitter<void>();
  @Output() accountDeletionRequested = new EventEmitter<void>();

  // State Signals
  activeTab = signal<AccountTab>('profile');
  isDetailsSaved = signal<boolean>(false);
  totalOrders = signal<number>(27);

  // Profile Form Model
  profile: UserProfileData = {
    fullName: 'Maurice Odhiambo',
    phone: '0712 345 678',
    email: '',
  };

  // Addresses Signal
  addresses = signal<SavedAddressItem[]>([
    {
      id: 'addr-1',
      label: 'Home',
      isDefault: true,
      details: 'Riverside Court B12, 3rd floor · Argwings Kodhek Rd, Kilimani',
    },
    {
      id: 'addr-2',
      label: 'Office',
      isDefault: false,
      details: 'Sanlam Tower, 6th floor · Waiyaki Way, Westlands',
    },
  ]);

  // Notifications Settings
  notifications: NotificationSettings = {
    smsUpdates: true,
    recurringReminders: true,
    offersAndRewards: false,
    qualityAlerts: false,
  };

  // User Initials Computed
  initials = computed(() => {
    const parts = this.profile.fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (this.profile.fullName.slice(0, 2) || 'MO').toUpperCase();
  });

  // Action methods
  setTab(tab: AccountTab) {
    this.activeTab.set(tab);
  }

  saveDetails() {
    this.isDetailsSaved.set(true);
    this.profileSaved.emit({ ...this.profile });
    setTimeout(() => {
      this.isDetailsSaved.set(false);
    }, 2500);
  }

  addAddress() {
    this.addressAdded.emit();
    const newId = 'addr-' + Date.now().toString().slice(-4);
    const newAddr: SavedAddressItem = {
      id: newId,
      label: 'Other',
      isDefault: false,
      details: 'Kileleshwa, Nairobi',
    };
    this.addresses.update((prev) => [...prev, newAddr]);
  }

  editAddress(addressId: string) {
    this.addressEdited.emit(addressId);
  }

  removeAddress(addressId: string) {
    if (confirm('Are you sure you want to remove this address?')) {
      this.addresses.update((prev) => prev.filter((a) => a.id !== addressId));
      this.addressRemoved.emit(addressId);
    }
  }

  addBusiness() {
    this.businessAdded.emit();
  }

  downloadData() {
    this.dataDownloadRequested.emit();
    alert('Preparing your account data export. You will receive an SMS and download link shortly.');
  }

  deleteAccount() {
    if (confirm('Are you sure you want to permanently delete your MajiSafi account? This action cannot be undone.')) {
      this.accountDeletionRequested.emit();
    }
  }
}
