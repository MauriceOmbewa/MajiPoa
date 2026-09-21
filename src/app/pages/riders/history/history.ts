import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar';

export type HistoryRangeFilter = 'today' | 'week' | 'month' | 'all';

export interface CompletedTrip {
  id: string;
  dateLabel: string;
  timeLabel: string;
  orderId: string;
  fromLabel: string;
  toLabel: string;
  distanceKm: number;
  durationMin: number;
  earned: number;
  rating: number;
  range: Exclude<HistoryRangeFilter, 'all'>[];
}

@Component({
  selector: 'app-rider-history',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './history.html',
  styleUrl: './history.scss'
})
export class History {
  searchTerm = signal('');
  activeRange = signal<HistoryRangeFilter>('week');

  rangeOptions: { label: string; value: HistoryRangeFilter }[] = [
    { label: 'Today', value: 'today' },
    { label: 'This week', value: 'week' },
    { label: 'This month', value: 'month' },
    { label: 'All time', value: 'all' }
  ];

  // TODO: replace with data from your delivery-history service
  trips = signal<CompletedTrip[]>([
    {
      id: 't1', dateLabel: 'Today', timeLabel: '3:18 pm', orderId: '#WM10240',
      fromLabel: 'ABC Water', toLabel: 'Kileleshwa', distanceKm: 3.4, durationMin: 24,
      earned: 110, rating: 5, range: ['today', 'week', 'month']
    },
    {
      id: 't2', dateLabel: 'Today', timeLabel: '2:44 pm', orderId: '#WM10231',
      fromLabel: 'ABC Water', toLabel: 'Kilimani', distanceKm: 1.2, durationMin: 14,
      earned: 80, rating: 4, range: ['today', 'week', 'month']
    },
    {
      id: 't3', dateLabel: 'Today', timeLabel: '1:52 pm', orderId: '#WM10228',
      fromLabel: 'Aqua Fresh', toLabel: 'Hurlingham', distanceKm: 2.1, durationMin: 19,
      earned: 90, rating: 5, range: ['today', 'week', 'month']
    },
    {
      id: 't4', dateLabel: 'Today', timeLabel: '12:30 pm', orderId: '#WM10214',
      fromLabel: 'Blue Spring', toLabel: 'Yaya', distanceKm: 0.9, durationMin: 11,
      earned: 80, rating: 5, range: ['today', 'week', 'month']
    },
    {
      id: 't5', dateLabel: 'Yesterday', timeLabel: '5:02 pm', orderId: '#WM10190',
      fromLabel: 'CleanDrop Oasis', toLabel: 'Lavington', distanceKm: 2.8, durationMin: 26,
      earned: 120, rating: 4, range: ['week', 'month']
    },
    {
      id: 't6', dateLabel: 'Yesterday', timeLabel: '11:15 am', orderId: '#WM10176',
      fromLabel: 'ABC Water', toLabel: 'Kilimani', distanceKm: 1.5, durationMin: 16,
      earned: 85, rating: 5, range: ['week', 'month']
    },
    {
      id: 't7', dateLabel: '3 days ago', timeLabel: '9:40 am', orderId: '#WM10102',
      fromLabel: 'PureFlow Nairobi', toLabel: 'Lavington', distanceKm: 3.1, durationMin: 28,
      earned: 130, rating: 3, range: ['week', 'month']
    },
    {
      id: 't8', dateLabel: '2 weeks ago', timeLabel: '4:20 pm', orderId: '#WM09884',
      fromLabel: 'Nairobi Bulk Maji Bowsers', toLabel: 'Industrial Area', distanceKm: 4.5, durationMin: 42,
      earned: 300, rating: 5, range: ['month']
    }
  ]);

  filteredTrips = computed(() => {
    const range = this.activeRange();
    const term = this.searchTerm().trim().toLowerCase();

    return this.trips().filter((trip) => {
      const matchesRange = range === 'all' || trip.range.includes(range);
      const matchesSearch =
        term.length === 0 ||
        trip.orderId.toLowerCase().includes(term) ||
        trip.fromLabel.toLowerCase().includes(term) ||
        trip.toLabel.toLowerCase().includes(term);
      return matchesRange && matchesSearch;
    });
  });

  totalTrips = computed(() => this.filteredTrips().length);

  totalEarned = computed(() =>
    this.filteredTrips().reduce((sum, t) => sum + t.earned, 0)
  );

  averageRating = computed(() => {
    const trips = this.filteredTrips();
    if (trips.length === 0) return 0;
    const sum = trips.reduce((acc, t) => acc + t.rating, 0);
    return Math.round((sum / trips.length) * 10) / 10;
  });

  setRange(range: HistoryRangeFilter): void {
    this.activeRange.set(range);
  }

  ratingStars(rating: number): string[] {
    return Array.from({ length: 5 }, (_, i) => (i < rating ? '★' : '☆'));
  }

  openTrip(trip: CompletedTrip): void {
    // TODO: navigate to a trip detail view, or open a modal with full trip info
  }
}