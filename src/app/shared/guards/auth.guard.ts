import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

/**
 * Ensures the user is authenticated before activating a route.
 *
 * On first page load after a browser refresh, the user() signal is null even
 * though the session cookie is still valid. We call fetchCurrentUser() to
 * restore the session from the cookie before deciding to block or allow.
 *
 * Redirect behaviour:
 *   Not logged in → /sign-in
 *   Logged in     → allow
 */
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  return auth.fetchCurrentUser().pipe(
    map(user => {
      if (user) return true;
      router.navigate(['/sign-in']);
      return false;
    })
  );
};
