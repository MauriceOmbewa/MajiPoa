import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class Navbar {
  readonly router = inject(Router);

  readonly navItems = [
    { label: 'Order water', route: '/find-water' },
    { label: 'My orders', route: '/orders' },
    { label: 'Water quality', route: '/water-quality' },
    { label: 'Help', route: '/help' },
    { label: 'Vendor', route: '/vendor-shop' },
    { label: 'Rider', route: '/riders/dashboard' },
  ];

  navigateToCart(): void {
    this.router.navigate(['/cart']);
  }

  navigateToSignIn(): void {
    this.router.navigate(['/sign-in']);
  }
}
