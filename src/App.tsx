import React, { useState, useEffect } from 'react';
import { 
  Organization, 
  User, 
  Coop, 
  EggProductionLog, 
  FeedItem, 
  VaccinationTask, 
  HealthLog, 
  FinancialTransaction, 
  NotificationItem, 
  SyncStatus, 
  SubscriptionPlan 
} from './types';
import { StorageService } from './services/storageService';
import { ApiService } from './services/api';
import { calculateAgeWeeks, getLocalDateInputValue } from './utils/date';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';

import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { CoopList } from './components/coops/CoopList';
import { EggProductionModule } from './components/production/EggProductionModule';
import { FeedManagementModule } from './components/feed/FeedManagementModule';
import { HealthVaccinationModule } from './components/health/HealthVaccinationModule';
import { FinancialModule } from './components/finance/FinancialModule';
import { PdfExportModule } from './components/reports/PdfExportModule';
import { OrgRoleManagement } from './components/saas/OrgRoleManagement';
import { FarmProfile } from './components/saas/FarmProfile';
import { SubscriptionBilling } from './components/saas/SubscriptionBilling';
import { SaaSOwnerDashboard } from './components/saas/SaaSOwnerDashboard';
import { LandingPage } from './components/landing/LandingPage';
import { E2EEAndSyncModal } from './components/security/E2EEAndSyncModal';
import { MySQLInspectorModal } from './components/database/MySQLInspectorModal';
import { FlutterMobileStudio } from './components/mobile/FlutterMobileStudio';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { CheckCircle2, RefreshCw } from 'lucide-react';

type DailyFeedCost = {
  date: string;
  materials: Array<{ id: string; name: string; feedType: string; consumedKg: number; pricePerKg: number; subtotal: number }>;
  totalConsumedKg: number;
  totalCost: number;
};

export default function App() {
  const [viewMode, setViewMode] = useState<'app' | 'landing'>('landing');
  const [isSessionChecking, setIsSessionChecking] = useState(true);
  const [isGuestDemo, setIsGuestDemo] = useState(false);
  const [authenticatedUserId, setAuthenticatedUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Application State initialized from StorageService
  const [dataMode, setDataMode] = useState<'demo' | 'real'>(StorageService.getDataMode());
  const [org, setOrg] = useState<Organization>(StorageService.getOrg());
  const [currentUser, setCurrentUser] = useState<User>(StorageService.getCurrentUser());
  const [coops, setCoops] = useState<Coop[]>(StorageService.getCoops());
  const [feeds, setFeeds] = useState<FeedItem[]>(StorageService.getFeeds());
  const [productionLogs, setProductionLogs] = useState<EggProductionLog[]>(StorageService.getProductionLogs());
  const [vaccinations, setVaccinations] = useState<VaccinationTask[]>(StorageService.getVaccinations());
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>(StorageService.getHealthLogs());
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(StorageService.getTransactions());
  const [notifications, setNotifications] = useState<NotificationItem[]>(StorageService.getNotifications());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(StorageService.getSyncStatus());
  const [eggEstimate, setEggEstimate] = useState({ date: '', totalWeightKg: 0, pricePerKg: 26000, estimatedRevenue: 0 });
  const [dailyFeedCost, setDailyFeedCost] = useState<DailyFeedCost>({ date: '', materials: [], totalConsumedKg: 0, totalCost: 0 });

  // Modal & Drawer visibility
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isMySQLModalOpen, setIsMySQLModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadMySQLData = async () => {
    const [houses, feedRows, harvests, vaccineRows, healthRows, financeRows, memberRows, estimate, feedCost, farmProfile] = await Promise.all([
      ApiService.getHouses(), ApiService.getFeeds(), ApiService.getHarvests(), ApiService.getVaccinations(), ApiService.getHealthLogs(), ApiService.getFinances(), ApiService.getMembers(), ApiService.getEggEstimate(), ApiService.getDailyFeedCost(), ApiService.getFarmProfile()
    ]);
    setCoops(houses.data.map((row: any): Coop => ({
      id: row.id, orgId: row.farm_id, name: row.name, code: row.code, capacity: Number(row.initial_chickens), initialChickens: Number(row.initial_chickens),
      currentChickens: Number(row.current_chickens), ageWeeks: calculateAgeWeeks(String(row.housed_date).slice(0, 10)), breed: row.chicken_type, status: row.status || 'active', housingType: row.housing_type || 'battery', entryDate: String(row.housed_date).slice(0, 10)
    })));
    setFeeds(feedRows.data.map((row: any): FeedItem => ({ id: row.id, name: row.feed_name, brand: row.feed_name, type: row.feed_type, currentStockKg: Number(row.current_stock_kg), minThresholdKg: Number(row.min_threshold_kg), pricePerKg: Number(row.price_per_kg), unit: 'kg' })));
    setProductionLogs(harvests.data.map((row: any): EggProductionLog => ({ id: row.id, coopId: row.house_id, date: String(row.harvest_date).slice(0, 10), timeSlot: row.time_slot, goodEggs: Number(row.good_eggs_count), brokenEggs: Number(row.damaged_eggs_count), totalEggs: Number(row.good_eggs_count) + Number(row.damaged_eggs_count), totalWeightKg: Number(row.weight_kg), mortalityCount: Number(row.death_count), feedUsageKg: Number(row.feed_kg || 0), henDayRate: Number(row.hen_day_percentage), recordedBy: row.recorded_by, notes: row.notes, synced: true })));
    setVaccinations(vaccineRows.data.map((row: any): VaccinationTask => ({ id: row.id, coopId: row.house_id, vaccineName: row.vaccine_name, diseaseTarget: row.disease_target, targetAgeWeeks: 0, scheduledDate: String(row.scheduled_date).slice(0, 10), status: row.status, dose: '-', method: 'suntik_muskul', completedDate: row.administered_date ? String(row.administered_date).slice(0, 10) : undefined, completedBy: row.vet_name, notes: row.notes })));
    setHealthLogs(healthRows.data.map((row: any): HealthLog => ({ id: row.id, coopId: row.house_id, date: String(row.record_date).slice(0, 10), mortalityCount: Number(row.mortality_count), culledCount: Number(row.culled_count), symptoms: row.symptoms ? JSON.parse(row.symptoms) : [], diagnosis: row.diagnosis, treatmentGiven: row.treatment_given, medicationCost: row.medication_cost ? Number(row.medication_cost) : undefined, vetNotes: row.vet_notes, recordedBy: row.recorded_by, synced: true })));
    setTransactions(financeRows.data.map((row: any): FinancialTransaction => ({ id: row.id, date: String(row.transaction_date).slice(0, 10), type: row.transaction_type, category: row.category, description: row.description, amount: Number(row.amount), recordedBy: 'Sistem', synced: true })));
    setOrg((previous) => ({ ...previous, members: memberRows.data.map((row: any): User => ({ id: row.id, name: row.full_name, email: row.email, role: row.role, phone: row.phone || undefined, status: row.status, assignedHouseIds: row.assigned_house_ids ? String(row.assigned_house_ids).split(',') : [], assignedHouseNames: row.assigned_house_names ? String(row.assigned_house_names).split('|') : [], avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(row.full_name)}&background=059669&color=fff` })) }));
    if (estimate.data) setEggEstimate(estimate.data);
    if (feedCost.data) setDailyFeedCost(feedCost.data);
    if (farmProfile.data) setOrg((previous) => ({ ...previous, name: farmProfile.data.name, plan: farmProfile.data.subscription_plan || previous.plan, status: farmProfile.data.subscription_status === 'trialing' ? 'trial' : farmProfile.data.subscription_status === 'active' ? 'active' : 'expired', ownerName: farmProfile.data.owner_name, city: farmProfile.data.city, address: farmProfile.data.address || '', logoData: farmProfile.data.logo_data || undefined, subscriptionStatus: farmProfile.data.subscription_status, trialEndsAt: farmProfile.data.trial_ends_at, subscriptionEndsAt: farmProfile.data.subscription_ends_at, nextBillingDate: farmProfile.data.subscription_ends_at ? String(farmProfile.data.subscription_ends_at).slice(0, 10) : previous.nextBillingDate }));
  };

  useEffect(() => {
    if (dataMode !== 'real' || !authenticatedUserId) return;
    loadMySQLData().catch((err) => showToast(`Gagal memuat MySQL: ${err.message}`));
  }, [dataMode, authenticatedUserId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshFeedsFromMySQL = async () => {
    const result = await ApiService.getFeeds();
    if (!result.data) throw new Error(result.error || 'Gagal memuat stok pakan.');
    setFeeds(result.data.map((row: any): FeedItem => ({ id: row.id, name: row.feed_name, brand: row.feed_name, type: row.feed_type, currentStockKg: Number(row.current_stock_kg), minThresholdKg: Number(row.min_threshold_kg), pricePerKg: Number(row.price_per_kg), unit: 'kg' })));
  };

  // Toggle between Demo Data vs Real Data Mode
  const handleToggleDataMode = () => {
    const nextMode = dataMode === 'demo' ? 'real' : 'demo';
    StorageService.setDataMode(nextMode);
    setDataMode(nextMode);

    // Reload all data arrays from StorageService according to active mode
    setCoops(StorageService.getCoops());
    setFeeds(StorageService.getFeeds());
    setProductionLogs(StorageService.getProductionLogs());
    setVaccinations(StorageService.getVaccinations());
    setHealthLogs(StorageService.getHealthLogs());
    setTransactions(StorageService.getTransactions());
    setNotifications(StorageService.getNotifications());

    showToast(
      nextMode === 'real'
        ? '🟢 Mode Data Riil Aktif — Seluruh data murni dari input Anda (0 Dummy)'
        : '🧪 Mode Demo Aktif — Menampilkan data simulasi/contoh'
    );
  };

  const handleLogout = async () => {
    await ApiService.logout();
    localStorage.removeItem('chicksync_current_user');
    setAuthenticatedUserId(null);
    setViewMode('landing');
    setIsGuestDemo(false);
    showToast('Sesi telah diakhiri.');
  };

  // Restore a valid server session after a browser refresh. Client storage is
  // never treated as proof of login; the HttpOnly cookie is the authority.
  useEffect(() => {
    ApiService.getSession().then((session) => {
      if (!session.authenticated || !session.user) return;
      const user: User = {
        ...session.user,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name)}&background=059669&color=fff`
      };
      StorageService.setDataMode('real');
      StorageService.setCurrentUser(user);
      setCurrentUser(user);
      setDataMode('real');
      setAuthenticatedUserId(user.id);
      setIsGuestDemo(false);
      setViewMode('app');
      if (new URLSearchParams(window.location.search).get('payment') === 'finish') setActiveTab('billing');
    }).catch(() => undefined).finally(() => setIsSessionChecking(false));
  }, []);

  // Enforce worker role tab constraint
  useEffect(() => {
    if (currentUser.role === 'worker' && activeTab !== 'production') {
      setActiveTab('production');
    }
  }, [currentUser.role, activeTab]);

  // Coop Management Handlers
  const handleAddCoop = async (newCoop: Omit<Coop, 'id' | 'orgId'>) => {
    if (dataMode === 'real') {
      await ApiService.createHouse({
        name: newCoop.name,
        code: newCoop.code,
        chickenType: newCoop.breed,
        initialChickens: newCoop.capacity,
        currentChickens: newCoop.currentChickens,
        ageWeeks: newCoop.ageWeeks,
        entryDate: newCoop.entryDate,
        housingType: newCoop.housingType,
        status: newCoop.status
      });
      await loadMySQLData();
      showToast(`Kandang '${newCoop.name}' tersimpan di MySQL.`);
      return;
    }
    const coopObj: Coop = {
      ...newCoop,
      id: `coop-${Date.now()}`,
      orgId: org.id
    };
    const updated = [coopObj, ...coops];
    setCoops(updated);
    StorageService.saveCoops(updated);
    showToast(`Kandang baru '${coopObj.name}' berhasil ditambahkan!`);
  };

  const handleUpdateCoop = async (updatedCoop: Coop) => {
    if (dataMode === 'real') {
      await ApiService.updateHouse(updatedCoop.id, updatedCoop);
      await loadMySQLData();
      showToast(`Data kandang '${updatedCoop.code}' diperbarui di MySQL.`);
      return;
    }
    const updated = coops.map(c => c.id === updatedCoop.id ? updatedCoop : c);
    setCoops(updated);
    StorageService.saveCoops(updated);
    showToast(`Data kandang '${updatedCoop.code}' berhasil diperbarui.`);
  };

  const handleDeleteCoop = async (coop: Coop) => {
    if (dataMode === 'real') {
      await ApiService.deleteHouse(coop.id);
      await loadMySQLData();
      showToast(`Kandang '${coop.code}' dan populasinya berhasil dihapus.`);
      return;
    }
    StorageService.deleteCoopData(coop.id);
    setCoops(StorageService.getCoops());
    setProductionLogs(StorageService.getProductionLogs());
    setVaccinations(StorageService.getVaccinations());
    setHealthLogs(StorageService.getHealthLogs());
    showToast(`Kandang '${coop.code}' dan populasinya berhasil dihapus.`);
  };

  // Egg Production Logger
  const handleAddEggLog = async (log: Omit<EggProductionLog, 'id' | 'henDayRate' | 'synced'>) => {
    if (dataMode === 'real') {
      const result = await ApiService.createHarvest({ houseId: log.coopId, harvestDate: log.date, timeSlot: log.timeSlot, goodEggsCount: log.goodEggs, damagedEggsCount: log.brokenEggs, weightKg: log.totalWeightKg, deathCount: log.mortalityCount || 0, feedKg: log.feedUsageKg || 0, recordedBy: log.recordedBy, notes: log.notes });
      if (!result?.data) throw new Error(result?.error || 'Gagal menyimpan panen');
      await loadMySQLData();
      showToast('Panen telur tersimpan di MySQL.');
      return;
    }
    const newLog = StorageService.addProductionLog(log);
    setProductionLogs(StorageService.getProductionLogs());
    setSyncStatus(StorageService.getSyncStatus());
    showToast(`Panen Telur ${newLog.totalEggs} Butir (${newLog.henDayRate}% HDP) berhasil dicatat!`);
  };

  const handleUpdateEggLog = async (log: EggProductionLog) => {
    if (dataMode === 'real') {
      await ApiService.updateHarvest(log.id, { houseId: log.coopId, harvestDate: log.date, timeSlot: log.timeSlot, goodEggsCount: log.goodEggs, damagedEggsCount: log.brokenEggs, weightKg: log.totalWeightKg, deathCount: log.mortalityCount || 0, feedKg: log.feedUsageKg || 0, recordedBy: log.recordedBy, notes: log.notes });
      await loadMySQLData();
      showToast('Data produksi berhasil diperbarui di MySQL.');
      return;
    }
    const coop = coops.find(item => item.id === log.coopId);
    const totalEggs = log.goodEggs + log.brokenEggs;
    StorageService.updateProductionLog({ ...log, totalEggs, henDayRate: coop?.currentChickens ? Number(((log.goodEggs / coop.currentChickens) * 100).toFixed(2)) : 0 });
    setProductionLogs(StorageService.getProductionLogs());
    showToast('Data produksi berhasil diperbarui.');
  };

  const handleDeleteEggLog = async (id: string) => {
    if (dataMode === 'real') {
      await ApiService.deleteHarvest(id);
      await loadMySQLData();
      showToast('Data produksi berhasil dihapus dari MySQL.');
      return;
    }
    StorageService.deleteProductionLog(id);
    setProductionLogs(StorageService.getProductionLogs());
    showToast('Data produksi berhasil dihapus.');
  };

  // Feed Stock Restock
  const handleUpdateFeedStock = async (feedId: string, additionalKg: number) => {
    if (dataMode === 'real') {
      await ApiService.adjustFeedStock(feedId, additionalKg);
      await refreshFeedsFromMySQL();
      showToast(`Stok pakan tersimpan di MySQL (${additionalKg > 0 ? '+' : ''}${additionalKg} kg).`);
      return;
    }
    const updated = feeds.map(f => {
      if (f.id === feedId) {
        return { ...f, currentStockKg: f.currentStockKg + additionalKg };
      }
      return f;
    });
    setFeeds(updated);
    StorageService.saveFeeds(updated);
    showToast(`Stok pakan berhasil ditambah +${additionalKg} kg.`);
  };

  // Vaccination Handlers
  const handleAddVaccination = async (task: Omit<VaccinationTask, 'id'>) => {
    if (dataMode === 'real') {
      await ApiService.createVaccination(task);
      await loadMySQLData();
      showToast(`Jadwal vaksinasi ${task.vaccineName} tersimpan di MySQL.`);
      return;
    }
    const newTask = StorageService.addVaccination(task);
    setVaccinations(StorageService.getVaccinations());
    showToast(`Jadwal vaksinasi ${newTask.vaccineName} disimpan!`);
  };

  const handleCompleteVaccination = async (id: string, vetName: string) => {
    if (dataMode === 'real') {
      await ApiService.completeVaccination(id, vetName);
      await loadMySQLData();
      showToast(`Vaksinasi ditandai selesai oleh ${vetName}.`);
      return;
    }
    const updated = vaccinations.map(v => {
      if (v.id === id) {
        return {
          ...v,
          status: 'completed' as const,
          completedDate: getLocalDateInputValue(),
          completedBy: vetName
        };
      }
      return v;
    });
    setVaccinations(updated);
    StorageService.saveVaccinations(updated);
    showToast(`Vaksinasi ditandai selesai oleh ${vetName}`);
  };

  // Health Log Handler
  const handleAddHealthLog = async (log: Omit<HealthLog, 'id' | 'synced'>) => {
    if (dataMode === 'real') {
      await ApiService.createHealthLog(log);
      await loadMySQLData();
      showToast('Catatan kesehatan tersimpan di MySQL.');
      return;
    }
    StorageService.addHealthLog(log);
    setHealthLogs(StorageService.getHealthLogs());
    setCoops(StorageService.getCoops());
    setSyncStatus(StorageService.getSyncStatus());
    showToast(`Catatan kesehatan disimpan. Populasi kandang diperbarui.`);
  };

  // Transaction Handler
  const handleAddTransaction = async (tx: Omit<FinancialTransaction, 'id' | 'synced'>) => {
    if (dataMode === 'real') {
      await ApiService.createFinance(tx);
      await loadMySQLData();
      showToast('Transaksi tersimpan di MySQL.');
      return;
    }
    const newTx = StorageService.addTransaction(tx);
    setTransactions(StorageService.getTransactions());
    setSyncStatus(StorageService.getSyncStatus());
    showToast(`Transaksi ${newTx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'} Rp ${newTx.amount.toLocaleString('id-ID')} disimpan.`);
  };

  // Org Invite Member Handler
  const handleInviteUser = async (newUser: Omit<User, 'id'> & { password: string }) => {
    if (dataMode === 'real') {
      await ApiService.inviteMember(newUser);
      await loadMySQLData();
      showToast(`Akun ${newUser.name} berhasil ditambahkan dan langsung aktif.`);
      return;
    }
    const { password: _password, ...safeUser } = newUser;
    const userObj: User = { ...safeUser, id: `user-${Date.now()}`, status: 'active' };
    const updatedOrg = {
      ...org,
      members: [...org.members, userObj]
    };
    setOrg(updatedOrg);
    StorageService.saveOrg(updatedOrg);
    showToast(`Anggota ${userObj.name} (${userObj.role}) berhasil ditambahkan.`);
  };

  const handleUpdateMemberAccount = async (id: string, data: { name: string; email: string; password?: string }) => {
    if (dataMode === 'real') {
      await ApiService.updateMemberAccount(id, data);
      await loadMySQLData();
      showToast('Akun downline diperbarui di MySQL.');
      return;
    }
    const updatedOrg = { ...org, members: org.members.map((member) => member.id === id ? { ...member, name: data.name, email: data.email } : member) };
    setOrg(updatedOrg);
    StorageService.saveOrg(updatedOrg);
  };

  const handleDeleteMember = async (member: User) => {
    if (member.role === 'owner') throw new Error('Akun owner tidak dapat dihapus.');
    if (dataMode === 'real') {
      await ApiService.deleteMember(member.id);
      await loadMySQLData();
      showToast(`Akun ${member.name} berhasil dihapus.`);
      return;
    }
    const updatedOrg = { ...org, members: org.members.filter((item) => item.id !== member.id) };
    setOrg(updatedOrg);
    StorageService.saveOrg(updatedOrg);
    showToast(`Akun ${member.name} berhasil dihapus.`);
  };

  const handleAssignHouseWorker = async (houseId: string, workerId: string | null) => {
    if (dataMode !== 'real') return;
    await ApiService.assignHouseWorker(houseId, workerId);
    await loadMySQLData();
    showToast(workerId ? 'Worker kandang tersimpan di MySQL.' : 'Worker kandang dilepas.');
  };

  const handleUpdateFarmProfile = async (data: { name: string; ownerName: string; city: string; address: string; logoData: string | null }) => {
    const result = await ApiService.updateFarmProfile(data);
    setOrg((previous) => {
      const updated = { ...previous, name: result.data.name, ownerName: result.data.ownerName, city: result.data.city, address: result.data.address, logoData: result.data.logoData || undefined };
      StorageService.saveOrg(updated);
      return updated;
    });
    showToast('Profil farm tersimpan di MySQL.');
  };

  const handleUpdateEggPrice = async (pricePerKg: number) => {
    await ApiService.updateEggPrice(pricePerKg);
    const estimate = await ApiService.getEggEstimate();
    if (estimate.data) setEggEstimate(estimate.data);
    showToast('Harga telur hari ini tersimpan di MySQL.');
  };

  const handleUpdateFeedPrice = async (feedId: string, pricePerKg: number) => {
    await ApiService.updateFeedPrice(feedId, pricePerKg);
    await loadMySQLData();
    showToast('Harga bahan pakan tersimpan di MySQL.');
  };

  // Subscription Upgrade Handler
  const handleUpdatePlan = (newPlan: SubscriptionPlan, subscriptionEndsAt?: string | null) => {
    const updatedOrg = {
      ...org,
      plan: newPlan,
      status: 'active' as const,
      subscriptionStatus: 'active',
      subscriptionEndsAt: subscriptionEndsAt || org.subscriptionEndsAt,
      nextBillingDate: subscriptionEndsAt ? String(subscriptionEndsAt).slice(0, 10) : org.nextBillingDate
    };
    setOrg(updatedOrg);
    StorageService.saveOrg(updatedOrg);
    showToast(`Selamat! Paket ditingkatkan ke Plan ${newPlan.toUpperCase()}`);
  };

  // Force Sync Handler
  const handleForceSync = async () => {
    showToast(`Menghubungkan ke Cloud... Enkripsi AES-256 diproses.`);
    const result = await StorageService.forceSyncNow();
    setSyncStatus(StorageService.getSyncStatus());
    setProductionLogs(StorageService.getProductionLogs());
    setHealthLogs(StorageService.getHealthLogs());
    setTransactions(StorageService.getTransactions());
    showToast(`Sinkronisasi selesai! ${result.syncedItems} catatan terenkripsi disinkron.`);
  };

  // Read Notif
  const handleMarkNotifRead = (id: string) => {
    StorageService.markNotificationRead(id);
    setNotifications(StorageService.getNotifications());
  };

  const pendingVaccinesCount = vaccinations.filter(v => v.status === 'scheduled' || v.status === 'overdue').length;
  const lowStockCount = feeds.filter(f => f.currentStockKg <= f.minThresholdKg).length;

  if (isSessionChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm font-medium text-slate-600">
        Memulihkan sesi...
      </div>
    );
  }

  if (viewMode === 'landing') {
    return (
      <LandingPage 
        onOpenApp={(portalType, userData) => {
          const guestDemo = !userData;
          setIsGuestDemo(guestDemo);
          StorageService.setDataMode(guestDemo ? 'demo' : 'real');
          setDataMode(guestDemo ? 'demo' : 'real');
          if (userData) {
            const user: User = { ...userData, avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=059669&color=fff` };
            setCurrentUser(user);
            StorageService.setCurrentUser(user);
            setAuthenticatedUserId(user.id);
          } else {
            setAuthenticatedUserId(null);
          }
          setViewMode('app');
          if (portalType === 'saas_owner') {
            setActiveTab('saas_owner');
          } else {
            setActiveTab('dashboard');
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        org={org}
        currentUser={currentUser}
        syncStatus={syncStatus}
        onForceSync={handleForceSync}
        notifications={notifications}
        onOpenNotifications={() => setIsNotifDrawerOpen(true)}
        onOpenBillingModal={() => setActiveTab('billing')}
        onGoToLanding={() => setViewMode('landing')}
        onOpenProfile={() => setActiveTab('profile')}
        onLogout={handleLogout}
      />

      {/* Main Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingVaccinesCount={pendingVaccinesCount}
          lowStockCount={lowStockCount}
          currentUser={currentUser}
          showDemoMode={isGuestDemo}
        />

        {/* Content View Area */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          
          {/* Active Real Data Banner Notice */}
          {false && dataMode === 'real' && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-950 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-emerald-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-xl shrink-0">
                  🟢
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm tracking-wide text-white">Mode Data Riil (Peternakan Saya)</h3>
                    <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                      Murni Input User (0 Dummy)
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200 mt-0.5">
                    Seluruh angka, grafik, FCR, dan laporan di bawah ini murni bersumber dari data yang Anda masukkan sendiri.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                <button
                  onClick={() => {
                    if (confirm('Apakah Anda yakin ingin menghapus seluruh data riil yang pernah Anda input?')) {
                      StorageService.clearRealData();
                      setCoops([]);
                      setFeeds([]);
                      setProductionLogs([]);
                      setVaccinations([]);
                      setHealthLogs([]);
                      setTransactions([]);
                      showToast('Data Riil berhasil direset ke 0.');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-200 text-xs font-semibold transition cursor-pointer border border-emerald-700"
                >
                  🗑️ Reset Data
                </button>
                <button
                  onClick={handleToggleDataMode}
                  className="px-3 py-1.5 rounded-lg bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  🧪 Beralih ke Mode Demo
                </button>
              </div>
            </div>
          )}
          {activeTab === 'dashboard' && (
            <OverviewDashboard
              coops={coops}
              productionLogs={productionLogs}
              feeds={feeds}
              vaccinations={vaccinations}
              healthLogs={healthLogs}
              transactions={transactions}
              eggEstimate={eggEstimate}
              dailyFeedCost={dailyFeedCost}
              currentUser={currentUser}
              onNavigate={setActiveTab}
              onQuickAddEgg={() => setActiveTab('production')}
              onQuickAddExpense={() => setActiveTab('finance')}
            />
          )}

          {activeTab === 'coops' && (
            <CoopList
              coops={coops}
              onAddCoop={handleAddCoop}
              onUpdateCoop={handleUpdateCoop}
              onDeleteCoop={handleDeleteCoop}
              currentUser={currentUser}
              eggEstimate={eggEstimate}
              onUpdateEggPrice={handleUpdateEggPrice}
            />
          )}

          {activeTab === 'production' && (
            <EggProductionModule
              coops={coops}
              productionLogs={productionLogs}
              onAddLog={handleAddEggLog}
              onUpdateLog={handleUpdateEggLog}
              onDeleteLog={handleDeleteEggLog}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'feed' && (
            <FeedManagementModule
              feeds={feeds}
              coops={coops}
              onUpdateFeedStock={handleUpdateFeedStock}
              onCompositionSaved={loadMySQLData}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'health' && (
            <HealthVaccinationModule
              coops={coops}
              vaccinations={vaccinations}
              healthLogs={healthLogs}
              onAddVaccination={handleAddVaccination}
              onCompleteVaccination={handleCompleteVaccination}
              onAddHealthLog={handleAddHealthLog}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'finance' && (
            <FinancialModule
              transactions={transactions}
              coops={coops}
              onAddTransaction={handleAddTransaction}
              currentUser={currentUser}
              eggEstimate={eggEstimate}
              onUpdateEggPrice={handleUpdateEggPrice}
              dailyFeedCost={dailyFeedCost}
              onUpdateFeedPrice={handleUpdateFeedPrice}
            />
          )}

          {activeTab === 'reports' && (
            <PdfExportModule
              org={org}
              coops={coops}
              productionLogs={productionLogs}
              transactions={transactions}
            />
          )}

          {activeTab === 'roles' && (
            <OrgRoleManagement
              org={org}
              coops={coops}
              currentUser={currentUser}
              onInviteUser={handleInviteUser}
              onUpdateMemberAccount={handleUpdateMemberAccount}
              onDeleteMember={handleDeleteMember}
              onAssignHouseWorker={handleAssignHouseWorker}
            />
          )}

          {activeTab === 'profile' && currentUser.role === 'owner' && (
            <FarmProfile org={org} onUpdateProfile={handleUpdateFarmProfile} />
          )}

          {activeTab === 'billing' && (
            <SubscriptionBilling
              org={org}
              onUpdatePlan={handleUpdatePlan}
            />
          )}

          {activeTab === 'security' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Keamanan dan Pencadangan Data</h2>
              <p className="text-xs text-slate-500 mb-4">
                Pengaturan perlindungan data dan sinkronisasi perangkat.
              </p>
              <button
                onClick={() => setIsSecurityModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
              >
                Buka Panel Keamanan
              </button>
            </div>
          )}

          {activeTab === 'flutter_mobile' && (
            <FlutterMobileStudio />
          )}

          {activeTab === 'saas_owner' && (
            currentUser.role === 'owner' ? (
              <SaaSOwnerDashboard />
            ) : (
              <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-black">
                  🔒
                </div>
                <h3 className="text-lg font-bold text-slate-900">Akses Dibatasi</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Halaman Admin Platform hanya dapat diakses oleh pengguna dengan role <strong>Owner</strong>.
                </p>
              </div>
            )
          )}
        </main>

      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl font-semibold text-xs flex items-center gap-2 animate-bounce border border-slate-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Security & Sync Modal */}
      <E2EEAndSyncModal
        org={org}
        syncStatus={syncStatus}
        onUpdateSyncStatus={(st) => {
          setSyncStatus(st);
          StorageService.saveSyncStatus(st);
        }}
        onForceSync={handleForceSync}
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />

      {/* MySQL Inspector Modal */}
      <MySQLInspectorModal
        isOpen={isMySQLModalOpen}
        onClose={() => setIsMySQLModalOpen(false)}
      />

      {/* Notifications Drawer */}
      <NotificationDrawer
        notifications={notifications}
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        onMarkRead={handleMarkNotifRead}
        onNavigate={setActiveTab}
      />

    </div>
  );
}
