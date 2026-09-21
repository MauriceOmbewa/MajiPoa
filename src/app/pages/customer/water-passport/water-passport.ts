// ==========================================================================
// MajiSafi - Standalone Angular Water Passport Component
// Framework: Angular 17 / 18 / 19 Standalone Component
// Selector: app-water-passport
// File: src/app/pages/water-passport/water-passport.ts
// ==========================================================================

import { Component, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface WaterLabMeasure {
  id: string;
  name: string;
  result: string;
  standard: string;
  passed: boolean;
}

export interface WaterPassportDetails {
  batchCode: string;
  vendorName: string;
  scanTime: string;
  bottledAtDate: string;
  isVerified: boolean;
  kebsMarkValid: boolean;
  labTestAgeDays: number;
  source: string;
  permitNumber: string;
  treatment: string;
  facilityLocation: string;
  labTestDate: string;
  labAgency: string;
  certificateNumber: string;
  productId?: string;
}

@Component({
  selector: 'app-water-passport',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './water-passport.html',
  styleUrl: './water-passport.scss',
})
export class WaterPassport {
  // Outputs for parent routing / integrations
  @Output() reorderRequested = new EventEmitter<string>();
  @Output() issueReported = new EventEmitter<string>();
  @Output() certificateViewRequested = new EventEmitter<string>();

  // Passport batch details
  passportData = signal<WaterPassportDetails>({
    batchCode: 'AW-0915-B',
    vendorName: 'ABC Water',
    scanTime: '15 Sep, 4:31 pm',
    bottledAtDate: '15 Sep 2026, 9:40 am',
    isVerified: true,
    kebsMarkValid: true,
    labTestAgeDays: 13,
    source: 'Licensed borehole, Ngong Rd',
    permitNumber: 'WRA/NRB/4471',
    treatment: 'Reverse osmosis + UV',
    facilityLocation: 'Kilimani plant, Nairobi',
    labTestDate: '2 Sep 2026',
    labAgency: 'SGS Kenya',
    certificateNumber: 'KE-2026-88214',
    productId: 'abc-20l-refill',
  });

  // Laboratory measures
  labMeasures = signal<WaterLabMeasure[]>([
    {
      id: 'ph',
      name: 'pH',
      result: '7.2',
      standard: '6.5 – 8.5',
      passed: true,
    },
    {
      id: 'tds',
      name: 'Total dissolved solids',
      result: '68 ppm',
      standard: '≤ 600 ppm',
      passed: true,
    },
    {
      id: 'turbidity',
      name: 'Turbidity',
      result: '0.4 NTU',
      standard: '≤ 5 NTU',
      passed: true,
    },
    {
      id: 'coliforms',
      name: 'Total coliforms',
      result: '0 / 100 ml',
      standard: '0 / 100 ml',
      passed: true,
    },
    {
      id: 'ecoli',
      name: 'E. coli',
      result: '0 / 100 ml',
      standard: '0 / 100 ml',
      passed: true,
    },
  ]);

  // Actions
  reorderWater() {
    this.reorderRequested.emit(this.passportData().productId || this.passportData().batchCode);
  }

  reportIssue() {
    this.issueReported.emit(this.passportData().batchCode);
  }

  openCertificate() {
    this.certificateViewRequested.emit(this.passportData().certificateNumber);
  }
}
