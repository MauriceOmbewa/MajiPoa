import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleService } from '../services/role.service';
import { map } from 'rxjs';

/**
 * Protects all vendor portal routes (/vendor-dashboard, /vendor-orders, etc.).
 *
 * Two checks applied in order:
 *   1. Is the user logged in?           → no → /sign-in
 *   2. Do they have the VENDOR DB role? → no → /become-vendor
 *
 * Uses the auth hint to avoid instant redirect on page refresh when a
 * valid session cookie may still exist.
 */
export const vendorGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const roles  = inject(RoleService);
  const router = inject(Router);

  const check = () => {
    if (!auth.isLoggedIn()) {
      router.navigate(['/sign-in']);
      return false;
    }
    if (auth.hasVendorRole()) {
      if (!roles.isVendorMode()) roles.switchMode('VENDOR');
      return true;
    }
    router.navigate(['/become-vendor']);
    return false;
  };

  if (auth.isLoggedIn()) return check();

  // No hint → never been logged in, no point calling the server
  if (!auth.hadSession()) {
    router.navigate(['/sign-in']);
    return false;
  }

  return auth.fetchCurrentUser().pipe(map(() => check()));
};
