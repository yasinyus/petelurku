// API Service client for ChickSync Express + MySQL Backend

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  database: {
    engine: string;
    status: 'connected' | 'simulated_fallback' | string;
    host: string;
    dbName: string;
    message: string;
  };
}

export const ApiService = {
  // Check MySQL Database Health Status
  getHealthStatus: async (): Promise<HealthCheckResponse> => {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('Health check response not OK');
      return await res.json();
    } catch (err: any) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: {
          engine: 'MySQL 8.0 / MariaDB',
          status: 'simulated_fallback',
          host: 'localhost',
          dbName: 'chicksync_db',
          message: 'Express Backend / API active with fallback memory store.'
        }
      };
    }
  },

  // Get raw MySQL Database Schema SQL
  getMySQLSchemaSQL: async (): Promise<string> => {
    try {
      const res = await fetch('/api/mysql/schema');
      if (!res.ok) throw new Error('Failed to fetch SQL schema');
      return await res.text();
    } catch (err: any) {
      return `-- Error loading schema file: ${err.message}`;
    }
  },

  // Trigger Data Migration for SaaS Owner & Seed Data
  runMigration: async () => {
    try {
      const res = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        message: 'Network error triggering migration'
      };
    }
  },

  // Authenticate / Login User
  login: async (email: string, password?: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  register: async (data: { fullName: string; email: string; password: string; farmName: string; city: string; selectedPlan: string }) => {
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return res.json();
  },

  resendVerification: async (email: string) => {
    const res = await fetch('/api/auth/resend-verification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    return res.json();
  },

  getSession: async () => {
    const res = await fetch('/api/auth/session');
    return res.ok ? res.json() : { authenticated: false };
  },

  logout: async () => {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    if (!res.ok) throw new Error('Gagal mengakhiri sesi');
    return res.json();
  },

  createSubscriptionCheckout: async (planId: 'basic' | 'pro' | 'enterprise', billingCycle: 'monthly' | 'annual') => {
    const res = await fetch('/api/subscriptions/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, billingCycle })
    });
    const payload = await res.json().catch(() => ({ error: 'Respons pembayaran tidak valid.' }));
    if (!res.ok) throw new Error(payload.error || 'Gagal membuat pembayaran.');
    return payload as { success: true; orderId: string; redirectUrl: string; amount: number };
  },

  getSubscriptionStatus: async () => {
    const res = await fetch('/api/subscriptions/status');
    const payload = await res.json().catch(() => ({ error: 'Respons status langganan tidak valid.' }));
    if (!res.ok) throw new Error(payload.error || 'Gagal memuat status langganan.');
    return payload;
  },

  getAdminDashboard: async () => {
    const res = await fetch('/api/admin/dashboard');
    const payload = await res.json().catch(() => ({ error: 'Respons dashboard admin tidak valid.' }));
    if (!res.ok) throw new Error(payload.error || 'Gagal memuat dashboard admin.');
    return payload;
  },

  updateAdminFarmStatus: async (farmId: string, status: 'active' | 'suspended') => {
    const res = await fetch(`/api/admin/farms/${farmId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    const payload = await res.json().catch(() => ({ error: 'Respons perubahan status tidak valid.' }));
    if (!res.ok) throw new Error(payload.error || 'Gagal mengubah status peternakan.');
    return payload;
  },

  // Fetch Farms from API
  getFarms: async () => {
    try {
      const res = await fetch('/api/farms');
      return await res.json();
    } catch (err) {
      console.warn('API fetch farms failed, falling back to client state');
      return { source: 'client_fallback', data: [] };
    }
  },

  getFarmProfile: async () => (await fetch('/api/farm-profile')).json(),
  updateFarmProfile: async (data: { name: string; ownerName: string; city: string; address: string; logoData: string | null }) => {
    const res = await fetch('/api/farm-profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const payload = await res.json().catch(() => ({ error: 'Server mengembalikan respons tidak valid.' }));
    if (!res.ok) throw new Error(payload.error || 'Gagal menyimpan profil farm');
    return payload;
  },

  // Create Farm via API
  createFarm: async (farmData: { name: string; ownerName: string; city: string; subscriptionPlan: string }) => {
    try {
      const res = await fetch('/api/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(farmData)
      });
      return await res.json();
    } catch (err) {
      console.error('API create farm error:', err);
      return null;
    }
  },

  // Fetch Egg Harvest Logs
  getHarvests: async () => {
    try {
      const res = await fetch('/api/harvests');
      return await res.json();
    } catch (err) {
      return { source: 'client_fallback', data: [] };
    }
  },

  // Record Egg Harvest Log
  createHarvest: async (harvestData: any) => {
    try {
      const res = await fetch('/api/harvests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(harvestData)
      });
      return await res.json();
    } catch (err) {
      console.error('API create harvest error:', err);
      return null;
    }
  }
  ,

  updateHarvest: async (id: string, harvestData: any) => {
    const res = await fetch(`/api/harvests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(harvestData)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Gagal memperbarui produksi');
    return result;
  },

  deleteHarvest: async (id: string) => {
    const res = await fetch(`/api/harvests/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Gagal menghapus produksi');
    return result;
  },

  getHouses: async () => (await fetch('/api/houses')).json(),
  getMembers: async () => (await fetch('/api/members')).json(),
  inviteMember: async (data: { name: string; email: string; role: string; phone?: string; password: string }) => {
    const res = await fetch('/api/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error((await res.json()).error || 'Gagal menyimpan anggota');
    return res.json();
  },
  updateMemberAccount: async (id: string, data: { name: string; email: string; password?: string }) => {
    const res = await fetch(`/api/members/${id}/account`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error((await res.json()).error || 'Gagal memperbarui akun anggota');
    return res.json();
  },
  deleteMember: async (id: string) => {
    const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
    const payload = await res.json().catch(() => ({ error: 'Server mengembalikan respons tidak valid.' }));
    if (!res.ok) throw new Error(payload.error || 'Gagal menghapus anggota');
    return payload;
  },
  assignHouseWorker: async (houseId: string, workerId: string | null) => {
    const res = await fetch(`/api/houses/${houseId}/worker`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workerId }) });
    if (!res.ok) throw new Error((await res.json()).error || 'Gagal menetapkan worker kandang');
    return res.json();
  },
  createHouse: async (data: any) => {
    const res = await fetch('/api/houses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error((await res.json()).error || 'Gagal menambahkan kandang');
    return res.json();
  },
  updateHouse: async (id: string, data: any) => {
    const res = await fetch(`/api/houses/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error((await res.json()).error || 'Gagal memperbarui kandang');
    return res.json();
  },
  deleteHouse: async (id: string) => {
    const res = await fetch(`/api/houses/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Gagal menghapus kandang');
    return result;
  },
  getFeeds: async () => (await fetch('/api/feeds')).json(),
  getFeedComposition: async () => (await fetch('/api/feed-composition')).json(),
  getFeedConsumptionSetting: async () => {
    const res = await fetch('/api/feed-consumption-setting');
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Gagal mengambil setelan pakan per ekor');
    return result;
  },
  saveFeedConsumptionSetting: async (gramsPerChicken: number) => {
    const res = await fetch('/api/feed-consumption-setting', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ gramsPerChicken }) });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Gagal menyimpan setelan pakan per ekor');
    return result;
  },
  getEggEstimate: async () => (await fetch('/api/finance/egg-estimate')).json(),
  getDailyFeedCost: async (date?: string) => (await fetch(`/api/finance/feed-cost${date ? `?date=${encodeURIComponent(date)}` : ''}`)).json(),
  updateFeedPrice: async (id: string, pricePerKg: number) => {
    const res = await fetch(`/api/feeds/${id}/price`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pricePerKg }) });
    if (!res.ok) throw new Error((await res.json()).error || 'Gagal memperbarui harga pakan');
    return res.json();
  },
  updateEggPrice: async (pricePerKg: number) => {
    const res = await fetch('/api/egg-price', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pricePerKg }) });
    if (!res.ok) throw new Error((await res.json()).error || 'Gagal menyimpan harga telur');
    return res.json();
  },
  saveFeedComposition: async (settings: Array<{ feedType: string; name: string; percentage: number; pricePerKg: number }>) => {
    const res = await fetch('/api/feed-composition', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settings }) });
    if (!res.ok) throw new Error((await res.json()).error || 'Gagal menyimpan komposisi pakan');
    return res.json();
  },
  getVaccinations: async () => (await fetch('/api/vaccinations')).json(),
  getHealthLogs: async () => (await fetch('/api/health-logs')).json(),
  getFinances: async () => (await fetch('/api/finances')).json(),

  restockFeed: async (id: string, amountKg: number) => {
    const res = await fetch(`/api/feeds/${id}/restock`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amountKg }) });
    if (!res.ok) throw new Error((await res.json()).error || 'Gagal memperbarui stok pakan');
    return res.json();
  },
  adjustFeedStock: async (id: string, changeKg: number) => {
    const res = await fetch(`/api/feeds/${id}/adjust-stock`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ changeKg }) });
    if (!res.ok) throw new Error((await res.json()).error || 'Gagal memperbarui stok pakan');
    return res.json();
  },
  createVaccination: async (data: any) => (await fetch('/api/vaccinations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })).json(),
  completeVaccination: async (id: string, vetName: string) => (await fetch(`/api/vaccinations/${id}/complete`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vetName }) })).json(),
  createHealthLog: async (data: any) => (await fetch('/api/health-logs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })).json(),
  createFinance: async (data: any) => (await fetch('/api/finances', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })).json()
};
