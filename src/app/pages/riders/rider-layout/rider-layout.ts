import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar';

@Component({
  selector: 'app-rider-layout',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './rider-layout.html',
  styleUrl: './rider-layout.scss'
})
export class RiderLayoutComponent {}