export type WaterNeedType =
  | 'all'
  | '20L refill jug'
  | '20L new jug'
  | '10L bottle'
  | '5L bottle'
  | '500ml case'
  | 'Tank / bulk delivery';

export interface WaterProduct {
  id: string;
  name: string;
  size: string;
  category: WaterNeedType;
  vendor: string;
  estate: string;
  distanceKm: number;
  deliveryTimeMins: number;
  priceKsh: number;
  verified: boolean;
  kebsCertified: boolean;
  tag?: string;
  tagType?: 'ok' | 'info' | 'warn';
  source: string;
  treatment: string;
  ph: number;
  tds: number;
  batchCode: string;
  rating?: number;
  reviewsCount?: number;
  imageUrl?: string;
  imageVarieties?: string[];
  inStock?: boolean;
}

export interface CartItem {
  product: WaterProduct;
  quantity: number;
}

export interface LocationEstate {
  id: string;
  name: string;
  subCounty: string;
  popularStreets: string[];
  vendorCount: number;
  averageDeliveryMins: number;
}

export type WorkspaceShell = 'customer' | 'vendor' | 'rider' | 'admin';

export interface WaterPassportData {
  batchNumber: string;
  testedDate: string;
  expiryDate: string;
  vendorName: string;
  sourceLocation: string;
  treatmentMethod: string;
  phLevel: number;
  tdsLevel: number;
  coliformCount: number;
  kebsLicenceNumber: string;
  status: 'passed' | 'review';
}
