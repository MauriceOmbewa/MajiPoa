import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

/**
 * Ensures the user is authenticated before activating a route.
 *
 * Behaviour on page refresh:
 *   - user() signal is always null after a refresh (in-memory only).
 *   - If an auth hint exists in localStorage, we know this browser had
 *     a valid session recently, so we try to restore it with fetchCurrentUser()
 *     before deciding whether to allow or block navigation.
 *   - If no hint exists at all, there was never a session in this browser
 *     and we redirect to /sign-in immediately without an HTTP call.
 *
 * Redirect behaviour:
 *   Not logged in + no hint  → /sign-in (immediate)
 *   Not logged in + hint     → fetchCurrentUser() → success: allow
 *                                                  → fail: /sign-in
 *   Logged in                → allow (skip the HTTP call)
 */
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  // Already restored in this page lifecycle
  if (auth.isLoggedIn()) return true;

  // No hint at all — never been logged in here, go straight to sign-in
  if (!auth.hadSession()) {
    router.navigate(['/sign-in']);
    return false;
  }

  // Hint present — try to restore the session from the cookie
  return auth.fetchCurrentUser().pipe(
    map(user => {
      if (user) return true;
      // fetchCurrentUser() succeeded but returned null (true session expiry)
      router.navigate(['/sign-in'], { queryParams: { reason: 'session-expired' } });
      return false;
    })
  );
};
