import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, of } from 'rxjs';
import { UserResponse } from '../models/api.models';
import { environment } from '../../../environments/environment';

/**
 * AuthService — owns the currently logged-in user.
 *
 * Responsibilities:
 *  - Redirect to Google OAuth2 sign-in (loginWithGoogle)
 *  - Restore session from server cookie on page refresh (fetchCurrentUser)
 *  - Expose the current user as a reactive signal
 *  - Sign out (logout)
 *
 * NOT responsible for:
 *  - Which "mode" the user is browsing in → that's RoleService
 *  - Upgrading the user's DB role          → that's RoleService.upgradeRole()
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);

  /**
   * The currently authenticated user.
   * null  = not logged in (or session not yet restored).
   * Updated by: fetchCurrentUser(), upgradeRole(), logout().
   */
  readonly user    = signal<UserResponse | null>(null);
  readonly loading = signal<boolean>(false);

  readonly isLoggedIn = computed(() => this.user() !== null);

  // Convenience role checks against the DB role (not the active view mode)
  readonly hasVendorRole  = computed(() => this.user()?.role === 'VENDOR' || this.user()?.role === 'ADMIN');
  readonly hasRiderRole   = computed(() => this.user()?.role === 'RIDER'  || this.user()?.role === 'ADMIN');
  readonly isCustomerOnly = computed(() => this.user()?.role === 'CUSTOMER');

  /**
   * Starts the Google OAuth2 sign-in flow.
   * Redirects the whole browser tab to the Spring Boot backend's
   * /oauth2/authorization/google endpoint, which then redirects to Google.
   * After Google authentication, Spring redirects back to /auth/callback here.
   */
  loginWithGoogle(): void {
    window.location.href = `${environment.apiUrl}/oauth2/authorization/google`;
  }

  /**
   * Fetches the current user from the backend using the existing session cookie.
   *
   * Called:
   *  - By /auth/callback after a successful Google login
   *  - By guards on page refresh to restore the session without requiring re-login
   *
   * Returns null (via catchError) if the session has expired or doesn't exist.
   */
  fetchCurrentUser() {
    this.loading.set(true);
    return this.http
      .get<UserResponse>(`${environment.apiUrl}/api/auth/me`, { withCredentials: true })
      .pipe(
        tap(u => {
          this.user.set(u);
          this.loading.set(false);
        }),
        catchError(() => {
          this.user.set(null);
          this.loading.set(false);
          return of(null);
        })
      );
  }

  /**
   * Invalidates the server-side session and clears local state.
   * After this all API calls return 401 until the user signs in again.
   */
  logout() {
    return this.http
      .post<void>(`${environment.apiUrl}/api/auth/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.user.set(null);
          sessionStorage.removeItem('majisafi_active_mode');
          this.router.navigate(['/home']);
        })
      );
  }
}
