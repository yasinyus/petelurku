import React, { useState } from 'react';
import { Home, Plus, Users, Calendar, AlertCircle, Edit3, Trash2, CheckCircle2 } from 'lucide-react';
import { Coop, User } from '../../types';
import { calculateAgeWeeks, getLocalDateInputValue } from '../../utils/date';

interface CoopListProps {
  coops: Coop[];
  onAddCoop: (coop: Omit<Coop, 'id' | 'orgId'>) => Promise<void> | void;
  onUpdateCoop: (coop: Coop) => Promise<void> | void;
  onDeleteCoop: (coop: Coop) => Promise<void> | void;
  currentUser: User;
}

export const CoopList: React.FC<CoopListProps> = ({
  coops,
  onAddCoop,
  onUpdateCoop,
  onDeleteCoop,
  currentUser
}) => {
  const canManageCoops = !['worker', 'farm_worker', 'vet'].includes(String(currentUser.role));
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCoop, setEditingCoop] = useState<Coop | null>(null);

  // New Coop Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [capacity, setCapacity] = useState(2000);
  const [currentChickens, setCurrentChickens] = useState(1800);
  const [breed, setBreed] = useState('ISA Brown');
  const [housingType, setHousingType] = useState<'battery' | 'open_house' | 'closed_house'>('battery');
  const [entryDate, setEntryDate] = useState(getLocalDateInputValue());
  const sortedCoops = [...coops].sort((a, b) => a.name.localeCompare(b.name, 'id', { numeric: true, sensitivity: 'base' }));

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    try {
      await onAddCoop({
      name,
      code: code.toUpperCase(),
      capacity,
      initialChickens: currentChickens,
      currentChickens,
      ageWeeks: calculateAgeWeeks(entryDate),
      breed,
      status: 'active',
      housingType,
      entryDate
      });

      setName('');
      setCode('');
      setEntryDate(getLocalDateInputValue());
      setShowAddModal(false);
    } catch (error: any) {
      window.alert(error.message || 'Gagal menyimpan kandang');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoop) return;
    try {
      await onUpdateCoop(editingCoop);
      setEditingCoop(null);
    } catch (error: any) {
      window.alert(error.message || 'Gagal memperbarui kandang');
    }
  };

  const handleDelete = async (coop: Coop) => {
    const confirmed = window.confirm(
      `Hapus kandang ${coop.code} beserta populasi ${coop.currentChickens.toLocaleString('id-ID')} ekor?\n\nSemua riwayat produksi, pakan, vaksinasi, dan kesehatan kandang ini juga akan dihapus. Tindakan ini tidak dapat dibatalkan.`
    );
    if (!confirmed) return;
    try {
      await onDeleteCoop(coop);
    } catch (error: any) {
      window.alert(error.message || 'Gagal menghapus kandang');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Home className="w-5 h-5 text-emerald-600" />
            Manajemen Kandang & Populasi Ayam
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data tiap blok kandang, kapasitas baterai/closed house, dan umur populasi layer.
          </p>
        </div>

        {canManageCoops && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Tambah Kandang Baru
          </button>
        )}
      </div>

      {/* Coop & Population Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-4 py-3">Nama Kandang</th>
                <th className="px-4 py-3">Kode</th>
                <th className="px-4 py-3 text-right">Populasi</th>
                <th className="px-4 py-3 text-right">Kapasitas</th>
                <th className="px-4 py-3">Keterisian</th>
                <th className="px-4 py-3 text-right">Umur</th>
                <th className="px-4 py-3">Ras / Strain</th>
                <th className="px-4 py-3">Tipe</th>
                <th className="px-4 py-3">Check-in</th>
                <th className="px-4 py-3">Status</th>
                {canManageCoops && <th className="px-4 py-3 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedCoops.map((coop) => {
                const calculatedAgeWeeks = calculateAgeWeeks(coop.entryDate);
                const occupancyRate = coop.capacity > 0 ? Number(((coop.currentChickens / coop.capacity) * 100).toFixed(1)) : 0;
                const ageStatusLabel = calculatedAgeWeeks < 20 ? 'Pullet / Starter' : calculatedAgeWeeks > 70 ? 'Afkir / Late Layer' : 'Layer Puncak';
                const ageStatusColor = calculatedAgeWeeks < 20 ? 'bg-blue-50 text-blue-800 border-blue-200' : calculatedAgeWeeks > 70 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200';
                return (
                  <tr key={coop.id} className="hover:bg-slate-50 transition text-slate-700">
                    <td className="px-4 py-3 font-bold text-slate-900">{coop.name}</td>
                    <td className="px-4 py-3"><span className="font-mono bg-slate-100 border border-slate-200 px-2 py-1 rounded font-bold">{coop.code}</span></td>
                    <td className="px-4 py-3 text-right font-black text-emerald-700">{coop.currentChickens.toLocaleString('id-ID')} ekor</td>
                    <td className="px-4 py-3 text-right font-semibold">{coop.capacity.toLocaleString('id-ID')} ekor</td>
                    <td className="px-4 py-3 min-w-32">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200"><div className={`h-full ${occupancyRate > 95 ? 'bg-amber-500' : 'bg-emerald-600'}`} style={{ width: `${Math.min(100, occupancyRate)}%` }} /></div>
                        <span className="font-bold text-[11px]">{occupancyRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-amber-700">{calculatedAgeWeeks} minggu</td>
                    <td className="px-4 py-3 font-medium">{coop.breed}</td>
                    <td className="px-4 py-3 capitalize">{coop.housingType.replace('_', ' ')}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{coop.entryDate}</td>
                    <td className="px-4 py-3"><span className={`inline-flex px-2 py-1 rounded-full border font-semibold text-[10px] ${ageStatusColor}`}>{ageStatusLabel}</span></td>
                    {canManageCoops && (
                      <td className="px-4 py-3"><div className="flex justify-center gap-1">
                        <button onClick={() => setEditingCoop(coop)} title="Edit kandang" className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(coop)} title="Hapus kandang" className="p-2 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div></td>
                    )}
                  </tr>
                );
              })}
              {sortedCoops.length === 0 && <tr><td colSpan={11} className="px-4 py-10 text-center text-slate-500">Belum ada data kandang.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Coop Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl text-slate-900">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Tambah Kandang Layer Baru</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-medium">Nama Kandang</label>
                <input
                  type="text"
                  placeholder="Contoh: Kandang A3 - Closed House"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Kode Kandang</label>
                  <input
                    type="text"
                    placeholder="KDG-A3"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Tipe Kandang</label>
                  <select
                    value={housingType}
                    onChange={(e) => setHousingType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  >
                    <option value="battery">Battery Cage</option>
                    <option value="closed_house">Closed House</option>
                    <option value="open_house">Open House</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">Tanggal Check-in</label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Kapasitas Maksimal</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Populasi Awal (Ekor)</label>
                  <input
                    type="number"
                    value={currentChickens}
                    onChange={(e) => setCurrentChickens(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Umur Ayam (Minggu)</label>
                  <input
                    type="number"
                    value={calculateAgeWeeks(entryDate)}
                    readOnly
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 cursor-not-allowed"
                  />
                  <p className="mt-1 text-[10px] text-slate-500">Dihitung otomatis dari tanggal check-in.</p>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Ras / Strain</label>
                  <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Simpan Kandang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Coop Modal */}
      {editingCoop && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl text-slate-900">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Edit Data Kandang {editingCoop.code}</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-medium">Nama Kandang</label>
                <input
                  type="text"
                  value={editingCoop.name}
                  onChange={(e) => setEditingCoop({ ...editingCoop, name: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Kode Kandang</label>
                  <input type="text" value={editingCoop.code} onChange={(e) => setEditingCoop({ ...editingCoop, code: e.target.value.toUpperCase() })} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-mono uppercase" />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Tipe Kandang</label>
                  <select value={editingCoop.housingType} onChange={(e) => setEditingCoop({ ...editingCoop, housingType: e.target.value as Coop['housingType'] })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white">
                    <option value="battery">Battery Cage</option>
                    <option value="closed_house">Closed House</option>
                    <option value="open_house">Open House</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Kapasitas Maksimal</label>
                  <input type="number" min="0" value={editingCoop.capacity} onChange={(e) => setEditingCoop({ ...editingCoop, capacity: Number(e.target.value), initialChickens: Number(e.target.value) })} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Jumlah Ayam Hidup</label>
                  <input
                    type="number"
                    value={editingCoop.currentChickens}
                    onChange={(e) => setEditingCoop({ ...editingCoop, currentChickens: Number(e.target.value) })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Umur (Minggu)</label>
                  <input
                    type="number"
                    value={calculateAgeWeeks(editingCoop.entryDate)}
                    readOnly
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 cursor-not-allowed"
                  />
                  <p className="mt-1 text-[10px] text-slate-500">Dihitung otomatis dari tanggal check-in.</p>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Ras / Strain</label>
                  <input type="text" value={editingCoop.breed} onChange={(e) => setEditingCoop({ ...editingCoop, breed: e.target.value })} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Tanggal Check-in</label>
                  <input type="date" value={editingCoop.entryDate} onChange={(e) => setEditingCoop({ ...editingCoop, entryDate: e.target.value, ageWeeks: calculateAgeWeeks(e.target.value) })} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Status</label>
                  <select value={editingCoop.status} onChange={(e) => setEditingCoop({ ...editingCoop, status: e.target.value as Coop['status'] })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white">
                    <option value="active">Aktif</option>
                    <option value="quarantine">Karantina</option>
                    <option value="maintenance">Pemeliharaan</option>
                    <option value="empty">Kosong</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCoop(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Perbarui
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
