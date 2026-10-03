import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleService } from '../services/role.service';
import { map } from 'rxjs';

/**
 * Protects all vendor portal routes (/vendor-dashboard, /vendor-orders, etc.).
 *
 * Two checks are applied in order:
 *   1. Is the user logged in?           → if not, redirect to /sign-in
 *   2. Do they have the VENDOR DB role? → if not, redirect to /become-vendor
 *      (the upgrade prompt page)
 *
 * The activeMode check is intentionally NOT done here — the guard is about
 * access control, not current view preference. Once inside the vendor portal
 * the user is always in vendor mode. If they want to go back to customer view
 * they use the mode-switcher in the sidebar.
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
      // Ensure the active mode reflects where they are
      if (!roles.isVendorMode()) roles.switchMode('VENDOR');
      return true;
    }
    router.navigate(['/become-vendor']);
    return false;
  };

  if (auth.isLoggedIn()) return check();

  // Restore session first (page refresh scenario)
  return auth.fetchCurrentUser().pipe(map(() => check()));
};
