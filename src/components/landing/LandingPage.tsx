import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  BarChart3, 
  Syringe, 
  FileSpreadsheet, 
  Users, 
  CreditCard, 
  Lock, 
  Wifi, 
  WifiOff, 
  Smartphone, 
  Award, 
  Sparkles, 
  ChevronRight, 
  DollarSign, 
  Star, 
  HelpCircle,
  Crown,
  Egg
} from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';

interface LandingPageProps {
  onOpenApp: (portalType: 'peternak' | 'saas_owner', userData?: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenApp }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [authInitialType, setAuthInitialType] = useState<'peternak' | 'saas_owner'>('peternak');

  const openAuth = (mode: 'login' | 'register', type: 'peternak' | 'saas_owner' = 'peternak') => {
    setAuthInitialMode(mode);
    setAuthInitialType(type);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-xs">
              <Egg className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-base leading-tight tracking-tight flex items-center gap-1.5">
                PetelurKu.com <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">SaaS Layer</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Sistem Manajemen Peternakan Ayam Petelur</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-emerald-700 transition">Fitur Utama</a>
            <a href="#pricing" className="hover:text-emerald-700 transition">Paket SaaS</a>
            <a href="#security" className="hover:text-emerald-700 transition">Keamanan E2EE</a>
            <a href="#saas-owner" className="hover:text-emerald-700 transition flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              Untuk Pemilik SaaS
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => openAuth('login', 'saas_owner')}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer hidden sm:flex items-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              Admin SaaS
            </button>

            <button
              onClick={() => openAuth('login', 'peternak')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Masuk
            </button>

            <button
              onClick={() => openAuth('register', 'peternak')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              Daftar Gratis 14 Hari
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-5">
            
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full text-emerald-800 text-xs font-bold shadow-2xs">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Platform SaaS B2B Manajemen Peternakan Ayam Petelur Terdepan
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Kelola Ribuan Ayam Petelur & Bisnis SaaS Peternakan Secara <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy">Presisi</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Otomatiskan pencatatan Hen Day Production (HDP %), analisis HPP pakan per butir telur, jadwal vaksinasi dokter hewan, hingga laporan keuangan & penagihan SaaS otomatis via Midtrans & Xendit.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                onClick={() => onOpenApp('peternak')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition cursor-pointer shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                Coba Aplikasi Peternak Sekarang <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenApp('saas_owner')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
              >
                <Crown className="w-4 h-4 text-amber-600" />
                Demo Dashboard Pemilik SaaS
              </button>
            </div>

            {/* Feature Pills */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Offline-First E2EE
              </span>
              <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Kalkulasi HDP & HPP Otomatis
              </span>
              <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Multi-Role (Owner, Manager, Vet, Anak Kandang)
              </span>
            </div>

          </div>

          {/* Interactive Live App Visual Mockup */}
          <div className="mt-12 max-w-5xl mx-auto bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono text-slate-400 ml-2">petelurku.com/dashboard-preview</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ● Status Real-Time Cloud Sync
              </span>
            </div>

            {/* Mockup Dashboard Content */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
                <span className="text-slate-500 text-[11px] font-medium">Total Panen Hari Ini</span>
                <div className="text-xl font-black text-slate-900">4.820 Butir <span className="text-xs font-normal text-emerald-700">(289.2 Kg)</span></div>
                <div className="text-[10px] text-emerald-700 font-bold">HDP Rata-rata 88.8% (Sangat Baik)</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
                <span className="text-slate-500 text-[11px] font-medium">Estimasi HPP Pakan</span>
                <div className="text-xl font-black text-slate-900">Rp 1.480 <span className="text-xs font-normal text-slate-500">/butir</span></div>
                <div className="text-[10px] text-emerald-700 font-bold">Harga Jual Pasar: Rp 1.950/butir</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
                <span className="text-slate-500 text-[11px] font-medium">Jadwal Vaksinasi Terdekat</span>
                <div className="text-xl font-black text-amber-800">ND-IB Booster</div>
                <div className="text-[10px] text-amber-700 font-bold">Kandang A1 (12 Agustus 2026)</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Features Showcase Grid */}
      <section id="features" className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Fitur Lengkap untuk Peternak & Pengelola SaaS
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Setiap modul dirancang khusus menjawab kebutuhan peternakan ayam bertelur modern di Indonesia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 shadow-2xs hover:border-emerald-300 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                🥚
              </div>
              <h3 className="text-base font-bold text-slate-900">Pancatatan Panen & Hen Day (HDP %)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Catat jumlah telur utuh, retak, dan bobot total (kg) berdasarkan slot waktu pagi, siang, dan sore. Grafik kurva produksi siap dipantau harian.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 shadow-2xs hover:border-emerald-300 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <BarChart3 className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Manajemen Stok Pakan & HPP</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hitung FCR (Feed Conversion Ratio) dan HPP per butir telur secara otomatis berdasarkan konsumsi pakan konsentrat, jagung, dan bekatul.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 shadow-2xs hover:border-emerald-300 transition">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Syringe className="w-5 h-5 text-blue-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Kesehatan & Rekam Medis Dokter</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pengingat otomatis jadwal vaksinasi ND-IB, AI, Coryza, serta pencatatan tingkat kematian (deplesi) dan konsultasi dokter hewan.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 shadow-2xs hover:border-emerald-300 transition">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5 text-teal-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Keuangan & Laporan Arus Kas</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pantau pendapatan penjualan telur utuh & afkir vs biaya operasional pakan, obat, dan listrik. Hitung Net Profit Margin secara instan.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 shadow-2xs hover:border-emerald-300 transition">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5 text-purple-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Ekspor Laporan PDF Profesional</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Unduh laporan cetak resmi format A4 lengkap dengan ringkasan statistik, rincian biaya, dan kolom tanda tangan pimpinan peternakan.
              </p>
            </div>

            {/* Feature 6 - SaaS Owner Feature */}
            <div id="saas-owner" className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6 space-y-3 shadow-2xs hover:border-emerald-400 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Crown className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Portal Pemilik SaaS (Super Admin)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Khusus pemilik platform: pantau total pendapatan berulang (MRR/ARR), kelola tenant peternakan, simulasi webhook Midtrans/Xendit, & siarkan pengumuman.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pilihan Paket Langganan SaaS
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pilih paket yang paling sesuai dengan skala peternakan Anda. Uji coba gratis 14 hari.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            
            {/* Basic Plan */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 flex flex-col justify-between shadow-2xs">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Peternakan Pemula</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">Paket Basic</h3>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  Rp 750.000 <span className="text-xs font-normal text-slate-400">/ bulan</span>
                </div>

                <ul className="mt-5 space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Maksimal 2 Kandang Ayam
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Pencatatan Panen & HDP
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Manajemen Stok Pakan
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 2 Anggota Tim (Owner & Worker)
                  </li>
                </ul>
              </div>

              <button
                onClick={() => openAuth('register', 'peternak')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Pilih Paket Basic
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-white border-2 border-emerald-600 rounded-2xl p-6 space-y-5 flex flex-col justify-between shadow-md relative">
              <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
                Paling Banyak Dipilih
              </span>

              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase">Peternakan Skala Menengah</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">Paket Pro</h3>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  Rp 1.500.000 <span className="text-xs font-normal text-slate-400">/ bulan</span>
                </div>

                <ul className="mt-5 space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Maksimal 10 Kandang Ayam
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Semua Fitur Basic + HPP Pakan
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Rekam Medis & Dokter Hewan
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ekspor Laporan PDF Standar A4
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Up to 10 Anggota Tim
                  </li>
                </ul>
              </div>

              <button
                onClick={() => openAuth('register', 'peternak')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
              >
                Mulai Uji Coba Pro Gratis
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 flex flex-col justify-between shadow-2xs">
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase">Perusahaan Poultry Besar</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">Enterprise</h3>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  Rp 2.500.000 <span className="text-xs font-normal text-slate-400">/ bulan</span>
                </div>

                <ul className="mt-5 space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Tanpa Batasan Jumlah Kandang
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Semua Fitur Pro + Multi-Farm
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Prioritas Support 24/7 & Training
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Custom Integrasi API
                  </li>
                </ul>
              </div>

              <button
                onClick={() => openAuth('register', 'peternak')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Pilih Enterprise
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-black text-slate-900">Dipercaya Oleh Peternak Layer di Seluruh Indonesia</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
              <div className="flex text-amber-400 gap-1">
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                "Aplikasi ini sangat membantu mengontrol panen dari 3 kandang kami di Blitar. Grafik HDP % membantu kami langsung mendeteksi bila ada penurunan produksi secara cepat."
              </p>
              <div className="text-xs font-bold text-slate-900 pt-2 border-t border-slate-200">
                H. Yasin Yusuf <span className="text-slate-500 font-normal">— Peternakan Barokah Farm, Blitar</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
              <div className="flex text-amber-400 gap-1">
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                "Perhitungan HPP pakan per butir telur sangat akurat! Kami jadi tahu kapan momen terbaik membeli bahan pakan konsentrat saat harga jagung naik."
              </p>
              <div className="text-xs font-bold text-slate-900 pt-2 border-t border-slate-200">
                Ir. Hendra Gunawan <span className="text-slate-500 font-normal">— PT Avian Jaya, Malang</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
              <div className="flex text-amber-400 gap-1">
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                "Kemudahan ekspor laporan PDF A4 membuat pelaporan bulanan ke investor jadi jauh lebih rapi, terpercaya, dan profesional."
              </p>
              <div className="text-xs font-bold text-slate-900 pt-2 border-t border-slate-200">
                Dr. Agus Setiawan <span className="text-slate-500 font-normal">— Bina Tani Layer, Lampung</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
              🥚
            </div>
            <span className="font-bold text-slate-100">PetelurKu.com SaaS Platform &copy; 2026</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => openAuth('login', 'peternak')} className="hover:text-emerald-400 cursor-pointer">
              Login Peternak
            </button>
            <button onClick={() => openAuth('login', 'saas_owner')} className="hover:text-amber-400 cursor-pointer flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              Portal Pemilik SaaS
            </button>
          </div>
        </div>
      </footer>

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={(userType, userData) => {
          onOpenApp(userType, userData);
        }}
        initialMode={authInitialMode}
        initialUserType={authInitialType}
      />

    </div>
  );
};
