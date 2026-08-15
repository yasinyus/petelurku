import React, { useEffect, useState } from 'react';
import { Wheat, Plus, AlertTriangle, Calculator, ShoppingCart, RefreshCw, CheckCircle2, Trash2 } from 'lucide-react';
import { FeedItem, FeedLog, Coop, User } from '../../types';
import { ApiService } from '../../services/api';

interface FeedManagementModuleProps {
  feeds: FeedItem[];
  coops: Coop[];
  onUpdateFeedStock: (feedId: string, additionalKg: number) => void;
  onCompositionSaved: () => Promise<void> | void;
  currentUser: User;
}

export const FeedManagementModule: React.FC<FeedManagementModuleProps> = ({
  feeds,
  coops,
  onUpdateFeedStock,
  onCompositionSaved,
  currentUser
}) => {
  const [selectedFeedId, setSelectedFeedId] = useState<string>(feeds[0]?.id || '');
  const [restockAmount, setRestockAmount] = useState<number>(500);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [stockAction, setStockAction] = useState<'add' | 'remove'>('add');
  const [composition, setComposition] = useState<Array<{ feedType: string; name: string; percentage: number; pricePerKg: number }>>([
    { feedType: 'corn', name: 'Jagung Giling', percentage: 50, pricePerKg: 5400 },
    { feedType: 'concentrate', name: 'Konsentrat', percentage: 30, pricePerKg: 9200 },
    { feedType: 'bran', name: 'Dedak / Bekatul', percentage: 15, pricePerKg: 3800 },
    { feedType: 'premix', name: 'Premix / Mineral', percentage: 5, pricePerKg: 18000 },
  ]);
  const [compositionMessage, setCompositionMessage] = useState('');
  const [gramsPerChicken, setGramsPerChicken] = useState(110);
  const [consumptionMessage, setConsumptionMessage] = useState('');

  const compositionFeeds: FeedItem[] = composition.map((item) => {
    const savedFeed = feeds.find((feed) => feed.type === item.feedType);
    return savedFeed || { id: `pending-${item.feedType}`, name: item.name, brand: item.name, type: item.feedType, currentStockKg: 0, minThresholdKg: 0, pricePerKg: item.pricePerKg, unit: 'kg' as const };
  });

  useEffect(() => {
    ApiService.getFeedComposition().then((result) => {
      if (!result.data?.length) return;
      setComposition(result.data.map((row: any) => {
        const feed = feeds.find((item) => item.type === row.feed_type);
        return { feedType: row.feed_type, name: feed?.name || row.feed_type, percentage: Number(row.percentage), pricePerKg: Number(feed?.pricePerKg || 0) };
      }));
    }).catch(() => undefined);
  }, [feeds]);

  useEffect(() => {
    ApiService.getFeedConsumptionSetting().then((result) => {
      if (result.data?.gramsPerChicken) setGramsPerChicken(Number(result.data.gramsPerChicken));
    }).catch(() => undefined);
  }, []);

  // Calculator FCR state
  const [calcFeedKg, setCalcFeedKg] = useState<number>(250);
  const [calcEggKg, setCalcEggKg] = useState<number>(115);

  const calculatedFcr = calcEggKg > 0 ? (calcFeedKg / calcEggKg).toFixed(2) : '0.00';
  const fcrNum = parseFloat(calculatedFcr);

  let fcrStatusText = 'Sangat Efisien / Puncak';
  let fcrStatusColor = 'text-emerald-800 bg-emerald-50 border-emerald-200';
  if (fcrNum > 2.3) {
    fcrStatusText = 'Perlu Evaluasi Nutrisi / Pemborosan Pakan';
    fcrStatusColor = 'text-rose-800 bg-rose-50 border-rose-200';
  } else if (fcrNum > 2.1) {
    fcrStatusText = 'Standar Industri Normal';
    fcrStatusColor = 'text-amber-800 bg-amber-50 border-amber-200';
  }

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeedId || restockAmount <= 0) return;
    onUpdateFeedStock(selectedFeedId, stockAction === 'add' ? restockAmount : -restockAmount);
    setShowRestockModal(false);
  };

  const saveComposition = async () => {
    const total = composition.reduce((sum, setting) => sum + setting.percentage, 0);
    if (Math.abs(total - 100) > 0.01) return setCompositionMessage('Total komposisi harus tepat 100%.');
    try {
      await ApiService.saveFeedComposition(composition);
      await onCompositionSaved();
      setCompositionMessage('Komposisi pakan tersimpan di MySQL.');
    } catch (error: any) {
      setCompositionMessage(error.message || 'Gagal menyimpan komposisi.');
    }
  };

  const saveConsumptionSetting = async () => {
    if (!Number.isFinite(gramsPerChicken) || gramsPerChicken <= 0 || gramsPerChicken > 1000) {
      setConsumptionMessage('Nilai harus lebih dari 0 dan maksimal 1.000 gram.');
      return;
    }
    try {
      await ApiService.saveFeedConsumptionSetting(gramsPerChicken);
      await onCompositionSaved();
      setConsumptionMessage('Setelan pakan per ekor berhasil disimpan.');
    } catch (error: any) {
      setConsumptionMessage(error.message || 'Gagal menyimpan setelan pakan per ekor.');
    }
  };

  const updateComposition = (feedType: string, changes: Partial<{ name: string; percentage: number; pricePerKg: number }>) => {
    setComposition((items) => items.map((item) => item.feedType === feedType ? { ...item, ...changes } : item));
  };

  const addComposition = () => {
    const sequence = composition.length + 1;
    setComposition((items) => [...items, { feedType: `bahan-${Date.now()}`, name: `Bahan Baru ${sequence}`, percentage: 0, pricePerKg: 0 }]);
  };

  const removeComposition = (feedType: string) => {
    setComposition((items) => {
      const removed = items.find((item) => item.feedType === feedType);
      const remaining = items.filter((item) => item.feedType !== feedType);
      if (!remaining.length || !removed) return items;
      return remaining.map((item, index) => index === 0 ? { ...item, percentage: Number((item.percentage + removed.percentage).toFixed(2)) } : item);
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Wheat className="w-5 h-5 text-emerald-600" />
            Manajemen Pakan & Calculator FCR (Feed Conversion Ratio)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pantau stok bahan pakan, harga per kg, batas minimal kritis, dan hitung efisiensi konversi pakan ke telur.
          </p>
        </div>

        <button
          onClick={() => { setStockAction('add'); setShowRestockModal(true); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shrink-0"
        >
          <ShoppingCart className="w-4 h-4" />
          Restock / Tambah Pakan
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Setelan Pakan Per Ekor Ayam</h3>
            <p className="text-xs text-slate-500 mt-1">Dipakai untuk mengisi otomatis pakan sesi pagi: populasi ayam × gram per ekor ÷ 1.000.</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end gap-2 min-w-fit">
            <label className="text-xs font-medium text-slate-700">Pakan per Ekor (gram/hari)
              <input type="number" min={0.01} max={1000} step="0.01" value={gramsPerChicken} onChange={(event) => setGramsPerChicken(Number(event.target.value))} className="block mt-1 w-48 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-emerald-600" />
            </label>
            <button onClick={saveConsumptionSetting} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer">Simpan Setelan</button>
          </div>
        </div>
        <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-800">
          Contoh: populasi 2.000 ekor × {gramsPerChicken || 0} gram = <strong>{((2000 * (gramsPerChicken || 0)) / 1000).toLocaleString('id-ID')} kg pakan pagi</strong>.
        </div>
        {consumptionMessage && <p className="text-xs text-slate-600 mt-2">{consumptionMessage}</p>}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div><h3 className="text-sm font-bold text-slate-900">Komposisi Pengurangan Pakan Otomatis</h3><p className="text-xs text-slate-500 mt-1">Digunakan saat pakan pagi atau siang dicatat dari produksi harian.</p></div>
          <div className="flex gap-2"><button onClick={addComposition} className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer">+ Tambah Bahan</button><button onClick={saveComposition} className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer">Simpan Komposisi</button></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {composition.map((item) => (
            <div key={item.feedType} className="border border-slate-200 rounded-xl bg-slate-50 p-3 grid grid-cols-[1fr_110px_auto] gap-2 items-end">
              <label className="block text-slate-700 font-medium">Nama Bahan<input value={item.name} onChange={(e) => updateComposition(item.feedType, { name: e.target.value })} className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-2 py-2 text-slate-900 font-semibold" /></label>
              <label className="block text-slate-700 font-medium">Komposisi (%)<div className="relative mt-1"><input type="number" min={0} max={100} step="0.1" value={item.percentage} onChange={(e) => updateComposition(item.feedType, { percentage: Number(e.target.value) })} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 pr-6 text-slate-900 font-semibold" /><span className="absolute right-2 top-2 text-slate-500">%</span></div></label>
              <button onClick={() => removeComposition(item.feedType)} disabled={composition.length === 1} className="p-2.5 rounded-lg text-rose-700 hover:bg-rose-100 disabled:opacity-40 cursor-pointer" title="Hapus bahan"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-3 text-xs"><span className="text-slate-500">Tambah, edit, atau hapus bahan sebelum menyimpan.</span><strong className={Math.abs(composition.reduce((sum, item) => sum + item.percentage, 0) - 100) < 0.01 ? 'text-emerald-700' : 'text-rose-700'}>Total: {composition.reduce((sum, item) => sum + item.percentage, 0)}%</strong></div>
        {compositionMessage && <p className="text-xs text-slate-600 mt-2">{compositionMessage}</p>}
      </div>

      {/* Feed Stock Inventory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {compositionFeeds.map((feed) => {
          const isLow = feed.currentStockKg <= feed.minThresholdKg;
          const percentage = Math.min(100, (feed.currentStockKg / (feed.minThresholdKg * 3)) * 100);

          return (
            <div 
              key={feed.id} 
              className={`bg-white border rounded-2xl p-4 transition shadow-xs ${
                isLow ? 'border-rose-300' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{feed.name}</h3>
                  <p className="text-[10px] text-slate-500">{feed.brand}</p>
                </div>
                {isLow ? (
                  <span className="bg-rose-50 text-rose-800 border border-rose-200 text-[10px] px-2 py-0.5 rounded font-bold">
                    Kritis!
                  </span>
                ) : (
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] px-2 py-0.5 rounded font-medium">
                    Aman
                  </span>
                )}
              </div>

              <div className="text-2xl font-black text-slate-900 mt-2">
                {feed.currentStockKg.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">kg</span>
              </div>

              {/* Progress Stock Level */}
              <div className="mt-3">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-500">Minimal Stok: {feed.minThresholdKg} kg</span>
                  <span className="text-slate-800 font-semibold">Rp {feed.pricePerKg.toLocaleString('id-ID')}/kg</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div 
                    className={`h-full rounded-full ${isLow ? 'bg-rose-500' : 'bg-emerald-600'}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedFeedId(feed.id); setStockAction('add');
                  setShowRestockModal(true);
                }}
                disabled={feed.id.startsWith('pending-')}
                className="w-full mt-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {feed.id.startsWith('pending-') ? 'Simpan Komposisi Dulu' : '+ Tambah Stok'}
              </button>
              <button
                onClick={() => { setSelectedFeedId(feed.id); setStockAction('remove'); setShowRestockModal(true); }}
                disabled={feed.id.startsWith('pending-') || feed.currentStockKg <= 0}
                className="w-full mt-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                - Kurangi Stok
              </button>
            </div>
          );
        })}
      </div>

      {/* FCR Auto-Calculator Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Simulasi & Calculator Feed Conversion Ratio (FCR)</h3>
            <p className="text-xs text-slate-500">Rumus: Total Pakan Dikonsumsi (kg) ÷ Total Berat Telur Dihasilkan (kg)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 mb-1 font-medium">Total Konsumsi Pakan (Kg)</label>
              <input
                type="number"
                value={calcFeedKg}
                onChange={(e) => setCalcFeedKg(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 font-bold text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1 font-medium">Total Hasil Berat Telur (Kg)</label>
              <input
                type="number"
                value={calcEggKg}
                onChange={(e) => setCalcEggKg(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 font-bold text-sm"
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-center space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hasil FCR Kalkulasi</span>
            <div className="text-4xl font-black text-emerald-700">{calculatedFcr}</div>
            <div className={`text-xs px-3 py-1 rounded-full border inline-block font-bold ${fcrStatusColor}`}>
              {fcrStatusText}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-2 text-slate-700">
            <span className="font-bold text-slate-900">Panduan Standar FCR Ayam Petelur:</span>
            <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
              <li><strong className="text-emerald-700">FCR &lt; 2.10:</strong> Sangat efisien, pakan terkonversi sempurna.</li>
              <li><strong className="text-amber-700">FCR 2.10 - 2.30:</strong> Standar industri produktif layer.</li>
              <li><strong className="text-rose-700">FCR &gt; 2.40:</strong> Boros pakan, cek kesehatan usus/pakan terbuang.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Restock Modal */}
      {showRestockModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl text-slate-900">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{stockAction === 'add' ? 'Tambah Stok Bahan Pakan' : 'Kurangi Stok Bahan Pakan'}</h3>
            <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-medium">Pilih Pakan</label>
                <select
                  value={selectedFeedId}
                  onChange={(e) => setSelectedFeedId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
                >
                  {compositionFeeds.map(f => (
                    <option key={f.id} value={f.id}>{f.name} (Stok Saat Ini: {f.currentStockKg} kg)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">{stockAction === 'add' ? 'Jumlah Tambahan (Kg)' : 'Jumlah Pengurangan (Kg)'}</label>
                <input
                  type="number"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(Number(e.target.value))}
                  required
                  min={1}
                  max={stockAction === 'remove' ? compositionFeeds.find((feed) => feed.id === selectedFeedId)?.currentStockKg : undefined}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  {stockAction === 'add' ? 'Tambah Stok' : 'Kurangi Stok'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
