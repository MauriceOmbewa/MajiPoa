import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
  riderName = 'James Kariuki';
  riderRole = 'Rider';
  riderInitials = 'JK';

  deliveryNav: NavItem[] = [
    { label: 'Dashboard', icon: '▦', route: '/riders/dashboard' },
    { label: 'Active delivery', icon: '→', route: '/riders/active-delivery' },
    { label: 'History', icon: '☰', route: '/riders/history' }
  ];

  accountNav: NavItem[] = [
    { label: 'Earnings', icon: '▤', route: '/riders/earnings' },
    { label: 'Profile', icon: '◍', route: '/riders/profile' }
  ];

  switchMode(): void {
    // TODO: hook up your account-switch logic here
  }

  goCustomerMode(): void {
    // TODO: navigate to your customer-mode area
  }

  signOut(): void {
    // TODO: hook up your sign-out logic here
  }
}