// ==========================================================================
// MajiSafi - Standalone Angular Corporate Accounts Component
// Framework: Angular 17 / 18 / 19 Standalone Component
// Selector: app-corporate-accounts
// File: src/app/pages/corporate-accounts/corporate-accounts.ts
// ==========================================================================

import { Component, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

export interface CorporateAccountRequest {
  companyName: string;
  kraPin: string;
  contactPerson: string;
  phone: string;
  workEmail: string;
  sitesCount: number;
  weeklyVolume: number | null;
  notes: string;
}

@Component({
  selector: 'app-corporate-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './corporate-accounts.html',
  styleUrl: './corporate-accounts.scss',
})
export class CorporateAccounts {
  // Outputs for parent routing / integrations
  @Output() requestSubmitted = new EventEmitter<CorporateAccountRequest>();
  @Output() onceOffRequested = new EventEmitter<void>();

  // State Signals
  isSubmitted = signal<boolean>(false);

  // Form Data Model
  formData: CorporateAccountRequest = {
    companyName: '',
    kraPin: '',
    contactPerson: '',
    phone: '',
    workEmail: '',
    sitesCount: 1,
    weeklyVolume: null,
    notes: '',
  };

  // Actions
  scrollToRequestForm() {
    const el = document.getElementById('req');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  orderOnceOff() {
    this.onceOffRequested.emit();
  }

  submitRequest() {
    if (!this.formData.companyName || !this.formData.contactPerson || !this.formData.phone || !this.formData.workEmail) {
      alert('Please fill in the required fields: Company Name, Contact Person, Phone, and Work Email.');
      return;
    }

    this.isSubmitted.set(true);
    this.requestSubmitted.emit({ ...this.formData });

    setTimeout(() => {
      this.formData = {
        companyName: '',
        kraPin: '',
        contactPerson: '',
        phone: '',
        workEmail: '',
        sitesCount: 1,
        weeklyVolume: null,
        notes: '',
      };
      this.isSubmitted.set(false);
    }, 4000);
  }
}
