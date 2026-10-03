import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VendorSidebar } from '../../../shared/layout/vendor-sidebar/vendor-sidebar';
import { VendorApiService } from '../../../shared/services/vendor-api.service';
import { VendorVerificationResponse, DocStatus } from '../../../shared/models/api.models';

export type TabName = 'Verification' | 'Details' | 'Delivery areas' | 'Staff' | 'Reviews';

@Component({
  selector: 'app-vendor-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, VendorSidebar],
  templateUrl: './vendor-verification.html',
})
export class VendorVerification implements OnInit {
  private readonly api = inject(VendorApiService);

  loading     = signal(true);
  error       = signal<string | null>(null);
  savedMsg    = signal<string | null>(null);

  activeTab   = signal<TabName>('Verification');
  tabs: TabName[] = ['Verification', 'Details', 'Delivery areas', 'Staff', 'Reviews'];

  data        = signal<VendorVerificationResponse | null>(null);

  // Editable form fields — seeded from API data
  businessName = signal('');
  waterSource  = signal('');
  treatment    = signal('');
  ph           = signal('');
  tds          = signal('');
  about        = signal('');

  documents  = computed(() => this.data()?.documents ?? []);
  planLabel  = computed(() => this.data()?.plan === 'PRO' ? 'Pro' : 'Free');

  /** Verification progress rail shown in the sidebar panel */
  steps = computed((): Array<{label: string; detail: string; state: 'done' | 'now' | 'upcoming'}> => {
    const vs = this.data()?.verificationStatus;
    const approved = vs === 'APPROVED';
    const suspended = vs === 'SUSPENDED';
    return [
      { label: 'Submitted',               detail: 'Documents uploaded',          state: 'done' },
      { label: 'Under review',            detail: 'MajiSafi ops reviewing',      state: approved || suspended ? 'done' : 'now' },
      { label: 'Approved',                detail: approved ? 'You can sell' : suspended ? 'Account suspended' : 'Pending', state: approved ? 'done' : suspended ? 'now' : 'upcoming' },
      { label: 'Keeping records current', detail: 'Renew expiring documents',    state: 'now' },
    ];
  });

  pipClasses(state: 'done' | 'now' | 'upcoming'): string {
    if (state === 'done') return 'bg-[#12946A] border-[#12946A] text-white';
    if (state === 'now')  return 'border-[#1877D2] text-[#1877D2] shadow-[0_0_0_5px_#E8F2FC]';
    return 'border-[#DBE7F1] text-[#5E7489] bg-white';
  }

  ngOnInit(): void {
    this.api.getVerification().subscribe({
      next: d => {
        this.data.set(d);
        this.businessName.set(d.businessName ?? '');
        this.waterSource.set(d.waterSource ?? '');
        this.treatment.set(d.treatment ?? '');
        this.ph.set(d.phValue ?? '');
        this.tds.set(d.tdsValue ?? '');
        this.about.set(d.about ?? '');
        this.loading.set(false);
      },
      error: () => { this.error.set('Failed to load profile.'); this.loading.set(false); },
    });
  }

  saveProfile(): void {
    this.api.updateProfile({
      businessName: this.businessName(),
      waterSource:  this.waterSource(),
      treatment:    this.treatment(),
      phValue:      this.ph(),
      tdsValue:     this.tds(),
      about:        this.about(),
    }).subscribe({
      next: d => {
        this.data.set(d);
        this.savedMsg.set('Saved');
        setTimeout(() => this.savedMsg.set(null), 2000);
      },
    });
  }

  statusClasses(status: DocStatus): string {
    if (status === 'APPROVED')      return 'bg-[#E3F5EE] text-[#12946A] border-[#c5e8da]';
    if (status === 'EXPIRING')      return 'bg-[#FDF1DE] text-[#C77A11] border-[#f2ddb8]';
    return 'bg-[#F1F6FA] text-[#5E7489] border-[#DBE7F1]';
  }

  statusLabel(s: DocStatus): string {
    return s === 'NOT_SUBMITTED' ? 'Not submitted' : s === 'EXPIRING' ? 'Expiring' : 'Approved';
  }

  formatDate(d: string | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
