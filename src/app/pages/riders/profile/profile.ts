import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar';
import {
  RiderApiService,
  ProfileDto,
  ProfileUpdateRequest,
} from '../../../shared/services/rider-api';

const KE_PHONE = /^(?:\+254|0)[17]\d{2}\s?\d{3}\s?\d{3}$/;

interface ProfileView {
  fullName: string;
  riderId: string;
  memberSince: string;
  rating: number | null;
  totalDeliveries: number;
  onTimeRate: number;
  verified: boolean;
}

const EMPTY_PROFILE: ProfileView = {
  fullName: '',
  riderId: '',
  memberSince: '—',
  rating: null,
  totalDeliveries: 0,
  onTimeRate: 0,
  verified: false,
};

@Component({
  selector: 'app-rider-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {
  private fb = inject(FormBuilder);
  private api = inject(RiderApiService);

  vehicleTypes = ['Motorbike', 'Bicycle', 'Tuk-tuk', 'Pickup'];

  profile = signal<ProfileView>(EMPTY_PROFILE);
  online = signal(false);
  loading = signal(true);
  loadError = signal<string | null>(null);
  saving = signal(false);
  toast = signal<string | null>(null);
  toastIsError = signal(false);

  initials = computed(() =>
    this.profile()
      .fullName.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('')
  );

  form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, Validators.pattern(KE_PHONE)]],
    email: ['', [Validators.required, Validators.email]],
    vehicleType: ['', Validators.required],
    plate: ['', Validators.required],
    capacity: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(50),
    ]),
    // optional: a new rider has none yet (an empty value passes the pattern validator)
    mpesaNumber: ['', [Validators.pattern(KE_PHONE)]],
    orderAlerts: [true],
    payoutAlerts: [true],
    smsUpdates: [false]
  });

  // last saved values, used by Discard
  private saved = this.form.getRawValue();

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.api.profile(0).subscribe({
      next: (p) => {
        this.applyProfile(p);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('Could not load your profile. Please try again.');
        this.loading.set(false);
      },
    });
  }

  hasError(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  toggleOnline(): void {
    const next = !this.online();
    this.online.set(next); // optimistic; rolled back if the server refuses
    this.api.setStatus(0, next).subscribe({
      next: (p) => this.online.set(p.online),
      error: (err) => {
        this.online.set(!next);
        this.showToast(this.errorMessage(err, 'Could not change your availability'), true);
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const body: ProfileUpdateRequest = {
      fullName: v.fullName.trim(),
      phone: v.phone.trim(),
      email: v.email.trim() || null,
      vehicleType: v.vehicleType,
      plateNumber: v.plate.trim(),
      capacity: v.capacity as number, // validators guarantee a number here
      mpesaNumber: v.mpesaNumber.trim() || null, // backend rejects "" so send null
      notifyNewOrders: v.orderAlerts,
      notifyPayouts: v.payoutAlerts,
      notifySms: v.smsUpdates,
    };

    this.saving.set(true);
    this.api.saveProfile(0, body).subscribe({
      next: (p) => {
        this.applyProfile(p); // shows what the server stored (plate upper-cased, etc.)
        this.saving.set(false);
        this.showToast('Profile saved');
      },
      error: (err) => {
        this.saving.set(false);
        this.showToast(this.errorMessage(err, 'Could not save your profile'), true);
      },
    });
  }

  reset(): void {
    this.form.reset(this.saved);
  }

  // ---- mapping -------------------------------------------------------------

  private applyProfile(p: ProfileDto): void {
    this.profile.set({
      fullName: p.fullName ?? '',
      riderId: p.riderCode,
      memberSince: this.monthYear(p.memberSince),
      rating: p.rating,
      totalDeliveries: p.totalDeliveries,
      onTimeRate: p.onTimeRate,
      verified: p.verified,
    });
    this.online.set(p.online);

    this.form.reset({
      fullName: p.fullName ?? '',
      phone: this.formatPhone(p.phone),
      email: p.email ?? '',
      vehicleType: p.vehicleType ?? '',
      plate: p.plateNumber ?? '',
      capacity: p.capacity,
      mpesaNumber: this.formatPhone(p.mpesaNumber),
      orderAlerts: p.notifyNewOrders,
      payoutAlerts: p.notifyPayouts,
      smsUpdates: p.notifySms,
    });
    this.saved = this.form.getRawValue();
  }

  private monthYear(iso: string | null): string {
    return iso
      ? new Date(iso + 'T00:00:00').toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })
      : '—';
  }

  /** 0798221004 -> "0798 221 004"; anything else is left as it is */
  private formatPhone(p: string | null): string {
    const digits = (p ?? '').replace(/\s/g, '');
    return /^0\d{9}$/.test(digits)
      ? `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
      : digits;
  }

  private errorMessage(err: any, fallback: string): string {
    return err?.error?.message || err?.error?.error || fallback;
  }

  private showToast(message: string, isError = false): void {
    this.toastIsError.set(isError);
    this.toast.set(message);
    setTimeout(() => this.toast.set(null), 3000);
  }
}