import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VendorSidebar } from '../../../shared/layout/vendor-sidebar/vendor-sidebar';

export type DocStatus = 'Approved' | 'Expiring' | 'Not submitted';

export interface VendorDocument {
  name: string;
  note?: string;
  reference: string;
  submitted: string;
  validUntil: string;
  status: DocStatus;
}

export type RailState = 'done' | 'now';
export interface VerificationStep {
  label: string;
  detail: string;
  state: RailState;
}

@Component({
  selector: 'app-vendor-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, VendorSidebar],
  templateUrl: './vendor-verification.html',
})
export class VendorVerification {
  activeTab = signal<'Verification' | 'Details' | 'Delivery areas' | 'Staff' | 'Reviews'>('Verification');
  tabs: Array<typeof this.activeTab extends () => infer T ? T : never> =
    ['Verification', 'Details', 'Delivery areas', 'Staff', 'Reviews'];

  documents = signal<VendorDocument[]>([
    { name: 'Business registration', reference: 'PVT-9K4D22', submitted: '4 Mar 2026', validUntil: '—', status: 'Approved' },
    { name: 'KEBS standardisation mark', reference: 'SM-2026-4471', submitted: '4 Mar 2026', validUntil: '31 Mar 2027', status: 'Approved' },
    { name: 'Water abstraction permit', reference: 'WRA/NRB/4471', submitted: '4 Mar 2026', validUntil: '12 Jan 2028', status: 'Approved' },
    { name: 'Laboratory test result', reference: 'KE-2026-88214 · SGS', submitted: '3 Sep 2026', validUntil: '2 Dec 2026', status: 'Expiring' },
    { name: 'Public health certificate', reference: '—', submitted: '—', validUntil: '—', status: 'Not submitted' },
  ]);

  steps = signal<VerificationStep[]>([
    { label: 'Submitted', detail: '4 Mar 2026', state: 'done' },
    { label: 'Under review', detail: '5 – 6 Mar 2026', state: 'done' },
    { label: 'Approved', detail: '6 Mar 2026 · you can sell', state: 'done' },
    { label: 'Keeping records current', detail: '1 document expiring', state: 'now' },
  ]);

  // Editable business-profile fields (feed the customer-facing water passport)
  waterSource = signal('Licensed borehole');
  treatment = signal('Reverse osmosis + UV');
  ph = signal('7.2');
  tds = signal('68 ppm');
  about = signal('Family-run since 2021. We draw from a licensed borehole on Ngong Road and purify by reverse osmosis and UV. Every jug is sealed and batch-coded.');

  savedMessage = signal<string | null>(null);

  saveProfile(): void {
    this.savedMessage.set('Saved');
    setTimeout(() => this.savedMessage.set(null), 2000);
  }

  statusClasses(status: DocStatus): string {
    if (status === 'Approved') return 'bg-[#E3F5EE] text-[#12946A] border-[#c5e8da]';
    if (status === 'Expiring') return 'bg-[#FDF1DE] text-[#C77A11] border-[#f2ddb8]';
    return 'bg-[#F1F6FA] text-[#5E7489] border-[#DBE7F1]';
  }

  pipClasses(state: RailState): string {
    return state === 'done'
      ? 'bg-[#12946A] border-[#12946A] text-white'
      : 'border-[#1877D2] text-[#1877D2] shadow-[0_0_0_5px_#E8F2FC]';
  }
}