import { Coop, EggProductionLog, FeedItem, FeedLog, FinancialTransaction, HealthLog, NotificationItem, Organization, SyncStatus, User, VaccinationTask } from '../types';
import { INITIAL_COOPS, INITIAL_FEEDS, INITIAL_HEALTH_LOGS, INITIAL_NOTIFICATIONS, INITIAL_ORG, INITIAL_PRODUCTION, INITIAL_TRANSACTIONS, INITIAL_USERS, INITIAL_VACCINATIONS } from '../data/mockData';

const STORAGE_KEYS = {
  ORG: 'chicksync_org',
  COOPS: 'chicksync_coops',
  FEEDS: 'chicksync_feeds',
  PRODUCTION: 'chicksync_production',
  HEALTH: 'chicksync_health',
  VACCINATIONS: 'chicksync_vaccinations',
  TRANSACTIONS: 'chicksync_transactions',
  NOTIFICATIONS: 'chicksync_notifications',
  CURRENT_USER: 'chicksync_current_user',
  SYNC_STATUS: 'chicksync_sync_status',
  E2EE_KEY: 'chicksync_e2ee_key',
  PENDING_QUEUE: 'chicksync_pending_queue',
  DATA_MODE: 'chicksync_data_mode',
};

// Simple AES/Hex E2EE simulation helper
export const e2eeCipher = {
  encrypt: (data: any, key: string): string => {
    try {
      const jsonStr = JSON.stringify(data);
      // Simulating E2EE tag
      return `E2EE_ENC[${btoa(encodeURIComponent(jsonStr))}]_${key.substring(0, 6)}`;
    } catch {
      return JSON.stringify(data);
    }
  },
  decrypt: (cipherText: string): any => {
    try {
      if (cipherText.startsWith('E2EE_ENC[')) {
        const payload = cipherText.substring(9, cipherText.lastIndexOf(']'));
        return JSON.parse(decodeURIComponent(atob(payload)));
      }
      return JSON.parse(cipherText);
    } catch {
      return null;
    }
  }
};

export class StorageService {
  // Data Mode Management ('demo' | 'real')
  static getDataMode(): 'demo' | 'real' {
    const raw = localStorage.getItem(STORAGE_KEYS.DATA_MODE);
    return raw === 'demo' ? 'demo' : 'real';
  }

  static setDataMode(mode: 'demo' | 'real'): void {
    localStorage.setItem(STORAGE_KEYS.DATA_MODE, mode);
  }

  private static getKey(baseKey: string): string {
    const mode = this.getDataMode();
    return mode === 'real' ? `${baseKey}_real` : baseKey;
  }

  static clearRealData(): void {
    localStorage.removeItem(`${STORAGE_KEYS.COOPS}_real`);
    localStorage.removeItem(`${STORAGE_KEYS.FEEDS}_real`);
    localStorage.removeItem(`${STORAGE_KEYS.PRODUCTION}_real`);
    localStorage.removeItem(`${STORAGE_KEYS.HEALTH}_real`);
    localStorage.removeItem(`${STORAGE_KEYS.VACCINATIONS}_real`);
    localStorage.removeItem(`${STORAGE_KEYS.TRANSACTIONS}_real`);
    localStorage.removeItem(`${STORAGE_KEYS.NOTIFICATIONS}_real`);
  }

  // Load state or fallback to defaults
  static getOrg(): Organization {
    const raw = localStorage.getItem(STORAGE_KEYS.ORG);
    return raw ? JSON.parse(raw) : INITIAL_ORG;
  }

  static saveOrg(org: Organization): void {
    localStorage.setItem(STORAGE_KEYS.ORG, JSON.stringify(org));
    this.triggerSyncEvent();
  }

  static getCurrentUser(): User {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : INITIAL_USERS[0]; // Default: Owner
  }

  static setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  static getCoops(): Coop[] {
    const mode = this.getDataMode();
    const key = this.getKey(STORAGE_KEYS.COOPS);
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    return mode === 'real' ? [] : INITIAL_COOPS;
  }

  static saveCoops(coops: Coop[]): void {
    const key = this.getKey(STORAGE_KEYS.COOPS);
    localStorage.setItem(key, JSON.stringify(coops));
    this.triggerSyncEvent();
  }

  static deleteCoopData(id: string): void {
    this.saveCoops(this.getCoops().filter(coop => coop.id !== id));
    localStorage.setItem(this.getKey(STORAGE_KEYS.PRODUCTION), JSON.stringify(this.getProductionLogs().filter(log => log.coopId !== id)));
    localStorage.setItem(this.getKey(STORAGE_KEYS.VACCINATIONS), JSON.stringify(this.getVaccinations().filter(task => task.coopId !== id)));
    localStorage.setItem(this.getKey(STORAGE_KEYS.HEALTH), JSON.stringify(this.getHealthLogs().filter(log => log.coopId !== id)));
    this.triggerSyncEvent();
  }

  static getFeeds(): FeedItem[] {
    const mode = this.getDataMode();
    const key = this.getKey(STORAGE_KEYS.FEEDS);
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    return mode === 'real' ? [] : INITIAL_FEEDS;
  }

  static saveFeeds(feeds: FeedItem[]): void {
    const key = this.getKey(STORAGE_KEYS.FEEDS);
    localStorage.setItem(key, JSON.stringify(feeds));
    this.triggerSyncEvent();
  }

  static getProductionLogs(): EggProductionLog[] {
    const mode = this.getDataMode();
    const key = this.getKey(STORAGE_KEYS.PRODUCTION);
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    return mode === 'real' ? [] : INITIAL_PRODUCTION;
  }

  static addProductionLog(log: Omit<EggProductionLog, 'id' | 'henDayRate' | 'synced'>): EggProductionLog {
    const logs = this.getProductionLogs();
    const coops = this.getCoops();
    const coop = coops.find(c => c.id === log.coopId);

    const totalEggs = log.goodEggs + log.brokenEggs;
    const currentChickens = coop ? coop.currentChickens : 2000;
    const henDayRate = currentChickens > 0 ? Number(((totalEggs / currentChickens) * 100).toFixed(1)) : 0;

    const isOnline = this.getSyncStatus().isOnline;

    const newLog: EggProductionLog = {
      ...log,
      id: `prod-${Date.now()}`,
      totalEggs,
      henDayRate,
      synced: isOnline
    };

    logs.unshift(newLog);
    const key = this.getKey(STORAGE_KEYS.PRODUCTION);
    localStorage.setItem(key, JSON.stringify(logs));

    // Send POST request to MySQL REST API backend
    fetch('/api/harvests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        houseId: log.coopId,
        harvestDate: log.date,
        timeSlot: log.timeSlot,
        goodEggsCount: log.goodEggs,
        damagedEggsCount: log.brokenEggs,
        deathCount: log.mortalityCount || 0,
        weightKg: log.totalWeightKg,
        recordedBy: log.recordedBy
      })
    }).catch(err => console.log('Backend sync offline/fallback active:', err.message));

    if (coop && (log.mortalityCount || 0) > 0) {
      coop.currentChickens = Math.max(0, coop.currentChickens - (log.mortalityCount || 0));
      this.saveCoops(coops);
    }

    if (!isOnline) {
      this.incrementPendingQueue();
    } else {
      this.triggerSyncEvent();
    }

    return newLog;
  }

  static updateProductionLog(updatedLog: EggProductionLog): void {
    const logs = this.getProductionLogs().map(log => log.id === updatedLog.id ? updatedLog : log);
    localStorage.setItem(this.getKey(STORAGE_KEYS.PRODUCTION), JSON.stringify(logs));
    this.triggerSyncEvent();
  }

  static deleteProductionLog(id: string): void {
    const logs = this.getProductionLogs().filter(log => log.id !== id);
    localStorage.setItem(this.getKey(STORAGE_KEYS.PRODUCTION), JSON.stringify(logs));
    this.triggerSyncEvent();
  }

  static getVaccinations(): VaccinationTask[] {
    const mode = this.getDataMode();
    const key = this.getKey(STORAGE_KEYS.VACCINATIONS);
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    return mode === 'real' ? [] : INITIAL_VACCINATIONS;
  }

  static saveVaccinations(tasks: VaccinationTask[]): void {
    const key = this.getKey(STORAGE_KEYS.VACCINATIONS);
    localStorage.setItem(key, JSON.stringify(tasks));
    this.triggerSyncEvent();
  }

  static addVaccination(task: Omit<VaccinationTask, 'id'>): VaccinationTask {
    const tasks = this.getVaccinations();
    const newTask: VaccinationTask = {
      ...task,
      id: `vac-${Date.now()}`
    };
    tasks.unshift(newTask);
    this.saveVaccinations(tasks);
    return newTask;
  }

  static getHealthLogs(): HealthLog[] {
    const mode = this.getDataMode();
    const key = this.getKey(STORAGE_KEYS.HEALTH);
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    return mode === 'real' ? [] : INITIAL_HEALTH_LOGS;
  }

  static addHealthLog(health: Omit<HealthLog, 'id' | 'synced'>): HealthLog {
    const logs = this.getHealthLogs();
    const isOnline = this.getSyncStatus().isOnline;
    const newLog: HealthLog = {
      ...health,
      id: `hl-${Date.now()}`,
      synced: isOnline
    };
    logs.unshift(newLog);
    const key = this.getKey(STORAGE_KEYS.HEALTH);
    localStorage.setItem(key, JSON.stringify(logs));

    // Automatically update coop live chicken numbers if mortality occurs!
    if (health.mortalityCount > 0 || health.culledCount > 0) {
      const coops = this.getCoops();
      const coopIndex = coops.findIndex(c => c.id === health.coopId);
      if (coopIndex !== -1) {
        coops[coopIndex].currentChickens = Math.max(0, coops[coopIndex].currentChickens - (health.mortalityCount + health.culledCount));
        this.saveCoops(coops);
      }
    }

    if (!isOnline) {
      this.incrementPendingQueue();
    } else {
      this.triggerSyncEvent();
    }
    return newLog;
  }

  static getTransactions(): FinancialTransaction[] {
    const mode = this.getDataMode();
    const key = this.getKey(STORAGE_KEYS.TRANSACTIONS);
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    return mode === 'real' ? [] : INITIAL_TRANSACTIONS;
  }

  static addTransaction(tx: Omit<FinancialTransaction, 'id' | 'synced'>): FinancialTransaction {
    const txs = this.getTransactions();
    const isOnline = this.getSyncStatus().isOnline;
    const newTx: FinancialTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      synced: isOnline
    };
    txs.unshift(newTx);
    const key = this.getKey(STORAGE_KEYS.TRANSACTIONS);
    localStorage.setItem(key, JSON.stringify(txs));

    if (!isOnline) {
      this.incrementPendingQueue();
    } else {
      this.triggerSyncEvent();
    }
    return newTx;
  }

  static getNotifications(): NotificationItem[] {
    const mode = this.getDataMode();
    const key = this.getKey(STORAGE_KEYS.NOTIFICATIONS);
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    return mode === 'real' ? [] : INITIAL_NOTIFICATIONS;
  }

  static saveNotifications(notifs: NotificationItem[]): void {
    const key = this.getKey(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.setItem(key, JSON.stringify(notifs));
  }

  static markNotificationRead(id: string): void {
    const notifs = this.getNotifications();
    const updated = notifs.map(n => n.id === id ? { ...n, isRead: true } : n);
    this.saveNotifications(updated);
  }

  // Sync state & connectivity
  static getSyncStatus(): SyncStatus {
    const raw = localStorage.getItem(STORAGE_KEYS.SYNC_STATUS);
    return raw ? JSON.parse(raw) : {
      isOnline: true,
      isSyncing: false,
      pendingQueueCount: 0,
      lastSyncedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      simulatedDeviceName: 'Kandang Master Tablet (Pos A1)'
    };
  }

  static saveSyncStatus(status: SyncStatus): void {
    localStorage.setItem(STORAGE_KEYS.SYNC_STATUS, JSON.stringify(status));
  }

  static incrementPendingQueue(): void {
    const status = this.getSyncStatus();
    status.pendingQueueCount += 1;
    this.saveSyncStatus(status);
  }

  static triggerSyncEvent(): void {
    const status = this.getSyncStatus();
    status.lastSyncedAt = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    this.saveSyncStatus(status);
  }

  static forceSyncNow(): Promise<{ success: boolean; syncedItems: number }> {
    return new Promise((resolve) => {
      const status = this.getSyncStatus();
      status.isSyncing = true;
      this.saveSyncStatus(status);

      setTimeout(() => {
        const count = status.pendingQueueCount;
        status.pendingQueueCount = 0;
        status.isSyncing = false;
        status.lastSyncedAt = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        this.saveSyncStatus(status);

        // Mark all items as synced
        const prods = this.getProductionLogs().map(p => ({ ...p, synced: true }));
        localStorage.setItem(STORAGE_KEYS.PRODUCTION, JSON.stringify(prods));

        const healths = this.getHealthLogs().map(h => ({ ...h, synced: true }));
        localStorage.setItem(STORAGE_KEYS.HEALTH, JSON.stringify(healths));

        const txs = this.getTransactions().map(t => ({ ...t, synced: true }));
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));

        resolve({ success: true, syncedItems: count || 3 });
      }, 1200);
    });
  }

  static resetToDemoData(): void {
    localStorage.setItem(STORAGE_KEYS.ORG, JSON.stringify(INITIAL_ORG));
    localStorage.setItem(STORAGE_KEYS.COOPS, JSON.stringify(INITIAL_COOPS));
    localStorage.setItem(STORAGE_KEYS.FEEDS, JSON.stringify(INITIAL_FEEDS));
    localStorage.setItem(STORAGE_KEYS.PRODUCTION, JSON.stringify(INITIAL_PRODUCTION));
    localStorage.setItem(STORAGE_KEYS.HEALTH, JSON.stringify(INITIAL_HEALTH_LOGS));
    localStorage.setItem(STORAGE_KEYS.VACCINATIONS, JSON.stringify(INITIAL_VACCINATIONS));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    this.saveSyncStatus({
      isOnline: true,
      isSyncing: false,
      pendingQueueCount: 0,
      lastSyncedAt: 'Baru saja',
      simulatedDeviceName: 'Kandang Master Tablet (Pos A1)'
    });
  }
}
