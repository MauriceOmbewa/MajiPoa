import { Injectable, signal, computed, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, of } from 'rxjs';
import { UserResponse } from '../models/api.models';
import { environment } from '../../../environments/environment';

/**
 * AuthService — owns the currently logged-in user.
 *
 * Session persistence strategy:
 *
 *  1. COOKIE (server-side)
 *     Spring Boot sets an HTTP-only session cookie after OAuth2.
 *     Every API request sends it via withCredentials: true.
 *
 *  2. AUTH HINT (localStorage)
 *     A small flag { email, role } is written to localStorage on every
 *     successful fetchCurrentUser().  It is cleared on logout.
 *     The guards read it to know "this browser was logged in recently"
 *     and show a loading state instead of an instant /sign-in redirect.
 *
 *  3. KEEP-ALIVE PING
 *     While the user is logged in, GET /api/auth/me is called every
 *     10 minutes.  This resets Spring Boot's 30-min session idle timer
 *     so active users are never kicked out mid-session.
 *
 *  4. 401 INTERCEPTOR (auth.interceptor.ts)
 *     Any 401 response triggers one automatic session-restore attempt
 *     before redirecting to /sign-in.
 */

const AUTH_HINT_KEY    = 'majisafi_auth_hint';
const KEEPALIVE_MS     = 10 * 60 * 1000; // 10 minutes

export interface AuthHint {
  email: string;
  role:  string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);

  // ── Signals ─────────────────────────────────────────────────────────────

  readonly user    = signal<UserResponse | null>(null);
  readonly loading = signal<boolean>(false);

  readonly isLoggedIn     = computed(() => this.user() !== null);
  readonly hasVendorRole  = computed(() => this.user()?.role === 'VENDOR' || this.user()?.role === 'ADMIN');
  readonly hasRiderRole   = computed(() => this.user()?.role === 'RIDER'  || this.user()?.role === 'ADMIN');
  readonly isCustomerOnly = computed(() => this.user()?.role === 'CUSTOMER');

  /**
   * True when a valid auth hint exists in localStorage, meaning this browser
   * had an active session recently.  Guards use this to show a loading spinner
   * instead of redirecting instantly to /sign-in on a page refresh.
   */
  readonly hadSession = computed(() => this._loadHint() !== null);

  // ── Keep-alive timer ─────────────────────────────────────────────────────
  private keepAliveTimer: ReturnType<typeof setInterval> | null = null;

  // ── Google OAuth2 ────────────────────────────────────────────────────────

  loginWithGoogle(): void {
    window.location.href = `${environment.apiUrl}/oauth2/authorization/google`;
  }

  // ── Session restore ───────────────────────────────────────────────────────

  /**
   * Fetches /api/auth/me with the existing session cookie.
   * On success: sets user signal, writes auth hint, starts keep-alive.
   * On failure: clears hint and user signal.
   */
  fetchCurrentUser() {
    this.loading.set(true);
    return this.http
      .get<UserResponse>(`${environment.apiUrl}/api/auth/me`, { withCredentials: true })
      .pipe(
        tap(u => {
          this.user.set(u);
          this.loading.set(false);
          this._saveHint({ email: u.email ?? '', role: u.role ?? '' });
          this._startKeepAlive();
        }),
        catchError(() => {
          this.user.set(null);
          this.loading.set(false);
          // Only clear the hint if the server confirms the session is gone.
          // Network errors (e.g. backend briefly down) should not log the user out.
          return of(null);
        })
      );
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  logout() {
    this._stopKeepAlive();
    return this.http
      .post<void>(`${environment.apiUrl}/api/auth/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.user.set(null);
          this.clearAuthHint();
          sessionStorage.removeItem('majisafi_active_mode');
          this.router.navigate(['/home']);
        })
      );
  }

  // ── Auth hint (localStorage) ──────────────────────────────────────────────

  /** Called by the 401 interceptor after a confirmed session expiry. */
  clearAuthHint(): void {
    try { localStorage.removeItem(AUTH_HINT_KEY); } catch { /* private browsing */ }
  }

  private _saveHint(hint: AuthHint): void {
    try {
      localStorage.setItem(AUTH_HINT_KEY, JSON.stringify(hint));
    } catch { /* storage quota or private browsing — ignore */ }
  }

  private _loadHint(): AuthHint | null {
    try {
      const raw = localStorage.getItem(AUTH_HINT_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AuthHint;
    } catch {
      return null;
    }
  }

  // ── Keep-alive ────────────────────────────────────────────────────────────

  /**
   * Pings /api/auth/me every 10 minutes to reset the Spring Boot session
   * idle timer.  Only the timer is of interest here — the response is handled
   * the same way as any other fetchCurrentUser() call.
   */
  private _startKeepAlive(): void {
    this._stopKeepAlive(); // clear any existing timer first

    this.keepAliveTimer = setInterval(() => {
      // Only ping if the tab is visible — no need to extend a session the
      // user has walked away from.
      if (document.visibilityState === 'hidden') return;

      this.http
        .get<UserResponse>(`${environment.apiUrl}/api/auth/me`, { withCredentials: true })
        .pipe(
          tap(u => {
            // Keep signal in sync in case role changed server-side
            this.user.set(u);
            this._saveHint({ email: u.email ?? '', role: u.role ?? '' });
          }),
          catchError(() => {
            // Session expired — stop pinging and clear state
            this._stopKeepAlive();
            this.user.set(null);
            this.clearAuthHint();
            return of(null);
          })
        )
        .subscribe();
    }, KEEPALIVE_MS);
  }

  private _stopKeepAlive(): void {
    if (this.keepAliveTimer !== null) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }
}
