/**
 * MajiSafi — responsive instant water order form.
 * Standalone Angular component using signals and outputs.
 */
import { Component, signal, computed, input, output, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WaterProduct, LocationEstate } from '../../../../types';
import { ProductService, CatalogProduct } from '../services/product-service';

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
  backendProductId: string | null;
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

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-form.html',
  styleUrls: ['./order-form.scss'],
})
export class OrderForm {
  layout = input<'card' | 'compact' | 'full' | 'embed'>('card');
  title = input('Instant Water Order Form');
  subtitle = input('Choose your water format, vendor and delivery preferences.');
  showHeading = input(true);
  initialSizeId = input('20l-refill');
  currentLocation = input<LocationEstate | null>(null);

  addToCart = output<{ product: WaterProduct; quantity: number; options: any }>();
  directCheckout = output<{ product: WaterProduct; quantity: number; options: any }>();
  openPassport = output<WaterProduct>();
  locationChange = output<LocationEstate>();
  private readonly productService = inject(ProductService);

  readonly catalogProducts = signal<CatalogProduct[]>([]);
  readonly productsLoading = signal(true);
  readonly productLoadError = signal<string | null>(null);

  private loadCatalogProducts(): void {
    this.productsLoading.set(true);
    this.productLoadError.set(null);

    this.productService.getProducts().subscribe({
      next: (products: CatalogProduct[]) => {
        const activeProducts = products.filter(
          (product: CatalogProduct) =>
            product.active !== false &&
            product.stockQuantity > 0 &&
            product.status?.toUpperCase() === 'SELLING',
        );

        // Store the available backend products first.
        this.catalogProducts.set(activeProducts);

        // Update the signal directly. No separate updatedOptions variable needed.
        this.productOptions.update((options: ProductOption[]) =>
          options.map((option: ProductOption) => {
            const product = this.findCatalogProduct(option.sizeId);

            return {
              ...option,
              backendProductId: product?.productId ?? null,
              name: product?.name ?? option.name,
              priceKsh: product ? Number(product.price) : option.priceKsh,
            };
          }),
        );

        this.productsLoading.set(false);

        const unmatched = this.productOptions().filter(
          (option: ProductOption) => !option.backendProductId,
        );

        if (unmatched.length > 0) {
          console.warn(
            'Some order-form products were not matched to the backend catalog:',
            unmatched.map((option: ProductOption) => option.sizeId),
          );
        }
      },

      error: (error: unknown) => {
        console.error('Failed to load catalog products:', error);
        this.productLoadError.set('Unable to load products. Please try again.');
        this.productsLoading.set(false);
      },
    });
  }

  private findCatalogProduct(sizeId: string): CatalogProduct | undefined {
    const products = this.catalogProducts();

    const normalize = (value: string | null | undefined): string =>
      (value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

    switch (sizeId) {
      case '20l-refill':
        return products.find(
          (p) => normalize(p.size) === '20l' && normalize(p.name).includes('refill'),
        );

      case '20l-new':
        return products.find(
          (p) => normalize(p.size) === '20l' && normalize(p.name).includes('newjug'),
        );

      case '10l-bottle':
        return products.find(
          (p) => normalize(p.size) === '10l' && normalize(p.name) === '10lbottle',
        );

      case '5l-pack':
        return products.find(
          (p) => normalize(p.size) === '5l' && normalize(p.name).includes('5leasypourpack'),
        );

      case '500ml-case':
        return products.find(
          (p) => normalize(p.size) === '500ml' && normalize(p.name) === '500mlcase',
        );

      case 'bulk-tanker':
        return products.find(
          (p) =>
            normalize(p.size) === '10000l' && normalize(p.name).includes('10000lcleanwatertanker'),
        );

      default:
        return undefined;
    }
  }

  readonly containerSizes: ContainerSizeOption[] = [
    {
      id: '20l-refill',
      sizeLabel: '20L Refill',
      name: '20L Refill Jug (Exchange)',
      category: '20L refill jug',
      volumeDescription: '20 Litres',
      badge: 'Most Popular',
      iconType: 'jug',
      defaultProductId: 'p1',
      basePrice: 250,
      containerNote: '20L Refill Jug (Exchange): Bring your empty 20L jug for 1-to-1 swap',
      containerNoteLink: '20L New Jug',
    },
    {
      id: '20l-new',
      sizeLabel: '20L New Jug',
      name: '20L Brand New Hard Jug + Water',
      category: '20L new jug',
      volumeDescription: '20 Litres',
      badge: 'First Time',
      iconType: 'jug',
      defaultProductId: 'p5',
      basePrice: 1250,
      containerNote: '20L New Jug: Keep the heavy-duty polycarbonate bottle',
    },
    {
      id: '10l-bottle',
      sizeLabel: '10L Bottle',
      name: '10L Bottle with Built-in Tap',
      category: '10L bottle',
      volumeDescription: '10 Litres',
      badge: 'Easy Pour',
      iconType: 'bottle',
      defaultProductId: 'p3',
      basePrice: 180,
      containerNote: '10L Bottle: Lightweight with ergonomic carry handle',
    },
    {
      id: '5l-pack',
      sizeLabel: '5L Pack',
      name: '5L Easy-Pour Bottle (Pack of 4)',
      category: '5L bottle',
      volumeDescription: '20 Litres total',
      badge: 'Fridge Friendly',
      iconType: 'bottle',
      defaultProductId: 'p6',
      basePrice: 560,
      containerNote: '5L Pack: Fits directly in standard home refrigerator',
    },
    {
      id: '500ml-case',
      sizeLabel: '500ml Case',
      name: '500ml Pocket Water (Case of 24)',
      category: '500ml case',
      volumeDescription: '12 Litres total',
      badge: 'Office Stock',
      iconType: 'pack',
      defaultProductId: 'p4',
      basePrice: 620,
      containerNote: '500ml Case: Sealed individual grab-and-go bottles',
    },
    {
      id: 'bulk-tanker',
      sizeLabel: '10,000L Bulk',
      name: '10,000L Clean Water Tanker',
      category: 'Tank / bulk delivery',
      volumeDescription: '10,000 Litres',
      badge: 'Bulk Delivery',
      iconType: 'tanker',
      defaultProductId: 'p7',
      basePrice: 6500,
      containerNote: 'Bulk Tanker: Food-grade stainless steel bowser with 50m pump hose',
    },
  ];

  readonly productOptions = signal<ProductOption[]>([
    {
      id: 'p1',
      backendProductId: null,
      sizeId: '20l-refill',
      name: '20L refill — hard jug',
      verified: true,
      source: 'Natural Deep Aquifer, Tigoni Kiambu',
      treatment: '7-Stage Reverse Osmosis + UV Sterilization + Ozonation',
      labCert: 'Lab Certificate (pH 7.3)',
      vendorName: 'ABC Water (Kilimani)',
      priceKsh: 250,
      deliveryMins: 45,
      ph: 7.3,
      tds: 38,
      imageEmoji: '🫙',
      imageLabel: '20L',
    },
    {
      id: 'p5',
      backendProductId: null,
      sizeId: '20l-new',
      name: '20L brand new hard jug',
      verified: true,
      source: 'Natural Deep Aquifer, Tigoni Kiambu',
      treatment: '7-Stage Reverse Osmosis + UV Sterilization',
      labCert: 'Lab Certificate (pH 7.2)',
      vendorName: 'ABC Water (Kilimani)',
      priceKsh: 1250,
      deliveryMins: 45,
      ph: 7.2,
      tds: 35,
      imageEmoji: '🫙',
      imageLabel: '20L',
    },
    {
      id: 'p3',
      backendProductId: null,
      sizeId: '10l-bottle',
      name: '10L bottle with tap',
      verified: true,
      source: 'Municipal + 5-Stage Filtration, Nairobi',
      treatment: '5-Stage RO + UV',
      labCert: 'Lab Certificate (pH 7.1)',
      vendorName: 'Pure Drop (Kilimani)',
      priceKsh: 180,
      deliveryMins: 40,
      ph: 7.1,
      tds: 42,
      imageEmoji: '🍶',
      imageLabel: '10L',
    },
    {
      id: 'p6',
      backendProductId: null,
      sizeId: '5l-pack',
      name: '5L easy-pour pack × 4',
      verified: true,
      source: 'Spring Source, Limuru',
      treatment: 'Multi-Stage Filtration + Ozone',
      labCert: 'Lab Certificate (pH 7.0)',
      vendorName: 'Crystal Clear (Kilimani)',
      priceKsh: 560,
      deliveryMins: 50,
      ph: 7.0,
      tds: 30,
      imageEmoji: '🧴',
      imageLabel: '5L × 4',
    },
    {
      id: 'p4',
      backendProductId: null,
      sizeId: '500ml-case',
      name: '500ml case × 24',
      verified: true,
      source: 'Municipal + Carbon + RO, Nairobi',
      treatment: 'RO + UV + Ozonation',
      labCert: 'Lab Certificate (pH 6.9)',
      vendorName: 'Aqua Pure (Kilimani)',
      priceKsh: 620,
      deliveryMins: 35,
      ph: 6.9,
      tds: 28,
      imageEmoji: '🧊',
      imageLabel: '500ml',
    },
    {
      id: 'p7',
      backendProductId: null,
      sizeId: 'bulk-tanker',
      name: '10,000L clean water tanker',
      verified: true,
      source: 'Borehole, Kiambu County',
      treatment: 'Chlorination + Sedimentation + RO',
      labCert: 'Lab Certificate (pH 7.4)',
      vendorName: 'MajiTank Kenya (Kilimani)',
      priceKsh: 6500,
      deliveryMins: 120,
      ph: 7.4,
      tds: 50,
      imageEmoji: '🚛',
      imageLabel: '10,000L',
    },
  ]);

  readonly vendorOptions: VendorOption[][] = [
    [
      { id: 'v1', name: 'ABC Water (Kilimani)', priceKsh: 250, deliveryMins: 45 },
      { id: 'v2', name: 'Nairobi Pure (Kilimani)', priceKsh: 270, deliveryMins: 55 },
      { id: 'v3', name: 'Crystal Drop (Kilimani)', priceKsh: 240, deliveryMins: 60 },
    ],
    [
      { id: 'v1', name: 'ABC Water (Kilimani)', priceKsh: 1250, deliveryMins: 45 },
      { id: 'v4', name: 'AquaFresh (Kilimani)', priceKsh: 1300, deliveryMins: 50 },
    ],
    [
      { id: 'v5', name: 'Pure Drop (Kilimani)', priceKsh: 180, deliveryMins: 40 },
      { id: 'v1', name: 'ABC Water (Kilimani)', priceKsh: 200, deliveryMins: 45 },
    ],
    [
      { id: 'v6', name: 'Crystal Clear (Kilimani)', priceKsh: 560, deliveryMins: 50 },
      { id: 'v1', name: 'ABC Water (Kilimani)', priceKsh: 580, deliveryMins: 45 },
    ],
    [
      { id: 'v7', name: 'Aqua Pure (Kilimani)', priceKsh: 620, deliveryMins: 35 },
      { id: 'v1', name: 'ABC Water (Kilimani)', priceKsh: 650, deliveryMins: 45 },
    ],
    [
      { id: 'v8', name: 'MajiTank Kenya (Kilimani)', priceKsh: 6500, deliveryMins: 120 },
      { id: 'v9', name: 'Bulk Water Kenya (Kilimani)', priceKsh: 6800, deliveryMins: 150 },
    ],
  ];
  readonly accessories: AccessoryOption[] = [
    { id: 'none', label: 'No accessories needed', priceAdd: 0 },
    { id: 'manual', label: 'Manual Press Pump', priceAdd: 350 },
    { id: 'electric', label: 'USB Electric Rechargeable Tap', priceAdd: 850 },
  ];
  readonly deliveryEstates: DeliveryEstate[] = [
    { id: 'kilimani', name: 'Kilimani, Nairobi', deliveryMins: 45, vendorCount: 47 },
    { id: 'westlands', name: 'Westlands, Nairobi', deliveryMins: 35, vendorCount: 38 },
    { id: 'lavington', name: 'Lavington, Nairobi', deliveryMins: 50, vendorCount: 29 },
    { id: 'parklands', name: 'Parklands, Nairobi', deliveryMins: 40, vendorCount: 33 },
    { id: 'upperhill', name: 'Upper Hill, Nairobi', deliveryMins: 30, vendorCount: 25 },
    { id: 'karen', name: 'Karen, Nairobi', deliveryMins: 60, vendorCount: 18 },
    { id: 'muthaiga', name: 'Muthaiga, Nairobi', deliveryMins: 45, vendorCount: 21 },
    { id: 'runda', name: 'Runda, Nairobi', deliveryMins: 55, vendorCount: 15 },
  ];
  readonly quickQtyOptions = [1, 2, 4, 10];

  selectedSizeId = signal('20l-refill');
  selectedVendorId = signal('v1');
  quantity = signal(2);
  timing = signal<'asap' | 'today' | 'auto'>('asap');
  hasEmptyJug = signal(true);
  selectedAccessory = signal<'none' | 'manual' | 'electric'>('none');
  selectedEstateId = signal('kilimani');
  selectedBottleType = signal<'soft' | 'hard'>('hard');

  activeSizeIndex = computed(() =>
    this.containerSizes.findIndex((s) => s.id === this.selectedSizeId()),
  );
  activeSizeOption = computed(
    () => this.containerSizes[this.activeSizeIndex()] ?? this.containerSizes[0],
  );
  activeProduct = computed(
    () =>
      this.productOptions().find((p) => p.sizeId === this.selectedSizeId()) ??
      this.productOptions()[0],
  );
  activeVendors = computed(
    () => this.vendorOptions[this.activeSizeIndex()] ?? this.vendorOptions[0],
  );
  activeVendor = computed(
    () =>
      this.activeVendors().find((v) => v.id === this.selectedVendorId()) ?? this.activeVendors()[0],
  );
  activeEstate = computed(
    () =>
      this.deliveryEstates.find((e) => e.id === this.selectedEstateId()) ?? this.deliveryEstates[0],
  );
  activeAccessory = computed(
    () => this.accessories.find((a) => a.id === this.selectedAccessory()) ?? this.accessories[0],
  );
  unitPrice = computed(() => this.activeProduct().priceKsh);
  itemsSubtotal = computed(() => this.unitPrice() * this.quantity());
  accessoryPrice = computed(() => this.activeAccessory().priceAdd);
  deliveryFee = computed(() =>
    this.selectedSizeId() === 'bulk-tanker' || this.itemsSubtotal() > 2000 ? 0 : 80,
  );
  autoDiscount = computed(() =>
    this.timing() === 'auto' ? Math.round(this.itemsSubtotal() * 0.05) : 0,
  );
  grandTotal = computed(() =>
    Math.max(
      0,
      this.itemsSubtotal() + this.accessoryPrice() + this.deliveryFee() - this.autoDiscount(),
    ),
  );
  totalVolumeLitres = computed(() => {
    const qty = this.quantity(),
      id = this.selectedSizeId();
    if (id === '20l-refill' || id === '20l-new' || id === '5l-pack') return qty * 20;
    if (id === '10l-bottle') return qty * 10;
    if (id === '500ml-case') return qty * 12;
    if (id === 'bulk-tanker') return qty * 10000;
    return qty * 20;
  });
  lineItemLabel = computed(() => {
    const qty = this.quantity(),
      price = this.unitPrice(),
      id = this.selectedSizeId();
    const labels: Record<string, string> = {
      '20l-refill': '20L Refill',
      '20l-new': '20L New Jug',
      '10l-bottle': '10L Bottle',
      '5l-pack': '5L Pack ×4',
      '500ml-case': '500ml Case ×24',
      'bulk-tanker': '10,000L Tanker',
    };
    return `${qty}× ${labels[id] ?? 'item'} (KSh ${price.toLocaleString()})`;
  });
  showExchangeCheckbox = computed(() => this.selectedSizeId() === '20l-refill');
  showBottleTypeSelector = computed(() =>
    ['20l-refill', '20l-new', '10l-bottle'].includes(this.selectedSizeId()),
  );
  deliveryTimeLabel = computed(() => {
    const mins = this.activeEstate().deliveryMins;
    return `~${Math.max(5, mins - 10)}–${mins}m`;
  });
  timingLabel = computed(() =>
    this.timing() === 'asap'
      ? `ASAP\n${this.deliveryTimeLabel()}`
      : this.timing() === 'today'
        ? 'Today'
        : 'Auto Weekly −5%',
  );

  constructor() {
    this.loadCatalogProducts();
    effect(() => {
      const init = this.initialSizeId();
      if (init) {
        this.selectedSizeId.set(init);
        const idx = this.containerSizes.findIndex((s) => s.id === init);
        this.selectedVendorId.set((this.vendorOptions[idx] ?? this.vendorOptions[0])[0].id);
      }
    });
  }
  selectSize(sizeId: string): void {
    this.selectedSizeId.set(sizeId);
    const idx = this.containerSizes.findIndex((s) => s.id === sizeId);
    this.selectedVendorId.set((this.vendorOptions[idx] ?? this.vendorOptions[0])[0].id);
    if (sizeId === 'bulk-tanker' || sizeId === '500ml-case') this.quantity.set(1);
    if (sizeId === '20l-new') this.selectedBottleType.set('hard');
  }
  selectVendor(id: string): void {
    this.selectedVendorId.set(id);
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
    if (this.quantity() < 50) this.quantity.update((q) => q + 1);
  }
  decrementQuantity(): void {
    if (this.quantity() > 1) this.quantity.update((q) => q - 1);
  }
  selectBottleType(type: 'soft' | 'hard'): void {
    this.selectedBottleType.set(type);
  }

  onAddToCartSubmit(): void {
    const product = this.buildProduct();

    if (this.productsLoading()) {
      alert('Please wait while products load.');
      return;
    }

    if (!product.id) {
      alert('This product is not available in the database yet.');
      return;
    }

    this.addToCart.emit({
      product,
      quantity: this.quantity(),
      options: this.buildOptions(),
    });
  }
  onOrderNowSubmit(): void {
    this.directCheckout.emit({
      product: this.buildProduct(),
      quantity: this.quantity(),
      options: this.buildOptions(),
    });
  }
  private buildOptions() {
    return {
      accessory: this.selectedAccessory(),
      timing: this.timing(),
      estate: this.selectedEstateId(),
      hasEmptyJug: this.showExchangeCheckbox() ? this.hasEmptyJug() : null,
      bottleType: this.showBottleTypeSelector() ? this.selectedBottleType() : null,
      accessoryPriceKsh: this.accessoryPrice(),
      deliveryFeeKsh: this.deliveryFee(),
      discountKsh: this.autoDiscount(),
      totalKsh: this.grandTotal(),
      vendorId: this.activeVendor().id,
      vendorName: this.activeVendor().name,
    };
  }
  private buildProduct(): WaterProduct {
    const p = this.activeProduct();
    const v = this.activeVendor();

    const bottleLabel = this.showBottleTypeSelector()
      ? ` — ${this.selectedBottleType()} bottle`
      : '';

    return {
      id: p.backendProductId ?? '',
      name: p.name + bottleLabel,
      size: this.activeSizeOption().sizeLabel,
      category: this.activeSizeOption().category as any,
      vendor: v.name,
      estate: this.activeEstate().name,
      distanceKm: 2,
      deliveryTimeMins: v.deliveryMins,
      priceKsh: p.priceKsh,
      verified: p.verified,
      kebsCertified: true,
      source: p.source,
      treatment: p.treatment,
      ph: p.ph,
      tds: p.tds,
      batchCode: 'BATCH-2026-' + p.id.toUpperCase(),
    };
  }
}
