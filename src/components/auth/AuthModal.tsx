import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  ArrowRight, 
  X,
  CheckCircle2,
} from 'lucide-react';
import { SubscriptionPlan } from '../../types';
import { ApiService } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userType: 'peternak' | 'saas_owner', userData?: any) => void;
  initialMode?: 'login' | 'register';
  initialPlan?: SubscriptionPlan;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
  initialPlan = 'pro'
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(initialPlan);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setMode(initialMode);
    setSelectedPlan(initialPlan);
  }, [isOpen, initialMode, initialPlan]);

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
      onLoginSuccess('peternak', result.user);
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

        {/* Header Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-extrabold text-slate-900">
            {mode === 'login' ? (
              'Masuk Aplikasi PetelurKu.com'
            ) : (
              'Daftarkan Peternakan Anda'
            )}
          </h2>
          <p className="text-slate-500 mt-1">
            {mode === 'login'
              ? 'Akses catatan produksi panen, stok pakan, dan rekam medis kandang.'
              : 'Mulai uji coba gratis 14 hari tanpa kartu kredit.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {mode === 'register' && (
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
                  <label className="block text-slate-700 font-semibold mb-1">Pilih Paket</label>
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
                placeholder="nama@email.com"
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
            ) : mode === 'login' ? (
              <>
                Masuk ke Dashboard Peternakan <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Daftar & Aktifkan Uji Coba <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle Login/Register */}
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

      </div>
    </div>
  );
};
