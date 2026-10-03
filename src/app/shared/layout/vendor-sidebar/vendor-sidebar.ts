import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { VendorApiService } from '../../services/vendor-api.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-vendor-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './vendor-sidebar.html',
})
export class VendorSidebar {
  private readonly auth      = inject(AuthService);
  private readonly vendorApi = inject(VendorApiService);

  // Pull vendor's business name from verification endpoint
  private readonly verification$ = toSignal(this.vendorApi.getVerification(), { initialValue: null });

  readonly businessName = computed(() => this.verification$()?.businessName ?? 'My Water Business');

  /** Two-letter initials for the avatar */
  readonly initials = computed(() => {
    const name = this.businessName();
    return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
  });

  readonly userName = computed(() => this.auth.user()?.name ?? '');

  logout(): void {
    this.auth.logout().subscribe();
  }
}
