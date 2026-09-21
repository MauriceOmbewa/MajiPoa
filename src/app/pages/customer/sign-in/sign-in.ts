// ==========================================================================
// MajiSafi - Standalone Angular Sign In / Authentication Component
// Framework: Angular 17 / 18 / 19 Standalone Component
// Selector: app-sign-in
// File: src/app/pages/sign-in/sign-in.ts
// ==========================================================================

import { Component, signal, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignIn implements OnDestroy {
  // Outputs for parent routing / integrations
  @Output() signedIn = new EventEmitter<{ phone: string }>();
  @Output() googleSignInRequested = new EventEmitter<void>();
  @Output() guestBrowsingRequested = new EventEmitter<void>();
  @Output() vendorJoinRequested = new EventEmitter<void>();
  @Output() navigateHomeRequested = new EventEmitter<void>();

  // State
  phoneNumber = '';
  otpCode = '';
  codeSent = signal<boolean>(false);
  resendSeconds = signal<number>(42);

  private timerInterval: any = null;

  sendCode() {
    if (!this.phoneNumber || this.phoneNumber.trim().length < 9) {
      alert('Please enter a valid phone number (e.g., 0712 345 678).');
      return;
    }

    this.codeSent.set(true);
    this.resendSeconds.set(42);

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      const current = this.resendSeconds();
      if (current > 0) {
        this.resendSeconds.set(current - 1);
      } else {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  verifyCode() {
    if (!this.otpCode || this.otpCode.trim().length < 4) {
      alert('Please enter the 6-digit verification code sent to your phone.');
      return;
    }

    this.signedIn.emit({ phone: this.phoneNumber });
  }

  continueWithGoogle() {
    this.googleSignInRequested.emit();
  }

  browseAsGuest() {
    this.guestBrowsingRequested.emit();
  }

  joinAsVendor() {
    this.vendorJoinRequested.emit();
  }

  goHome() {
    this.navigateHomeRequested.emit();
  }

  openTerms() {
    window.open('/terms', '_blank');
  }

  openPrivacy() {
    window.open('/privacy', '_blank');
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}
