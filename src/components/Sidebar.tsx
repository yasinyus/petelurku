import React from 'react';
import { 
  LayoutDashboard, 
  Home, 
  Egg, 
  Wheat, 
  Syringe, 
  DollarSign, 
  FileSpreadsheet, 
  Users, 
  CreditCard, 
  ShieldCheck,
  Building2,
  Smartphone,
  Crown,
  ChevronRight
} from 'lucide-react';

import { User } from '../types';

export type TabType = 
  | 'dashboard'
  | 'coops'
  | 'production'
  | 'feed'
  | 'health'
  | 'finance'
  | 'reports'
  | 'roles'
  | 'billing'
  | 'security'
  | 'flutter_mobile'
  | 'saas_owner'
  | 'profile';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  pendingVaccinesCount: number;
  lowStockCount: number;
  currentUser?: User;
  showDemoMode?: boolean;
  dataMode?: 'demo' | 'real';
  onToggleDataMode?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingVaccinesCount,
  lowStockCount,
  currentUser,
  showDemoMode = false,
  dataMode = 'demo',
  onToggleDataMode,
}) => {
  const isSaaSOwner = currentUser?.role === 'saas_owner';
  const isWorker = currentUser?.role === 'worker';

  const menuItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number | string; badgeColor?: string; saasOwnerOnly?: boolean }[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard Analisis', 
      icon: <LayoutDashboard className="w-4 h-4" /> 
    },
    { 
      id: 'coops', 
      label: 'Kandang & Populasi', 
      icon: <Home className="w-4 h-4" /> 
    },
    { 
      id: 'production', 
      label: 'Produksi Telur Harian', 
      icon: <Egg className="w-4 h-4" /> 
    },
    { 
      id: 'feed', 
      label: 'Stok & Pakan (FCR)', 
      icon: <Wheat className="w-4 h-4" />,
      badge: lowStockCount,
      badgeColor: 'bg-rose-500 text-white'
    },
    { 
      id: 'health', 
      label: 'Kesehatan & Vaksinasi', 
      icon: <Syringe className="w-4 h-4" />,
      badge: pendingVaccinesCount,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold'
    },
    { 
      id: 'finance', 
      label: 'Keuangan & Keuntungan', 
      icon: <DollarSign className="w-4 h-4" /> 
    },
    { 
      id: 'reports', 
      label: 'Ekspor Laporan PDF', 
      icon: <FileSpreadsheet className="w-4 h-4" /> 
    },
    { 
      id: 'roles', 
      label: 'Kelola Akses & Role', 
      icon: <Users className="w-4 h-4" /> 
    },
    { 
      id: 'billing', 
      label: 'Langganan', 
      icon: <CreditCard className="w-4 h-4" /> 
    },
    { 
      id: 'security', 
      label: 'Keamanan E2EE', 
      icon: <ShieldCheck className="w-4 h-4" /> 
    },
    { 
      id: 'flutter_mobile', 
      label: 'App Mobile Flutter', 
      icon: <Smartphone className="w-4 h-4 text-emerald-600" />,
      badge: 'NEW',
      badgeColor: 'bg-emerald-500 text-white font-bold',
      saasOwnerOnly: true
    },
    { 
      id: 'saas_owner', 
      label: 'Admin Platform', 
      icon: <Building2 className="w-4 h-4 text-emerald-600" />,
      badge: 'PRO',
      badgeColor: 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-200',
      saasOwnerOnly: true
    },
  ];

  const visibleMenuItems = menuItems.filter(item => {
    if (isSaaSOwner) return item.saasOwnerOnly === true;
    if (isWorker) {
      return item.id === 'production';
    }
    if (item.saasOwnerOnly) return false;
    return true;
  });

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 shrink-0 p-3 md:sticky md:top-[65px] md:h-[calc(100vh-65px)] md:overflow-y-auto md:self-start">
      {showDemoMode && (
        <div className="mb-4 p-2.5 rounded-xl border bg-indigo-50 border-indigo-200">
          <div className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">Mode Demo</div>
          <p className="text-[10px] text-indigo-700 mt-1">Data contoh untuk pengunjung. Login untuk melihat data peternakan Anda.</p>
        </div>
      )}
      
      {/* Mode Data Selector Banner */}
      {onToggleDataMode && (
        <div className="mb-4 p-2.5 rounded-xl border bg-slate-50 border-slate-200">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Sumber Data App</span>
            {dataMode === 'real' ? (
              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-black">REAL</span>
            ) : (
              <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-black">DEMO</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1 bg-slate-200/70 p-1 rounded-lg">
            <button
              onClick={() => dataMode !== 'demo' && onToggleDataMode()}
              className={`py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                dataMode === 'demo'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🧪 Demo Data
            </button>
            <button
              onClick={() => dataMode !== 'real' && onToggleDataMode()}
              className={`py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                dataMode === 'real'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🟢 Data Real
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5 leading-tight">
            {dataMode === 'real'
              ? '🟢 MURNI dari data input Anda sendiri (0 dummy).'
              : '🧪 Menggunakan data contoh/simulasi awal.'}
          </p>
        </div>
      )}

      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Navigasi Utama
        </div>
        {visibleMenuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-emerald-600' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge !== undefined && item.badge !== null && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${item.badgeColor || 'bg-slate-200 text-slate-800'}`}>
                    {item.badge}
                  </span>
                )}
                <ChevronRight className={`w-3.5 h-3.5 opacity-50 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Security Status Box */}
      <div className="mt-8 p-3 rounded-xl bg-slate-900 text-white border border-slate-800 text-xs shadow-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Keamanan Terjamin</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Data kandang dan transaksi dilindungi serta dicadangkan secara aman.
        </p>
      </div>
    </aside>
  );
};
