import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleService } from '../services/role.service';
import { map } from 'rxjs';

/**
 * Protects all rider portal routes (/riders/**).
 * Same two-step pattern as vendorGuard:
 *   1. Logged in?          → no → /sign-in
 *   2. Has RIDER DB role?  → no → /become-rider
 */
export const riderGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const roles  = inject(RoleService);
  const router = inject(Router);

  const check = () => {
    if (!auth.isLoggedIn()) { router.navigate(['/sign-in']); return false; }
    if (auth.hasRiderRole()) {
      if (!roles.isRiderMode()) roles.switchMode('RIDER');
      return true;
    }
    router.navigate(['/become-rider']);
    return false;
  };

  if (auth.isLoggedIn()) return check();
  return auth.fetchCurrentUser().pipe(map(() => check()));
};
