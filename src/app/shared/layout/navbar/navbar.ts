import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RoleService } from '../../services/role.service';
import { ActiveMode } from '../../models/api.models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
})
export class Navbar {
  readonly router = inject(Router);
  readonly auth   = inject(AuthService);
  readonly roles  = inject(RoleService);

  /** Controls visibility of the user/mode dropdown */
  readonly menuOpen = signal(false);

  readonly navItems = [
    { label: 'Order water', route: '/find-water' },
    { label: 'My orders',   route: '/orders' },
    { label: 'Quality',     route: '/water-quality' },
    { label: 'Help',        route: '/help' },
  ];

  /** The display label for the current mode pill */
  readonly modeLabel = computed(() => {
    switch (this.roles.activeMode()) {
      case 'VENDOR': return '🏪 Vendor';
      case 'RIDER':  return '🚴 Rider';
      default:       return '🛍 Customer';
    }
  });

  /** User's first name for the greeting */
  readonly firstName = computed(() => {
    const name = this.auth.user()?.name ?? '';
    return name.split(' ')[0];
  });

  readonly userPicture  = computed(() => this.auth.user()?.pictureUrl ?? null);
  readonly userInitials = computed(() => {
    const name = this.auth.user()?.name ?? '?';
    return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
  });

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  switchMode(mode: ActiveMode): void {
    this.closeMenu();
    this.roles.switchMode(mode);
  }

  signIn(): void {
    this.router.navigate(['/sign-in']);
  }

  signOut(): void {
    this.closeMenu();
    this.auth.logout().subscribe();
  }

  navigateToCart(): void {
    this.router.navigate(['/cart']);
  }
}
