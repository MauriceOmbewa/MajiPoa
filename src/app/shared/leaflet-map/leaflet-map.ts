/**
 * LeafletMapComponent
 * - Uses ResizeObserver to init Leaflet only after the container has real pixel dimensions
 * - Zoom + nudge controls float inside the map canvas (bottom-right), not below it
 */

import {
  Component, Input, Output, EventEmitter,
  OnInit, OnDestroy, AfterViewInit,
  ElementRef, ViewChild, signal, computed,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { NoSanitizePipe } from './no-sanitize.pipe';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface PinnedLocation {
  latitude:      number;
  longitude:     number;
  estateName:    string;
  streetAddress: string;
  buildingName?: string;
  apartmentUnit?: string;
  landmark?:     string;
  deliveryNotes?: string;
  mapProvider:   'openstreetmap' | 'google-roads' | 'satellite';
}

export interface EstatePreset {
  id:            string;
  name:          string;
  subCounty:     string;
  lat:           number;
  lng:           number;
  popularStreet: string;
}

export type MapProvider = 'openstreetmap' | 'google-roads' | 'satellite';

// ── Tile layer URLs ───────────────────────────────────────────────────────────

const TILES: Record<MapProvider, { url: string; attribution: string; subdomains: string | string[] }> = {
  'openstreetmap': {
    url:         'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    subdomains:  'abc',
  },
  'google-roads': {
    url:         'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '© <a href="https://maps.google.com">Google Maps</a>',
    subdomains:  ['0','1','2','3'],
  },
  'satellite': {
    url:         'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© <a href="https://www.esri.com">Esri</a>, Maxar, Earthstar Geographics',
    subdomains:  'abc',
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

@Component({
  selector:    'app-leaflet-map',
  standalone:  true,
  imports:     [CommonModule, FormsModule, NoSanitizePipe],
  templateUrl: './leaflet-map.html',
  styleUrl:    './leaflet-map.scss',
})
export class LeafletMapComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('mapContainer', { static: false }) mapEl!: ElementRef<HTMLDivElement>;

  // ── Inputs ────────────────────────────────────────────────────────────────
  @Input() mode: 'page' | 'preview' = 'page';
  @Input() initialLat      = -1.2921;
  @Input() initialLng      =  36.7856;
  @Input() initialEstate   = 'Kilimani';
  @Input() returnPath      = '';
  @Input() initialProvider: MapProvider = 'openstreetmap';

  // ── Outputs ───────────────────────────────────────────────────────────────
  @Output() locationPinned = new EventEmitter<PinnedLocation>();
  @Output() previewClicked = new EventEmitter<void>();
  @Output() cancelled      = new EventEmitter<void>();

  // ── Leaflet objects ───────────────────────────────────────────────────────
  private map!:       L.Map;
  private marker!:    L.Marker;
  private tileLayer!: L.TileLayer;
  private ro!:        ResizeObserver;
  private mapReady  = false;

  // ── Signals ───────────────────────────────────────────────────────────────
  provider    = signal<MapProvider>('openstreetmap');
  currentLat  = signal(-1.2921);
  currentLng  = signal( 36.7856);
  isLocating  = signal(false);
  isSaved     = signal(false);
  searchQuery = signal('');
  showDropdown = signal(false);

  estateName    = signal('Kilimani');
  streetAddress = signal('Argwings Kodhek Road');
  buildingName  = signal('');
  apartmentUnit = signal('');
  landmark      = signal('');
  deliveryNotes = signal('');

  formattedCoords = computed(() =>
    `${this.currentLat().toFixed(4)}, ${this.currentLng().toFixed(4)}`
  );

  filteredPresets = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return q
      ? this.estatePresets.filter(e =>
          e.name.toLowerCase().includes(q) ||
          e.subCounty.toLowerCase().includes(q) ||
          e.popularStreet.toLowerCase().includes(q))
      : this.estatePresets;
  });

  // ── Estate presets ────────────────────────────────────────────────────────
  readonly estatePresets: EstatePreset[] = [
    { id: 'kilimani',   name: 'Kilimani',            subCounty: 'Dagoretti North', lat: -1.2921, lng: 36.7856, popularStreet: 'Argwings Kodhek Rd' },
    { id: 'yaya',       name: 'Yaya Centre / Kilimani',subCounty:'Dagoretti North',lat: -1.2936, lng: 36.7891, popularStreet: 'Valley Rd / Argwings Kodhek' },
    { id: 'hurlingham', name: 'Hurlingham',           subCounty: 'Dagoretti North', lat: -1.2904, lng: 36.7820, popularStreet: 'Ralph Bunche Road' },
    { id: 'westlands',  name: 'Westlands',            subCounty: 'Westlands',       lat: -1.2676, lng: 36.8118, popularStreet: 'Mpaka Road / Rhapta Rd' },
    { id: 'wstl-sarit', name: 'Westlands (Sarit)',    subCounty: 'Westlands',       lat: -1.2640, lng: 36.8080, popularStreet: 'Sarit Centre, Westlands' },
    { id: 'kileleshwa', name: 'Kileleshwa',           subCounty: 'Dagoretti North', lat: -1.2798, lng: 36.7825, popularStreet: 'Mandera Road' },
    { id: 'lavington',  name: 'Lavington',            subCounty: 'Dagoretti North', lat: -1.2789, lng: 36.7699, popularStreet: 'James Gichuru Rd' },
    { id: 'karen',      name: 'Karen',                subCounty: 'Langata',         lat: -1.3197, lng: 36.7065, popularStreet: 'Karen Road / Ngong View' },
    { id: 'south-b',    name: 'South B (Hazina)',     subCounty: 'Starehe',         lat: -1.3114, lng: 36.8372, popularStreet: 'Kapiti Crescent' },
    { id: 'ngong-rd',   name: 'Ngong Road',           subCounty: 'Dagoretti South', lat: -1.3005, lng: 36.7644, popularStreet: 'Prestige Plaza Wing' },
    { id: 'parklands',  name: 'Parklands',            subCounty: 'Westlands',       lat: -1.2619, lng: 36.8223, popularStreet: '3rd Parklands Avenue' },
    { id: 'roysambu',   name: 'Roysambu',             subCounty: 'Kasarani',        lat: -1.2185, lng: 36.8872, popularStreet: 'Near TRM Drive' },
    { id: 'cbd',        name: 'Nairobi Central CBD',  subCounty: 'Starehe',         lat: -1.2864, lng: 36.8172, popularStreet: 'Kenyatta Avenue' },
    { id: 'langata',    name: 'Langata',              subCounty: 'Langata',         lat: -1.3350, lng: 36.7490, popularStreet: 'Langata Road' },
    { id: 'ruaka',      name: 'Ruaka',                subCounty: 'Kiambu',          lat: -1.2109, lng: 36.7625, popularStreet: 'Ruaka Road' },
  ];

  constructor(private zone: NgZone) {}

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.currentLat.set(this.initialLat);
    this.currentLng.set(this.initialLng);
    this.estateName.set(this.initialEstate.split(',')[0].trim());
    this.provider.set(this.initialProvider);
  }

  ngAfterViewInit(): void {
    if (this.mode !== 'page') return;

    const el = this.mapEl.nativeElement;

    // Use ResizeObserver: init Leaflet the first time the element has real size,
    // and call invalidateSize() on every subsequent resize (e.g. sidebar toggle).
    this.ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height ?? 0;
      const w = entries[0]?.contentRect.width  ?? 0;

      if (!this.mapReady && h > 50 && w > 50) {
        // First paint with real dimensions — init Leaflet inside NgZone
        this.mapReady = true;
        this.zone.runOutsideAngular(() => this._initMap(el));
      } else if (this.mapReady && this.map) {
        // Window / layout resize — re-sync tile grid
        this.map.invalidateSize({ pan: false });
      }
    });

    this.ro.observe(el);
  }

  ngOnDestroy(): void {
    this.ro?.disconnect();
    this.map?.remove();
  }

  // ── Map init ──────────────────────────────────────────────────────────────

  private _initMap(el: HTMLElement): void {
    const lat = this.currentLat();
    const lng = this.currentLng();

    this.map = L.map(el, {
      center:             [lat, lng],
      zoom:               15,
      zoomControl:        false,   // we add our own inside the canvas overlay
      attributionControl: true,
      preferCanvas:       false,
    });

    // Zoom control inside map – bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Initial tile layer
    this._applyTileLayer(this.provider());

    // Custom water-drop marker
    this.marker = L.marker([lat, lng], {
      draggable: true,
      icon: this._markerIcon(),
    }).addTo(this.map);

    this.marker.on('dragend', () => {
      const { lat: la, lng: lo } = this.marker.getLatLng();
      this.zone.run(() => this._updatePin(la, lo));
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.marker.setLatLng(e.latlng);
      this.zone.run(() => this._updatePin(e.latlng.lat, e.latlng.lng));
    });

    // Invalidate once more after a short delay in case page is still animating in
    setTimeout(() => this.map.invalidateSize({ pan: false }), 300);

    this._reverseGeocode(lat, lng);
  }

  // ── Tile layer helpers ────────────────────────────────────────────────────

  private _applyTileLayer(p: MapProvider): void {
    if (this.tileLayer) this.map.removeLayer(this.tileLayer);
    const cfg = TILES[p];
    this.tileLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom:     19,
      subdomains:  cfg.subdomains as string,
    }).addTo(this.map);
  }

  setProvider(p: MapProvider): void {
    this.provider.set(p);
    if (this.mapReady) this._applyTileLayer(p);
  }

  // ── Custom SVG marker ─────────────────────────────────────────────────────

  private _markerIcon(): L.DivIcon {
    return L.divIcon({
      html: `
        <div style="
          position:relative;
          width:38px;
          height:50px;
          filter:drop-shadow(0 4px 8px rgba(0,0,0,.35));
        ">
          <div style="
            width:38px;height:38px;border-radius:50%;
            background:#07243D;border:3px solid #2FC4C0;
            display:flex;align-items:center;justify-content:center;
            font-size:18px;color:#fff;
          ">💧</div>
          <div style="
            width:4px;height:12px;background:#07243D;
            margin:0 auto;border-radius:0 0 3px 3px;
          "></div>
          <div style="
            width:12px;height:5px;background:rgba(0,0,0,.2);
            border-radius:50%;margin:0 auto;
          "></div>
        </div>`,
      className: '',
      iconSize:    [38, 50],
      iconAnchor:  [19, 50],
      popupAnchor: [0, -50],
    });
  }

  // ── Estate preset / fly-to ────────────────────────────────────────────────

  selectPreset(preset: EstatePreset): void {
    this.searchQuery.set(preset.name);
    this.showDropdown.set(false);
    this.currentLat.set(preset.lat);
    this.currentLng.set(preset.lng);
    this.estateName.set(preset.name);
    this.streetAddress.set(preset.popularStreet);
    if (this.mapReady) {
      this.map.flyTo([preset.lat, preset.lng], 16, { duration: 0.7 });
      this.marker.setLatLng([preset.lat, preset.lng]);
    }
  }

  // ── Pin update + reverse geocode ──────────────────────────────────────────

  private _updatePin(lat: number, lng: number): void {
    this.currentLat.set(Number(lat.toFixed(5)));
    this.currentLng.set(Number(lng.toFixed(5)));
    this._reverseGeocode(lat, lng);
  }

  private async _reverseGeocode(lat: number, lng: number): Promise<void> {
    // Nearest estate fallback (haversine)
    let closest = this.estatePresets[0];
    let minD = Infinity;
    for (const p of this.estatePresets) {
      const dLat = ((p.lat - lat) * Math.PI) / 180;
      const dLng = ((p.lng - lng) * Math.PI) / 180;
      const a = Math.sin(dLat/2)**2 +
        Math.cos(lat*Math.PI/180)*Math.cos(p.lat*Math.PI/180)*Math.sin(dLng/2)**2;
      const d = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      if (d < minD) { minD = d; closest = p; }
    }
    this.zone.run(() => {
      this.estateName.set(closest.name);
      this.streetAddress.set(closest.popularStreet);
    });

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        const a = data.address || {};
        const road   = a.road || a.pedestrian || a.highway || closest.popularStreet;
        const suburb = a.suburb || a.neighbourhood || a.residential || closest.name;
        const poi    = a.building || a.amenity || a.shop;
        this.zone.run(() => {
          this.streetAddress.set(road);
          this.estateName.set(suburb);
          if (poi) this.landmark.set(`Near ${poi}`);
        });
      }
    } catch { /* keep local */ }
  }

  // ── GPS ───────────────────────────────────────────────────────────────────

  locateMe(): void {
    if (!navigator.geolocation) { alert('Geolocation not supported.'); return; }
    this.isLocating.set(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        this.zone.run(() => {
          this.isLocating.set(false);
          this.currentLat.set(lat);
          this.currentLng.set(lng);
        });
        if (this.mapReady) {
          this.map.flyTo([lat, lng], 16, { duration: 0.7 });
          this.marker.setLatLng([lat, lng]);
        }
        this._reverseGeocode(lat, lng);
      },
      err => {
        console.warn('GPS error:', err.message);
        this.zone.run(() => this.isLocating.set(false));
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  // ── Nudge ─────────────────────────────────────────────────────────────────

  nudge(dLat: number, dLng: number): void {
    const lat = Number((this.currentLat() + dLat).toFixed(5));
    const lng = Number((this.currentLng() + dLng).toFixed(5));
    this.currentLat.set(lat);
    this.currentLng.set(lng);
    if (this.mapReady) {
      this.map.panTo([lat, lng]);
      this.marker.setLatLng([lat, lng]);
    }
    this._reverseGeocode(lat, lng);
  }

  // ── Confirm / cancel ──────────────────────────────────────────────────────

  confirm(): void {
    this.isSaved.set(true);
    this.locationPinned.emit({
      latitude:      this.currentLat(),
      longitude:     this.currentLng(),
      estateName:    this.estateName(),
      streetAddress: this.streetAddress(),
      buildingName:  this.buildingName(),
      apartmentUnit: this.apartmentUnit(),
      landmark:      this.landmark(),
      deliveryNotes: this.deliveryNotes(),
      mapProvider:   this.provider(),
    });
  }

  cancel(): void { this.cancelled.emit(); }
  onPreviewClick(): void { this.previewClicked.emit(); }
}
