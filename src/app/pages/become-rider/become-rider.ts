import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Navbar } from '../../shared/layout/navbar/navbar';
import { Footer } from '../../shared/layout/footer/footer';
import { RoleService } from '../../shared/services/role.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-become-rider',
  standalone: true,
  imports: [CommonModule, Navbar, Footer],
  templateUrl: './become-rider.html',
})
export class BecomeRider {
  private readonly roles  = inject(RoleService);
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading    = signal(false);
  readonly error      = signal<string | null>(null);
  readonly isLoggedIn = this.auth.isLoggedIn;

  readonly benefits = [
    'Pick up and deliver water orders in your area',
    'Flexible hours — work whenever you want',
    'Real-time delivery tracking and route guidance',
    'Daily earnings summary and M-Pesa payouts',
    'Ratings system to build your reputation',
    'Support from the MajiSafi operations team',
  ];

  goBack():  void { this.router.navigate(['/home']); }
  signIn():  void { this.router.navigate(['/sign-in']); }

  confirm(): void {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/sign-in']); return; }
    this.loading.set(true);
    this.error.set(null);
    this.roles.upgradeRole('RIDER').subscribe({
      next:  ()    => { this.loading.set(false); this.router.navigate(['/riders/dashboard']); },
      error: (err) => { this.loading.set(false); this.error.set(err?.error?.detail ?? 'Something went wrong. Please try again.'); },
    });
  }
}
