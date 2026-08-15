import { Coop, EggProductionLog, FeedItem, FeedLog, FinancialTransaction, HealthLog, Organization, User, VaccinationTask, NotificationItem } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-saas-1',
    name: 'Super Admin PetelurKu.com',
    email: 'admin@chicksync.saas',
    role: 'owner',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    phone: '+62 812-9988-7766'
  },
  {
    id: 'user-1',
    name: 'H. Yasin Yusuf (Pemilik Peternakan)',
    email: 'yasin@barokahfarm.id',
    role: 'owner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+62 812-3456-7890'
  },
  {
    id: 'user-2',
    name: 'Herman Wijaya',
    email: 'herman@barokahfarm.id',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+62 813-9876-5432'
  },
  {
    id: 'user-3',
    name: 'Budi Santoso',
    email: 'budi@barokahfarm.id',
    role: 'worker',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '+62 857-1122-3344'
  },
  {
    id: 'user-4',
    name: 'drh. Annisa Rahma',
    email: 'drh.annisa@poultryvet.id',
    role: 'vet',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+62 811-5566-7788'
  }
];

export const INITIAL_ORG: Organization = {
  id: 'org-1',
  name: 'Peternakan Barokah Layer Farm',
  plan: 'pro',
  status: 'active',
  billingCycle: 'monthly',
  nextBillingDate: '2026-09-01',
  e2eeFingerprint: 'SHA256:9f8a...7b2c-CHICKSYNC-AES256',
  isE2EEEnabled: true,
  maxCoops: 10,
  members: INITIAL_USERS
};

export const INITIAL_COOPS: Coop[] = [
  {
    id: 'coop-1',
    orgId: 'org-1',
    name: 'Kandang A1 - Closed House',
    code: 'KDG-A1',
    capacity: 2500,
    initialChickens: 2050,
    currentChickens: 2010,
    ageWeeks: 34,
    breed: 'ISA Brown',
    status: 'active',
    housingType: 'closed_house',
    entryDate: '2025-12-10'
  },
  {
    id: 'coop-2',
    orgId: 'org-1',
    name: 'Kandang A2 - Battery Semi',
    code: 'KDG-A2',
    capacity: 2000,
    initialChickens: 1850,
    currentChickens: 1825,
    ageWeeks: 28,
    breed: 'Lohmann Brown',
    status: 'active',
    housingType: 'battery',
    entryDate: '2026-01-15'
  },
  {
    id: 'coop-3',
    orgId: 'org-1',
    name: 'Kandang B1 - Layer Starter/Puncak',
    code: 'KDG-B1',
    capacity: 1800,
    initialChickens: 1600,
    currentChickens: 1590,
    ageWeeks: 20,
    breed: 'Hy-Line Brown',
    status: 'active',
    housingType: 'battery',
    entryDate: '2026-03-20'
  }
];

export const INITIAL_FEEDS: FeedItem[] = [
  {
    id: 'feed-1',
    name: 'Konsentrat Layer 36%',
    brand: 'Japfa Comfeed K-36',
    type: 'concentrate',
    currentStockKg: 1450,
    minThresholdKg: 500,
    pricePerKg: 9200,
    unit: 'kg'
  },
  {
    id: 'feed-2',
    name: 'Jagung Giling Super Kering',
    brand: 'Lokal Blitar Quality A',
    type: 'corn',
    currentStockKg: 420, // Low stock warning!
    minThresholdKg: 800,
    pricePerKg: 5400,
    unit: 'kg'
  },
  {
    id: 'feed-3',
    name: 'Dedak Halus Padi',
    brand: 'Mitra Tani Sejahtera',
    type: 'bran',
    currentStockKg: 950,
    minThresholdKg: 300,
    pricePerKg: 3800,
    unit: 'kg'
  },
  {
    id: 'feed-4',
    name: 'Premix Top Mix Layer & Calphos',
    brand: 'Medion TopMix',
    type: 'premix',
    currentStockKg: 120,
    minThresholdKg: 40,
    pricePerKg: 28000,
    unit: 'kg'
  }
];

// Generate 10 days of production data for realistic graphs
const generateInitialProduction = (): EggProductionLog[] => {
  const logs: EggProductionLog[] = [];
  const today = new Date('2026-08-06');

  for (let i = 9; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Coop 1 (KDG-A1: 2010 chickens, HDP ~93%)
    const c1Good = 1840 + Math.floor(Math.sin(i) * 20);
    const c1Broken = 12 + Math.floor(Math.random() * 6);
    const c1Total = c1Good + c1Broken;
    const c1Weight = Number((c1Total * 0.0625).toFixed(1)); // ~62.5g per egg
    const c1Hdp = Number(((c1Total / 2010) * 100).toFixed(1));

    logs.push({
      id: `prod-c1-${i}`,
      coopId: 'coop-1',
      date: dateStr,
      timeSlot: 'pagi',
      goodEggs: c1Good,
      brokenEggs: c1Broken,
      totalEggs: c1Total,
      totalWeightKg: c1Weight,
      henDayRate: c1Hdp,
      recordedBy: 'Budi Santoso',
      notes: 'Kualitas cangkang tebal, pakan lahap.',
      synced: true
    });

    // Coop 2 (KDG-A2: 1825 chickens, HDP ~90%)
    const c2Good = 1620 + Math.floor(Math.cos(i) * 25);
    const c2Broken = 15 + Math.floor(Math.random() * 5);
    const c2Total = c2Good + c2Broken;
    const c2Weight = Number((c2Total * 0.061).toFixed(1));
    const c2Hdp = Number(((c2Total / 1825) * 100).toFixed(1));

    logs.push({
      id: `prod-c2-${i}`,
      coopId: 'coop-2',
      date: dateStr,
      timeSlot: 'pagi',
      goodEggs: c2Good,
      brokenEggs: c2Broken,
      totalEggs: c2Total,
      totalWeightKg: c2Weight,
      henDayRate: c2Hdp,
      recordedBy: 'Budi Santoso',
      notes: 'Suhu kandang stabil 27°C.',
      synced: true
    });

    // Coop 3 (KDG-B1: 1590 chickens, HDP ~78% growing up)
    const c3Good = 1210 + (9 - i) * 18 + Math.floor(Math.random() * 10);
    const c3Broken = 8 + Math.floor(Math.random() * 4);
    const c3Total = c3Good + c3Broken;
    const c3Weight = Number((c3Total * 0.058).toFixed(1));
    const c3Hdp = Number(((c3Total / 1590) * 100).toFixed(1));

    logs.push({
      id: `prod-c3-${i}`,
      coopId: 'coop-3',
      date: dateStr,
      timeSlot: 'pagi',
      goodEggs: c3Good,
      brokenEggs: c3Broken,
      totalEggs: c3Total,
      totalWeightKg: c3Weight,
      henDayRate: c3Hdp,
      recordedBy: 'Herman Wijaya',
      notes: 'Trend produksi naik perlahan menuju puncak.',
      synced: true
    });
  }

  return logs;
};

export const INITIAL_PRODUCTION: EggProductionLog[] = generateInitialProduction();

export const INITIAL_VACCINATIONS: VaccinationTask[] = [
  {
    id: 'vac-1',
    coopId: 'coop-3',
    vaccineName: 'Avian Influenza H5N1 / H7N9 (Killed)',
    diseaseTarget: 'Flu Burung (AI)',
    targetAgeWeeks: 20,
    scheduledDate: '2026-08-07', // Tomorrow!
    status: 'scheduled',
    dose: '0.5 ml / ekor',
    method: 'suntik_muskul',
    notes: 'Vaksinasi pengulangan wajib untuk proteksi puncak produksi.'
  },
  {
    id: 'vac-2',
    coopId: 'coop-3',
    vaccineName: 'ND-IB Emulsion (Killed)',
    diseaseTarget: 'Tetelo & Infectious Bronchitis',
    targetAgeWeeks: 18,
    scheduledDate: '2026-07-24',
    status: 'completed',
    dose: '0.5 ml / ekor',
    method: 'suntik_muskul',
    completedDate: '2026-07-24',
    completedBy: 'drh. Annisa Rahma',
    notes: 'Suntik paha kanan, reaksi pasca-vaksinasi normal.'
  },
  {
    id: 'vac-3',
    coopId: 'coop-2',
    vaccineName: 'Coryza / Snot Booster (Killed)',
    diseaseTarget: 'Coryza (Flu Ayam)',
    targetAgeWeeks: 28,
    scheduledDate: '2026-08-05',
    status: 'overdue',
    dose: '0.5 ml / ekor',
    method: 'suntik_muskul',
    notes: 'Perlu dijadwalkan ulang segera oleh drh. Annisa!'
  },
  {
    id: 'vac-4',
    coopId: 'coop-1',
    vaccineName: 'ND Lasota Booster (Live)',
    diseaseTarget: 'Newcastle Disease (ND)',
    targetAgeWeeks: 36,
    scheduledDate: '2026-08-20',
    status: 'scheduled',
    dose: '1 dosis / ekor',
    method: 'air_minum',
    notes: 'Campurkan dengan air bebas kaporit + skim milk.'
  }
];

export const INITIAL_HEALTH_LOGS: HealthLog[] = [
  {
    id: 'hl-1',
    coopId: 'coop-1',
    date: '2026-08-05',
    mortalityCount: 1,
    culledCount: 0,
    symptoms: ['Ayam lemas 1 ekor', 'Nafsu makan baik'],
    diagnosis: 'Prolapsus uterus ringan',
    treatmentGiven: 'Pemberian Vita Stress via Air Minum',
    medicationCost: 45000,
    recordedBy: 'Budi Santoso',
    synced: true
  },
  {
    id: 'hl-2',
    coopId: 'coop-2',
    date: '2026-08-04',
    mortalityCount: 2,
    culledCount: 1,
    symptoms: ['Kotoran hijau encer', 'Mata berair'],
    diagnosis: 'Kandidat awal Coryza / perubahan cuaca',
    treatmentGiven: 'Injeksi Medoxy-LA + Sanitasi air minum',
    medicationCost: 120000,
    vetNotes: 'Isolasi 3 ekor di kandang karantina.',
    recordedBy: 'drh. Annisa Rahma',
    synced: true
  }
];

export const INITIAL_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: 'tx-1',
    coopId: 'coop-1',
    date: '2026-08-05',
    type: 'income',
    category: 'egg_sales',
    description: 'Penjualan Telur Curah ke Agen Blitar (185 Crate)',
    amount: 7020000, // IDR 7,020,000
    quantity: 270,
    unit: 'kg',
    recordedBy: 'Herman Wijaya',
    synced: true
  },
  {
    id: 'tx-2',
    coopId: 'coop-2',
    date: '2026-08-05',
    type: 'income',
    category: 'egg_sales',
    description: 'Penjualan Telur Super Segar (Grosir Pasar Anyar)',
    amount: 5850000,
    quantity: 225,
    unit: 'kg',
    recordedBy: 'Herman Wijaya',
    synced: true
  },
  {
    id: 'tx-3',
    date: '2026-08-04',
    type: 'expense',
    category: 'feed_purchase',
    description: 'Pembelian Konsentrat K-36 (20 Sak @50kg)',
    amount: 9200000,
    quantity: 1000,
    unit: 'kg',
    recordedBy: 'Herman Wijaya',
    synced: true
  },
  {
    id: 'tx-4',
    date: '2026-08-03',
    type: 'expense',
    category: 'electricity_utility',
    description: 'Token Listrik Closed House & Pompa Air Otomatis',
    amount: 1450000,
    recordedBy: 'H. Yasin Yusuf',
    synced: true
  },
  {
    id: 'tx-5',
    date: '2026-08-01',
    type: 'income',
    category: 'manure_sales',
    description: 'Penjualan Pupuk Kotoran Ayam Kering (50 Karung)',
    amount: 49000,
    quantity: 50,
    unit: 'karung',
    recordedBy: 'Budi Santoso',
    synced: true
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Pengingat Vaksinasi Besok!',
    message: 'Kandang B1 dijadwalkan Vaksin Flu Burung (AI H5N1) besok (07 Aug 2026). Dosis 0.5 ml/ekor.',
    type: 'vaccine',
    severity: 'warning',
    date: '2026-08-06 06:00',
    isRead: false
  },
  {
    id: 'notif-2',
    title: 'Peringatan Stok Pakan Kritis',
    message: 'Stok Jagung Giling tersisa 420 kg (Di bawah batas minimal 800 kg). Cukup untuk ~2 hari.',
    type: 'stock',
    severity: 'danger',
    date: '2026-08-05 18:30',
    isRead: false
  },
  {
    id: 'notif-3',
    title: 'Vaksinasi Terlewat (Overdue)',
    message: 'Vaksin Coryza di Kandang A2 terlewat dari jadwal 05 Aug 2026. Segera lakukan tindakan.',
    type: 'vaccine',
    severity: 'danger',
    date: '2026-08-06 00:00',
    isRead: false
  },
  {
    id: 'notif-4',
    title: 'Sinkronisasi Cloud Berhasil',
    message: 'Semua 18 catatan produksi & keuangan telah terenkripsi E2EE dan tersinkron ke Cloud.',
    type: 'sync',
    severity: 'success',
    date: '2026-08-06 07:00',
    isRead: true
  }
];
