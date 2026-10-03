import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { ActiveMode, Role, SwitchRoleRequest, UserResponse } from '../models/api.models';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

/**
 * RoleService — manages the user's ACTIVE MODE separately from their DB role.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  CONCEPT                                                                  │
 * │                                                                          │
 * │  DB role  = the highest capability level stored in the database.         │
 * │             Changed only when the user permanently joins as VENDOR/RIDER │
 * │             via POST /api/auth/role.                                     │
 * │                                                                          │
 * │  activeMode = which portal the user is currently VIEWING.               │
 * │               Stored in sessionStorage — resets on tab close.           │
 * │               A VENDOR can switch to CUSTOMER view and back freely.     │
 * │                                                                          │
 * │  Rule: activeMode can only be a mode the user's DB role allows.         │
 * │    CUSTOMER  → can only be CUSTOMER mode                                │
 * │    VENDOR    → can be CUSTOMER or VENDOR mode                           │
 * │    RIDER     → can be CUSTOMER or RIDER mode                            │
 * │    ADMIN     → can be any mode                                          │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * Flow when user clicks "Switch to vendor mode":
 *   1. Check if their DB role is VENDOR  →  if yes, set activeMode = VENDOR
 *   2. If no  →  navigate to /become-vendor (upgrade prompt page)
 *
 * Flow when user confirms "Join as vendor" on /become-vendor:
 *   1. POST /api/auth/role { role: "VENDOR" }
 *   2. AuthService.user signal updated with new role
 *   3. activeMode set to VENDOR
 *   4. Navigate to /vendor-dashboard
 */
@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly http   = inject(HttpClient);
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  private readonly STORAGE_KEY = 'majisafi_active_mode';

  /** The mode the user is currently browsing in. Defaults to CUSTOMER. */
  readonly activeMode = signal<ActiveMode>(this.loadPersistedMode());

  // ── Computed helpers ─────────────────────────────────────────────────────

  readonly isCustomerMode = computed(() => this.activeMode() === 'CUSTOMER');
  readonly isVendorMode   = computed(() => this.activeMode() === 'VENDOR');
  readonly isRiderMode    = computed(() => this.activeMode() === 'RIDER');

  /** The modes this user is allowed to switch into based on their DB role. */
  readonly allowedModes = computed((): ActiveMode[] => {
    const role = this.auth.user()?.role;
    if (!role) return ['CUSTOMER'];
    switch (role) {
      case 'VENDOR': return ['CUSTOMER', 'VENDOR'];
      case 'RIDER':  return ['CUSTOMER', 'RIDER'];
      case 'ADMIN':  return ['CUSTOMER', 'VENDOR', 'RIDER'];
      default:       return ['CUSTOMER'];
    }
  });

  /** True if the user has the DB role needed to enter a given mode. */
  canEnterMode(mode: ActiveMode): boolean {
    return this.allowedModes().includes(mode);
  }

  // ── Mode switching ────────────────────────────────────────────────────────

  /**
   * Switch to the given mode.
   *
   * If the user already has the required DB role → switches immediately.
   * If they don't → redirects to the upgrade prompt page.
   * Always called from the navbar mode-switcher.
   */
  switchMode(mode: ActiveMode): void {
    if (mode === 'CUSTOMER') {
      // Everyone can always switch back to customer view
      this.setMode('CUSTOMER');
      this.router.navigate(['/home']);
      return;
    }

    if (this.canEnterMode(mode)) {
      this.setMode(mode);
      this.router.navigate(mode === 'VENDOR' ? ['/vendor-dashboard'] : ['/riders/dashboard']);
    } else {
      // User needs to upgrade their role first
      this.router.navigate([mode === 'VENDOR' ? '/become-vendor' : '/become-rider']);
    }
  }

  /**
   * Permanently upgrade the user's DB role, then activate that mode.
   * Called from the /become-vendor or /become-rider confirmation page.
   */
  upgradeRole(role: Role) {
    const body: SwitchRoleRequest = { role };
    return this.http
      .post<UserResponse>(`${environment.apiUrl}/api/auth/role`, body, { withCredentials: true })
      .pipe(
        tap(updated => {
          // Update the user signal in AuthService with the new role
          this.auth.user.set(updated);
          // Activate the new mode immediately
          const mode: ActiveMode = role === 'VENDOR' ? 'VENDOR' : role === 'RIDER' ? 'RIDER' : 'CUSTOMER';
          this.setMode(mode);
        })
      );
  }

  /** Reset active mode to CUSTOMER (called on logout). */
  reset(): void {
    this.setMode('CUSTOMER');
  }

  // ── Internal ─────────────────────────────────────────────────────────────

  private setMode(mode: ActiveMode): void {
    this.activeMode.set(mode);
    sessionStorage.setItem(this.STORAGE_KEY, mode);
  }

  private loadPersistedMode(): ActiveMode {
    const stored = sessionStorage.getItem(this.STORAGE_KEY) as ActiveMode | null;
    return stored ?? 'CUSTOMER';
  }
}
