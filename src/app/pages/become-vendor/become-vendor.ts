import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Navbar } from '../../shared/layout/navbar/navbar';
import { Footer } from '../../shared/layout/footer/footer';
import { RoleService } from '../../shared/services/role.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-become-vendor',
  standalone: true,
  imports: [CommonModule, Navbar, Footer],
  templateUrl: './become-vendor.html',
})
export class BecomeVendor {
  private readonly roles  = inject(RoleService);
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading    = signal(false);
  readonly error      = signal<string | null>(null);
  readonly isLoggedIn = this.auth.isLoggedIn;

  readonly benefits = [
    'Receive orders directly from customers in your area',
    'Manage deliveries with platform riders or your own staff',
    'Real-time dashboard: sales, orders, and stock levels',
    'Weekly M-Pesa payouts with full settlement statements',
    'Water quality records and verification badges',
    'Free tier available — upgrade to Pro for advanced analytics',
  ];

  goBack():  void { this.router.navigate(['/home']); }
  signIn():  void { this.router.navigate(['/sign-in']); }

  confirm(): void {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/sign-in']); return; }
    this.loading.set(true);
    this.error.set(null);
    this.roles.upgradeRole('VENDOR').subscribe({
      next:  ()    => { this.loading.set(false); this.router.navigate(['/vendor-dashboard']); },
      error: (err) => { this.loading.set(false); this.error.set(err?.error?.detail ?? 'Something went wrong. Please try again.'); },
    });
  }
}
