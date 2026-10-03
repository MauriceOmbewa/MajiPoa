import { Routes } from '@angular/router';
import { HomeComponent } from './pages/customer/home/home';
import { Dashboard } from './pages/riders/dashboard/dashboard';
import { ActiveDelivery } from './pages/riders/active-delivery/active-delivery';
import { History } from './pages/riders/history/history';
import { Earnings } from './pages/riders/earnings/earnings';
import { Profile } from './pages/riders/profile/profile';
import { vendorGuard } from './shared/guards/vendor.guard';
import { riderGuard } from './shared/guards/rider.guard';
import { authGuard } from './shared/guards/auth.guard';

/**
 * Application routes.
 *
 * Three tiers of access:
 *   1. Public          — no guard, anyone can visit (home, sign-in, find-water…)
 *   2. authGuard       — must be logged in (orders, cart, account…)
 *   3. vendorGuard     — must be logged in AND have VENDOR DB role
 *   4. riderGuard      — must be logged in AND have RIDER DB role
 *
 * Role-upgrade pages (/become-vendor, /become-rider) are intentionally PUBLIC
 * so even logged-out users can browse the pitch before signing in.
 */
export const routes: Routes = [

  // ── Root redirect ─────────────────────────────────────────────────────────
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // ── OAuth2 callback ───────────────────────────────────────────────────────
  // Spring Boot redirects here after successful Google sign-in.
  {
    path: 'auth/callback',
    loadComponent: () => import('./pages/auth-callback/auth-callback').then(m => m.AuthCallback),
  },

  // ── Role upgrade prompts (public) ─────────────────────────────────────────
  // Shown when a CUSTOMER tries to enter the vendor/rider portal.
  // Public so even signed-out users can read about the benefits.
  {
    path: 'become-vendor',
    loadComponent: () => import('./pages/become-vendor/become-vendor').then(m => m.BecomeVendor),
  },
  {
    path: 'become-rider',
    loadComponent: () => import('./pages/become-rider/become-rider').then(m => m.BecomeRider),
  },

  // ── Customer pages — public ───────────────────────────────────────────────
  { path: 'home',           component: HomeComponent },
  { path: 'sign-in',        loadComponent: () => import('./pages/customer/sign-in/sign-in').then(m => m.SignIn) },
  { path: 'find-water',     loadComponent: () => import('./pages/customer/find-water/find-water').then(m => m.FindWater) },
  { path: 'product-detail', loadComponent: () => import('./pages/customer/product-detail/product-detail').then(m => m.ProductDetail) },
  { path: 'vendor-shop',    loadComponent: () => import('./pages/customer/vendor-shop/vendor-shop').then(m => m.VendorShop) },
  { path: 'water-passport', loadComponent: () => import('./pages/customer/water-passport/water-passport').then(m => m.WaterPassport) },
  { path: 'water-quality',  loadComponent: () => import('./pages/customer/water-quality/water-quality').then(m => m.WaterQuality) },

  // ── Customer pages — authenticated ────────────────────────────────────────
  { path: 'orders',           canActivate: [authGuard], loadComponent: () => import('./pages/customer/orders/orders').then(m => m.Orders) },
  { path: 'accountaddress',   canActivate: [authGuard], loadComponent: () => import('./pages/customer/account-addresses/account-addresses').then(m => m.AccountAddresses) },
  { path: 'cart',             canActivate: [authGuard], loadComponent: () => import('./pages/customer/cart/cart').then(m => m.Cart) },
  { path: 'checkout',         canActivate: [authGuard], loadComponent: () => import('./pages/customer/checkout/checkout').then(m => m.Checkout) },
  { path: 'account',          canActivate: [authGuard], loadComponent: () => import('./pages/customer/corporate-accounts/corporate-accounts').then(m => m.CorporateAccounts) },
  { path: 'help',             canActivate: [authGuard], loadComponent: () => import('./pages/customer/help-complaints/help-complaints').then(m => m.HelpComplaints) },
  { path: 'order-confirmed',  canActivate: [authGuard], loadComponent: () => import('./pages/customer/order-confirmed/order-confirmed').then(m => m.OrderConfirmed) },
  { path: 'live-tracking',    canActivate: [authGuard], loadComponent: () => import('./pages/customer/live-tracking/live-tracking').then(m => m.LiveTracking) },
  { path: 'offers',           canActivate: [authGuard], loadComponent: () => import('./pages/customer/offers-rewards/offers-rewards').then(m => m.OffersRewards) },
  { path: 'recurring-orders', canActivate: [authGuard], loadComponent: () => import('./pages/customer/recurring-delivery/recurring-delivery').then(m => m.RecurringDelivery) },

  // ── Rider portal — riderGuard (RIDER role required) ───────────────────────
  { path: 'riders/dashboard',       canActivate: [riderGuard], component: Dashboard },
  { path: 'riders/active-delivery', canActivate: [riderGuard], component: ActiveDelivery },
  { path: 'riders/history',         canActivate: [riderGuard], component: History },
  { path: 'riders/earnings',        canActivate: [riderGuard], component: Earnings },
  { path: 'riders/profile',         canActivate: [riderGuard], component: Profile },

  // ── Vendor portal — vendorGuard (VENDOR role required) ───────────────────
  { path: 'vendor-dashboard',    canActivate: [vendorGuard], loadComponent: () => import('./pages/vendor/vendor-dashboard/vendor-dashboard').then(m => m.VendorDashboard) },
  { path: 'vendor-orders',       canActivate: [vendorGuard], loadComponent: () => import('./pages/vendor/vendor-orders/vendor-orders').then(m => m.VendorOrders) },
  { path: 'vendor-order-detail', canActivate: [vendorGuard], loadComponent: () => import('./pages/vendor/vendor-order-detail/vendor-order-detail').then(m => m.VendorOrderDetail) },
  { path: 'vendor-deliveries',   canActivate: [vendorGuard], loadComponent: () => import('./pages/vendor/vendor-deliveries/vendor-deliveries').then(m => m.VendorDeliveries) },
  { path: 'vendor-products',     canActivate: [vendorGuard], loadComponent: () => import('./pages/vendor/vendor-products/vendor-products').then(m => m.VendorProducts) },
  { path: 'vendor-analytics',    canActivate: [vendorGuard], loadComponent: () => import('./pages/vendor/vendor-analytics/vendor-analytics').then(m => m.VendorAnalytics) },
  { path: 'vendor-offline-sales',canActivate: [vendorGuard], loadComponent: () => import('./pages/vendor/vendor-offline-sales/vendor-offline-sales').then(m => m.VendorOfflineSales) },
  { path: 'vendor-payouts',      canActivate: [vendorGuard], loadComponent: () => import('./pages/vendor/vendor-payouts/vendor-payouts').then(m => m.VendorPayouts) },
  { path: 'vendor-verification', canActivate: [vendorGuard], loadComponent: () => import('./pages/vendor/vendor-verification/vendor-verification').then(m => m.VendorVerification) },
  { path: 'vendor-subscription', canActivate: [vendorGuard], loadComponent: () => import('./pages/vendor/vendor-subscription/vendor-subscription').then(m => m.VendorSubscription) },

  // ── Fallback ──────────────────────────────────────────────────────────────
  { path: '**', redirectTo: 'home' },
];
