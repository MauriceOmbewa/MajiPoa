// ==========================================================================
// MajiSafi - Standalone Angular Sign In / Authentication Component
// Framework: Angular 17 / 18 / 19 Standalone Component
// Selector: app-sign-in
// File: src/app/pages/sign-in/sign-in.ts
// ==========================================================================

import { Component, signal, Output, EventEmitter, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Navbar } from '../../../shared/layout/navbar/navbar';
import { Footer } from '../../../shared/layout/footer/footer';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar, Footer],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignIn implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  // Outputs kept for backward compatibility but no longer needed for Google SSO
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
    // Redirect to Spring Boot's Google OAuth2 initiation endpoint.
    // Spring Security handles the full OIDC handshake and redirects
    // back to /auth/callback on this app once authentication succeeds.
    this.authService.loginWithGoogle();
  }

  browseAsGuest() {
    this.router.navigate(['/home']);
  }

  joinAsVendor() {
    this.authService.loginWithGoogle();
  }

  goHome() {
    this.router.navigate(['/home']);
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
