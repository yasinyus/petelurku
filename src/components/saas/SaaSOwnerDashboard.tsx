import React, { useState } from 'react';
import { 
  Building2, 
  CreditCard, 
  TrendingUp, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  UserPlus, 
  ShieldCheck, 
  Download, 
  ExternalLink,
  ChevronRight,
  Megaphone,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Send,
  Lock,
  RefreshCw,
  Mail,
  Phone
} from 'lucide-react';
import { SaaSTenantOrg, SaaSPaymentTransaction, SubscriptionPlan } from '../../types';
import { ApiService } from '../../services/api';

// Mock initial data for SaaS Owner view
const INITIAL_TENANTS: SaaSTenantOrg[] = [
  {
    id: 'org-1',
    name: 'Peternakan Barokah Layer Farm',
    ownerName: 'H. Yasin Yusuf',
    ownerEmail: 'yasin@barokahfarm.id',
    ownerPhone: '+62 812-3456-7890',
    city: 'Blitar, Jawa Timur',
    plan: 'pro',
    status: 'active',
    monthlyRevenue: 99000,
    totalCoops: 3,
    totalChickens: 5425,
    joinedDate: '2025-10-12',
    nextBillingDate: '2026-09-01',
    paymentMethod: 'QRIS Instant',
    autoRenew: true
  },
  {
    id: 'org-2',
    name: 'PT Avian Jaya Nusantara',
    ownerName: 'Ir. Hendra Gunawan',
    ownerEmail: 'hendra@avianjaya.co.id',
    ownerPhone: '+62 811-9988-7766',
    city: 'Malang, Jawa Timur',
    plan: 'enterprise',
    status: 'active',
    monthlyRevenue: 199000,
    totalCoops: 12,
    totalChickens: 35000,
    joinedDate: '2025-08-01',
    nextBillingDate: '2026-08-28',
    paymentMethod: 'BCA Virtual Account',
    autoRenew: true
  },
  {
    id: 'org-3',
    name: 'Sumber Makmur Poultry',
    ownerName: 'Siti Rahmawati',
    ownerEmail: 'siti@sumbermakmur.id',
    ownerPhone: '+62 856-4433-2211',
    city: 'Payakumbuh, Sumatera Barat',
    plan: 'basic',
    status: 'active',
    monthlyRevenue: 49000,
    totalCoops: 2,
    totalChickens: 2800,
    joinedDate: '2026-01-15',
    nextBillingDate: '2026-08-15',
    paymentMethod: 'Mandiri VA',
    autoRenew: true
  },
  {
    id: 'org-4',
    name: 'Lumbung Telur Sejahtera',
    ownerName: 'Bambang Hartono',
    ownerEmail: 'bambang@lumbungtelur.com',
    ownerPhone: '+62 818-0909-8080',
    city: 'Sukabumi, Jawa Barat',
    plan: 'pro',
    status: 'trial',
    monthlyRevenue: 0,
    totalCoops: 4,
    totalChickens: 7500,
    joinedDate: '2026-07-28',
    nextBillingDate: '2026-08-11',
    paymentMethod: 'Belum Terhubung',
    autoRenew: false
  },
  {
    id: 'org-5',
    name: 'CV Sinar Farm Poultry',
    ownerName: 'Dewi Kartika',
    ownerEmail: 'dewi@sinarfarm.co.id',
    ownerPhone: '+62 813-7766-5544',
    city: 'Kendhal, Jawa Tengah',
    plan: 'basic',
    status: 'expired',
    monthlyRevenue: 49000,
    totalCoops: 1,
    totalChickens: 1500,
    joinedDate: '2025-11-20',
    nextBillingDate: '2026-07-20',
    paymentMethod: 'BCA Virtual Account',
    autoRenew: false
  },
  {
    id: 'org-6',
    name: 'Bina Tani Layer Modern',
    ownerName: 'Dr. Agus Setiawan',
    ownerEmail: 'agus@binatani.id',
    ownerPhone: '+62 812-4455-6677',
    city: 'Lampung Selatan',
    plan: 'enterprise',
    status: 'active',
    monthlyRevenue: 199000,
    totalCoops: 15,
    totalChickens: 42000,
    joinedDate: '2025-06-10',
    nextBillingDate: '2026-09-10',
    paymentMethod: 'Credit Card Visa/Master',
    autoRenew: true
  }
];

const INITIAL_TRANSACTIONS: SaaSPaymentTransaction[] = [
  {
    id: 'pay-1001',
    orgId: 'org-1',
    orgName: 'Peternakan Barokah Layer Farm',
    amount: 99000,
    plan: 'pro',
    paymentMethod: 'QRIS Instant (Gopay)',
    gateway: 'Midtrans',
    status: 'settlement',
    transactionDate: '2026-08-01 09:15',
    invoiceNumber: 'INV/202608/SAAS-001'
  },
  {
    id: 'pay-1002',
    orgId: 'org-2',
    orgName: 'PT Avian Jaya Nusantara',
    amount: 199000,
    plan: 'enterprise',
    paymentMethod: 'BCA Virtual Account',
    gateway: 'Midtrans',
    status: 'settlement',
    transactionDate: '2026-07-28 14:30',
    invoiceNumber: 'INV/202607/SAAS-089'
  },
  {
    id: 'pay-1003',
    orgId: 'org-3',
    orgName: 'Sumber Makmur Poultry',
    amount: 49000,
    plan: 'basic',
    paymentMethod: 'Mandiri Virtual Account',
    gateway: 'Xendit',
    status: 'settlement',
    transactionDate: '2026-07-15 11:00',
    invoiceNumber: 'INV/202607/SAAS-045'
  },
  {
    id: 'pay-1004',
    orgId: 'org-5',
    orgName: 'CV Sinar Farm Poultry',
    amount: 49000,
    plan: 'basic',
    paymentMethod: 'BCA Virtual Account',
    gateway: 'Midtrans',
    status: 'expire',
    transactionDate: '2026-07-21 23:59',
    invoiceNumber: 'INV/202607/SAAS-062'
  },
  {
    id: 'pay-1005',
    orgId: 'org-4',
    orgName: 'Lumbung Telur Sejahtera',
    amount: 99000,
    plan: 'pro',
    paymentMethod: 'QRIS Instant',
    gateway: 'Midtrans',
    status: 'pending',
    transactionDate: '2026-08-06 07:10',
    invoiceNumber: 'INV/202608/SAAS-012'
  }
];

const MRR_HISTORY = [
  { month: 'Mar', mrr: 32500000, subscribers: 18 },
  { month: 'Apr', mrr: 36000000, subscribers: 20 },
  { month: 'Mei', mrr: 39500000, subscribers: 21 },
  { month: 'Jun', mrr: 42000000, subscribers: 22 },
  { month: 'Jul', mrr: 45500000, subscribers: 23 },
  { month: 'Agu', mrr: 48500000, subscribers: 25 },
];

export const SaaSOwnerDashboard: React.FC = () => {
  const [tenants, setTenants] = useState<SaaSTenantOrg[]>(INITIAL_TENANTS);
  const [transactions, setTransactions] = useState<SaaSPaymentTransaction[]>(INITIAL_TRANSACTIONS);
  const [activeSubTab, setActiveSubTab] = useState<'tenants' | 'financials' | 'broadcast'>('tenants');
  
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trial' | 'expired'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'basic' | 'pro' | 'enterprise'>('all');

  // Modal State for New Tenant
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newPlan, setNewPlan] = useState<SubscriptionPlan>('pro');

  // Broadcast Announcement State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Data Migration State
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<string | null>(null);

  const handleRunDataMigration = async () => {
    setIsMigrating(true);
    const res = await ApiService.runMigration();
    setIsMigrating(false);
    if (res && res.success) {
      setMigrationResult(`✅ Migrasi Sukses: ${res.message} (Akun Owner: admin@chicksync.saas)`);
    } else {
      setMigrationResult(`❌ Migrasi Gagal: ${res?.message || 'Terjadi kesalahan'}`);
    }
  };

  // Financial Statistics Calculation
  const totalActiveTenants = tenants.filter(t => t.status === 'active').length;
  const totalTrialTenants = tenants.filter(t => t.status === 'trial').length;
  const totalExpiredTenants = tenants.filter(t => t.status === 'expired').length;
  
  const currentMRR = tenants.reduce((acc, t) => t.status === 'active' ? acc + t.monthlyRevenue : acc, 0);
  const estimatedARR = currentMRR * 12;
  const totalChickensManaged = tenants.reduce((acc, t) => acc + t.totalChickens, 0);

  const basicCount = tenants.filter(t => t.plan === 'basic' && t.status === 'active').length;
  const proCount = tenants.filter(t => t.plan === 'pro' && t.status === 'active').length;
  const enterpriseCount = tenants.filter(t => t.plan === 'enterprise' && t.status === 'active').length;

  // Filtered Tenants List
  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPlan = planFilter === 'all' || t.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName || !newOwnerName || !newEmail) return;

    const planPrices = { basic: 49000, pro: 99000, enterprise: 199000 };
    const newTenant: SaaSTenantOrg = {
      id: `org-${Date.now()}`,
      name: newOrgName,
      ownerName: newOwnerName,
      ownerEmail: newEmail,
      ownerPhone: newPhone || '+62 812-0000-0000',
      city: newCity || 'Indonesia',
      plan: newPlan,
      status: 'active',
      monthlyRevenue: planPrices[newPlan],
      totalCoops: 2,
      totalChickens: 3000,
      joinedDate: new Date().toISOString().split('T')[0],
      nextBillingDate: '2026-09-06',
      paymentMethod: 'QRIS Instant',
      autoRenew: true
    };

    setTenants([newTenant, ...tenants]);
    setShowAddTenantModal(false);
    setNewOrgName('');
    setNewOwnerName('');
    setNewEmail('');
    setNewPhone('');
    setNewCity('');
  };

  const handleToggleStatus = (id: string) => {
    setTenants(tenants.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'active' ? 'expired' : 'active';
        return { 
          ...t, 
          status: nextStatus,
          monthlyRevenue: nextStatus === 'active' ? (t.plan === 'enterprise' ? 199000 : t.plan === 'pro' ? 99000 : 49000) : 0 
        };
      }
      return t;
    }));
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastTitle('');
      setBroadcastMessage('');
    }, 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Super Admin Platform
              </span>
              <span className="text-slate-400 text-xs font-mono">• PetelurKu.com Cloud Engine</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-6 h-6 text-emerald-600" />
              Dashboard Eksekutif Admin
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Pusat kendali utama: pantau pendapatan berulang, perkembangan pelanggan peternakan, status pembayaran, dan distribusi lisensi secara real-time.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRunDataMigration}
              disabled={isMigrating}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
              title="Jalankan migrasi dan data awal admin"
            >
              <RefreshCw className={`w-4 h-4 ${isMigrating ? 'animate-spin' : ''}`} />
              {isMigrating ? 'Migrasi...' : 'Migrasi Data Admin'}
            </button>

            <button
              onClick={() => setShowAddTenantModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              Onboarding Peternakan Baru
            </button>
          </div>
        </div>
      </div>

      {/* Migration Notification Result Banner */}
      {migrationResult && (
        <div className="bg-emerald-900 text-emerald-200 border border-emerald-700 rounded-2xl p-4 flex items-center justify-between shadow-lg text-xs font-mono">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{migrationResult}</span>
          </div>
          <button
            onClick={() => setMigrationResult(null)}
            className="px-2 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded font-sans text-[11px] font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* MRR Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Monthly Recurring Revenue (MRR)</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              Rp {currentMRR.toLocaleString('id-ID')}
              <span className="text-xs font-normal text-slate-400"> /bln</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% MoM
            </span>
            <span className="text-slate-400">EST ARR: Rp {(estimatedARR / 1000000).toFixed(0)} Jt</span>
          </div>
        </div>

        {/* Total Subscribers Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Pelanggan Terdaftar</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {tenants.length} <span className="text-xs font-normal text-slate-500">Peternakan</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 font-semibold">{totalActiveTenants} Aktif</span>
            <span className="text-amber-700 font-semibold">{totalTrialTenants} Trial</span>
            <span className="text-slate-400">{totalExpiredTenants} Expired</span>
          </div>
        </div>

        {/* Managed Chickens Scale Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Populasi Ayam di Platform</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                🥚
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {totalChickensManaged.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">Ekor</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Rata-rata ~{(totalChickensManaged / (totalActiveTenants || 1)).toFixed(0)} ekor / farm</span>
          </div>
        </div>

        {/* ARPU Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Rata-rata Pendapatan (ARPU)</span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              Rp {(currentMRR / (totalActiveTenants || 1)).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
            <span>Churn Rate Rendah (&lt;1.5%)</span>
          </div>
        </div>

      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MRR Growth Chart Visualization */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Tren Pertumbuhan MRR (Monthly Recurring Revenue)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Pertumbuhan pendapatan 6 bulan terakhir</p>
            </div>
            <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Target Q3: Rp 55 Jt
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-100">
            {MRR_HISTORY.map((item, idx) => {
              const maxMrr = 50000000;
              const heightPercent = Math.round((item.mrr / maxMrr) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition">
                    {(item.mrr / 1000000).toFixed(1)}Jt
                  </span>
                  <div 
                    style={{ height: `${heightPercent}%` }} 
                    className="w-full max-w-[40px] bg-emerald-600 group-hover:bg-emerald-700 rounded-t-lg transition-all relative"
                  />
                  <span className="text-xs font-bold text-slate-600">{item.month}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Total MRR Terkumpul
            </span>
            <span>Total Pelanggan Aktif: <strong>{totalActiveTenants} Peternakan</strong></span>
          </div>
        </div>

        {/* Subscription Plan Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Komposisi Paket Langganan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Distribusi pengguna aktif berdasarkan lisensi</p>
          </div>

          <div className="space-y-4 pt-2">
            {/* Enterprise Bar */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-purple-700">Bisnis (Rp 199.000/bln)</span>
                <span className="text-slate-900">{enterpriseCount} Peternakan</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-purple-600 h-full rounded-full" 
                  style={{ width: `${(enterpriseCount / (totalActiveTenants || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Pro Bar */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-amber-700">Pro (Rp 99.000/bln)</span>
                <span className="text-slate-900">{proCount} Peternakan</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full" 
                  style={{ width: `${(proCount / (totalActiveTenants || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Basic Bar */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-teal-700">Basic (Rp 49.000/bln)</span>
                <span className="text-slate-900">{basicCount} Peternakan</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-teal-500 h-full rounded-full" 
                  style={{ width: `${(basicCount / (totalActiveTenants || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Insight Strategis:
            </div>
            <p>Paket Pro & Enterprise menyumbang <strong>82.5%</strong> dari total MRR platform Anda.</p>
          </div>
        </div>

      </div>

      {/* Main Tabs Navigation Inside SaaS Owner Dashboard */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Navigation Tabs Header */}
        <div className="border-b border-slate-200 bg-slate-50/50 p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('tenants')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'tenants'
                  ? 'bg-white text-emerald-700 border border-slate-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Daftar Pelanggan ({tenants.length})
            </button>

            <button
              onClick={() => setActiveSubTab('financials')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'financials'
                  ? 'bg-white text-emerald-700 border border-slate-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Riwayat Pembayaran ({transactions.length})
            </button>

            <button
              onClick={() => setActiveSubTab('broadcast')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'broadcast'
                  ? 'bg-white text-emerald-700 border border-slate-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              Pengumuman Broadcast
            </button>
          </div>
        </div>

        {/* Tab 1: Tenants List & Management */}
        {activeSubTab === 'tenants' && (
          <div className="p-5 space-y-4 text-xs">
            
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari peternakan, kota, atau pemilik..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif Berlangganan</option>
                  <option value="trial">Masa Trial</option>
                  <option value="expired">Expired / Kadaluarsa</option>
                </select>

                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none"
                >
                  <option value="all">Semua Paket</option>
                  <option value="basic">Paket Basic</option>
                  <option value="pro">Paket Pro</option>
                  <option value="enterprise">Paket Enterprise</option>
                </select>
              </div>
            </div>

            {/* Tenants Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Nama Peternakan</th>
                    <th className="py-3 px-4">Pemilik & Kontak</th>
                    <th className="py-3 px-4">Paket</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Skala Kandang</th>
                    <th className="py-3 px-4">MRR Tenant</th>
                    <th className="py-3 px-4">Jatuh Tempo</th>
                    <th className="py-3 px-4 text-center">Aksi Administrator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{tenant.name}</div>
                        <div className="text-[11px] text-slate-500">{tenant.city}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{tenant.ownerName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{tenant.ownerEmail}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                          tenant.plan === 'enterprise' 
                            ? 'bg-purple-50 text-purple-800 border-purple-200' 
                            : tenant.plan === 'pro' 
                            ? 'bg-amber-50 text-amber-800 border-amber-200' 
                            : 'bg-teal-50 text-teal-800 border-teal-200'
                        }`}>
                          {tenant.plan}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          tenant.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                            : tenant.status === 'trial' 
                            ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {tenant.status === 'active' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {tenant.status === 'trial' && <Clock className="w-3 h-3 text-blue-600" />}
                          {tenant.status === 'expired' && <AlertCircle className="w-3 h-3 text-rose-600" />}
                          {tenant.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{tenant.totalCoops} Kandang</div>
                        <div className="text-[10px] text-slate-400 font-mono">{tenant.totalChickens.toLocaleString('id-ID')} ekor</div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {tenant.monthlyRevenue > 0 
                          ? `Rp ${tenant.monthlyRevenue.toLocaleString('id-ID')}` 
                          : <span className="text-slate-400 font-normal">Rp 0 (Trial)</span>}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {tenant.nextBillingDate}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(tenant.id)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                            tenant.status === 'active'
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {tenant.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredTenants.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Tidak ada peternakan yang cocok dengan filter pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Financial Transactions Gateway Logs */}
        {activeSubTab === 'financials' && (
          <div className="p-5 space-y-4 text-xs">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Riwayat Transaksi Gateway (Midtrans & Xendit)</h3>
                <p className="text-slate-500 text-[11px]">Log otomatis pembayaran langganan</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Webhook Live Connected
                </span>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">No. Invoice</th>
                    <th className="py-3 px-4">Peternakan / Tenant</th>
                    <th className="py-3 px-4">Paket Dipilih</th>
                    <th className="py-3 px-4">Nominal</th>
                    <th className="py-3 px-4">Metode & Gateway</th>
                    <th className="py-3 px-4">Waktu Transaksi</th>
                    <th className="py-3 px-4 text-center">Status Gateway</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{tx.invoiceNumber}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{tx.orgName}</td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {tx.plan}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900">
                        Rp {tx.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{tx.paymentMethod}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Gateway: {tx.gateway}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {tx.transactionDate}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tx.status === 'settlement' 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                            : tx.status === 'pending' 
                            ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* Tab 3: System Broadcast */}
        {activeSubTab === 'broadcast' && (
          <div className="p-5 max-w-2xl space-y-4 text-xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-emerald-600" />
                Kirim Pengumuman Global ke Semua Peternakan
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Pesan ini akan langsung muncul di panel notifikasi seluruh pengguna aplikasi.
              </p>
            </div>

            {broadcastSent && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Pengumuman berhasil disiarkan ke {totalActiveTenants} peternakan aktif!
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Judul Pengumuman System</label>
                <input
                  type="text"
                  placeholder="Contoh: Pemeliharaan Sistem Rutin Halaman Laporan"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Isi Pesan Broadcast</label>
                <textarea
                  rows={4}
                  placeholder="Tuliskan informasi penting seputar pembaruan fitur, tips peternakan, atau informasi penagihan..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Siarkan Pengumuman Sekarang
              </button>
            </form>
          </div>
        )}

      </div>

      {/* Add New Tenant Modal */}
      {showAddTenantModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl text-slate-900 text-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Onboarding Manual Peternakan Baru</h3>
            <p className="text-slate-500 mb-4">Tambahkan tenant baru secara langsung dari dashboard Super Admin.</p>

            <form onSubmit={handleCreateTenant} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Peternakan / Badan Usaha</label>
                <input
                  type="text"
                  placeholder="Contoh: Peternakan Ayam Sejahtera"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Pemilik / Penanggung Jawab</label>
                <input
                  type="text"
                  placeholder="Contoh: H. Ahmad Subardjo"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Utama</label>
                  <input
                    type="email"
                    placeholder="ahmad@poultry.id"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+62 812..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kota / Lokasi</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kediri"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pilih Paket</label>
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value as SubscriptionPlan)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-600 font-bold"
                  >
                    <option value="basic">Basic (Rp 49rb/bln)</option>
                    <option value="pro">Pro (Rp 99rb/bln)</option>
                    <option value="enterprise">Bisnis (Rp 199rb/bln)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTenantModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Simpan & Daftarkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
