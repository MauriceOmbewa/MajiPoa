import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { RiderApiService } from '../../../shared/services/rider-api'; // adjust path

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-rider-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent {
  private api = inject(RiderApiService);
  private router = inject(Router);

  riderRole = 'Rider';

  riderName = computed(() => this.api.currentProfile()?.fullName ?? '');

  riderInitials = computed(() =>
    this.riderName()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('') || '–'
  );

  deliveryNav: NavItem[] = [
    { label: 'Dashboard', icon: '▦', route: '/riders/dashboard' },
    { label: 'Active delivery', icon: '→', route: '/riders/active-delivery' },
    { label: 'History', icon: '☰', route: '/riders/history' }
  ];

  accountNav: NavItem[] = [
    { label: 'Earnings', icon: '▤', route: '/riders/earnings' },
    { label: 'Profile', icon: '◍', route: '/riders/profile' }
  ];

  constructor() {
    // Pages that already loaded the profile fill this in; otherwise fetch it once.
    if (!this.api.currentProfile()) {
      this.api.profile(0).subscribe({ error: () => {} });
    }
  }

  switchMode(): void {
    this.goCustomerMode();
  }

  goCustomerMode(): void {
    // ASSUMPTION: the role value is 'CUSTOMER' and the customer area lives at '/'.
    this.api.switchRole('CUSTOMER').subscribe({
      next: () => {
        this.api.currentProfile.set(null);
        this.router.navigateByUrl('/');
      },
      error: () => {
        // if the role can't be changed, don't strand the rider on a page that will 403
      }
    });
  }

  signOut(): void {
    const done = () => {
      this.api.currentProfile.set(null);
      this.router.navigateByUrl('/');
    };
    this.api.logout().subscribe({ next: done, error: done });
  }
}