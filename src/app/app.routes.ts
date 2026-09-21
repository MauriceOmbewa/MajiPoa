import { Routes } from '@angular/router';
import { HomeComponent } from './pages/customer/home/home';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'find-water', loadComponent: () => import('./pages/customer/find-water/find-water').then(m => m.FindWater) },
  { path: 'product-detail', loadComponent: () => import('./pages/customer/product-detail/product-detail').then(m => m.ProductDetail) },
  { path: 'vendor-shop', loadComponent: () => import('./pages/customer/vendor-shop/vendor-shop').then(m => m.VendorShop) },
  { path: 'cart', loadComponent: () => import('./pages/customer/cart/cart').then(m => m.Cart) },
  { path: 'checkout', loadComponent: () => import('./pages/customer/checkout/checkout').then(m => m.Checkout) },
  { path: 'order-confirmed', loadComponent: () => import('./pages/customer/order-confirmed/order-confirmed').then(m => m.OrderConfirmed) },
  { path: 'live-tracking', loadComponent: () => import('./pages/customer/live-tracking/live-tracking').then(m => m.LiveTracking) },
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
