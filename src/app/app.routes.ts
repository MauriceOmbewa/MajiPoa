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
  { path: '**', redirectTo: 'home' }
];
