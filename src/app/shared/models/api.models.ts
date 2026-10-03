// ── Auth ──────────────────────────────────────────────────────────────────────

export type Role = 'CUSTOMER' | 'VENDOR' | 'RIDER' | 'ADMIN';

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  pictureUrl: string;
  role: Role;
}

// ── Vendor Dashboard ──────────────────────────────────────────────────────────

export interface IncomingOrderDto {
  id: number;
  orderRef: string;
  items: string;
  area: string;
  distanceKm: number;
  total: number;
  minutesAgo: number;
}

export interface ActiveOrderDto {
  id: number;
  orderRef: string;
  items: string;
  area: string;
  stage: string;
}

export interface VendorDashboardResponse {
  salesToday: number;
  ordersToday: number;
  completedToday: number;
  jugsInStock: number;
  jugsCapacity: number;
  incoming: IncomingOrderDto[];
  active: ActiveOrderDto[];
}

// ── Vendor Orders ─────────────────────────────────────────────────────────────

export type OrderStatus = 'NEW' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PAID' | 'INVOICED' | 'REFUNDED';
export type RiderKind = 'PLATFORM' | 'MY_STAFF';
export type DeliveryStage = 'EN_ROUTE' | 'NEAR_CUSTOMER' | 'CUSTOMER_NOT_REACHABLE';

export interface OrderLineDto {
  productName: string;
  note: string | null;
  qty: number;
  unitPrice: number;
}

export interface VendorOrderDto {
  id: number;
  orderRef: string;
  customerName: string;
  area: string;
  distanceKm: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  placedAgo: string;
  riderName: string | null;
  riderKind: RiderKind | null;
  deliveryStage: DeliveryStage | null;
  placedAt: string; // ISO instant string
  lines: OrderLineDto[];
}

// ── Products ──────────────────────────────────────────────────────────────────

export type ProductStatus = 'SELLING' | 'PAUSED' | 'OUT_OF_STOCK';

export interface ProductDto {
  id: number;
  name: string;
  note: string | null;
  size: string;
  price: number;
  marketMin: number;
  marketMax: number;
  availableToday: number;
  soldToday: number;
  status: ProductStatus;
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface DayBar    { day: string; pct: number; peak: boolean; }
export interface HourBar   { label: string; pct: number; orders: number; }
export interface ShareBar  { label: string; pct: number; value: string; }

export interface AnalyticsResponse {
  period: string;
  grossSales: number;
  netAfterFees: number;
  commissionPaid: number;
  orders: number;
  avgOrder: number;
  salesByDay: DayBar[];
  busiestHours: HourBar[];
  topProducts: ShareBar[];
  areas: ShareBar[];
  newCustomers: number;
  returningCustomers: number;
  repeatRate: number;
  recurringCustomers: number;
  lostCustomers: number;
  acceptanceRate: number;
  avgPrepTime: number;
  avgDeliveryTime: number;
  cancellationRate: number;
}

// ── Offline Sales ─────────────────────────────────────────────────────────────

export interface OfflineSaleDto {
  id: number;
  saleDate: string; // LocalDate: "YYYY-MM-DD"
  product: string;
  qty: number;
  amount: number;
  channel: string;
}

// ── Payouts ───────────────────────────────────────────────────────────────────

export interface SettlementLine { label: string; amount: number; }

export interface PayoutRecordDto {
  id: number;
  paidOn: string;
  periodStart: string;
  periodEnd: string;
  orders: number;
  gross: number;
  deductions: number;
  paid: number;
  reference: string;
}

export interface PayoutsResponse {
  nextPayout: number;
  pendingClearance: number;
  paidThisMonth: number;
  heldForDisputes: number;
  settlement: SettlementLine[];
  payable: number;
  history: PayoutRecordDto[];
}

// ── Verification ──────────────────────────────────────────────────────────────

export type DocStatus          = 'APPROVED' | 'EXPIRING' | 'NOT_SUBMITTED';
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED';
export type SubscriptionPlan   = 'FREE' | 'PRO';

export interface VendorDocumentDto {
  id: number;
  name: string;
  note: string | null;
  reference: string;
  submittedOn: string | null;
  validUntil: string | null;
  status: DocStatus;
}

export interface VendorVerificationResponse {
  businessName: string;
  waterSource: string | null;
  treatment: string | null;
  phValue: string | null;
  tdsValue: string | null;
  about: string | null;
  verificationStatus: VerificationStatus;
  plan: SubscriptionPlan;
  documents: VendorDocumentDto[];
}

// ── Subscription ──────────────────────────────────────────────────────────────

export interface SubscriptionResponse { plan: SubscriptionPlan; }

// ── Role switching ────────────────────────────────────────────────────────────

export interface SwitchRoleRequest { role: Role; }

/**
 * The "active mode" the user is currently browsing in.
 * This is separate from their DB role — a VENDOR can still browse as CUSTOMER.
 *
 *   CUSTOMER  → customer-facing pages (home, find-water, orders, cart…)
 *   VENDOR    → vendor portal (/vendor-dashboard etc.)
 *   RIDER     → rider portal (/riders/dashboard etc.)
 */
export type ActiveMode = 'CUSTOMER' | 'VENDOR' | 'RIDER';
