// ==========================================================================
// MajiSafi - Standalone Angular Help & Complaints Component
// Framework: Angular 17 / 18 / 19 Standalone Component
// Selector: app-help-complaints
// File: src/app/pages/help-complaints/help-complaints.ts
// ==========================================================================

import { Component, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

export interface SupportCaseItem {
  id: string;
  caseNumber: string;
  orderRef: string;
  openedDate: string;
  status: 'Refunded' | 'In Review' | 'Resolved' | 'Escalated';
  resolutionSummary: string;
}

export interface TicketSubmission {
  orderId: string;
  issueCategory: string;
  details: string;
  filesCount: number;
}

@Component({
  selector: 'app-help-complaints',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './help-complaints.html',
  styleUrl: './help-complaints.scss',
})
export class HelpComplaints {
  // Outputs for host applications
  @Output() ticketSubmitted = new EventEmitter<TicketSubmission>();

  // Orders list for dropdown
  recentOrders = [
    { id: 'WM10248', label: '#WM10248 · today · ABC Water · KSh 1,120' },
    { id: 'WM10249', label: '#WM10249 · today · Blue Spring · KSh 260' },
    { id: 'WM10192', label: '#WM10192 · 8 Sep · ABC Water · KSh 580' },
  ];

  // Issue category chips
  issueTypes: string[] = [
    'Delivery is late',
    'Water never arrived',
    'Wrong item',
    'Missing item',
    'Damaged or leaking jug',
    'Seal was broken',
    'Water taste or smell',
    'Charged twice',
    'Rider behaviour',
  ];

  // Reactive state signals
  selectedOrder = 'WM10248';
  selectedIssue = signal<string>('Delivery is late');
  detailsText = '';
  attachedFilesCount = signal<number>(0);
  isSubmitted = signal<boolean>(false);
  lastSubmittedCaseId = signal<string>('4413');

  // Open cases history
  openCases = signal<SupportCaseItem[]>([
    {
      id: 'sc-1',
      caseNumber: '#SUP-4412',
      orderRef: '#WM10088',
      openedDate: '25 Aug',
      status: 'Refunded',
      resolutionSummary: 'Vendor could not deliver. KSh 340 returned to 0712 345 678 on 25 Aug, M Pesa code SH91LK220P.',
    },
  ]);

  // Methods
  selectIssue(issue: string) {
    this.selectedIssue.set(issue);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && input.files) {
      this.attachedFilesCount.set(input.files.length);
    }
  }

  submitTicket() {
    if (!this.selectedIssue()) {
      alert('Please choose what went wrong.');
      return;
    }

    const newCaseNum = Math.floor(4413 + Math.random() * 50).toString();
    this.lastSubmittedCaseId.set(newCaseNum);
    this.isSubmitted.set(true);

    const payload: TicketSubmission = {
      orderId: this.selectedOrder,
      issueCategory: this.selectedIssue(),
      details: this.detailsText,
      filesCount: this.attachedFilesCount(),
    };

    this.ticketSubmitted.emit(payload);

    // Append to open cases list
    const newCase: SupportCaseItem = {
      id: 'sc-' + newCaseNum,
      caseNumber: `#SUP-${newCaseNum}`,
      orderRef: `#${this.selectedOrder}`,
      openedDate: 'Today',
      status: 'In Review',
      resolutionSummary: `Reported issue "${this.selectedIssue()}". Investigation in progress with vendor.`,
    };

    this.openCases.update((prev) => [newCase, ...prev]);

    // Reset form fields
    setTimeout(() => {
      this.detailsText = '';
      this.attachedFilesCount.set(0);
      this.isSubmitted.set(false);
    }, 5000);
  }
}
