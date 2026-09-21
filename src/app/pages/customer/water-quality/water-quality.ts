// ==========================================================================
// MajiSafi - Standalone Angular Water Quality Component
// Framework: Angular 17 / 18 / 19 Standalone Component
// Selector: app-water-quality
// File: src/app/pages/water-quality/water-quality.ts
// ==========================================================================

import { Component, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface VendorQualityRecord {
  id: string;
  name: string;
  location: string;
  source: string;
  treatment: string;
  ph: number;
  tdsPpm: number;
  lastLabTest: string;
  kebsStatus: 'active' | 'pending-renewal' | 'unverified';
  kebsLabel: string;
}

@Component({
  selector: 'app-water-quality',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './water-quality.html',
  styleUrl: './water-quality.scss',
})
export class WaterQuality {
  // Outputs for parent routing / interactions
  @Output() reportProblemRequested = new EventEmitter<void>();
  @Output() orderFromVendorsRequested = new EventEmitter<void>();
  @Output() viewVendorRecordsRequested = new EventEmitter<string>();

  // Verified vendors data
  verifiedVendors = signal<VendorQualityRecord[]>([
    {
      id: 'abc-water',
      name: 'ABC Water',
      location: 'Kilimani',
      source: 'Borehole',
      treatment: 'RO + UV',
      ph: 7.2,
      tdsPpm: 68,
      lastLabTest: '2 Sep 2026',
      kebsStatus: 'active',
      kebsLabel: 'S-Mark',
    },
    {
      id: 'aqua-fresh',
      name: 'Aqua Fresh Ltd',
      location: 'Hurlingham',
      source: 'Municipal',
      treatment: 'UV + RO',
      ph: 7.0,
      tdsPpm: 54,
      lastLabTest: '21 Aug 2026',
      kebsStatus: 'active',
      kebsLabel: 'S-Mark',
    },
    {
      id: 'blue-spring',
      name: 'Blue Spring Water',
      location: 'Yaya',
      source: 'Spring',
      treatment: 'Filtration',
      ph: 7.4,
      tdsPpm: 71,
      lastLabTest: '28 Aug 2026',
      kebsStatus: 'pending-renewal',
      kebsLabel: 'Pending renewal',
    },
  ]);

  // Actions
  reportProblem() {
    this.reportProblemRequested.emit();
  }

  orderFromVendors() {
    this.orderFromVendorsRequested.emit();
  }

  viewVendorRecords(vendorId: string) {
    this.viewVendorRecordsRequested.emit(vendorId);
  }
}
