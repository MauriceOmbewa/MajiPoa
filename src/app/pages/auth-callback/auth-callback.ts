import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { RoleService } from '../../shared/services/role.service';
import { CommonModule } from '@angular/common';

/**
 * /auth/callback
 *
 * Spring Boot redirects here after a successful Google OAuth2 sign-in.
 *
 * What this component does:
 *   1. Calls GET /api/auth/me to load the authenticated user
 *   2. Determines the best landing page based on role + previously active mode
 *   3. Redirects the user there
 *
 * Routing logic:
 *   VENDOR  → /vendor-dashboard  (and sets activeMode = VENDOR)
 *   RIDER   → /riders/dashboard  (and sets activeMode = RIDER)
 *   CUSTOMER / guest → /home     (activeMode stays CUSTOMER)
 *
 * If the session fetch fails (e.g. cookies not sent), we redirect to /sign-in.
 */
@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-[#F1F6FA] flex items-center justify-center">
      <div class="text-center">
        <svg class="w-10 h-10 mx-auto mb-4 animate-spin text-[#07243D]" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <p class="text-[#07243D] font-semibold text-[15px]">Signing you in…</p>
      </div>
    </div>
  `,
})
export class AuthCallback implements OnInit {
  private readonly auth   = inject(AuthService);
  private readonly roles  = inject(RoleService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.auth.fetchCurrentUser().subscribe(user => {
      if (!user) {
        this.router.navigate(['/sign-in']);
        return;
      }
      // Route based on DB role; RoleService.switchMode sets the activeMode signal too
      switch (user.role) {
        case 'VENDOR':
          this.roles.switchMode('VENDOR');
          break;
        case 'RIDER':
          this.roles.switchMode('RIDER');
          break;
        default:
          this.roles.switchMode('CUSTOMER');
          this.router.navigate(['/home']);
          break;
      }
    });
  }
}
