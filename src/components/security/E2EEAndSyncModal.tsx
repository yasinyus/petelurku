import React, { useState } from 'react';
import { ShieldCheck, Lock, RefreshCw, Wifi, WifiOff, Laptop, Smartphone, CheckCircle2, Key, Database } from 'lucide-react';
import { Organization, SyncStatus } from '../../types';
import { StorageService } from '../../services/storageService';

interface E2EEAndSyncModalProps {
  org: Organization;
  syncStatus: SyncStatus;
  onUpdateSyncStatus: (status: SyncStatus) => void;
  onForceSync: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const E2EEAndSyncModal: React.FC<E2EEAndSyncModalProps> = ({
  org,
  syncStatus,
  onUpdateSyncStatus,
  onForceSync,
  isOpen,
  onClose
}) => {
  const [simulatedDevice, setSimulatedDevice] = useState<string>(syncStatus.simulatedDeviceName);
  const [keyRotated, setKeyRotated] = useState(false);

  if (!isOpen) return null;

  const toggleOnlineMode = () => {
    const updated = {
      ...syncStatus,
      isOnline: !syncStatus.isOnline
    };
    onUpdateSyncStatus(updated);
  };

  const handleDeviceChange = (name: string) => {
    setSimulatedDevice(name);
    onUpdateSyncStatus({
      ...syncStatus,
      simulatedDeviceName: name
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5 text-xs text-slate-900">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Keamanan E2EE & Sinkronisasi Cloud</h3>
              <p className="text-[11px] text-slate-500">Enkripsi End-to-End AES-256 & Akses Lintas Perangkat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-base font-bold px-2 py-1 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* E2EE Info Box */}
        <div className="bg-slate-50 border border-emerald-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Enkripsi End-to-End Aktif
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">
              AES-256-GCM
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Semua catatan produksi telur, biaya pakan, dan rekam medis dienkripsi di perangkat sebelum dikirim ke Cloud storage.
          </p>
          <div className="text-[10px] text-slate-600 font-mono bg-white p-2 rounded border border-slate-200 truncate">
            Fingerprint Kunci: {org.e2eeFingerprint}
          </div>
        </div>

        {/* Connectivity & Sync Mode */}
        <div className="space-y-3 pt-2">
          <label className="block text-slate-700 font-bold">Mode Koneksi & Penguji Offline:</label>
          
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2">
              {syncStatus.isOnline ? (
                <Wifi className="w-4 h-4 text-emerald-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-amber-600" />
              )}
              <div>
                <div className="font-bold text-slate-900">
                  {syncStatus.isOnline ? 'Online (Real-time Cloud Sync)' : 'Mode Offline (Lokal Cache)'}
                </div>
                <div className="text-[10px] text-slate-500">
                  {syncStatus.pendingQueueCount > 0
                    ? `${syncStatus.pendingQueueCount} catatan pending tersimpan di IndexedDB`
                    : 'Semua data telah tersinkron sempurna'}
                </div>
              </div>
            </div>

            <button
              onClick={toggleOnlineMode}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                syncStatus.isOnline 
                  ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {syncStatus.isOnline ? 'Simulasi Offline' : 'Aktifkan Online'}
            </button>
          </div>
        </div>

        {/* Multi-Device Switcher Simulation */}
        <div className="space-y-3 pt-2">
          <label className="block text-slate-700 font-bold">Simulasi Perangkat Terhubung (Multi-Device):</label>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDeviceChange('Tablet Pos Kandang A1 (Android)')}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                simulatedDevice.includes('Tablet')
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <Smartphone className="w-4 h-4 mb-1 text-emerald-600" />
              <div>Tablet Pos Kandang A1</div>
              <div className="text-[10px] text-slate-500">Petugas Budi Santoso</div>
            </button>

            <button
              onClick={() => handleDeviceChange('Laptop Master H. Yasin (MacBook Pro)')}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                simulatedDevice.includes('Laptop')
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <Laptop className="w-4 h-4 mb-1 text-blue-600" />
              <div>Laptop Dashboard Master</div>
              <div className="text-[10px] text-slate-500">Owner H. Yasin Yusuf</div>
            </button>
          </div>
        </div>

        {/* Sync Trigger */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-slate-500 text-[11px]">Terakhir Sinkron: {syncStatus.lastSyncedAt}</span>
          <button
            onClick={() => {
              onForceSync();
              onClose();
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Sinkronkan Cloud Sekarang
          </button>
        </div>

      </div>
    </div>
  );
};
