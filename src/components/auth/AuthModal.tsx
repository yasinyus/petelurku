import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  Key, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  X,
  CheckCircle2,
  Crown,
  Briefcase,
  HardHat,
  Zap
} from 'lucide-react';
import { UserRole, SubscriptionPlan } from '../../types';
import { ApiService } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userType: 'peternak' | 'saas_owner', userData?: any) => void;
  initialMode?: 'login' | 'register';
  initialUserType?: 'peternak' | 'saas_owner';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
  initialUserType = 'peternak'
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [userType, setUserType] = useState<'peternak' | 'saas_owner'>(initialUserType);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('pro');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'register') {
        const result = await ApiService.register({ fullName, email, password, farmName, city, selectedPlan });
        setIsLoading(false);
        if (!result.success) return setErrorMsg(result.message || 'Pendaftaran gagal');
        setSuccessMsg(result.message);
        return;
      }
      const result = await ApiService.login(email, password);
      setIsLoading(false);
      if (!result.success) return setErrorMsg(result.message || 'Login gagal');
      onLoginSuccess(userType, result.user);
      onClose();
    } catch (error: any) {
      setIsLoading(false);
      setErrorMsg(error.message || 'Login gagal');
    }
  };

  const handleQuickDemoLogin = async (roleType: 'farm_owner' | 'farm_worker' | 'saas_owner') => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const demoEmail = roleType === 'saas_owner' ? 'admin@chicksync.saas' : 'yasin@barokahfarm.id';
      const result = await ApiService.login(demoEmail);
      setIsLoading(false);
      if (!result.success) return setErrorMsg(result.message || 'Login gagal');
      onLoginSuccess(roleType === 'saas_owner' ? 'saas_owner' : 'peternak', result.user);
      onClose();
    } catch (error: any) {
      setIsLoading(false);
      setErrorMsg(error.message || 'Login gagal');
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    setErrorMsg('');
    const result = await ApiService.resendVerification(email);
    setIsLoading(false);
    if (!result.success) return setErrorMsg(result.message || 'Gagal mengirim ulang email');
    setSuccessMsg(result.message);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-900 text-xs relative my-8">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Type Switcher (Peternak vs SaaS Owner) */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setUserType('peternak');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
              userType === 'peternak'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-600" />
            Portal Peternak / User
          </button>

          <button
            type="button"
            onClick={() => {
              setUserType('saas_owner');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
              userType === 'saas_owner'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-600" />
            Portal Pemilik SaaS (Admin)
          </button>
        </div>

        {/* Header Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-extrabold text-slate-900">
            {userType === 'saas_owner' ? (
              <span className="flex items-center justify-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                Login Super Admin PetelurKu.com
              </span>
            ) : mode === 'login' ? (
              'Masuk Aplikasi PetelurKu.com'
            ) : (
              'Daftarkan Peternakan Anda'
            )}
          </h2>
          <p className="text-slate-500 mt-1">
            {userType === 'saas_owner'
              ? 'Kelola sistem berlangganan, tenant peternakan, dan arus kas platform SaaS.'
              : mode === 'login'
              ? 'Akses catatan produksi panen, stok pakan, dan rekam medis kandang.'
              : 'Mulai uji coba gratis 14 hari tanpa kartu kredit.'}
          </p>
        </div>

        {/* Quick Demo Login Presets */}
        <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
          <div className="font-bold text-emerald-900 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-600" /> Masuk Cepat dengan Akun Demo (1-Click):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('farm_owner')}
              className="px-2.5 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100/50 rounded-lg text-[11px] font-bold text-emerald-900 text-left transition cursor-pointer"
            >
              👑 Owner Farm
              <div className="text-[9px] text-slate-500 font-normal">H. Yasin (Blitar)</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('farm_worker')}
              className="px-2.5 py-1.5 bg-white border border-teal-300 hover:bg-teal-100/50 rounded-lg text-[11px] font-bold text-teal-900 text-left transition cursor-pointer"
            >
              👷 Anak Kandang
              <div className="text-[9px] text-slate-500 font-normal">Input Panen Telur</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('saas_owner')}
              className="px-2.5 py-1.5 bg-white border border-amber-300 hover:bg-amber-100/50 rounded-lg text-[11px] font-bold text-amber-900 text-left transition cursor-pointer"
            >
              🛡️ Super Admin
              <div className="text-[9px] text-slate-500 font-normal">Pemilik SaaS</div>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {userType === 'peternak' && mode === 'register' && (
            <>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Peternakan / Usaha Layer</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Contoh: Peternakan Telur Barokah"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-emerald-600 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kota / Lokasi</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Blitar, Jatim"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pilih Paket SaaS</label>
                  <select
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value as SubscriptionPlan)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-600 font-bold"
                  >
                    <option value="basic">Basic (2 Kandang)</option>
                    <option value="pro">Pro (10 Kandang)</option>
                    <option value="enterprise">Enterprise (Unlim)</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap Anda</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Contoh: H. Yasin Yusuf"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Email Utama</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                placeholder={userType === 'saas_owner' ? 'admin@chicksync.saas' : 'yasin@barokahfarm.id'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-emerald-600 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Kata Sandi (Password)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-center font-semibold">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-center font-semibold space-y-2">
              <div>{successMsg}</div>
              {mode === 'register' && (
                <button type="button" onClick={handleResendVerification} disabled={isLoading} className="text-emerald-700 hover:underline cursor-pointer">
                  Kirim ulang email konfirmasi
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition cursor-pointer text-xs flex items-center justify-center gap-2 shadow-xs"
          >
            {isLoading ? (
              <span>Memproses Verifikasi...</span>
            ) : userType === 'saas_owner' ? (
              <>
                <ShieldCheck className="w-4 h-4" /> Masuk Portal Pemilik SaaS
              </>
            ) : mode === 'login' ? (
              <>
                Masuk ke Dashboard Peternakan <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Daftar & Aktifkan Uji Coba SaaS <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle Login/Register */}
        {userType === 'peternak' && (
          <div className="mt-5 pt-4 border-t border-slate-100 text-center text-slate-500">
            {mode === 'login' ? (
              <p>
                Belum memiliki akun peternakan?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Daftar Peternakan Baru
                </button>
              </p>
            ) : (
              <p>
                Sudah memiliki akun?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Masuk di Sini
                </button>
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
