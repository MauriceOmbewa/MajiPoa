// ==========================================================================
// MajiSafi - Standalone Angular Location Pinning / Tracking Map Component
// Selector: app-map
// Modes:
//   'page'     – full page with header, search, address form, provider switch
//   'picker'   – same layout but without the page-level chrome (for modals)
//   'compact'  – single-panel canvas + address form, no header
//   'tracking' – read-only delivery view with animated rider + vendor pins
// ==========================================================================

import {
  Component,
  signal,
  computed,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ── Public interfaces ───────────────────────────────────────────────────────

export interface PinnedLocation {
  latitude:      number;
  longitude:     number;
  estateName:    string;
  streetAddress: string;
  buildingName?: string;
  apartmentUnit?: string;
  landmark?:     string;
  deliveryNotes?: string;
  mapProvider:   'openstreetmap' | 'google-roads' | 'google-satellite';
}

export interface EstatePreset {
  id:            string;
  name:          string;
  subCounty:     string;
  lat:           number;
  lng:           number;
  popularStreet: string;
}

// ── Component ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map implements OnInit, OnDestroy, OnChanges {

  // ── Inputs ────────────────────────────────────────────────────────────────
  @Input() mode: 'page' | 'picker' | 'compact' | 'tracking' = 'page';
  @Input() initialLat           = -1.2921;
  @Input() initialLng           =  36.7856;
  @Input() initialEstate        = 'Kilimani, Nairobi';
  @Input() title                = 'Pin Your Delivery Location';
  @Input() subtitle             = 'Drop a pin on OpenStreetMap or Google Maps for exact doorstep water delivery.';
  @Input() allowProviderToggle  = true;

  // Tracking-mode inputs
  /** Percentage x position (0–100) of the animated rider pin */
  @Input() riderX = 58;
  /** Percentage y position (0–100) of the animated rider pin */
  @Input() riderY = 40;
  /** Label shown on the rider pin bubble */
  @Input() riderLabel = 'Rider';
  /** Label shown on the vendor / origin pin */
  @Input() vendorLabel = 'Vendor';
  /** Label shown on the destination pin */
  @Input() destinationLabel = 'Your address';
  /** Minutes-away text shown in the rider pill */
  @Input() minutesAway = 0;

  // ── Outputs ───────────────────────────────────────────────────────────────
  @Output() locationPinned = new EventEmitter<PinnedLocation>();
  @Output() cancel         = new EventEmitter<void>();

  // ── State signals ─────────────────────────────────────────────────────────
  mapProvider      = signal<'openstreetmap' | 'google-roads' | 'google-satellite'>('openstreetmap');
  currentLat       = signal(-1.2921);
  currentLng       = signal( 36.7856);
  zoomLevel        = signal(16);
  searchQuery      = signal('');
  isLocating       = signal(false);
  locationSaved    = signal(false);
  showPresetDropdown = signal(false);

  // Tracking-mode reactive pin position (updated by the parent's setInterval)
  _riderX = signal(58);
  _riderY = signal(40);

  // Address details form signals
  estateName    = signal('Kilimani');
  streetAddress = signal('Argwings Kodhek Road');
  buildingName  = signal('');
  apartmentUnit = signal('');
  landmark      = signal('');
  deliveryNotes = signal('');

  // ── Nairobi estate presets ────────────────────────────────────────────────
  readonly estatePresets: EstatePreset[] = [
    { id: 'kilimani',  name: 'Kilimani',           subCounty: 'Dagoretti North', lat: -1.2921, lng: 36.7856, popularStreet: 'Argwings Kodhek Rd' },
    { id: 'westlands', name: 'Westlands',           subCounty: 'Westlands',       lat: -1.2676, lng: 36.8118, popularStreet: 'Mpaka Road / Rhapta Rd' },
    { id: 'kileleshwa',name: 'Kileleshwa',          subCounty: 'Dagoretti North', lat: -1.2798, lng: 36.7825, popularStreet: 'Mandera Road' },
    { id: 'lavington', name: 'Lavington',           subCounty: 'Dagoretti North', lat: -1.2789, lng: 36.7699, popularStreet: 'James Gichuru Rd' },
    { id: 'karen',     name: 'Karen',               subCounty: 'Langata',         lat: -1.3197, lng: 36.7065, popularStreet: 'Karen Road / Ngong View' },
    { id: 'south-b',   name: 'South B (Hazina)',    subCounty: 'Starehe',         lat: -1.3114, lng: 36.8372, popularStreet: 'Kapiti Crescent' },
    { id: 'ngong-rd',  name: 'Ngong Road',          subCounty: 'Dagoretti South', lat: -1.3005, lng: 36.7644, popularStreet: 'Prestige Plaza Wing' },
    { id: 'parklands', name: 'Parklands',           subCounty: 'Westlands',       lat: -1.2619, lng: 36.8223, popularStreet: '3rd Parklands Avenue' },
    { id: 'roysambu',  name: 'Roysambu',            subCounty: 'Kasarani',        lat: -1.2185, lng: 36.8872, popularStreet: 'Near TRM Drive' },
    { id: 'cbd',       name: 'Nairobi Central CBD', subCounty: 'Starehe',         lat: -1.2864, lng: 36.8172, popularStreet: 'Kenyatta Avenue' },
  ];

  // ── Computed ──────────────────────────────────────────────────────────────
  filteredPresets = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.estatePresets;
    return this.estatePresets.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.subCounty.toLowerCase().includes(q) ||
      e.popularStreet.toLowerCase().includes(q)
    );
  });

  formattedCoordinates = computed(() =>
    `${this.currentLat().toFixed(5)}, ${this.currentLng().toFixed(5)}`
  );

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.currentLat.set(this.initialLat);
    this.currentLng.set(this.initialLng);
    if (this.initialEstate) this.estateName.set(this.initialEstate.split(',')[0].trim());
    // Sync tracking pin
    this._riderX.set(this.riderX);
    this._riderY.set(this.riderY);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Keep tracking pin reactive when the parent updates riderX/riderY
    if (changes['riderX']) this._riderX.set(this.riderX);
    if (changes['riderY']) this._riderY.set(this.riderY);
  }

  ngOnDestroy(): void { /* nothing to tear down */ }

  // ── Map provider ──────────────────────────────────────────────────────────
  setMapProvider(p: 'openstreetmap' | 'google-roads' | 'google-satellite'): void {
    this.mapProvider.set(p);
  }

  // ── Estate preset ─────────────────────────────────────────────────────────
  selectEstatePreset(preset: EstatePreset): void {
    this.currentLat.set(preset.lat);
    this.currentLng.set(preset.lng);
    this.estateName.set(preset.name);
    this.streetAddress.set(preset.popularStreet);
    this.searchQuery.set(preset.name);
    this.showPresetDropdown.set(false);
  }

  // ── Reverse geocode ───────────────────────────────────────────────────────
  async reverseGeocode(lat: number, lng: number): Promise<void> {
    let closest = this.estatePresets[0];
    let minDist = Infinity;
    for (const p of this.estatePresets) {
      const dLat = ((p.lat - lat) * Math.PI) / 180;
      const dLng = ((p.lng - lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat * Math.PI) / 180) * Math.cos((p.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
      const d = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      if (d < minDist) { minDist = d; closest = p; }
    }
    this.estateName.set(closest.name);
    this.streetAddress.set(closest.popularStreet);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        this.streetAddress.set(addr.road || addr.pedestrian || addr.highway || closest.popularStreet);
        this.estateName.set(addr.suburb || addr.neighbourhood || addr.residential || closest.name);
        const poi = addr.building || addr.amenity || addr.shop;
        if (poi) this.landmark.set(`Near ${poi}`);
      }
    } catch { /* keep local match */ }
  }

  // ── GPS ───────────────────────────────────────────────────────────────────
  locateMe(): void {
    if (!navigator.geolocation) { alert('Geolocation not supported.'); return; }
    this.isLocating.set(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        this.currentLat.set(lat);
        this.currentLng.set(lng);
        this.isLocating.set(false);
        this.reverseGeocode(lat, lng);
      },
      err => { console.warn('GPS error:', err.message); this.isLocating.set(false); },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  // ── Zoom ──────────────────────────────────────────────────────────────────
  zoomIn():  void { this.zoomLevel.update(z => Math.min(z + 1, 19)); }
  zoomOut(): void { this.zoomLevel.update(z => Math.max(z - 1, 12)); }

  // ── Nudge ─────────────────────────────────────────────────────────────────
  nudgePin(dLat: number, dLng: number): void {
    const lat = Number((this.currentLat() + dLat).toFixed(5));
    const lng = Number((this.currentLng() + dLng).toFixed(5));
    this.currentLat.set(lat);
    this.currentLng.set(lng);
    this.reverseGeocode(lat, lng);
  }

  // ── Confirm ───────────────────────────────────────────────────────────────
  confirmLocation(): void {
    const payload: PinnedLocation = {
      latitude:      this.currentLat(),
      longitude:     this.currentLng(),
      estateName:    this.estateName(),
      streetAddress: this.streetAddress(),
      buildingName:  this.buildingName(),
      apartmentUnit: this.apartmentUnit(),
      landmark:      this.landmark(),
      deliveryNotes: this.deliveryNotes(),
      mapProvider:   this.mapProvider(),
    };
    this.locationSaved.set(true);
    this.locationPinned.emit(payload);
  }

  onCancel(): void { this.cancel.emit(); }
}
