import { Routes } from '@angular/router';
import { HomeComponent } from './pages/customer/home/home';
import { Dashboard } from './pages/riders/dashboard/dashboard';
import { ActiveDelivery } from './pages/riders/active-delivery/active-delivery';
   import { History } from './pages/riders/history/history';
   import { Earnings } from './pages/riders/earnings/earnings';
   import{ Profile } from './pages/riders/profile/profile';


export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'riders/dashboard', component: Dashboard },
  { path: 'riders/active-delivery', component: ActiveDelivery },
  { path: 'riders/history', component: History },
  {path: 'riders/earnings',component: Earnings},
  {path: 'riders/profile',component: Profile},
  { path: 'find-water', loadComponent: () => import('./pages/customer/find-water/find-water').then(m => m.FindWater) },
  { path: 'product-detail', loadComponent: () => import('./pages/customer/product-detail/product-detail').then(m => m.ProductDetail) },
  { path: 'vendor-shop', loadComponent: () => import('./pages/customer/vendor-shop/vendor-shop').then(m => m.VendorShop) },
  { path: 'orders', loadComponent: () => import('./pages/customer/orders/orders').then(m => m.Orders) },
  { path: 'accountaddress', loadComponent: () => import('./pages/customer/account-addresses/account-addresses').then(m => m.AccountAddresses) },
  { path: 'cart', loadComponent: () => import('./pages/customer/cart/cart').then(m => m.Cart) },
  { path: 'checkout', loadComponent: () => import('./pages/customer/checkout/checkout').then(m => m.Checkout) },
  { path: 'account', loadComponent: () => import('./pages/customer/corporate-accounts/corporate-accounts').then(m => m.CorporateAccounts) },
  { path: 'help', loadComponent: () => import('./pages/customer/help-complaints/help-complaints').then(m => m.HelpComplaints) },
  { path: 'order-confirmed', loadComponent: () => import('./pages/customer/order-confirmed/order-confirmed').then(m => m.OrderConfirmed) },
  { path: 'live-tracking', loadComponent: () => import('./pages/customer/live-tracking/live-tracking').then(m => m.LiveTracking) },
  { path: 'offers', loadComponent: () => import('./pages/customer/offers-rewards/offers-rewards').then(m => m.OffersRewards) },
  { path: 'recurring-orders', loadComponent: () => import('./pages/customer/recurring-delivery/recurring-delivery').then(m => m.RecurringDelivery) },
  { path: 'sign-in', loadComponent: () => import('./pages/customer/sign-in/sign-in').then(m => m.SignIn) },
  { path: 'vendor-shop', loadComponent: () => import('./pages/customer/vendor-shop/vendor-shop').then(m => m.VendorShop) },
  { path: 'water-passport', loadComponent: () => import('./pages/customer/water-passport/water-passport').then(m => m.WaterPassport) },
  { path: 'water-quality', loadComponent: () => import('./pages/customer/water-quality/water-quality').then(m => m.WaterQuality) },
  { path: 'vendor-dashboard', loadComponent: () => import('./pages/vendor/vendor-dashboard/vendor-dashboard').then(m => m.VendorDashboard) },
  { path: 'vendor-orders', loadComponent: () => import('./pages/vendor/vendor-orders/vendor-orders').then(m => m.VendorOrders) },
  { path: 'vendor-order-detail', loadComponent: () => import('./pages/vendor/vendor-order-detail/vendor-order-detail').then(m => m.VendorOrderDetail) },
  { path: 'vendor-deliveries', loadComponent: () => import('./pages/vendor/vendor-deliveries/vendor-deliveries').then(m => m.VendorDeliveries) },
  { path: 'vendor-products', loadComponent: () => import('./pages/vendor/vendor-products/vendor-products').then(m => m.VendorProducts) },
  { path: 'vendor-analytics', loadComponent: () => import('./pages/vendor/vendor-analytics/vendor-analytics').then(m => m.VendorAnalytics) },
  { path: 'vendor-offline-sales', loadComponent: () => import('./pages/vendor/vendor-offline-sales/vendor-offline-sales').then(m => m.VendorOfflineSales) },
  { path: 'vendor-payouts', loadComponent: () => import('./pages/vendor/vendor-payouts/vendor-payouts').then(m => m.VendorPayouts) },
  { path: 'vendor-verification', loadComponent: () => import('./pages/vendor/vendor-verification/vendor-verification').then(m => m.VendorVerification) },
  { path: 'vendor-subscription', loadComponent: () => import('./pages/vendor/vendor-subscription/vendor-subscription').then(m => m.VendorSubscription) },
  { path: '**', redirectTo: 'home' }
];
