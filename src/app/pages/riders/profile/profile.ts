import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar';

const KE_PHONE = /^(?:\+254|0)[17]\d{2}\s?\d{3}\s?\d{3}$/;

@Component({
  selector: 'app-rider-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {
  private fb = inject(FormBuilder);

  vehicleTypes = ['Motorbike', 'Bicycle', 'Tuk-tuk', 'Pickup'];

  // TODO: replace with data from your rider/auth service
  profile = signal({
    fullName: 'James Kariuki',
    riderId: 'RDR-0412',
    memberSince: 'March 2025',
    rating: 4.8,
    totalDeliveries: 1284,
    onTimeRate: 96
  });

  online = signal(true);
  saving = signal(false);
  toast = signal<string | null>(null);

  initials = computed(() =>
    this.profile()
      .fullName.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('')
  );

  form = this.fb.nonNullable.group({
    fullName: ['James Kariuki', [Validators.required, Validators.minLength(3)]],
    phone: ['0798 221 004', [Validators.required, Validators.pattern(KE_PHONE)]],
    email: ['james.kariuki@example.com', [Validators.required, Validators.email]],
    vehicleType: ['Motorbike', Validators.required],
    plate: ['KMFA 123B', Validators.required],
    capacity: [4, [Validators.required, Validators.min(1), Validators.max(50)]],
    mpesaNumber: ['0798 221 004', [Validators.required, Validators.pattern(KE_PHONE)]],
    orderAlerts: [true],
    payoutAlerts: [true],
    smsUpdates: [false]
  });

  // last saved values, used by Discard
  private saved = this.form.getRawValue();

  hasError(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  toggleOnline(): void {
    this.online.update((v) => !v);
    // TODO: tell your API the rider's availability changed
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    // TODO: replace this timeout with your real API call
    setTimeout(() => {
      this.saved = this.form.getRawValue();
      this.profile.update((p) => ({ ...p, fullName: this.saved.fullName }));
      this.form.markAsPristine();
      this.saving.set(false);
      this.showToast('Profile saved');
    }, 600);
  }

  reset(): void {
    this.form.reset(this.saved);
  }

  private showToast(message: string): void {
    this.toast.set(message);
    setTimeout(() => this.toast.set(null), 2500);
  }
}