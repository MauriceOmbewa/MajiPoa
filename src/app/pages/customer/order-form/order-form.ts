/**
 * ============================================================================
 * MajiSafi – Order Form Component (Angular 17+ Standalone)
 * Fully matches the target design:
 *  - Dark header with INSTANT ORDER FORM badge + KEBS S-Mark pill
 *  - Step 1: Size button grid (6 sizes)
 *  - Step 2: Product detail card (image, verified badge, vendor dropdown, lab cert, pH/TDS/delivery)
 *  - Exchange checkbox (20L refill only)
 *  - Optional dispenser accessory row
 *  - Bottom controls: Quantity stepper + quick chips | Delivery Estate dropdown | When do you need it
 *  - Price footer: breakdown line items + Add to Cart + Order Now with M-Pesa
 * ============================================================================
 */

import { Component, signal, computed, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WaterProduct, LocationEstate } from '../../../../types';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface ContainerSizeOption {
  id: string;
  sizeLabel: string;
  name: string;
  category: string;
  volumeDescription: string;
  badge?: string;
  iconType: 'jug' | 'bottle' | 'pack' | 'tanker';
  defaultProductId: string;
  basePrice: number;
  containerNote: string;
  containerNoteLink?: string;
}

export interface ProductOption {
  id: string;
  sizeId: string;
  name: string;
  verified: boolean;
  source: string;
  treatment: string;
  labCert: string;
  vendorName: string;
  priceKsh: number;
  deliveryMins: number;
  ph: number;
  tds: number;
  imageEmoji: string;
  imageLabel: string;
}

export interface VendorOption {
  id: string;
  name: string;
  priceKsh: number;
  deliveryMins: number;
}

export interface AccessoryOption {
  id: 'none' | 'manual' | 'electric';
  label: string;
  priceAdd: number;
}

export interface DeliveryEstate {
  id: string;
  name: string;
  deliveryMins: number;
  vendorCount: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-form.html',
  styleUrls: ['./order-form.scss']
})
export class OrderForm {

  // ── Inputs ──────────────────────────────────────────────────────────────
  layout        = input<'card' | 'compact' | 'full' | 'embed'>('card');
  title         = input<string>('Instant Water Order Form');
  subtitle      = input<string>('Size buttons on top decide container & bottle format. Dispatched immediately by certified Nairobi stations in Kilimani.');
  showHeading   = input<boolean>(true);
  initialSizeId = input<string>('20l-refill');
  currentLocation = input<LocationEstate | null>(null);

  // ── Outputs ─────────────────────────────────────────────────────────────
  addToCart      = output<{ product: WaterProduct; quantity: number; options: any }>();
  directCheckout = output<{ product: WaterProduct; quantity: number; options: any }>();
  openPassport   = output<WaterProduct>();
  locationChange = output<LocationEstate>();

  // ── Static Data ─────────────────────────────────────────────────────────

  readonly containerSizes: ContainerSizeOption[] = [
    {
      id: '20l-refill',
      sizeLabel: '20L Refill',
      name: '20L Refill Jug (Exchange)',
      category: '20L refill jug',
      volumeDescription: '20 Litres',
      badge: 'Most Po...',
      iconType: 'jug',
      defaultProductId: 'p1',
      basePrice: 250,
      containerNote: '20L Refill Jug (Exchange): Bring your empty 20L jug for 1-to-1 swap',
      containerNoteLink: '20L New Jug'
    },
    {
      id: '20l-new',
      sizeLabel: '20L New Jug',
      name: '20L Brand New Hard Jug + Water',
      category: '20L new jug',
      volumeDescription: '20 Litres',
      badge: 'First Tim...',
      iconType: 'jug',
      defaultProductId: 'p5',
      basePrice: 1250,
      containerNote: '20L New Jug: Keep the heavy-duty polycarbonate bottle'
    },
    {
      id: '10l-bottle',
      sizeLabel: '10L Bottle',
      name: '10L Bottle with Built-in Tap',
      category: '10L bottle',
      volumeDescription: '10 Litres',
      badge: 'Easy P...',
      iconType: 'bottle',
      defaultProductId: 'p3',
      basePrice: 180,
      containerNote: '10L Bottle: Lightweight with ergonomic carry handle'
    },
    {
      id: '5l-pack',
      sizeLabel: '5L Pack',
      name: '5L Easy-Pour Bottle (Pack of 4)',
      category: '5L bottle',
      volumeDescription: '20 Litres total',
      badge: 'Fridge Fr...',
      iconType: 'bottle',
      defaultProductId: 'p6',
      basePrice: 560,
      containerNote: '5L Pack: Fits directly in standard home refrigerator'
    },
    {
      id: '500ml-case',
      sizeLabel: '500ml Case',
      name: '500ml Pocket Water (Case of 24)',
      category: '500ml case',
      volumeDescription: '12 Litres total',
      badge: 'Office S...',
      iconType: 'pack',
      defaultProductId: 'p4',
      basePrice: 620,
      containerNote: '500ml Case: Sealed individual grab-and-go bottles'
    },
    {
      id: 'bulk-tanker',
      sizeLabel: '10,000L Bulk',
      name: '10,000L Clean Water Tanker',
      category: 'Tank / bulk delivery',
      volumeDescription: '10,000 Litres',
      badge: 'Estate / C...',
      iconType: 'tanker',
      defaultProductId: 'p7',
      basePrice: 6500,
      containerNote: 'Bulk Tanker: Food-grade stainless steel bowser with 50m pump hose'
    }
  ];

  readonly productOptions: ProductOption[] = [
    {
      id: 'p1', sizeId: '20l-refill',
      name: '20L refill — hard jug',
      verified: true,
      source: 'Natural Deep Aquifer, Tigoni Kiambu',
      treatment: '7-Stage Reverse Osmosis + UV Sterilization + Ozonation',
      labCert: 'Lab Certificate (pH 7.3)',
      vendorName: 'ABC Water (Kilimani)',
      priceKsh: 250, deliveryMins: 45, ph: 7.3, tds: 38,
      imageEmoji: '🫙', imageLabel: '20L'
    },
    {
      id: 'p5', sizeId: '20l-new',
      name: '20L brand new hard jug',
      verified: true,
      source: 'Natural Deep Aquifer, Tigoni Kiambu',
      treatment: '7-Stage Reverse Osmosis + UV Sterilization',
      labCert: 'Lab Certificate (pH 7.2)',
      vendorName: 'ABC Water (Kilimani)',
      priceKsh: 1250, deliveryMins: 45, ph: 7.2, tds: 35,
      imageEmoji: '🫙', imageLabel: '20L'
    },
    {
      id: 'p3', sizeId: '10l-bottle',
      name: '10L bottle with tap',
      verified: true,
      source: 'Municipal + 5-Stage Filtration, Nairobi',
      treatment: '5-Stage RO + UV',
      labCert: 'Lab Certificate (pH 7.1)',
      vendorName: 'Pure Drop (Kilimani)',
      priceKsh: 180, deliveryMins: 40, ph: 7.1, tds: 42,
      imageEmoji: '🍶', imageLabel: '10L'
    },
    {
      id: 'p6', sizeId: '5l-pack',
      name: '5L easy-pour pack × 4',
      verified: true,
      source: 'Spring Source, Limuru',
      treatment: 'Multi-Stage Filtration + Ozone',
      labCert: 'Lab Certificate (pH 7.0)',
      vendorName: 'Crystal Clear (Kilimani)',
      priceKsh: 560, deliveryMins: 50, ph: 7.0, tds: 30,
      imageEmoji: '🧴', imageLabel: '5L×4'
    },
    {
      id: 'p4', sizeId: '500ml-case',
      name: '500ml case × 24',
      verified: true,
      source: 'Municipal + Carbon + RO, Nairobi',
      treatment: 'RO + UV + Ozonation',
      labCert: 'Lab Certificate (pH 6.9)',
      vendorName: 'Aqua Pure (Kilimani)',
      priceKsh: 620, deliveryMins: 35, ph: 6.9, tds: 28,
      imageEmoji: '🧊', imageLabel: '500ml'
    },
    {
      id: 'p7', sizeId: 'bulk-tanker',
      name: '10,000L clean water tanker',
      verified: true,
      source: 'Borehole, Kiambu County',
      treatment: 'Chlorination + Sedimentation + RO',
      labCert: 'Lab Certificate (pH 7.4)',
      vendorName: 'MajiTank Kenya (Kilimani)',
      priceKsh: 6500, deliveryMins: 120, ph: 7.4, tds: 50,
      imageEmoji: '🚛', imageLabel: '10kL'
    }
  ];

  readonly vendorOptions: VendorOption[][] = [
    // 20l-refill vendors
    [
      { id: 'v1', name: 'ABC Water (Kilimani)', priceKsh: 250, deliveryMins: 45 },
      { id: 'v2', name: 'Nairobi Pure (Kilimani)', priceKsh: 270, deliveryMins: 55 },
      { id: 'v3', name: 'Crystal Drop (Kilimani)', priceKsh: 240, deliveryMins: 60 }
    ],
    // 20l-new vendors
    [
      { id: 'v1', name: 'ABC Water (Kilimani)', priceKsh: 1250, deliveryMins: 45 },
      { id: 'v4', name: 'AquaFresh (Kilimani)', priceKsh: 1300, deliveryMins: 50 }
    ],
    // 10l-bottle vendors
    [
      { id: 'v5', name: 'Pure Drop (Kilimani)', priceKsh: 180, deliveryMins: 40 },
      { id: 'v1', name: 'ABC Water (Kilimani)', priceKsh: 200, deliveryMins: 45 }
    ],
    // 5l-pack vendors
    [
      { id: 'v6', name: 'Crystal Clear (Kilimani)', priceKsh: 560, deliveryMins: 50 },
      { id: 'v1', name: 'ABC Water (Kilimani)', priceKsh: 580, deliveryMins: 45 }
    ],
    // 500ml-case vendors
    [
      { id: 'v7', name: 'Aqua Pure (Kilimani)', priceKsh: 620, deliveryMins: 35 },
      { id: 'v1', name: 'ABC Water (Kilimani)', priceKsh: 650, deliveryMins: 45 }
    ],
    // bulk-tanker vendors
    [
      { id: 'v8', name: 'MajiTank Kenya (Kilimani)', priceKsh: 6500, deliveryMins: 120 },
      { id: 'v9', name: 'Bulk Water Kenya (Kilimani)', priceKsh: 6800, deliveryMins: 150 }
    ]
  ];

  readonly accessories: AccessoryOption[] = [
    { id: 'none',     label: 'No accessories needed', priceAdd: 0 },
    { id: 'manual',   label: 'Manual Press Pump',     priceAdd: 350 },
    { id: 'electric', label: 'USB Electric Rechargeable Tap', priceAdd: 850 }
  ];

  readonly deliveryEstates: DeliveryEstate[] = [
    { id: 'kilimani',   name: 'Kilimani, Nairobi',    deliveryMins: 45, vendorCount: 47 },
    { id: 'westlands',  name: 'Westlands, Nairobi',   deliveryMins: 35, vendorCount: 38 },
    { id: 'lavington',  name: 'Lavington, Nairobi',   deliveryMins: 50, vendorCount: 29 },
    { id: 'parklands',  name: 'Parklands, Nairobi',   deliveryMins: 40, vendorCount: 33 },
    { id: 'upperhill',  name: 'Upper Hill, Nairobi',  deliveryMins: 30, vendorCount: 25 },
    { id: 'karen',      name: 'Karen, Nairobi',       deliveryMins: 60, vendorCount: 18 },
    { id: 'muthaiga',   name: 'Muthaiga, Nairobi',    deliveryMins: 45, vendorCount: 21 },
    { id: 'runda',      name: 'Runda, Nairobi',       deliveryMins: 55, vendorCount: 15 }
  ];

  readonly quickQtyOptions = [1, 2, 4, 10];

  // ── Reactive State ───────────────────────────────────────────────────────
  selectedSizeId   = signal<string>('20l-refill');
  selectedVendorId = signal<string>('v1');
  quantity         = signal<number>(2);
  timing           = signal<'asap' | 'today' | 'auto'>('asap');
  hasEmptyJug      = signal<boolean>(true);
  selectedAccessory = signal<'none' | 'manual' | 'electric'>('none');
  selectedEstateId  = signal<string>('kilimani');

  // ── Computed ─────────────────────────────────────────────────────────────

  activeSizeIndex = computed(() =>
    this.containerSizes.findIndex(s => s.id === this.selectedSizeId())
  );

  activeSizeOption = computed(() =>
    this.containerSizes[this.activeSizeIndex()] ?? this.containerSizes[0]
  );

  activeProduct = computed(() => {
    const sizeId = this.selectedSizeId();
    return this.productOptions.find(p => p.sizeId === sizeId) ?? this.productOptions[0];
  });

  activeVendors = computed(() =>
    this.vendorOptions[this.activeSizeIndex()] ?? this.vendorOptions[0]
  );

  activeVendor = computed(() =>
    this.activeVendors().find(v => v.id === this.selectedVendorId()) ?? this.activeVendors()[0]
  );

  activeEstate = computed(() =>
    this.deliveryEstates.find(e => e.id === this.selectedEstateId()) ?? this.deliveryEstates[0]
  );

  activeAccessory = computed(() =>
    this.accessories.find(a => a.id === this.selectedAccessory()) ?? this.accessories[0]
  );

  unitPrice = computed(() => this.activeVendor().priceKsh);

  itemsSubtotal = computed(() => this.unitPrice() * this.quantity());

  accessoryPrice = computed(() => this.activeAccessory().priceAdd);

  deliveryFee = computed(() => {
    if (this.selectedSizeId() === 'bulk-tanker') return 0;
    if (this.itemsSubtotal() > 2000) return 0;
    return 80;
  });

  autoDiscount = computed(() =>
    this.timing() === 'auto' ? Math.round(this.itemsSubtotal() * 0.05) : 0
  );

  grandTotal = computed(() =>
    Math.max(0,
      this.itemsSubtotal() + this.accessoryPrice() + this.deliveryFee() - this.autoDiscount()
    )
  );

  totalVolumeLitres = computed(() => {
    const sizeId = this.selectedSizeId();
    const qty = this.quantity();
    if (sizeId === '20l-refill' || sizeId === '20l-new') return qty * 20;
    if (sizeId === '10l-bottle') return qty * 10;
    if (sizeId === '5l-pack') return qty * 20; // 4×5L per pack
    if (sizeId === '500ml-case') return qty * 12; // 24×500ml per case
    if (sizeId === 'bulk-tanker') return qty * 10000;
    return qty * 20;
  });

  lineItemLabel = computed(() => {
    const qty = this.quantity();
    const price = this.unitPrice();
    const sizeId = this.selectedSizeId();
    if (sizeId === '20l-refill') return `${qty}× 20L Refill (KSh ${price})`;
    if (sizeId === '20l-new')    return `${qty}× 20L New Jug (KSh ${price})`;
    if (sizeId === '10l-bottle') return `${qty}× 10L Bottle (KSh ${price})`;
    if (sizeId === '5l-pack')    return `${qty}× 5L Pack ×4 (KSh ${price})`;
    if (sizeId === '500ml-case') return `${qty}× 500ml Case ×24 (KSh ${price})`;
    if (sizeId === 'bulk-tanker') return `${qty}× 10,000L Tanker (KSh ${price})`;
    return `${qty}× item (KSh ${price})`;
  });

  showExchangeCheckbox = computed(() => this.selectedSizeId() === '20l-refill');

  deliveryTimeLabel = computed(() => {
    const mins = this.activeEstate().deliveryMins;
    return `~${mins - 10}–${mins}m`;
  });

  timingLabel = computed(() => {
    const t = this.timing();
    if (t === 'asap')  return `ASAP\n~${this.deliveryTimeLabel()}`;
    if (t === 'today') return 'Today';
    return 'Auto\nWeekly −5%';
  });

  // ── Lifecycle ────────────────────────────────────────────────────────────

  constructor() {
    effect(() => {
      const init = this.initialSizeId();
      if (init) {
        this.selectedSizeId.set(init);
        // reset vendor to first in new size
        const idx = this.containerSizes.findIndex(s => s.id === init);
        const vendors = this.vendorOptions[idx] ?? this.vendorOptions[0];
        this.selectedVendorId.set(vendors[0].id);
      }
    });
  }

  // ── Methods ──────────────────────────────────────────────────────────────

  selectSize(sizeId: string): void {
    this.selectedSizeId.set(sizeId);
    const idx = this.containerSizes.findIndex(s => s.id === sizeId);
    const vendors = this.vendorOptions[idx] ?? this.vendorOptions[0];
    this.selectedVendorId.set(vendors[0].id);
    if (sizeId === 'bulk-tanker' || sizeId === '500ml-case') {
      this.quantity.set(1);
    }
  }

  selectVendor(vendorId: string): void {
    this.selectedVendorId.set(vendorId);
  }

  setAccessory(id: 'none' | 'manual' | 'electric'): void {
    this.selectedAccessory.set(id);
  }

  setTiming(t: 'asap' | 'today' | 'auto'): void {
    this.timing.set(t);
  }

  setQuickQty(q: number): void {
    this.quantity.set(q);
  }

  incrementQuantity(): void {
    if (this.quantity() < 50) this.quantity.update(q => q + 1);
  }

  decrementQuantity(): void {
    if (this.quantity() > 1) this.quantity.update(q => q - 1);
  }

  onAddToCartSubmit(): void {
    this.addToCart.emit({
      product: this._buildProduct(),
      quantity: this.quantity(),
      options: { accessory: this.selectedAccessory(), timing: this.timing(), estate: this.selectedEstateId() }
    });
  }

  onOrderNowSubmit(): void {
    this.directCheckout.emit({
      product: this._buildProduct(),
      quantity: this.quantity(),
      options: { accessory: this.selectedAccessory(), timing: this.timing(), estate: this.selectedEstateId() }
    });
  }

  private _buildProduct(): WaterProduct {
    const p = this.activeProduct();
    const v = this.activeVendor();
    return {
      id: p.id,
      name: p.name,
      size: this.activeSizeOption().sizeLabel,
      category: this.activeSizeOption().category as any,
      vendor: v.name,
      estate: this.activeEstate().name,
      distanceKm: 2,
      deliveryTimeMins: v.deliveryMins,
      priceKsh: v.priceKsh,
      verified: p.verified,
      kebsCertified: true,
      source: p.source,
      treatment: p.treatment,
      ph: p.ph,
      tds: p.tds,
      batchCode: 'BATCH-2026-' + p.id.toUpperCase()
    };
  }
}
