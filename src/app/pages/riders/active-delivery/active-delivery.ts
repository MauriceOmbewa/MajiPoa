import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { SidebarComponent } from '../sidebar/sidebar';
import { RiderApiService } from '../../../shared/services/rider-api';

export type DeliveryStatus =
  | 'OFFERED' | 'ACCEPTED' | 'AT_VENDOR' | 'PICKED_UP' | 'ARRIVED'
  | 'DELIVERED' | 'DECLINED' | 'EXPIRED' | 'CANCELLED';

/** Mirrors RiderDtos.ItemDto */
export interface ItemDto {
  id: number;
  quantity: number;
  name: string;
  note: string | null;
  checked: boolean;
}

/** Mirrors RiderDtos.TimelineStepDto */
export interface TimelineStepDto {
  key: string;
  label: string;
  at: string | null;
  detail: string | null;
  state: 'done' | 'current' | 'pending';
}

/** Mirrors RiderDtos.ActiveDeliveryDto */
export interface ActiveDeliveryDto {
  id: number;
  orderNumber: string;
  status: DeliveryStatus;
  statusLabel: string;
  vendorName: string;
  pickupAddress: string;
  pickupLat: number | null;
  pickupLng: number | null;
  customerName: string;
  customerPhone: string | null;
  dropoffAddress: string;
  dropoffUnit: string | null;
  dropoffArea: string | null;
  dropoffNotes: string | null;
  dropoffLat: number | null;
  dropoffLng: number | null;
  riderLat: number | null;
  riderLng: number | null;
  destinationLabel: string;
  destinationAddress: string;
  distanceRemainingKm: number;
  etaMinutes: number;
  fee: number;
  paid: boolean;
  items: ItemDto[];
  timeline: TimelineStepDto[];
  nextStatus: DeliveryStatus | null;
  nextActionLabel: string | null;
}

const NAIROBI: L.LatLngTuple = [-1.286389, 36.817223];

@Component({
  selector: 'app-active-delivery',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './active-delivery.html',
  styleUrl: './active-delivery.scss'
})
export class ActiveDelivery implements AfterViewInit, OnDestroy {
  private api = inject(RiderApiService);

  @ViewChild('mapEl', { static: true }) mapEl!: ElementRef<HTMLDivElement>;

  // The backend works out the rider from the login session (/api/riders/me/...),
  // so no id is needed. RiderApiService ignores this first argument.
  private readonly me = 0;

  // ---- state ----
  loading = signal(true);
  busy = signal(false);
  error = signal<string | null>(null);
  completed = signal(false);
  delivery = signal<ActiveDeliveryDto | null>(null);

  myPosition = signal<L.LatLng | null>(null);
  locationError = signal<string | null>(null);
  routeInfo = signal<{ km: number; min: number } | null>(null);

  // ---- derived ----
  orderId = computed(() => {
    const n = this.delivery()?.orderNumber;
    return n ? '#' + n : '';
  });

  /** True while the rider is still heading to / waiting at the vendor */
  atPickupStage = computed(() => {
    const s = this.delivery()?.status;
    return s === 'ACCEPTED' || s === 'AT_VENDOR';
  });

  destination = computed(() => {
    const d = this.delivery();
    if (!d) return null;
    const lat = this.atPickupStage() ? d.pickupLat : d.dropoffLat;
    const lng = this.atPickupStage() ? d.pickupLng : d.dropoffLng;
    if (lat == null || lng == null) return null;
    return { label: d.destinationLabel, lat, lng };
  });

  /** Road distance/ETA when we have it, otherwise the backend's estimate */
  tripInfo = computed(() => {
    const d = this.delivery();
    if (!d) return null;
    return this.routeInfo() ?? { km: d.distanceRemainingKm, min: d.etaMinutes };
  });

  allItemsChecked = computed(() => (this.delivery()?.items ?? []).every((i) => i.checked));

  /** Pickup can only be confirmed once every item is ticked (the backend enforces this too) */
  canAdvance = computed(() => {
    const d = this.delivery();
    if (!d || !d.nextStatus) return false;
    return d.nextStatus !== 'PICKED_UP' || this.allItemsChecked();
  });

  // ---- map internals ----
  private map?: L.Map;
  private meMarker?: L.Marker;
  private destMarker?: L.Marker;
  private routeLine?: L.Polyline;
  private watchId?: number;
  private fittedOnce = false;
  private lastSentAt = 0;
  private lastRouteAt = 0;

  ngAfterViewInit(): void {
    this.initMap();
    this.startLocationWatch();
    this.load();
  }

  ngOnDestroy(): void {
    if (this.watchId !== undefined) navigator.geolocation.clearWatch(this.watchId);
    this.map?.remove();
  }

  // ================= Backend =================

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.activeDelivery(this.me).subscribe({
      next: (res) => {
        // 204 = no active delivery
        this.delivery.set(res.status === 204 ? null : (res.body as ActiveDeliveryDto));
        this.loading.set(false);
        this.refreshMap(true);
      },
      error: (err) => {
        this.error.set(this.message(err, 'Could not load your active delivery. Please try again.'));
        this.loading.set(false);
      }
    });
  }

  advance(): void {
    const d = this.delivery();
    if (!d || !d.nextStatus || this.busy() || !this.canAdvance()) return;

    this.busy.set(true);
    this.error.set(null);
    this.api.advance(this.me, d.id, d.nextStatus).subscribe({
      next: (updated: ActiveDeliveryDto) => {
        this.busy.set(false);
        this.routeInfo.set(null); // the destination changes after most steps
        if (updated.status === 'DELIVERED') {
          this.delivery.set(null);
          this.completed.set(true);
          this.refreshMap(true);
        } else {
          this.delivery.set(updated);
          this.refreshMap(true);
        }
      },
      error: (err) => {
        this.busy.set(false);
        this.error.set(this.message(err, 'Could not update the delivery status. Please try again.'));
      }
    });
  }

  toggleItem(item: ItemDto, event: Event): void {
    const d = this.delivery();
    if (!d) return;
    const checked = (event.target as HTMLInputElement).checked;
    this.api.checkItem(this.me, d.id, item.id, checked).subscribe({
      next: (updated: ActiveDeliveryDto) => this.delivery.set(updated),
      error: (err) => {
        this.error.set(this.message(err, 'Could not update the item.'));
        this.load(); // resync the checkbox with the server
      }
    });
  }

  // ================= Actions =================

  openInMaps(): void {
    const dest = this.destination();
    if (!dest) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}&travelmode=driving`,
      '_blank'
    );
  }

  callCustomer(): void {
    const phone = this.delivery()?.customerPhone;
    if (phone) window.location.href = `tel:${phone.replace(/\s/g, '')}`;
  }

  messageCustomer(): void {
    const phone = this.delivery()?.customerPhone;
    if (phone) window.location.href = `sms:${phone.replace(/\s/g, '')}`;
  }

  formatTime(iso: string | null): string {
    return iso ? new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
  }

  // ================= Map =================

  private initMap(): void {
    this.map = L.map(this.mapEl.nativeElement, { zoomControl: true }).setView(NAIROBI, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    setTimeout(() => this.map?.invalidateSize(), 0);
  }

  private pinIcon(text: string, cls: string): L.DivIcon {
    return L.divIcon({
      className: '',
      html: `<span class="map-pin ${cls}">${this.escape(text)}</span>`,
      iconSize: [0, 0]
    });
  }

  /** Labels come from the database (vendor and customer names), so never inject them raw */
  private escape(s: string): string {
    return s.replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
  }

  private startLocationWatch(): void {
    if (!('geolocation' in navigator)) {
      this.locationError.set('Your device does not support location.');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        this.locationError.set(null);
        const here = L.latLng(pos.coords.latitude, pos.coords.longitude);
        this.myPosition.set(here);
        this.refreshMap(false);
        this.sendLocation(here);
      },
      (err) => {
        this.locationError.set(
          err.code === err.PERMISSION_DENIED
            ? 'Location access is blocked. Allow it in your browser settings so customers can track you.'
            : 'Could not get your location. Check that GPS is on.'
        );
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );
  }

  /** Push the rider's location to the backend at most every 10 seconds */
  private sendLocation(pos: L.LatLng): void {
    const now = Date.now();
    if (now - this.lastSentAt < 10_000) return;
    this.lastSentAt = now;
    this.api.updateLocation(this.me, pos.lat, pos.lng).subscribe({ error: () => {} });
  }

  private refreshMap(fit: boolean): void {
    if (!this.map) return;
    const d = this.delivery();
    const me =
      this.myPosition() ??
      (d && d.riderLat != null && d.riderLng != null ? L.latLng(d.riderLat, d.riderLng) : null);
    const dest = this.destination();
    const destLatLng = dest ? L.latLng(dest.lat, dest.lng) : null;

    if (me) {
      if (!this.meMarker) {
        this.meMarker = L.marker(me, { icon: this.pinIcon('You', 'you-pin'), zIndexOffset: 1000 }).addTo(this.map);
      } else {
        this.meMarker.setLatLng(me);
      }
    }

    if (dest && destLatLng) {
      if (!this.destMarker) {
        this.destMarker = L.marker(destLatLng, { icon: this.pinIcon(dest.label, 'place-pin') }).addTo(this.map);
      } else {
        this.destMarker.setLatLng(destLatLng);
        this.destMarker.setIcon(this.pinIcon(dest.label, 'place-pin'));
      }
    } else if (this.destMarker) {
      this.destMarker.remove();
      this.destMarker = undefined;
      this.routeLine?.remove();
      this.routeLine = undefined;
    }

    if (me && destLatLng) {
      this.updateRoute(me, destLatLng, fit);
    }

    if ((fit || !this.fittedOnce) && (me || destLatLng)) {
      const points = [me, destLatLng].filter(Boolean) as L.LatLng[];
      if (points.length === 1) this.map.setView(points[0], 15);
      else this.map.fitBounds(L.latLngBounds(points), { padding: [50, 50] });
      this.fittedOnce = true;
    }
  }

  /** Road route from OSRM (free, OpenStreetMap-based). Falls back to a straight line. */
  private async updateRoute(from: L.LatLng, to: L.LatLng, force: boolean): Promise<void> {
    const now = Date.now();
    if (!force && now - this.lastRouteAt < 30_000) return;
    this.lastRouteAt = now;

    try {
      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      const r = data.routes?.[0];
      if (!r) throw new Error('no route');

      this.routeInfo.set({ km: r.distance / 1000, min: Math.max(1, Math.round(r.duration / 60)) });
      const latlngs = r.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as L.LatLngTuple);
      this.drawRoute(latlngs);
    } catch {
      this.routeInfo.set(null); // fall back to the backend's estimate
      this.drawRoute([from, to]);
    }
  }

  private drawRoute(latlngs: L.LatLngExpression[]): void {
    if (!this.map) return;
    if (this.routeLine) {
      this.routeLine.setLatLngs(latlngs);
    } else {
      this.routeLine = L.polyline(latlngs, { color: '#2563eb', weight: 4, opacity: 0.8 }).addTo(this.map);
    }
  }

  // ================= Helpers =================

  private message(err: any, fallback: string): string {
    const m = err?.error?.message;
    return typeof m === 'string' && m ? m : fallback;
  }
}