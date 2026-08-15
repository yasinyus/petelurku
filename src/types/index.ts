export type SubscriptionPlan = 'basic' | 'pro' | 'enterprise';

export type UserRole = 'owner' | 'manager' | 'worker' | 'vet';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'invited';
  assignedHouseId?: string;
  assignedHouseName?: string;
  assignedHouseIds?: string[];
  assignedHouseNames?: string[];
}

export interface Organization {
  id: string;
  name: string;
  plan: SubscriptionPlan;
  status: 'active' | 'trial' | 'expired';
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  e2eeFingerprint: string;
  isE2EEEnabled: boolean;
  maxCoops: number;
  members: User[];
  logoData?: string;
  ownerName?: string;
  city?: string;
  address?: string;
  subscriptionStatus?: string;
  trialEndsAt?: string | null;
  subscriptionEndsAt?: string | null;
}

export interface Coop {
  id: string;
  orgId: string;
  name: string;
  code: string;
  capacity: number;
  initialChickens: number;
  currentChickens: number;
  ageWeeks: number;
  breed: string; // e.g., ISA Brown, Lohmann Brown, Hy-Line
  status: 'active' | 'quarantine' | 'maintenance' | 'empty';
  housingType: 'battery' | 'open_house' | 'closed_house';
  entryDate: string;
}

export interface EggProductionLog {
  id: string;
  coopId: string;
  date: string; // YYYY-MM-DD
  timeSlot: 'pagi' | 'siang' | 'sore';
  goodEggs: number; // Utuh
  brokenEggs: number; // Retak / Rusak
  totalEggs: number;
  totalWeightKg: number;
  mortalityCount?: number;
  feedUsageKg?: number;
  henDayRate: number; // HDP %
  recordedBy: string;
  notes?: string;
  synced: boolean;
}

export interface FeedItem {
  id: string;
  name: string;
  brand: string;
  type: string;
  currentStockKg: number;
  minThresholdKg: number;
  pricePerKg: number;
  unit: 'kg' | 'sak';
}

export interface FeedLog {
  id: string;
  coopId: string;
  feedId: string;
  date: string;
  amountKg: number;
  recordedBy: string;
  notes?: string;
  synced: boolean;
}

export interface HealthLog {
  id: string;
  coopId: string;
  date: string;
  mortalityCount: number; // Mati
  culledCount: number; // Afkir
  symptoms: string[];
  diagnosis?: string;
  treatmentGiven?: string;
  medicationCost?: number;
  vetNotes?: string;
  recordedBy: string;
  synced: boolean;
}

export interface VaccinationTask {
  id: string;
  coopId: string;
  vaccineName: string;
  diseaseTarget: string;
  targetAgeWeeks: number;
  scheduledDate: string;
  status: 'scheduled' | 'completed' | 'overdue';
  dose: string;
  method: 'air_minum' | 'suntik_muskul' | 'tetes_mata' | 'tetes_hidung' | 'spray';
  completedDate?: string;
  completedBy?: string;
  notes?: string;
}

export type FinancialCategory = 
  | 'egg_sales'
  | 'culled_chicken_sales'
  | 'manure_sales'
  | 'feed_purchase'
  | 'medication_vaccine'
  | 'electricity_utility'
  | 'labor_salary'
  | 'equipment_repair'
  | 'other_expense';

export interface FinancialTransaction {
  id: string;
  coopId?: string;
  date: string;
  type: 'income' | 'expense';
  category: FinancialCategory;
  description: string;
  amount: number;
  quantity?: number;
  unit?: string;
  recordedBy: string;
  receiptUrl?: string;
  synced: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'vaccine' | 'stock' | 'health' | 'finance' | 'sync';
  severity: 'info' | 'warning' | 'danger' | 'success';
  date: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingQueueCount: number;
  lastSyncedAt: string;
  simulatedDeviceName: string;
}

export interface SaaSTenantOrg {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  city: string;
  plan: SubscriptionPlan;
  status: 'active' | 'trial' | 'expired' | 'suspended';
  monthlyRevenue: number;
  totalCoops: number;
  totalChickens: number;
  joinedDate: string;
  nextBillingDate: string;
  paymentMethod: string;
  autoRenew: boolean;
}

export interface SaaSPaymentTransaction {
  id: string;
  orgId: string;
  orgName: string;
  amount: number;
  plan: SubscriptionPlan;
  paymentMethod: string;
  gateway: 'Midtrans' | 'Xendit';
  status: 'settlement' | 'pending' | 'failed' | 'expire';
  transactionDate: string;
  invoiceNumber: string;
}
