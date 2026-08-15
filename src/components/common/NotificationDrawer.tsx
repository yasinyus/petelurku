import React from 'react';
import { Bell, Syringe, AlertTriangle, CheckCircle2, RefreshCw, X } from 'lucide-react';
import { NotificationItem } from '../../types';
import { TabType } from '../Sidebar';

interface NotificationDrawerProps {
  notifications: NotificationItem[];
  isOpen: boolean;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onNavigate: (tab: TabType) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkRead,
  onNavigate
}) => {
  if (!isOpen) return null;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'vaccine': return <Syringe className="w-4 h-4 text-amber-600" />;
      case 'stock': return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'sync': return <RefreshCw className="w-4 h-4 text-emerald-600" />;
      default: return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-sm bg-white border-l border-slate-200 h-full p-5 shadow-xl flex flex-col justify-between z-10 text-xs">
        <div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Pusat Notifikasi & Pengingat</h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 max-h-[calc(100vh-120px)] overflow-y-auto pr-1">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                className={`p-3.5 rounded-xl border transition ${
                  notif.isRead 
                    ? 'bg-slate-50 border-slate-200 opacity-75' 
                    : 'bg-white border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">{getIcon(notif.type)}</div>
                  <div className="space-y-1 w-full">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{notif.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{notif.date.substring(11)}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{notif.message}</p>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      {notif.type === 'vaccine' && (
                        <button
                          onClick={() => {
                            onNavigate('health');
                            onClose();
                          }}
                          className="text-[10px] font-bold text-amber-700 hover:underline cursor-pointer"
                        >
                          Buka Jadwal Vaksin &rarr;
                        </button>
                      )}
                      {notif.type === 'stock' && (
                        <button
                          onClick={() => {
                            onNavigate('feed');
                            onClose();
                          }}
                          className="text-[10px] font-bold text-rose-700 hover:underline cursor-pointer"
                        >
                          Cek Stok Pakan &rarr;
                        </button>
                      )}

                      {!notif.isRead && (
                        <button
                          onClick={() => onMarkRead(notif.id)}
                          className="text-[10px] text-slate-400 hover:text-emerald-700 font-medium ml-auto cursor-pointer"
                        >
                          Tandai Dibaca
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500">
          Notifikasi Otomatis Terhubung ke Jadwal Kandang
        </div>
      </div>
    </div>
  );
};
