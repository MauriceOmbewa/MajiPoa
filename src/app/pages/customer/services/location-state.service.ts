/**
 * LocationStateService
 *
 * Singleton that holds the user's current delivery location (lat, lng,
 * estate name, street address) and shares it across find-water, checkout,
 * and live-tracking. Persists to localStorage so the location survives
 * page refreshes and back-navigation.
 */
import { Injectable, signal, computed } from '@angular/core';

const STORAGE_KEY = 'majisafi_location';

export interface SavedLocation {
  lat:           number;
  lng:           number;
  estateName:    string;
  streetAddress: string;
  buildingName:  string;
  apartmentUnit: string;
  landmark:      string;
  deliveryNotes: string;
}

const DEFAULT_LOCATION: SavedLocation = {
  lat:           -1.2921,
  lng:            36.7856,
  estateName:    'Kilimani',
  streetAddress: 'Argwings Kodhek Road',
  buildingName:  '',
  apartmentUnit: '',
  landmark:      '',
  deliveryNotes: '',
};

@Injectable({ providedIn: 'root' })
export class LocationStateService {

  private readonly _location = signal<SavedLocation>(this._load());

  readonly location      = this._location.asReadonly();
  readonly estateName    = computed(() => this._location().estateName);
  readonly streetAddress = computed(() => this._location().streetAddress);
  readonly lat           = computed(() => this._location().lat);
  readonly lng           = computed(() => this._location().lng);

  /** Full display string: "Kilimani, Nairobi" */
  readonly displayName = computed(() => {
    const l = this._location();
    return l.estateName ? `${l.estateName}, Nairobi` : 'Nairobi';
  });

  set(loc: Partial<SavedLocation>): void {
    this._location.update(cur => {
      const next = { ...cur, ...loc };
      this._save(next);
      return next;
    });
  }

  reset(): void {
    this._location.set(DEFAULT_LOCATION);
    this._save(DEFAULT_LOCATION);
  }

  private _load(): SavedLocation {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_LOCATION;
      return { ...DEFAULT_LOCATION, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_LOCATION;
    }
  }

  private _save(loc: SavedLocation): void {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(loc)); } catch { /* quota */ }
  }
}
