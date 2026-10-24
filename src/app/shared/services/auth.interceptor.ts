/**
 * authInterceptor
 *
 * Catches 401 Unauthorized responses from the backend and attempts a
 * single session-restore before giving up and redirecting to /sign-in.
 *
 * Flow:
 *   Request → 401 → fetchCurrentUser() → success → retry original request
 *                                      → fail    → navigate to /sign-in
 *
 * A `_retried` flag on the cloned request prevents infinite retry loops
 * if /api/auth/me itself returns 401 (session truly expired).
 *
 * The interceptor is skipped for the /api/auth/me and /api/auth/logout
 * endpoints to avoid circular retry loops.
 */

import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

// Extend request to carry the retry flag (Angular HttpRequest is immutable,
// so we carry the flag in a module-level WeakSet keyed to the request object).
const retriedRequests = new WeakSet<HttpRequest<unknown>>();

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  // Skip the session-restore and logout endpoints to avoid loops
  const isAuthEndpoint =
    req.url.includes('/api/auth/me') ||
    req.url.includes('/api/auth/logout') ||
    req.url.includes('/oauth2/');

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Only handle 401s; pass everything else through
      if (err.status !== 401 || isAuthEndpoint || retriedRequests.has(req)) {
        return throwError(() => err);
      }

      // Mark this request as already retried so we don't loop
      retriedRequests.add(req);

      // Try to restore the session from the cookie
      return auth.fetchCurrentUser().pipe(
        switchMap(user => {
          if (user) {
            // Session restored — replay the original request with credentials
            const retried = req.clone({ withCredentials: true });
            retriedRequests.add(retried);
            return next(retried);
          }

          // Session is truly gone — clear any stale hint and redirect
          auth.clearAuthHint();
          router.navigate(['/sign-in'], {
            queryParams: { reason: 'session-expired' },
          });
          return throwError(() => err);
        }),
        catchError(() => {
          // fetchCurrentUser itself failed
          auth.clearAuthHint();
          router.navigate(['/sign-in'], {
            queryParams: { reason: 'session-expired' },
          });
          return throwError(() => err);
        })
      );
    })
  );
};
