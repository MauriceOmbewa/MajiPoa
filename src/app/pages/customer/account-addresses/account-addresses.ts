// ==========================================================================
// MajiSafi - Standalone Angular Account & Addresses Component
// File: src/app/pages/account-addresses/account-addresses.ts
// ==========================================================================

import {
  Component,
  signal,
  Output,
  EventEmitter,
  OnInit,
  inject,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Navbar } from '../../../shared/layout/navbar/navbar';
import { Footer } from '../../../shared/layout/footer/footer';

import {
  CustomerService,
  CustomerRequest,
  CustomerResponse,
  AddressDTO,
} from '../services/customer-service';

import { LeafletMapComponent, PinnedLocation } from '../../../shared/leaflet-map/leaflet-map';
import { Router } from '@angular/router';

export type AccountTab =
  | 'profile'
  | 'addresses'
  | 'payment'
  | 'notifications'
  | 'privacy';

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
  imports: [CommonModule, FormsModule, RouterModule, Navbar, Footer, LeafletMapComponent],
  templateUrl: './account-addresses.html',
  styleUrl: './account-addresses.scss',
})
export class AccountAddresses implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly router          = inject(Router);

  @Output() profileSaved = new EventEmitter<UserProfileData>();
  @Output() addressAdded = new EventEmitter<void>();
  @Output() addressEdited = new EventEmitter<string>();
  @Output() addressRemoved = new EventEmitter<string>();
  @Output() businessAdded = new EventEmitter<void>();
  @Output() dataDownloadRequested = new EventEmitter<void>();
  @Output() accountDeletionRequested = new EventEmitter<void>();

  activeTab = signal<AccountTab>('profile');

  /** Controls the inline map picker expansion in the address form */
  showAddressMap = signal(false);

  isLoading = signal(false);
  isSavingProfile = signal(false);
  isSavingAddress = signal(false);
  isDetailsSaved = signal(false);
  isAddressSaved = signal(false);
  isEditingAddress = signal(false);
  hasAddress = signal(false);
  totalOrders = signal(0);

  errorMessage = signal('');
  successMessage = signal('');

  customerId = signal('');
  pictureUrl = signal<string | null>(null);

  profile: UserProfileData = {
    fullName: '',
    phone: '',
    email: '',
  };

  addressForm: AddressDTO = this.emptyAddress();

  addresses = signal<SavedAddressItem[]>([]);

  notifications: NotificationSettings = {
    smsUpdates: true,
    recurringReminders: true,
    offersAndRewards: false,
    qualityAlerts: false,
  };

  ngOnInit(): void {
    this.loadProfile();
  }

  /** Safe lat from "lat,lng" pinLocation string — defaults to Kilimani */
  get pinLat(): number {
    const v = parseFloat((this.addressForm.pinLocation ?? '').split(',')[0]);
    return isNaN(v) ? -1.2921 : v;
  }

  /** Safe lng from "lat,lng" pinLocation string — defaults to Kilimani */
  get pinLng(): number {
    const v = parseFloat((this.addressForm.pinLocation ?? '').split(',')[1]);
    return isNaN(v) ? 36.7856 : v;
  }

  private emptyAddress(): AddressDTO {
    return {
      county: '',
      subCounty: '',
      area: '',
      street: '',
      building: '',
      landmark: '',
      pinLocation: '',
    };
  }

  initials(): string {
    const parts = this.profile.fullName.trim().split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return (this.profile.fullName.slice(0, 2) || 'U').toUpperCase();
  }

  setTab(tab: AccountTab): void {
    this.activeTab.set(tab);
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.customerService.getMyProfile().subscribe({
      next: (customer: CustomerResponse) => {
        this.applyCustomerResponse(customer);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);

        if (error.status === 401 || error.status === 403) {
          this.errorMessage.set(
            'Your session may have expired. Please sign in again to access your account.'
          );
        } else {
          this.errorMessage.set(
            'We could not load your account details. Please try again.'
          );
        }

        console.error('Failed to load customer profile:', error);
      },
    });
  }

  private applyCustomerResponse(customer: CustomerResponse): void {
    this.customerId.set(customer.customerId ?? '');
    this.pictureUrl.set(customer.pictureUrl ?? null);

    this.profile = {
      fullName: [customer.firstName, customer.lastName]
        .filter((part) => !!part?.trim())
        .join(' '),
      phone: customer.phoneNumber ?? '',
      email: customer.email ?? '',
    };

    this.addressForm = customer.address
      ? { ...this.emptyAddress(), ...customer.address }
      : this.emptyAddress();

    this.hasAddress.set(!!customer.address);

    this.addresses.set(
      customer.address
        ? [
            {
              id: 'current-address',
              label: 'Home',
              isDefault: true,
              details: this.formatAddress(customer.address),
            },
          ]
        : []
    );
  }

  private formatAddress(address: AddressDTO): string {
    return [
      address.building,
      address.street,
      address.area,
      address.subCounty,
      address.county,
    ]
      .filter((part) => !!part?.trim())
      .join(', ');
  }

  private buildRequest(): CustomerRequest {
    const nameParts = this.profile.fullName.trim().split(/\s+/).filter(Boolean);
    const firstName = nameParts.shift() ?? '';
    const lastName = nameParts.join(' ');

    return {
      firstName,
      lastName,
      email: this.profile.email.trim(),
      userName: this.profile.fullName.trim(),
      phoneNumber: this.profile.phone.trim(),
      address: this.hasAddress() ? { ...this.addressForm } : null,
    };
  }

  saveDetails(): void {
    if (this.isSavingProfile()) {
      return;
    }

    this.isSavingProfile.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.customerService.updateMyProfile(this.buildRequest()).subscribe({
      next: (customer) => {
        this.applyCustomerResponse(customer);
        this.isSavingProfile.set(false);
        this.isDetailsSaved.set(true);
        this.successMessage.set('Your profile has been updated.');
        this.profileSaved.emit({ ...this.profile });

        setTimeout(() => this.isDetailsSaved.set(false), 2500);
      },
      error: (error) => {
        this.isSavingProfile.set(false);
        this.errorMessage.set(
          'We could not save your profile. Please check your connection and try again.'
        );
        console.error('Failed to update customer profile:', error);
      },
    });
  }

  addAddress(): void {
    this.addressForm = this.emptyAddress();
    this.hasAddress.set(true);
    this.isEditingAddress.set(true);
    this.activeTab.set('addresses');
    this.addressAdded.emit();
  }

  editAddress(addressId: string): void {
    this.addressEdited.emit(addressId);
    this.isEditingAddress.set(true);
    this.activeTab.set('addresses');
  }

  cancelAddressEdit(): void {
    this.isEditingAddress.set(false);

    // Restore the saved address from the backend.
    this.loadProfile();
  }

  saveAddress(): void {
    if (this.isSavingAddress()) {
      return;
    }

    if (!this.addressForm.county.trim() || !this.addressForm.area.trim()) {
      this.errorMessage.set('Please enter at least a county and area.');
      return;
    }

    this.isSavingAddress.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.customerService.updateMyProfile(this.buildRequest()).subscribe({
      next: (customer) => {
        this.applyCustomerResponse(customer);
        this.isSavingAddress.set(false);
        this.isEditingAddress.set(false);
        this.isAddressSaved.set(true);
        this.successMessage.set('Your address has been saved.');

        setTimeout(() => this.isAddressSaved.set(false), 2500);
      },
      error: (error) => {
        this.isSavingAddress.set(false);
        this.errorMessage.set(
          'We could not save your address. Please try again.'
        );
        console.error('Failed to update customer address:', error);
      },
    });
  }

  removeAddress(addressId: string): void {
    if (!this.hasAddress()) {
      return;
    }

    if (!confirm('Are you sure you want to remove your saved address?')) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.customerService.deleteMyAddress().subscribe({
      next: () => {
        this.hasAddress.set(false);
        this.addressForm = this.emptyAddress();
        this.addresses.set([]);
        this.isEditingAddress.set(false);
        this.successMessage.set('Your saved address has been removed.');
        this.addressRemoved.emit(addressId);
      },
      error: (error) => {
        this.errorMessage.set(
          'We could not remove your address. Please try again.'
        );
        console.error('Failed to remove customer address:', error);
      },
    });
  }

  /** Navigate to the full-page map to pin address location. */
  goToPinLocation(): void {
    // Parse existing pinLocation "lat,lng" if available
    const pinParts = this.addressForm.pinLocation?.split(',');
    const lat = pinParts && pinParts.length === 2 ? parseFloat(pinParts[0]) : undefined;
    const lng = pinParts && pinParts.length === 2 ? parseFloat(pinParts[1]) : undefined;
    this.router.navigate(['/pin-location'], {
      queryParams: {
        returnTo: 'accountaddress',
        ...(lat && lng ? { lat, lng } : {}),
        estate: this.addressForm.area || 'Kilimani',
      }
    });
  }

  /** Toggle the inline map picker and scroll it into view */
  toggleAddressMap(): void {
    this.showAddressMap.update(v => !v);
  }

  /**
   * Called when the user confirms a pin in the inline address map.
   * Fills in the address form fields and stores lat/lng in pinLocation.
   */
  onAddressMapPinned(loc: PinnedLocation): void {
    // Populate addressForm from the map result
    if (loc.estateName)    this.addressForm.area     = loc.estateName;
    if (loc.streetAddress) this.addressForm.street   = loc.streetAddress;
    if (loc.buildingName)  this.addressForm.building = loc.buildingName;
    if (loc.landmark)      this.addressForm.landmark = loc.landmark;
    // Store coordinates as "lat,lng" in the pinLocation field
    this.addressForm.pinLocation = `${loc.latitude},${loc.longitude}`;
    // Collapse the map after confirming
    this.showAddressMap.set(false);
  }

  addBusiness(): void {
    this.businessAdded.emit();
  }

  downloadData(): void {
    this.dataDownloadRequested.emit();
    alert('Account data export is not connected yet.');
  }

  deleteAccount(): void {
    if (
      confirm(
        'Are you sure you want to permanently delete your MajiSafi account? This action cannot be undone.'
      )
    ) {
      this.accountDeletionRequested.emit();
    }
  }
}