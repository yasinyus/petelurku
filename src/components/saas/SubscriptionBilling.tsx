import React, { useState } from 'react';
import { CreditCard, Zap, CheckCircle2, ShieldCheck, QrCode, ArrowRight, Download, Building2 } from 'lucide-react';
import { Organization, SubscriptionPlan } from '../../types';

interface SubscriptionBillingProps {
  org: Organization;
  onUpdatePlan: (plan: SubscriptionPlan) => void;
}

export const SubscriptionBilling: React.FC<SubscriptionBillingProps> = ({
  org,
  onUpdatePlan
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('pro');
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'bca_va' | 'mandiri_va'>('qris');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const isTrial = org.subscriptionStatus === 'trialing' || org.status === 'trial';
  const formatDate = (value?: string | null) => value ? new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-';
  const statusLabel = isTrial ? 'Trial' : org.subscriptionStatus === 'active' || org.status === 'active' ? 'Aktif' : org.subscriptionStatus || 'Tidak aktif';

  const plans: { id: SubscriptionPlan; name: string; price: string; rawPrice: number; features: string[]; isPopular?: boolean }[] = [
    {
      id: 'basic',
      name: 'Plan Basic',
      price: 'Rp 149.000',
      rawPrice: 149000,
      features: [
        'Maksimal 2 Kandang Active',
        '2 Akses Pengguna Staf',
        'Pencatatan Telur & Pakan',
        'Mode Offline & Cloud Sync',
        'Enkripsi E2EE AES-256'
      ]
    },
    {
      id: 'pro',
      name: 'Plan Pro Layer',
      price: 'Rp 399.000',
      rawPrice: 399000,
      isPopular: true,
      features: [
        'Maksimal 10 Kandang Active',
        '10 Akses Pengguna Staf',
        'Pengingat Vaksinasi Otomatis',
        'Kalkulator FCR & Stok Pakan',
        'Keuangan & Profit Real-Time',
        'Ekspor Laporan PDF Resmi'
      ]
    },
    {
      id: 'enterprise',
      name: 'Plan Enterprise',
      price: 'Rp 999.000',
      rawPrice: 999000,
      features: [
        'Kandang Tanpa Batas (Unlimited)',
        'Pengguna Staf Tanpa Batas',
        'Integrasi API Pihak Ketiga',
        'Dukungan Dokter Hewan Prioritas',
        'Backup Cloud Real-Time Multi-Region'
      ]
    }
  ];

  const handlePayNow = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      onUpdatePlan(selectedPlan);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase">
              Paket Saat Ini: {org.plan.toUpperCase()}
            </span>
            <span className="text-slate-500 text-xs">Status: <strong className={isTrial ? 'text-amber-700' : 'text-emerald-700'}>{statusLabel}</strong></span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            Langganan dan Pembayaran Otomatis
          </h2>
        </div>
        <div className="text-right">
          <div className="text-right"><span className={`${isTrial ? 'text-amber-700' : 'text-emerald-700'} font-bold text-xs flex items-center gap-1 justify-end`}><CheckCircle2 className="w-4 h-4" /> Status {statusLabel}</span><div className="text-sm text-slate-600 mt-1">{isTrial ? `Trial berakhir: ${formatDate(org.trialEndsAt)}` : `Langganan berakhir: ${formatDate(org.subscriptionEndsAt || org.nextBillingDate)}`}</div></div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => {
          const isCurrent = org.plan === p.id;

          return (
            <div
              key={p.id}
              className={`bg-white border rounded-2xl p-6 flex flex-col justify-between relative transition shadow-xs ${
                p.isPopular 
                  ? 'border-amber-500 ring-1 ring-amber-500' 
                  : 'border-slate-200'
              }`}
            >
              {p.isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
                  Paling Banyak Dipilih
                </span>
              )}

              <div>
                <h3 className="text-base font-bold text-slate-900">{p.name}</h3>
                <div className="text-2xl font-black text-slate-900 mt-2 mb-4">
                  {p.price} <span className="text-xs font-normal text-slate-500">/ bulan</span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700 pt-3 border-t border-slate-100">
                  {p.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed text-center"
                  >
                    Paket Aktif Anda saat Ini
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedPlan(p.id);
                      setPaymentSuccess(false);
                      setShowPaymentModal(true);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-4 h-4" />
                    Pilih & Upgrade Paket
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Gateway Simulator Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl text-slate-900">
            {!paymentSuccess ? (
              <>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Simulasi Integrasi Pembayaran Otomatis</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Midtrans / Xendit Payment Gateway Simulator (Callback Real-Time)
                </p>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-500">Paket Dipilih:</span>
                    <span className="font-bold text-amber-800 uppercase">{selectedPlan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Tagihan Bulanan:</span>
                    <span className="font-black text-slate-900 text-sm">
                      {plans.find(p => p.id === selectedPlan)?.price}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-6 text-xs">
                  <label className="block text-slate-700 font-semibold">Pilih Metode Pembayaran Otomatis:</label>
                  
                  <div 
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                      paymentMethod === 'qris' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold">QRIS Instant (Gopay, OVO, Dana, ShopeePay)</span>
                    </div>
                  </div>

                  <div 
                    onClick={() => setPaymentMethod('bca_va')}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                      paymentMethod === 'bca_va' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span className="font-bold">BCA Virtual Account (Auto-Detect)</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handlePayNow}
                    disabled={isProcessing}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <span>Memproses Pembayaran...</span>
                    ) : (
                      <>
                        <span>Bayar & Aktifkan Paket</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4 space-y-4 text-xs">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Pembayaran Berhasil!</h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Paket <strong className="text-amber-800 uppercase">{selectedPlan}</strong> telah diaktifkan untuk {org.name}.
                  </p>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Selesai & Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
