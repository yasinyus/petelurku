import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  BarChart3, 
  Syringe, 
  FileSpreadsheet, 
  Users, 
  Sparkles, 
  ChevronRight, 
  DollarSign, 
  Crown,
  Egg,
  MapPin,
  MessageCircle
} from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';

interface LandingPageProps {
  onOpenApp: (portalType: 'peternak' | 'saas_owner', userData?: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenApp }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [authInitialPlan, setAuthInitialPlan] = useState<'basic' | 'pro' | 'enterprise'>('pro');

  const openAuth = (mode: 'login' | 'register') => {
    setAuthInitialMode(mode);
    setShowAuthModal(true);
  };

  const openPlanRegistration = (plan: 'basic' | 'pro' | 'enterprise') => {
    setAuthInitialPlan(plan);
    openAuth('register');
  };

  return (
    <div className="landing-page min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
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
                PetelurKu.com
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Sistem Manajemen Peternakan Ayam Petelur</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-emerald-700 transition">Fitur</a>
            <a href="#benefits" className="hover:text-emerald-700 transition">Manfaat</a>
            <a href="#pricing" className="hover:text-emerald-700 transition">Harga</a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => openAuth('login')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Masuk
            </button>

            <button
              onClick={() => openAuth('register')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              Coba Gratis 15 Hari
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] items-center gap-9 lg:gap-12">
          <div className="text-center lg:text-left space-y-5">
            
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full text-emerald-800 text-xs font-bold shadow-2xs">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Dibuat untuk Peternak Ayam Petelur Indonesia
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Produksi Telur, Pakan, dan Keuntungan Peternakan <span className="text-emerald-600">Terpantau Setiap Hari</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Ganti catatan buku dan spreadsheet yang tercecer dengan satu aplikasi. PetelurKu membantu Anda mencatat produksi telur, memantau biaya pakan, mengelola populasi kandang, dan mengetahui untung rugi dengan lebih cepat.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-3">
              <button
                onClick={() => openPlanRegistration('pro')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition cursor-pointer shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                Mulai Gratis 15 Hari <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenApp('saas_owner')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
              >
                <Crown className="w-4 h-4 text-amber-600" />
                Lihat Demo Aplikasi
              </button>
            </div>

            {/* Feature Pills */}
            <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Mudah Dipakai di HP dan Komputer
              </span>
              <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Kalkulasi HDP & HPP Otomatis
              </span>
              <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Akses Owner dan Petugas Kandang
              </span>
            </div>

          </div>

          <div className="relative hidden sm:block" aria-hidden="true">
            <div className="absolute -inset-8 bg-emerald-100/50 blur-3xl rounded-full" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 shadow-xl shadow-emerald-950/10 bg-emerald-50 aspect-[4/3]">
              <img
                src="/petelurku-hero-farm.webp"
                alt=""
                className="h-full w-full object-cover object-[68%_center] opacity-90"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/10 via-transparent to-white/25" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-emerald-950/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/60 bg-white/75 backdrop-blur-md px-4 py-3 shadow-sm">
                <p className="text-xs font-extrabold text-slate-800">Catatan kandang dalam genggaman</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">Pantau produksi dan kondisi ayam langsung dari lokasi peternakan.</p>
              </div>
            </div>
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
              Semua Catatan Peternakan dalam Satu Tempat
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Data harian lebih rapi, keputusan lebih cepat, dan kondisi setiap kandang lebih mudah dipantau.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 shadow-2xs hover:border-emerald-300 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                🥚
              </div>
              <h3 className="text-base font-bold text-slate-900">Pencatatan Produksi Telur dan HDP</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Catat telur utuh, retak, bobot panen, dan kematian ayam per kandang. Persentase Hen Day Production dihitung otomatis setiap hari.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 shadow-2xs hover:border-emerald-300 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <BarChart3 className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Stok dan Biaya Pakan Harian</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pantau stok jagung, konsentrat, dan bekatul. Biaya pakan dihitung dari konsumsi ayam, komposisi bahan, dan harga per kilogram.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 shadow-2xs hover:border-emerald-300 transition">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Syringe className="w-5 h-5 text-blue-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Kesehatan dan Jadwal Vaksinasi</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Simpan jadwal vaksin, catatan gejala, pengobatan, dan angka kematian agar riwayat kesehatan ayam tidak hilang.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 shadow-2xs hover:border-emerald-300 transition">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5 text-teal-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Pendapatan dan Untung Rugi</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bandingkan pendapatan telur dengan biaya pakan harian langsung dari dashboard untuk melihat kondisi usaha hari ini dan kemarin.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 shadow-2xs hover:border-emerald-300 transition">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5 text-purple-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Laporan Siap Dibagikan</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Unduh laporan produksi dan keuangan dalam format PDF untuk evaluasi usaha, arsip, atau dibagikan kepada rekan bisnis.
              </p>
            </div>

            {/* Feature 6 - SaaS Owner Feature */}
            <div id="saas-owner" className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6 space-y-3 shadow-2xs hover:border-emerald-400 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Crown className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Kelola Tim dan Hak Akses</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Owner dapat mengatur akses manager, petugas kandang, dan dokter hewan sesuai pekerjaan masing-masing.
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
              Pilihan Paket Langganan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pilih paket sesuai jumlah kandang dan anggota tim. Semua paket dapat dicoba gratis selama 15 hari.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            
            {/* Basic Plan */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 flex flex-col justify-between shadow-2xs">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Peternakan Pemula</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">Paket Basic</h3>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  Rp 49.000 <span className="text-xs font-normal text-slate-400">/ bulan</span>
                </div>

                <ul className="mt-5 space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Maksimal 2 Kandang Ayam
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Produksi Telur & HDP
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Stok dan Biaya Pakan
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 2 Pengguna Termasuk Owner
                  </li>
                </ul>
              </div>

              <button
                onClick={() => openPlanRegistration('basic')}
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
                  Rp 99.000 <span className="text-xs font-normal text-slate-400">/ bulan</span>
                </div>

                <ul className="mt-5 space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Maksimal 10 Kandang Ayam
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Semua Fitur Basic
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Kelola Akses Petugas Kandang
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Laporan Produksi & Keuangan PDF
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Maksimal 10 Pengguna
                  </li>
                </ul>
              </div>

              <button
                onClick={() => openPlanRegistration('pro')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
              >
                Mulai Uji Coba Pro Gratis
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 flex flex-col justify-between shadow-2xs">
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase">Peternakan Berkembang</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">Paket Bisnis</h3>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  Rp 199.000 <span className="text-xs font-normal text-slate-400">/ bulan</span>
                </div>

                <ul className="mt-5 space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Tanpa Batasan Jumlah Kandang
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Semua Fitur Pro
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Maksimal 30 Pengguna
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Prioritas Bantuan Teknis
                  </li>
                </ul>
              </div>

              <button
                onClick={() => openPlanRegistration('enterprise')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Pilih Paket Bisnis
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-black text-slate-900">Lebih Mudah Mengendalikan Usaha Peternakan</h2>
            <p className="text-sm text-slate-500 mt-2">Ubah catatan harian menjadi informasi yang siap digunakan untuk mengambil keputusan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
              <BarChart3 className="w-7 h-7 text-emerald-600" />
              <p className="text-xs text-slate-700 italic leading-relaxed">
                Bandingkan produksi hari ini dan kemarin agar penurunan hasil telur dapat diketahui lebih cepat.
              </p>
              <div className="text-xs font-bold text-slate-900 pt-2 border-t border-slate-200">
                Pantau Produksi Harian
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
              <DollarSign className="w-7 h-7 text-emerald-600" />
              <p className="text-xs text-slate-700 italic leading-relaxed">
                Hitung biaya dari harga jagung, konsentrat, bekatul, komposisi bahan, dan konsumsi ayam produktif.
              </p>
              <div className="text-xs font-bold text-slate-900 pt-2 border-t border-slate-200">
                Kendalikan Biaya Pakan
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
              <Users className="w-7 h-7 text-emerald-600" />
              <p className="text-xs text-slate-700 italic leading-relaxed">
                Petugas mencatat dari kandang, sementara owner dapat memantau laporan terbaru dari perangkatnya.
              </p>
              <div className="text-xs font-bold text-slate-900 pt-2 border-t border-slate-200">
                Kelola Tim dari Mana Saja
              </div>
            </div>

          </div>

        </div>
      </section>

      <section className="py-16 bg-slate-50 border-t border-slate-200" aria-labelledby="faq-title">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-9">
            <h2 id="faq-title" className="text-2xl font-black text-slate-900">Pertanyaan yang Sering Ditanyakan Peternak</h2>
          </div>
          <div className="space-y-3">
            {[
              ['Apa itu PetelurKu?', 'PetelurKu adalah aplikasi manajemen peternakan ayam petelur untuk mencatat produksi telur, kandang, populasi, stok dan biaya pakan, kesehatan, vaksinasi, serta keuangan.'],
              ['Apakah PetelurKu dapat digunakan melalui HP?', 'Ya. Tampilan web PetelurKu responsif untuk HP dan komputer, serta tersedia proyek aplikasi mobile untuk pencatatan oleh petugas kandang.'],
              ['Bagaimana biaya pakan harian dihitung?', 'Biaya dihitung dari jumlah ayam produktif, konsumsi pakan harian, persentase komposisi jagung, konsentrat dan bekatul, serta harga masing-masing bahan.'],
              ['Apakah ayam pullet ikut dalam perhitungan biaya pakan?', 'Tidak. Kandang yang masih berstatus pullet dikeluarkan dari perhitungan biaya pakan pada dashboard.'],
              ['Berapa lama masa uji coba gratis?', 'Peternak baru mendapatkan masa uji coba selama 15 hari setelah alamat email berhasil diaktifkan.']
            ].map(([question, answer]) => (
              <details key={question} className="group bg-white border border-slate-200 rounded-xl p-4">
                <summary className="cursor-pointer list-none font-bold text-sm text-slate-900 flex items-center justify-between gap-4">
                  {question}<ChevronRight className="w-4 h-4 text-emerald-600 transition group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">{answer}</p>
              </details>
            ))}
          </div>
          <div className="mt-9 text-center">
            <button onClick={() => openAuth('register')} className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition cursor-pointer">
              Mulai Kelola Peternakan Gratis
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-7 md:grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-950/30">
              <Egg className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white">PetelurKu.com</div>
              <div className="mt-0.5">&copy; 2026 · Manajemen peternakan modern</div>
            </div>
          </div>

          <div className="text-center md:px-8 md:border-x md:border-slate-700/70">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">Developed By</p>
            <p className="mt-1 font-extrabold text-sm text-slate-100">AUUF Farm</p>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Blitar, Indonesia
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2.5">
            <p className="font-semibold text-slate-300">Butuh bantuan atau ingin berkonsultasi?</p>
            <a
              href="https://wa.me/6285707104107?text=Saya%20ingin%20bertanya%20tentang%20App%20Petelurku.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Konsultasi WhatsApp di 085707104107"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 font-extrabold text-slate-950 shadow-lg shadow-emerald-950/30 transition hover:-translate-y-0.5 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <MessageCircle className="w-4 h-4" />
              Konsultasi WA · 085707104107
            </a>
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
        initialPlan={authInitialPlan}
      />

    </div>
  );
};
