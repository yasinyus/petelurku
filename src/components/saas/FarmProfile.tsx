import React, { useEffect, useState } from 'react';
import { Building2, Save, Upload } from 'lucide-react';
import { Organization } from '../../types';

interface FarmProfileProps {
  org: Organization;
  onUpdateProfile: (data: { name: string; ownerName: string; city: string; address: string; logoData: string | null }) => Promise<void> | void;
}

export const FarmProfile: React.FC<FarmProfileProps> = ({ org, onUpdateProfile }) => {
  const [name, setName] = useState(org.name);
  const [ownerName, setOwnerName] = useState(org.ownerName || '');
  const [city, setCity] = useState(org.city || '');
  const [address, setAddress] = useState(org.address || '');
  const [logoData, setLogoData] = useState<string | null>(org.logoData || null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(org.name); setOwnerName(org.ownerName || ''); setCity(org.city || ''); setAddress(org.address || ''); setLogoData(org.logoData || null);
  }, [org]);

  const handleLogoChange = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 1_000_000) {
      window.alert('Pilih logo gambar berukuran maksimal 1 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoData(String(reader.result));
    reader.readAsDataURL(file);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setIsSaving(true);
      await onUpdateProfile({ name, ownerName, city, address, logoData });
    } catch (error: any) {
      window.alert(error.message || 'Gagal menyimpan profil farm.');
    } finally {
      setIsSaving(false);
    }
  };

  return <div className="max-w-4xl mx-auto space-y-6">
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
      <div className="flex items-center gap-3"><Building2 className="w-6 h-6 text-emerald-600" /><div><h2 className="text-xl font-bold text-slate-900">Profil Perusahaan / Farm</h2><p className="text-sm text-slate-500 mt-1">Kelola identitas peternakan dan informasi owner.</p></div></div>
    </div>
    <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        <div className="flex flex-col items-center gap-3">
          {logoData ? <img src={logoData} alt="Logo farm" className="w-28 h-28 rounded-xl object-cover border border-slate-200" /> : <div className="w-28 h-28 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-black text-4xl">{name.charAt(0).toUpperCase() || 'F'}</div>}
          <button type="button" onClick={() => setLogoData(null)} className="text-sm font-semibold text-rose-700 cursor-pointer">Hapus logo</button>
        </div>
        <label className="flex-1 text-sm font-semibold text-slate-700">Logo Farm<input type="file" accept="image/*" onChange={(event) => handleLogoChange(event.target.files?.[0])} className="block mt-2 w-full text-sm text-slate-600 file:mr-3 file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-emerald-800 file:font-semibold" /><span className="block mt-2 text-xs font-normal text-slate-500">Format gambar, maksimal 1 MB.</span></label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm font-semibold text-slate-700">Nama Farm<input value={name} onChange={(event) => setName(event.target.value)} required className="block mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900" /></label>
        <label className="text-sm font-semibold text-slate-700">Nama Owner<input value={ownerName} onChange={(event) => setOwnerName(event.target.value)} required className="block mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900" /></label>
        <label className="text-sm font-semibold text-slate-700">Kota<input value={city} onChange={(event) => setCity(event.target.value)} required className="block mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900" /></label>
        <label className="text-sm font-semibold text-slate-700">Alamat<textarea value={address} onChange={(event) => setAddress(event.target.value)} rows={3} className="block mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 resize-y" /></label>
      </div>
      <div className="flex justify-end pt-2 border-t border-slate-100"><button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white cursor-pointer disabled:opacity-60"><Save className="w-4 h-4" />{isSaving ? 'Menyimpan...' : 'Simpan Profil'}</button></div>
    </form>
  </div>;
};
