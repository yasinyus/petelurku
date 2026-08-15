import React, { useEffect, useState } from 'react';
import { Egg, Plus, Filter, CheckCircle2, Pencil, Trash2, CalendarDays, Warehouse, X } from 'lucide-react';
import { Coop, EggProductionLog, User } from '../../types';
import { ApiService } from '../../services/api';
import { getLocalDateInputValue } from '../../utils/date';

interface EggProductionModuleProps {
  coops: Coop[];
  productionLogs: EggProductionLog[];
  onAddLog: (log: Omit<EggProductionLog, 'id' | 'henDayRate' | 'synced'>) => Promise<void> | void;
  onUpdateLog: (log: EggProductionLog) => Promise<void> | void;
  onDeleteLog: (id: string) => Promise<void> | void;
  currentUser: User;
  autoOpenAddModal?: boolean;
}

export const EggProductionModule: React.FC<EggProductionModuleProps> = ({
  coops,
  productionLogs,
  onAddLog,
  onUpdateLog,
  onDeleteLog,
  currentUser,
  autoOpenAddModal = false,
}) => {
  const [showAddModal, setShowAddModal] = useState(autoOpenAddModal);
  const [editingLog, setEditingLog] = useState<EggProductionLog | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCoopFilter, setSelectedCoopFilter] = useState<string>('all');

  // Form states
  const [coopId, setCoopId] = useState(coops[0]?.id || '');
  const [date, setDate] = useState(getLocalDateInputValue());
  const [timeSlot, setTimeSlot] = useState<'pagi' | 'siang' | 'sore'>('pagi');
  const [goodEggs, setGoodEggs] = useState(1820);
  const [brokenEggs, setBrokenEggs] = useState(12);
  const [totalWeightKg, setTotalWeightKg] = useState(114.5);
  const [mortalityCount, setMortalityCount] = useState(0);
  const [feedUsageKg, setFeedUsageKg] = useState(0);
  const [gramsPerChicken, setGramsPerChicken] = useState(110);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!coops.some((coop) => coop.id === coopId)) setCoopId(coops[0]?.id || '');
  }, [coops, coopId]);

  useEffect(() => {
    ApiService.getFeedConsumptionSetting().then((result) => {
      if (result.data?.gramsPerChicken) setGramsPerChicken(Number(result.data.gramsPerChicken));
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!showAddModal || editingLog) return;
    if (timeSlot === 'pagi') {
      const coop = coops.find((item) => item.id === coopId);
      setFeedUsageKg(coop ? Number(((coop.currentChickens * gramsPerChicken) / 1000).toFixed(2)) : 0);
    } else {
      setFeedUsageKg(0);
    }
  }, [showAddModal, editingLog, timeSlot, coopId, gramsPerChicken, coops]);

  const selectedCoop = coops.find(c => c.id === coopId);
  const currentTotalEggs = goodEggs + brokenEggs;
  const estimatedHdp = selectedCoop && selectedCoop.currentChickens > 0
    ? ((currentTotalEggs / selectedCoop.currentChickens) * 100).toFixed(1)
    : '90.0';
  const estimatedFcr = totalWeightKg > 0 && feedUsageKg > 0 ? (feedUsageKg / totalWeightKg).toFixed(2) : '-';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coopId) return;

    setIsSaving(true);
    try {
      const values = {
        coopId,
        date,
        timeSlot,
        goodEggs,
        brokenEggs,
        totalEggs: currentTotalEggs,
        totalWeightKg,
        mortalityCount,
        feedUsageKg,
        recordedBy: currentUser.name,
        notes
      };
      if (editingLog) {
        await onUpdateLog({ ...editingLog, ...values, totalEggs: currentTotalEggs, henDayRate: Number(estimatedHdp) });
      } else {
        await onAddLog(values);
      }
      setShowAddModal(false);
      setEditingLog(null);
    } catch (error: any) {
      window.alert(error.message || 'Gagal menyimpan produksi ke MySQL');
    } finally {
      setIsSaving(false);
    }
  };

  const openAddModal = () => {
    setEditingLog(null);
    setCoopId(coops[0]?.id || '');
    setDate(getLocalDateInputValue());
    setTimeSlot('pagi');
    setGoodEggs(0);
    setBrokenEggs(0);
    setTotalWeightKg(0);
    setMortalityCount(0);
    setFeedUsageKg(0);
    setNotes('');
    setShowAddModal(true);
  };

  const openEditModal = (log: EggProductionLog) => {
    setEditingLog(log);
    setCoopId(log.coopId);
    setDate(log.date);
    setTimeSlot(log.timeSlot);
    setGoodEggs(log.goodEggs);
    setBrokenEggs(log.brokenEggs);
    setTotalWeightKg(log.totalWeightKg);
    setMortalityCount(log.mortalityCount || 0);
    setFeedUsageKg(log.feedUsageKg || 0);
    setNotes(log.notes || '');
    setShowAddModal(true);
  };

  const handleDelete = async (log: EggProductionLog) => {
    if (!window.confirm(`Hapus data produksi ${log.date} sesi ${log.timeSlot}? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await onDeleteLog(log.id);
    } catch (error: any) {
      window.alert(error.message || 'Gagal menghapus data produksi');
    }
  };

  const filteredLogs = selectedCoopFilter === 'all'
    ? productionLogs
    : productionLogs.filter(l => l.coopId === selectedCoopFilter);

  return (
    <div className="space-y-6">
      
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Egg className="w-5 h-5 text-amber-600" />
            Pencatatan Produksi Telur Harian
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Input jumlah telur utuh, retak, berat total, dan pantau otomatis Hen Day Production (HDP %).
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="w-full sm:w-auto justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-3 rounded-xl text-sm sm:text-xs flex items-center gap-2 transition cursor-pointer shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Input Hasil Panen Telur
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex w-full sm:w-auto items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="hidden sm:inline text-slate-700 font-medium">Filter Kandang:</span>
          <select
            value={selectedCoopFilter}
            onChange={(e) => setSelectedCoopFilter(e.target.value)}
            className="min-w-0 flex-1 sm:flex-none bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-600 font-medium"
          >
            <option value="all">Semua Kandang ({productionLogs.length} Entri)</option>
            {coops.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
            ))}
          </select>
        </div>

        <div className="text-slate-500 text-[11px]">
          Menampilkan <span className="font-bold text-slate-800">{filteredLogs.length}</span> catatan produksi
        </div>
      </div>

      {/* Logs Table */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Tanggal / Waktu</th>
                <th className="py-3 px-4">Kandang</th>
                <th className="py-3 px-4 text-right">Telur Utuh</th>
                <th className="py-3 px-4 text-right">Telur Rusak</th>
                <th className="py-3 px-4 text-right">Total (Butir)</th>
                <th className="py-3 px-4 text-right">Berat (Kg)</th>
                <th className="py-3 px-4 text-right">Pakan (Kg)</th>
                <th className="py-3 px-4 text-right">FCR</th>
                <th className="py-3 px-4 text-right">Kematian</th>
                <th className="py-3 px-4 text-right">Hen Day Rate (HDP)</th>
                <th className="py-3 px-4">Pencatat</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {filteredLogs.map((log) => {
                const coop = coops.find(c => c.id === log.coopId);
                const isGoodHdp = log.henDayRate >= 85;

                return (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{log.date}</div>
                      <div className="text-[10px] text-slate-500 capitalize">Sesi: {log.timeSlot}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {coop ? coop.code : log.coopId}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      {log.goodEggs.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-rose-600">
                      {log.brokenEggs}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900">
                      {log.totalEggs.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right text-amber-700 font-bold">
                      {log.totalWeightKg} kg
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-teal-700">{(log.feedUsageKg || 0).toLocaleString('id-ID')} kg</td>
                    <td className="py-3 px-4 text-right">
                      {log.totalWeightKg > 0 && (log.feedUsageKg || 0) > 0 ? (
                        <span className={`px-2 py-0.5 rounded font-bold border ${((log.feedUsageKg || 0) / log.totalWeightKg) <= 2.1 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : ((log.feedUsageKg || 0) / log.totalWeightKg) <= 2.3 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>{((log.feedUsageKg || 0) / log.totalWeightKg).toFixed(2)}</span>
                      ) : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-rose-700">{log.mortalityCount || 0}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        isGoodHdp ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {log.henDayRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {log.recordedBy}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEditModal(log)} title="Edit data" className="p-2 rounded-lg text-blue-700 hover:bg-blue-50 cursor-pointer"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(log)} title="Hapus data" className="p-2 rounded-lg text-rose-700 hover:bg-rose-50 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile production cards */}
      <div className="grid gap-3 md:hidden">
        {filteredLogs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <Egg className="mx-auto h-9 w-9 text-slate-300" />
            <p className="mt-3 text-sm font-bold text-slate-700">Belum ada produksi</p>
            <p className="mt-1 text-xs text-slate-500">Tekan tombol input untuk mencatat panen hari ini.</p>
          </div>
        )}
        {filteredLogs.map((log) => {
          const coop = coops.find(c => c.id === log.coopId);
          const fcr = log.totalWeightKg > 0 && (log.feedUsageKg || 0) > 0
            ? ((log.feedUsageKg || 0) / log.totalWeightKg).toFixed(2)
            : '-';
          return (
            <article key={log.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500"><CalendarDays className="h-3.5 w-3.5" />{log.date} · <span className="capitalize">{log.timeSlot}</span></div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-sm font-black text-slate-900"><Warehouse className="h-4 w-4 text-emerald-600" />{coop?.name || log.coopId}</div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-black ${log.henDayRate >= 85 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>HDP {log.henDayRate}%</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-emerald-50 p-2.5"><div className="text-[10px] font-semibold text-emerald-700">Telur utuh</div><div className="mt-0.5 text-base font-black text-emerald-800">{log.goodEggs.toLocaleString('id-ID')}</div></div>
                <div className="rounded-xl bg-rose-50 p-2.5"><div className="text-[10px] font-semibold text-rose-700">Rusak</div><div className="mt-0.5 text-base font-black text-rose-800">{log.brokenEggs.toLocaleString('id-ID')}</div></div>
                <div className="rounded-xl bg-slate-100 p-2.5"><div className="text-[10px] font-semibold text-slate-600">Total</div><div className="mt-0.5 text-base font-black text-slate-900">{log.totalEggs.toLocaleString('id-ID')}</div></div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-500">
                <div><span className="block font-black text-slate-800">{log.totalWeightKg} kg</span>Berat</div>
                <div><span className="block font-black text-slate-800">{log.feedUsageKg || 0} kg</span>Pakan</div>
                <div><span className="block font-black text-slate-800">{fcr}</span>FCR</div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="truncate pr-2 text-[11px] text-slate-500">Dicatat oleh {log.recordedBy}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEditModal(log)} aria-label="Edit data" className="rounded-lg bg-blue-50 p-2.5 text-blue-700"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(log)} aria-label="Hapus data" className="rounded-lg bg-rose-50 p-2.5 text-rose-700"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Add Log Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="relative flex max-h-[94dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl text-slate-900 sm:max-h-[90vh] sm:rounded-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
              <div><h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Egg className="w-5 h-5 text-emerald-600" />
              {editingLog ? 'Edit Hasil Panen Telur' : 'Catat Hasil Panen Telur'}
            </h3><p className="text-xs text-slate-500 mt-1">
              Hen Day Production (HDP %) dihitung otomatis berdasarkan jumlah ayam hidup di kandang.
            </p></div>
              <button type="button" aria-label="Tutup form" onClick={() => { setShowAddModal(false); setEditingLog(null); }} className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col text-xs">
              <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 pb-28 sm:px-6 sm:pb-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Pilih Kandang</label>
                  <select
                    value={coopId}
                    onChange={(e) => setCoopId(e.target.value)}
                    required
                    className="w-full min-h-12 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-base sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
                  >
                    {coops.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.currentChickens} ekor)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Tanggal Panen</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full min-h-12 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-base sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
                  />
                </div>
              </div>

              {(timeSlot === 'pagi' || timeSlot === 'siang') && (
                <div>
                  <label className="block text-emerald-700 mb-1 font-bold">Pakan (Kg)</label>
                  <input type="number" inputMode="decimal" min={0} step="0.1" value={feedUsageKg} onChange={(e) => setFeedUsageKg(Number(e.target.value))} className="w-full min-h-12 bg-slate-50 border border-emerald-200 rounded-xl px-3 py-3 text-lg text-slate-900 focus:outline-none focus:border-emerald-600 font-bold" />
                  <p className="text-[10px] text-slate-500 mt-1">{timeSlot === 'pagi' ? `Terisi otomatis: ${selectedCoop?.currentChickens.toLocaleString('id-ID') || 0} ekor × ${gramsPerChicken} gram.` : 'Stok bahan dikurangi otomatis sesuai komposisi pakan.'}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 mb-1 font-medium">Waktu Sesi</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value as any)}
                    className="w-full min-h-12 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-base sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 capitalize"
                  >
                    <option value="pagi">Pagi (07:00)</option>
                    <option value="siang">Siang (12:00)</option>
                    <option value="sore">Sore (16:00)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-emerald-700 mb-1 font-bold">Telur Utuh (Btr)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={goodEggs}
                    onChange={(e) => setGoodEggs(Number(e.target.value))}
                    required
                    min={0}
                    className="w-full min-h-12 bg-slate-50 border border-emerald-200 rounded-xl px-3 py-3 text-lg text-slate-900 focus:outline-none focus:border-emerald-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-rose-600 mb-1 font-bold">Telur Rusak/Retak</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={brokenEggs}
                    onChange={(e) => setBrokenEggs(Number(e.target.value))}
                    required
                    min={0}
                    className="w-full min-h-12 bg-slate-50 border border-rose-200 rounded-xl px-3 py-3 text-lg text-slate-900 focus:outline-none focus:border-rose-600 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-700 mb-1 font-bold">Total Berat (Kg)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={totalWeightKg}
                    onChange={(e) => setTotalWeightKg(Number(e.target.value))}
                    required
                    min={0}
                    className="w-full min-h-12 bg-slate-50 border border-amber-200 rounded-xl px-3 py-3 text-lg text-slate-900 focus:outline-none focus:border-amber-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-rose-700 mb-1 font-bold">Kematian (Ekor)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={mortalityCount}
                    onChange={(e) => setMortalityCount(Number(e.target.value))}
                    className="w-full min-h-12 bg-slate-50 border border-rose-200 rounded-xl px-3 py-3 text-lg text-slate-900 focus:outline-none focus:border-rose-600 font-bold"
                  />
                </div>

                {/* Live Preview HDP Badge */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-center">
                  <span className="text-[10px] text-slate-500 font-medium">Estimasi HDP Rate:</span>
                  <span className="text-xl font-black text-emerald-700">{estimatedHdp}%</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-center">
                  <span className="text-[10px] text-slate-500 font-medium">Estimasi FCR:</span>
                  <span className="text-xl font-black text-teal-700">{estimatedFcr}</span>
                  <span className="text-[9px] text-slate-400">Pakan ÷ berat telur</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">Catatan Petugas (Opsional)</label>
                <input
                  type="text"
                  placeholder="Kondisi cangkang, nafsu makan, suhu udara..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-12 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-base sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 flex gap-2 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:static sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingLog(null); }}
                  className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-[2] sm:flex-none justify-center px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSaving ? 'Menyimpan...' : editingLog ? 'Simpan Perubahan' : 'Simpan Entri'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
