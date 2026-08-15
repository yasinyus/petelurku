import React from 'react';
import { 
  ShieldCheck, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Bell, 
  Building2, 
  Zap,
  LogOut,
  Egg
} from 'lucide-react';
import { NotificationItem, Organization, SyncStatus, User } from '../types';

interface NavbarProps {
  org: Organization;
  currentUser: User;
  syncStatus: SyncStatus;
  onForceSync: () => void;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  onOpenBillingModal: () => void;
  onGoToLanding?: () => void;
  dataMode?: 'demo' | 'real';
  onToggleDataMode?: () => void;
  onLogout?: () => void;
  onOpenProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  org,
  currentUser,
  syncStatus,
  onForceSync,
  notifications,
  onOpenNotifications,
  onOpenBillingModal,
  onGoToLanding,
  dataMode = 'demo',
  onToggleDataMode,
  onLogout,
  onOpenProfile,
}) => {
  const unreadNotifs = notifications.filter(n => !n.isRead).length;
  const isTrial = org.subscriptionStatus === 'trialing' || org.status === 'trial';
  const subscriptionStatus = isTrial ? 'Trial' : org.subscriptionStatus === 'active' || org.status === 'active' ? 'Aktif' : org.subscriptionStatus || 'Tidak Aktif';

  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-30 px-4 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand & Org */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onGoToLanding}
            className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-xl text-white shadow-sm hover:scale-105 transition cursor-pointer"
            title="Kembali ke Halaman Utama / Landing Page"
          >
            <Egg className="w-6 h-6" strokeWidth={2.5} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <button 
                onClick={onGoToLanding} 
                className="font-bold text-lg text-slate-900 tracking-tight hover:text-emerald-700 transition cursor-pointer text-left"
              >
                PetelurKu.com
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-medium text-slate-700 truncate max-w-[180px]">{org.name}</span>
              <button 
                onClick={onOpenBillingModal}
                className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 text-[10px] px-1.5 py-0.5 rounded-md font-medium flex items-center gap-1 transition cursor-pointer"
              >
                <Zap className="w-2.5 h-2.5 text-amber-600" />
                Plan {org.plan.toUpperCase()}
              </button>
            </div>
          </div>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-2 md:gap-3">

          {/* Mode Switcher: Demo vs Data Riil (Peternakan Saya) */}
          {onToggleDataMode && (
            dataMode === 'real' ? (
              <button
                onClick={onToggleDataMode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 transition cursor-pointer"
                title="Beralih ke Mode Demo / Contoh Data"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="hidden sm:inline">🟢 Data Riil (Peternakan Saya)</span>
                <span className="sm:hidden">🟢 Data Real</span>
              </button>
            ) : (
              <button
                onClick={onToggleDataMode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold text-xs transition cursor-pointer"
                title="Beralih ke Mode Data Riil (Murni Input User)"
              >
                <span>🧪 Mode Demo</span>
                <span className="hidden md:inline text-[10px] bg-indigo-200/80 text-indigo-900 px-1.5 py-0.5 rounded-md font-semibold">Switch ke Data Real</span>
              </button>
            )
          )}
          
          {/* Online/Offline & Real-Time Sync Indicator */}
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
            {syncStatus.isOnline ? (
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">Online</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden md:inline">Mode Offline</span>
              </span>
            )}

            <button
              onClick={onForceSync}
              disabled={syncStatus.isSyncing}
              className={`p-1 hover:bg-slate-200 rounded transition text-slate-600 hover:text-slate-900 cursor-pointer ${
                syncStatus.isSyncing ? 'animate-spin text-emerald-600' : ''
              }`}
              title="Sinkronkan Cloud Sekarang"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {syncStatus.pendingQueueCount > 0 && (
              <span className="bg-amber-500 text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                {syncStatus.pendingQueueCount} pending
              </span>
            )}
          </div>

          {/* Notifications Trigger */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition cursor-pointer"
            title="Notifikasi & Pengingat Vaksinasi"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {unreadNotifs}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-6 h-6 rounded-full object-cover border border-emerald-500" />
            <button onClick={onOpenProfile} className="hidden lg:block max-w-[120px] text-left cursor-pointer" title="Buka profil farm">
              <div className="font-semibold text-slate-800 leading-tight truncate">{currentUser.name}</div>
              <div className="text-[10px] text-emerald-700 capitalize font-medium">{currentUser.role}</div>
            </button>
            <div className="hidden xl:flex items-center gap-1.5 border-l border-slate-200 pl-2">
              <span className="rounded-md bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">PLAN {org.plan.toUpperCase()}</span>
              {isTrial ? (
                <button onClick={onOpenBillingModal} className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 cursor-pointer hover:bg-amber-200" title="Buka Langganan">STATUS: TRIAL</button>
              ) : (
                <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">STATUS: {subscriptionStatus.toUpperCase()}</span>
              )}
            </div>
            {onLogout && (
              <button onClick={onLogout} className="p-1 rounded text-rose-700 hover:bg-rose-100 cursor-pointer" title="Keluar dari aplikasi">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
