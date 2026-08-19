import React, { useEffect, useState } from 'react';
import { 
  Egg, 
  Home, 
  TrendingUp, 
  Wheat, 
  Syringe, 
  DollarSign, 
  AlertTriangle, 
  Plus, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from 'recharts';
import { Coop, EggProductionLog, FeedItem, FinancialTransaction, HealthLog, VaccinationTask, User } from '../../types';
import { TabType } from '../Sidebar';
import { getLocalDateInputValue, shiftCalendarDate } from '../../utils/date';
import { ApiService } from '../../services/api';

interface OverviewDashboardProps {
  coops: Coop[];
  productionLogs: EggProductionLog[];
  feeds: FeedItem[];
  vaccinations: VaccinationTask[];
  healthLogs: HealthLog[];
  transactions: FinancialTransaction[];
  eggEstimate: { totalWeightKg: number; pricePerKg: number; estimatedRevenue: number };
  dailyFeedCost: {
    materials: Array<{ id: string; name: string; feedType: string; consumedKg: number; pricePerKg: number; subtotal: number }>;
    houses?: Array<{ houseId: string; code: string; name: string; chickenCount: number; isProductive: boolean; consumedKg: number; totalCost: number }>;
    totalConsumedKg: number;
    totalCost: number;
  };
  currentUser: User;
  onNavigate: (tab: TabType) => void;
  onQuickAddEgg: () => void;
  onQuickAddExpense: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  coops,
  productionLogs,
  feeds,
  vaccinations,
  transactions,
  eggEstimate,
  dailyFeedCost,
  onNavigate,
  onQuickAddEgg,
  onQuickAddExpense
}) => {
  const [dashboardPeriod, setDashboardPeriod] = useState<'today' | 'yesterday'>('today');
  const eggPricePerKg = Number(eggEstimate?.pricePerKg) || 26000;
  // Calculated stats
  const totalChickens = coops.reduce((sum, c) => sum + c.currentChickens, 0);
  
  // Real production for the current local calendar date. Multiple harvest
  // sessions and houses are all included in today's totals.
  const today = getLocalDateInputValue();
  const selectedDate = dashboardPeriod === 'today' ? today : shiftCalendarDate(today, -1);
  const selectedPeriodLabel = dashboardPeriod === 'today' ? 'Hari Ini' : 'Kemarin';
  const selectedDateLabel = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC'
  }).format(new Date(`${selectedDate}T00:00:00Z`));
  const selectedLogs = productionLogs.filter(log => log.date === selectedDate);
  const selectedTotalEggs = selectedLogs.reduce((sum, p) => sum + p.totalEggs, 0);
  const selectedGoodEggs = selectedLogs.reduce((sum, p) => sum + p.goodEggs, 0);
  const selectedBrokenEggs = selectedLogs.reduce((sum, p) => sum + p.brokenEggs, 0);
  const selectedWeightKg = selectedLogs.reduce((sum, p) => sum + p.totalWeightKg, 0);
  const selectedEggRevenue = selectedWeightKg * eggPricePerKg;
  const [selectedFeedCost, setSelectedFeedCost] = useState(dailyFeedCost);
  useEffect(() => {
    if (dashboardPeriod === 'today') {
      setSelectedFeedCost(dailyFeedCost);
      return;
    }
    ApiService.getDailyFeedCost(selectedDate).then((result) => {
      if (result.data) setSelectedFeedCost(result.data);
    }).catch(() => setSelectedFeedCost({ materials: [], houses: [], totalConsumedKg: 0, totalCost: 0 }));
  }, [dashboardPeriod, selectedDate, dailyFeedCost]);
  const selectedProfitLoss = selectedEggRevenue - Number(selectedFeedCost.totalCost || 0);

  const productivePopulation = coops
    .filter(coop => coop.ageWeeks >= 20)
    .reduce((sum, coop) => sum + coop.currentChickens, 0);
  const coopDailyProfitRows = coops.map((coop) => {
    const logs = selectedLogs.filter(log => log.coopId === coop.id);
    const totalEggs = logs.reduce((sum, log) => sum + log.totalEggs, 0);
    const weightKg = logs.reduce((sum, log) => sum + log.totalWeightKg, 0);
    const revenue = weightKg * eggPricePerKg;
    const feedHouse = selectedFeedCost.houses?.find(house => house.houseId === coop.id);
    const fallbackRatio = coop.ageWeeks >= 20 && productivePopulation > 0
      ? coop.currentChickens / productivePopulation
      : 0;
    const feedCost = feedHouse
      ? Number(feedHouse.totalCost || 0)
      : Number(selectedFeedCost.totalCost || 0) * fallbackRatio;
    const profitLoss = revenue - feedCost;
    const hdp = coop.currentChickens > 0 ? (totalEggs / coop.currentChickens) * 100 : 0;
    return { coop, totalEggs, weightKg, revenue, feedCost, profitLoss, hdp };
  });

  const avgHdp = selectedTotalEggs && totalChickens 
    ? Number(((selectedTotalEggs / totalChickens) * 100).toFixed(1)) 
    : 0;

  // Financial totals
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

  // Low feeds
  const lowFeeds = feeds.filter(f => f.currentStockKg <= f.minThresholdKg);

  // Overdue or upcoming vaccinations (next 3 days)
  const pendingVaccines = vaccinations.filter(v => v.status === 'scheduled' || v.status === 'overdue');

  // Chart Data preparation (group by date)
  const chartMap: { [date: string]: { date: string; hdp: number; utuh: number; rusak: number; count: number } } = {};
  
  productionLogs.forEach(log => {
    if (!chartMap[log.date]) {
      chartMap[log.date] = { date: log.date, hdp: 0, utuh: 0, rusak: 0, count: 0 };
    }
    chartMap[log.date].hdp += log.henDayRate;
    chartMap[log.date].utuh += log.goodEggs;
    chartMap[log.date].rusak += log.brokenEggs;
    chartMap[log.date].count += 1;
  });

  const chartData = Object.values(chartMap)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-10)
    .map(d => ({
      date: d.date.substring(5), // MM-DD
      avgHdp: Number((d.hdp / (d.count || 1)).toFixed(1)),
      utuh: d.utuh,
      rusak: d.rusak,
      total: d.utuh + d.rusak
    }));

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Hero Quick Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                Ringkasan Performansi Real-Time
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Data Terenkripsi E2EE
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Manajemen Kandang Layer Terpadu
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Pantau {totalChickens.toLocaleString('id-ID')} ekor ayam di {coops.length} kandang aktif secara efisien.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={onQuickAddEgg}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Catat Panen Telur
            </button>
            <button
              onClick={onQuickAddExpense}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 border border-slate-700 transition cursor-pointer"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Catat Biaya / Masuk
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-slate-900">Periode Data Dashboard</p>
          <p className="text-[11px] text-slate-500">Menampilkan data {selectedPeriodLabel.toLowerCase()}, {selectedDateLabel}</p>
        </div>
        <div className="inline-flex rounded-xl bg-slate-100 p-1 self-start sm:self-auto">
          <button type="button" onClick={() => setDashboardPeriod('today')} className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${dashboardPeriod === 'today' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Hari Ini</button>
          <button type="button" onClick={() => setDashboardPeriod('yesterday')} className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${dashboardPeriod === 'yesterday' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Kemarin</button>
        </div>
      </div>

      {/* Onboarding Empty State Card for Real Data Mode */}
      {coops.length === 0 && (
        <div className="bg-white border-2 border-dashed border-emerald-300 rounded-2xl p-6 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto text-2xl font-black shadow-xs">
            🐔
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-extrabold text-slate-900">Belum Ada Data Kandang</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Anda sedang berada di <strong>Mode Data Riil (Peternakan Saya)</strong>. Mulai catat peternakan asli Anda dengan memasukkan data kandang pertama!
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('coops')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Tambah Kandang Pertama
            </button>
            <button
              onClick={() => onNavigate('production')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <Egg className="w-4 h-4" />
              Input Produksi Telur
            </button>
            <button
              onClick={() => onNavigate('feed')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2"
            >
              <Wheat className="w-4 h-4 text-emerald-600" />
              Tambah Stok Pakan
            </button>
          </div>
        </div>
      )}

      {/* Alert Banner if any overdue vaccine or low stock */}
      {(pendingVaccines.length > 0 || lowFeeds.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-amber-900 text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <span className="font-bold text-amber-900">Perhatian Diperlukan!</span>
              <p className="text-amber-800 text-[11px] mt-0.5">
                {pendingVaccines.length > 0 && `${pendingVaccines.length} jadwal vaksinasi pending/terlewat. `}
                {lowFeeds.length > 0 && `${lowFeeds.length} bahan pakan di bawah batas aman.`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {pendingVaccines.length > 0 && (
              <button
                onClick={() => onNavigate('health')}
                className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer"
              >
                Cek Vaksinasi
              </button>
            )}
            {lowFeeds.length > 0 && (
              <button
                onClick={() => onNavigate('feed')}
                className="bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer"
              >
                Cek Stok Pakan
              </button>
            )}
          </div>
        </div>
      )}

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* KPI 1: Production Today */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Produksi {selectedPeriodLabel}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Egg className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {selectedTotalEggs.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">btr</span>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 text-slate-500 pt-2 border-t border-slate-100">
            <span className="text-emerald-700 font-medium">Utuh: {selectedGoodEggs.toLocaleString('id-ID')}</span>
            <span className="text-rose-600 font-medium">Rusak: {selectedBrokenEggs}</span>
            <span className="font-semibold text-slate-700">{selectedWeightKg} kg</span>
          </div>
        </div>

        {/* KPI 2: Hen Day Production (HDP %) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Hen Day Rate (HDP)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-black text-emerald-600">
              {avgHdp}%
            </div>
            <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
              Target &gt; 85%
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex justify-between">
            <span>Populasi Hidup:</span>
            <span className="font-bold text-slate-800">{totalChickens.toLocaleString('id-ID')} ekor</span>
          </div>
        </div>

        {/* KPI 3: Estimated Daily Egg Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pendapatan Telur {selectedPeriodLabel}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            Rp {selectedEggRevenue.toLocaleString('id-ID')}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 mt-2 pt-2 border-t border-slate-100 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{selectedWeightKg.toLocaleString('id-ID')} kg × Rp {eggPricePerKg.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* KPI 4: Calculated daily feed cost */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Biaya Pakan Harian</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Wheat className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            Rp {Number(selectedFeedCost.totalCost || 0).toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex justify-between">
            <span>Konsumsi:</span>
            <span className="font-bold text-amber-700">{Number(selectedFeedCost.totalConsumedKg || 0).toLocaleString('id-ID')} kg/hari</span>
          </div>
        </div>

        <div className={`bg-white border rounded-2xl p-5 shadow-xs transition ${selectedProfitLoss >= 0 ? 'border-emerald-200' : 'border-rose-200'}`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Untung/Rugi {selectedPeriodLabel}</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedProfitLoss >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>
              {selectedProfitLoss >= 0 ? <TrendingUp className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            </div>
          </div>
          <div className={`text-2xl font-black ${selectedProfitLoss >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            {selectedProfitLoss < 0 ? '- ' : ''}Rp {Math.abs(selectedProfitLoss).toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            Pendapatan telur − biaya pakan
          </div>
        </div>

      </div>

      <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div><h3 className="text-sm font-bold text-slate-900">Rincian Biaya Pakan Harian</h3><p className="text-[11px] text-slate-500">Konsumsi populasi layer umur ≥20 minggu dibagi berdasarkan komposisi, lalu dikalikan harga/kg. Kandang berstatus Pullet tidak dihitung.</p></div>
          <span className="text-sm font-black text-amber-800">Rp {Number(selectedFeedCost.totalCost || 0).toLocaleString('id-ID')}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {selectedFeedCost.materials.map((material) => (
            <div key={material.id} className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs">
              <div className="font-bold text-slate-900">{material.name}</div>
              <div className="mt-2 text-slate-600">{Number(material.consumedKg).toLocaleString('id-ID')} kg × Rp {Number(material.pricePerKg).toLocaleString('id-ID')}</div>
              <div className="mt-1 font-black text-amber-800">Rp {Number(material.subtotal).toLocaleString('id-ID')}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Estimasi Laba/Rugi Harian Per Kandang
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Pendapatan telur dikurangi estimasi biaya pakan pada {selectedDateLabel}. Belum termasuk obat, listrik, gaji, dan biaya bersama lainnya.</p>
          </div>
          <span className={`self-start sm:self-auto rounded-lg px-3 py-1.5 text-xs font-black ${selectedProfitLoss >= 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            Total: {selectedProfitLoss < 0 ? '- ' : ''}Rp {Math.abs(selectedProfitLoss).toLocaleString('id-ID')}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-xs text-left">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Kandang</th>
                <th className="px-4 py-3 text-right">Produksi</th>
                <th className="px-4 py-3 text-right">Berat</th>
                <th className="px-4 py-3 text-right">HDP</th>
                <th className="px-4 py-3 text-right">Pendapatan Telur</th>
                <th className="px-4 py-3 text-right">Biaya Pakan</th>
                <th className="px-4 py-3 text-right">Estimasi Laba/Rugi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coopDailyProfitRows.map(({ coop, totalEggs, weightKg, revenue, feedCost, profitLoss, hdp }) => (
                <tr key={coop.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3"><div className="font-bold text-slate-900">{coop.name}</div><div className="text-[10px] text-slate-500">{coop.code}</div></td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">{totalEggs.toLocaleString('id-ID')} btr</td>
                  <td className="px-4 py-3 text-right text-slate-700">{weightKg.toLocaleString('id-ID')} kg</td>
                  <td className="px-4 py-3 text-right"><span className={`font-bold ${hdp >= 85 ? 'text-emerald-700' : 'text-amber-700'}`}>{hdp.toFixed(1)}%</span></td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-700">Rp {revenue.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 text-right font-semibold text-rose-600">Rp {feedCost.toLocaleString('id-ID')}</td>
                  <td className={`px-4 py-3 text-right font-black ${profitLoss >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>{profitLoss < 0 ? '- ' : ''}Rp {Math.abs(profitLoss).toLocaleString('id-ID')}</td>
                </tr>
              ))}
              {coopDailyProfitRows.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Belum ada kandang untuk dihitung.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: HDP Trend */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Tren Performansi Bertelur (HDP %)
              </h3>
              <p className="text-[11px] text-slate-500">Hen Day Production (%) 10 hari terakhir</p>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
              Standar Laying: &gt;85%
            </span>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="hdpColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[70, 100]} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="avgHdp" name="HDP (%)" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#hdpColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Egg Yield Breakdown Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Egg className="w-4 h-4 text-amber-600" />
                Kualitas Hasil Panen Telur (Butir)
              </h3>
              <p className="text-[11px] text-slate-500">Perbandingan Telur Utuh vs Retak/Rusak</p>
            </div>
            <span className="text-xs text-slate-400">Terbaru</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="utuh" name="Telur Utuh" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rusak" name="Telur Retak/Rusak" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Coops Status Overview Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-600" />
              Status Per Kandang
            </h3>
            <p className="text-[11px] text-slate-500">Ringkasan kondisi populasi dan umur ayam</p>
          </div>
          <button
            onClick={() => onNavigate('coops')}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            Lihat Semua Kandang &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coops.map((coop) => (
            <div key={coop.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900">{coop.name}</span>
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                  {coop.code}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Populasi Hidup:</span>
                  <span className="font-semibold text-slate-900">{coop.currentChickens.toLocaleString('id-ID')} ekor</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Umur Ayam:</span>
                  <span className="font-semibold text-amber-700">{coop.ageWeeks} Minggu</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ras / Breed:</span>
                  <span className="text-slate-800 font-medium">{coop.breed}</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Tipe Kandang:</span>
                <span className="capitalize text-emerald-700 font-medium">{coop.housingType.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
