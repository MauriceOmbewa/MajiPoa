/**
 * PinLocation — /pin-location  (public standalone route)
 *
 * Query params:
 *   returnTo = find-water | checkout | accountaddress
 *   lat, lng, estate  (optional seed)
 *
 * Layout: two-column — map on left, address-details form on right.
 * The LeafletMapComponent emits (locationPinned) which populates the form
 * and saves to LocationStateService.  Confirm navigates back.
 */
import { Component, OnInit, signal, ViewChild, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Navbar } from '../../../shared/layout/navbar/navbar';
import { Footer } from '../../../shared/layout/footer/footer';
import { LeafletMapComponent, PinnedLocation, MapProvider } from '../../../shared/leaflet-map/leaflet-map';
import { LocationStateService } from '../services/location-state.service';

@Component({
  selector:    'app-pin-location',
  standalone:  true,
  imports:     [CommonModule, FormsModule, RouterModule, Navbar, Footer, LeafletMapComponent],
  templateUrl: './pin-location.html',
  styleUrl:    './pin-location.scss',
})
export class PinLocation implements OnInit {

  @ViewChild(LeafletMapComponent) mapComp?: LeafletMapComponent;

  private readonly route         = inject(ActivatedRoute);
  private readonly router        = inject(Router);
  private readonly locationState = inject(LocationStateService);

  returnTo   = signal('find-water');
  seedLat    = signal(-1.2921);
  seedLng    = signal( 36.7856);
  seedEstate = signal('Kilimani');

  /** Current tile provider — controlled by the page-level toggle buttons */
  activeProvider = signal<MapProvider>('openstreetmap');

  readonly providerOptions: { id: MapProvider; icon: string; label: string }[] = [
    { id: 'openstreetmap', icon: '🗺️', label: 'OpenStreetMap' },
    { id: 'google-roads',  icon: '📍', label: 'Google Roads'  },
    { id: 'satellite',     icon: '🛰️', label: 'Satellite'     },
  ];

  setProvider(p: MapProvider): void {
    this.activeProvider.set(p);
    // Also call through to the map component so it actually swaps the tile layer
    this.mapComp?.setProvider(p);
  }

  // Address form fields — populated when the map emits locationPinned
  estateName    = signal('Kilimani');
  streetAddress = signal('Argwings Kodhek Road');
  buildingName  = signal('');
  apartmentUnit = signal('');
  landmark      = signal('');
  deliveryNotes = signal('');
  isSaved       = signal(false);

  ngOnInit(): void {
    const p = this.route.snapshot.queryParamMap;
    this.returnTo.set(p.get('returnTo') ?? 'find-water');

    const lat    = parseFloat(p.get('lat')    ?? '');
    const lng    = parseFloat(p.get('lng')    ?? '');
    const estate = p.get('estate') ?? '';

    if (!isNaN(lat) && !isNaN(lng)) {
      this.seedLat.set(lat);
      this.seedLng.set(lng);
      this.seedEstate.set(estate || this.locationState.estateName());
    } else {
      this.seedLat.set(this.locationState.lat());
      this.seedLng.set(this.locationState.lng());
      this.seedEstate.set(this.locationState.estateName());
    }

    // Pre-fill form from last known location
    const loc = this.locationState.location();
    this.estateName.set(loc.estateName);
    this.streetAddress.set(loc.streetAddress);
    this.buildingName.set(loc.buildingName);
    this.apartmentUnit.set(loc.apartmentUnit);
    this.landmark.set(loc.landmark);
    this.deliveryNotes.set(loc.deliveryNotes);
  }

  /** Map emits locationPinned → auto-fill address form fields */
  onMapPinned(loc: PinnedLocation): void {
    this.estateName.set(loc.estateName);
    this.streetAddress.set(loc.streetAddress);
    // Don't overwrite building/unit/notes — user may have typed them already
  }

  confirm(): void {
    this.locationState.set({
      lat:           this.seedLat(),   // last emitted lat from map
      lng:           this.seedLng(),
      estateName:    this.estateName(),
      streetAddress: this.streetAddress(),
      buildingName:  this.buildingName(),
      apartmentUnit: this.apartmentUnit(),
      landmark:      this.landmark(),
      deliveryNotes: this.deliveryNotes(),
    });
    this.isSaved.set(true);
    this.router.navigate(['/' + this.returnTo()]);
  }

  goBack(): void {
    this.router.navigate(['/' + this.returnTo()]);
  }

  /** Keep seedLat/Lng in sync when the map emits so confirm() uses the right coords */
  onMapAutoPin(loc: PinnedLocation): void {
    this.seedLat.set(loc.latitude);
    this.seedLng.set(loc.longitude);
    this.onMapPinned(loc);
  }
}
