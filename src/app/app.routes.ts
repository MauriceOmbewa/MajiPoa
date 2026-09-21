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
  {path: 'riders/profile',component: Profile}
];
