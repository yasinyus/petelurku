import React, { useEffect, useState } from 'react';
import { CreditCard, Zap, CheckCircle2, ArrowRight, MessageCircle } from 'lucide-react';
import { Organization, SubscriptionPlan } from '../../types';
import { ApiService } from '../../services/api';

interface SubscriptionBillingProps {
  org: Organization;
  onUpdatePlan: (plan: SubscriptionPlan, subscriptionEndsAt?: string | null) => void;
}

export const SubscriptionBilling: React.FC<SubscriptionBillingProps> = ({
  org,
  onUpdatePlan
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const isTrial = org.subscriptionStatus === 'trialing' || org.status === 'trial';
  const formatDate = (value?: string | null) => value ? new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';
  const statusLabel = isTrial ? 'Trial' : org.subscriptionStatus === 'active' || org.status === 'active' ? 'Aktif' : org.subscriptionStatus || 'Tidak aktif';

  useEffect(() => {
    const returningFromPayment = new URLSearchParams(window.location.search).get('payment') === 'finish';
    let attempts = 0;
    const checkStatus = async () => {
      attempts += 1;
      try {
        const result = await ApiService.getSubscriptionStatus();
        if (result.data?.payment_status === 'active') {
          onUpdatePlan(result.data.subscription_plan, result.data.expires_at || null);
          setPaymentSuccess(true);
          if (returningFromPayment) window.history.replaceState({}, '', window.location.pathname);
          return;
        }
        if (returningFromPayment && attempts < 10) window.setTimeout(checkStatus, 3000);
        else if (returningFromPayment) setPaymentError('Pembayaran masih menunggu konfirmasi. Muat ulang halaman ini beberapa saat lagi.');
      } catch (error: any) {
        setPaymentError(error.message || 'Status pembayaran belum dapat diperiksa.');
      }
    };
    checkStatus();
  }, []);

  const plans: { id: SubscriptionPlan; name: string; monthlyPrice: string; annualPrice: string; features: string[]; isPopular?: boolean }[] = [
    {
      id: 'basic',
      name: 'Plan Basic',
      monthlyPrice: 'Rp 49.000',
      annualPrice: 'Rp 490.000',
      features: [
        'Maksimal 2 kandang',
        '2 pengguna termasuk owner',
        'Dashboard hari ini & kemarin',
        'Produksi telur dan HDP',
        'Stok serta biaya pakan',
        'Kesehatan dan vaksinasi',
        'Keuangan dan untung rugi'
      ]
    },
    {
      id: 'pro',
      name: 'Plan Pro Layer',
      monthlyPrice: 'Rp 150.000',
      annualPrice: 'Rp 1.500.000',
      isPopular: true,
      features: [
        'Semua fitur Basic',
        'Maksimal 10 kandang',
        '10 pengguna termasuk owner',
        'Kelola akses dan petugas kandang',
        'Laporan produksi dan keuangan PDF',
        'Dashboard pendapatan dan biaya pakan'
      ]
    },
    {
      id: 'enterprise',
      name: 'Plan Bisnis',
      monthlyPrice: 'Rp 299.000',
      annualPrice: 'Rp 2.990.000',
      features: [
        'Semua fitur Pro',
        'Maksimal 30 kandang',
        'Maksimal 30 pengguna',
        'Laporan produksi dan keuangan PDF',
        'Kelola akses petugas per kandang',
        'Prioritas bantuan teknis'
      ]
    }
  ];

  const handlePayNow = async () => {
    setIsProcessing(true);
    setPaymentError('');
    try {
      const checkout = await ApiService.createSubscriptionCheckout(selectedPlan, billingCycle);
      window.location.assign(checkout.redirectUrl);
    } catch (error: any) {
      setIsProcessing(false);
      setPaymentError(error.message || 'Pembayaran belum dapat dibuat.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase">
              Paket Saat Ini: {org.plan.toUpperCase()}
            </span>
            <span className="text-slate-500 text-xs">Status: <strong className={isTrial ? 'text-amber-700' : 'text-emerald-700'}>{statusLabel}{!isTrial && statusLabel === 'Aktif' ? ` sampai ${formatDate(org.subscriptionEndsAt || org.nextBillingDate)}` : ''}</strong></span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            Langganan dan Pembayaran Otomatis
          </h2>
        </div>
        <div className="text-right">
          <div className="text-right"><span className={`${isTrial ? 'text-amber-700' : 'text-emerald-700'} font-bold text-xs flex items-center gap-1 justify-end`}><CheckCircle2 className="w-4 h-4" /> {isTrial ? `Trial sampai ${formatDate(org.trialEndsAt)}` : `Aktif sampai ${formatDate(org.subscriptionEndsAt || org.nextBillingDate)}`}</span></div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((p) => {
          const isCurrent = org.plan === p.id && !isTrial;

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
                  {p.monthlyPrice} <span className="text-xs font-normal text-slate-500">/ bulan</span>
                  <div className="text-sm font-bold text-emerald-700 mt-1">{p.annualPrice} <span className="text-xs font-normal text-slate-500">/ tahun</span></div>
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

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between relative shadow-lg text-white">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase">Untuk Operasional Kompleks</span>
            <h3 className="text-base font-bold mt-1">Enterprise</h3>
            <div className="text-2xl font-black mt-2 mb-4">Hubungi Kami</div>
            <div className="space-y-2.5 text-xs text-slate-200 pt-3 border-t border-slate-700">
              {[
                'Jumlah kandang tanpa batas',
                'Jumlah pengguna sesuai kebutuhan',
                'Multi-farm / multi-company',
                'Onboarding',
                'Migrasi data',
                'Training',
                'Custom report',
                'API / integrasi',
                'Dedicated support'
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-700">
            <a
              href="https://wa.me/6285707104107?text=Saya%20tertarik%20dengan%20paket%20Enterprise%20PetelurKu.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4" />
              Hubungi Kami
            </a>
          </div>
        </div>
      </div>

      {/* Payment Gateway Simulator Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl text-slate-900">
            {!paymentSuccess ? (
              <>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Lanjutkan Pembayaran</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Anda akan diarahkan ke halaman pembayaran aman Midtrans.
                </p>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 text-xs">
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button onClick={() => setBillingCycle('monthly')} className={`rounded-lg px-3 py-2 font-bold ${billingCycle === 'monthly' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>Bulanan</button>
                    <button onClick={() => setBillingCycle('annual')} className={`rounded-lg px-3 py-2 font-bold ${billingCycle === 'annual' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>Tahunan</button>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-500">Paket Dipilih:</span>
                    <span className="font-bold text-amber-800 uppercase">{selectedPlan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Tagihan Bulanan:</span>
                    <span className="font-black text-slate-900 text-sm">
                      {billingCycle === 'annual' ? plans.find(p => p.id === selectedPlan)?.annualPrice : plans.find(p => p.id === selectedPlan)?.monthlyPrice}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 text-xs text-blue-900 leading-relaxed">
                  Metode yang tersedia—seperti QRIS, transfer virtual account, dan e-wallet—mengikuti aktivasi pada akun merchant Midtrans Anda. Paket baru aktif otomatis setelah pembayaran terverifikasi.
                </div>

                {paymentError && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{paymentError}</div>}

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
                        <span>Bayar melalui Midtrans</span>
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
