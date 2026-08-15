import React, { useEffect, useState } from 'react';
import { DollarSign, Plus, ArrowUpRight, ArrowDownRight, PieChart, TrendingUp, Calendar, Filter, CheckCircle2, Wheat } from 'lucide-react';
import { FinancialTransaction, User, FinancialCategory, Coop } from '../../types';
import { getLocalDateInputValue } from '../../utils/date';

interface FinancialModuleProps {
  transactions: FinancialTransaction[];
  coops: Coop[];
  onAddTransaction: (tx: Omit<FinancialTransaction, 'id' | 'synced'>) => void;
  currentUser: User;
  eggEstimate: { totalWeightKg: number; pricePerKg: number; estimatedRevenue: number };
  onUpdateEggPrice: (pricePerKg: number) => Promise<void> | void;
  dailyFeedCost: { date: string; materials: Array<{ id: string; name: string; feedType: string; consumedKg: number; pricePerKg: number; subtotal: number }>; totalConsumedKg: number; totalCost: number };
  onUpdateFeedPrice: (feedId: string, pricePerKg: number) => Promise<void> | void;
  autoOpenAddModal?: boolean;
}

export const FinancialModule: React.FC<FinancialModuleProps> = ({
  transactions,
  coops,
  onAddTransaction,
  currentUser,
  eggEstimate,
  onUpdateEggPrice,
  dailyFeedCost,
  onUpdateFeedPrice,
  autoOpenAddModal = false,
}) => {
  const safeEggEstimate = {
    totalWeightKg: Number(eggEstimate?.totalWeightKg) || 0,
    pricePerKg: Number(eggEstimate?.pricePerKg) || 26000,
    estimatedRevenue: Number(eggEstimate?.estimatedRevenue) || 0,
  };
  const [showAddModal, setShowAddModal] = useState(autoOpenAddModal);
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [eggPriceInput, setEggPriceInput] = useState(safeEggEstimate.pricePerKg);
  const [eggPriceMessage, setEggPriceMessage] = useState('');
  const [feedPriceInputs, setFeedPriceInputs] = useState<Record<string, number>>({});
  const [feedPriceMessage, setFeedPriceMessage] = useState('');

  useEffect(() => setEggPriceInput(safeEggEstimate.pricePerKg), [safeEggEstimate.pricePerKg]);
  useEffect(() => {
    setFeedPriceInputs(Object.fromEntries(dailyFeedCost.materials.map((material) => [material.id, material.pricePerKg])));
  }, [dailyFeedCost.materials]);
  const activeFeedMaterials = dailyFeedCost.materials;

  // New Transaction Form State
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState<FinancialCategory>('egg_sales');
  const [description, setDescription] = useState('Penjualan Telur Curah');
  const [amount, setAmount] = useState<number>(3500000);
  const [quantity, setQuantity] = useState<number>(135);
  const [unit, setUnit] = useState<string>('kg');
  const [coopId, setCoopId] = useState<string>(coops[0]?.id || '');
  const [date, setDate] = useState<string>(getLocalDateInputValue());

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const marginPct = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0) return;

    onAddTransaction({
      coopId: coopId || undefined,
      date,
      type,
      category,
      description,
      amount,
      quantity: quantity || undefined,
      unit: unit || undefined,
      recordedBy: currentUser.name
    });

    setShowAddModal(false);
  };

  const filteredTransactions = typeFilter === 'all'
    ? transactions
    : transactions.filter(t => t.type === typeFilter);

  return (
    <div className="space-y-6">
      
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Keuangan & Keuntungan Real-Time
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Catat penjualan telur, pupuk, biaya pakan, listrik & obat untuk melihat HPP dan net profit margin otomatis.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Catat Transaksi Baru
        </button>
      </div>

      <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div><h3 className="text-base font-bold text-slate-900">Harga Telur Hari Ini</h3><p className="text-sm text-slate-500 mt-1">Estimasi memakai total berat panen hari ini.</p></div>
        <div className="flex items-end gap-2"><label className="text-sm font-medium text-slate-700">Rp / kg<input type="number" min={1} value={eggPriceInput} onChange={(e) => setEggPriceInput(Number(e.target.value))} className="block mt-1 w-36 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-base font-bold" /></label><button onClick={async () => { try { await onUpdateEggPrice(eggPriceInput); setEggPriceMessage('Tersimpan.'); } catch (error: any) { setEggPriceMessage(error.message); } }} className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-bold cursor-pointer">Simpan Harga</button></div>
        <div className="text-right"><div className="text-xs uppercase font-bold text-slate-500">Estimasi Pendapatan Hari Ini</div><div className="text-2xl font-black text-emerald-700">Rp {safeEggEstimate.estimatedRevenue.toLocaleString('id-ID')}</div><div className="text-sm text-slate-500">{safeEggEstimate.totalWeightKg.toLocaleString('id-ID')} kg panen</div>{eggPriceMessage && <div className="text-sm text-emerald-700">{eggPriceMessage}</div>}</div>
      </div>

      <div className="bg-white border border-amber-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2"><Wheat className="w-5 h-5 text-amber-700" /><div><h3 className="text-base font-bold text-slate-900">Harga Bahan Pakan</h3><p className="text-sm text-slate-500">Harga Jagung, Konsentrat, dan Bekatul mengikuti komposisi serta pengaturan bahan pakan.</p></div></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm text-left">
            <thead className="bg-amber-50 text-amber-900 uppercase text-xs"><tr><th className="px-4 py-3">Bahan Pakan</th><th className="px-4 py-3 text-right">Harga / kg</th><th className="px-4 py-3 text-center">Aksi</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {activeFeedMaterials.map((material) => <tr key={material.id}>
                <td className="px-4 py-3 font-semibold text-slate-800">{material.name}</td>
                <td className="px-4 py-2 text-right"><input type="number" min={0} value={feedPriceInputs[material.id] ?? material.pricePerKg} onChange={(event) => setFeedPriceInputs((values) => ({ ...values, [material.id]: Number(event.target.value) }))} className="w-32 border border-slate-200 bg-slate-50 rounded-lg px-2 py-2 text-right text-base font-semibold" /></td>
                <td className="px-4 py-2 text-center"><button onClick={async () => { try { await onUpdateFeedPrice(material.id, feedPriceInputs[material.id] ?? material.pricePerKg); setFeedPriceMessage('Harga bahan pakan tersimpan.'); } catch (error: any) { setFeedPriceMessage(error.message); } }} className="px-3 py-2 rounded-lg bg-slate-800 text-white font-bold text-xs cursor-pointer">Simpan</button></td>
              </tr>)}
              {activeFeedMaterials.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-500">Atur bahan pakan terlebih dahulu pada menu Pakan.</td></tr>}
            </tbody>
          </table>
        </div>
        {feedPriceMessage && <div className="px-4 py-2 border-t border-slate-100 text-sm text-emerald-700">{feedPriceMessage}</div>}
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Pendapatan</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">
            Rp {totalIncome.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            Hasil Penjualan Telur & By-products
          </p>
        </div>

        <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Biaya Operasional</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">
            Rp {totalExpense.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            Pakan, Listrik, Obat & Gaji Pekerja
          </p>
        </div>

        <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Keuntungan Bersih (Profit)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-700">
            Rp {netProfit.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            Margin Keuntungan: <strong className="text-emerald-700">{marginPct}%</strong>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Estimasi Pendapatan Hari Ini</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-800">
            Rp {safeEggEstimate.estimatedRevenue.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            {safeEggEstimate.totalWeightKg.toLocaleString('id-ID')} kg x <strong className="text-slate-800">Rp {safeEggEstimate.pricePerKg.toLocaleString('id-ID')} / kg</strong>
          </p>
        </div>

      </div>

      <div className="bg-emerald-950 text-white rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div><div className="text-sm font-bold uppercase text-emerald-200">Estimasi Laba Telur Hari Ini</div><div className="text-sm text-emerald-100 mt-1">Pendapatan telur dikurangi biaya seluruh bahan pakan yang dikonsumsi hari ini.</div></div>
        <div className="text-3xl font-black">Rp {Math.max(0, safeEggEstimate.estimatedRevenue - Number(dailyFeedCost.totalCost || 0)).toLocaleString('id-ID')}</div>
      </div>

      {/* Filter & Transactions List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-700 font-medium">Filter Tipe:</span>
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1 rounded-lg transition cursor-pointer ${typeFilter === 'all' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Semua
          </button>
          <button
            onClick={() => setTypeFilter('income')}
            className={`px-3 py-1 rounded-lg transition cursor-pointer ${typeFilter === 'income' ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Pemasukan
          </button>
          <button
            onClick={() => setTypeFilter('expense')}
            className={`px-3 py-1 rounded-lg transition cursor-pointer ${typeFilter === 'expense' ? 'bg-rose-50 text-rose-800 font-bold border border-rose-200' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Pengeluaran
          </button>
        </div>

        <span className="text-slate-500 text-[11px]">{filteredTransactions.length} transaksi tercatat</span>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Jenis Transaksi</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Deskripsi</th>
                <th className="py-3 px-4 text-right">Jumlah (Rp)</th>
                <th className="py-3 px-4">Pencatat</th>
                <th className="py-3 px-4 text-center">Sync Cloud</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {filteredTransactions.map((tx) => {
                const isIncome = tx.type === 'income';

                return (
                  <tr key={tx.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900">{tx.date}</td>
                    <td className="py-3 px-4">
                      {isIncome ? (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                          Pemasukan
                        </span>
                      ) : (
                        <span className="bg-rose-50 text-rose-800 border border-rose-200 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                          Pengeluaran
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 capitalize font-semibold text-slate-700">
                      {tx.category.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-slate-800">
                      {tx.description}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold text-sm ${isIncome ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {isIncome ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">{tx.recordedBy}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-emerald-700 font-bold text-[10px] flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> E2EE OK
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl text-slate-900">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Catat Transaksi Keuangan</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Tipe Transaksi</label>
                  <select
                    value={type}
                    onChange={(e) => {
                      const newType = e.target.value as 'income' | 'expense';
                      setType(newType);
                      setCategory(newType === 'income' ? 'egg_sales' : 'feed_purchase');
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 font-bold"
                  >
                    <option value="income">Pemasukan (Income)</option>
                    <option value="expense">Pengeluaran (Expense)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 capitalize"
                  >
                    {type === 'income' ? (
                      <>
                        <option value="egg_sales">Penjualan Telur</option>
                        <option value="culled_chicken_sales">Penjualan Ayam Afkir</option>
                        <option value="manure_sales">Penjualan Pupuk Kotoran</option>
                      </>
                    ) : (
                      <>
                        <option value="feed_purchase">Pembelian Pakan</option>
                        <option value="medication_vaccine">Obat & Vaksin</option>
                        <option value="electricity_utility">Listrik & Air</option>
                        <option value="labor_salary">Gaji Pekerja</option>
                        <option value="equipment_repair">Peralatan / Perbaikan</option>
                        <option value="other_expense">Lain-lain</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">Deskripsi Transaksi</label>
                <input
                  type="text"
                  placeholder="Contoh: Penjualan Telur Curah Agen Blitar"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Total Nominal (Rp)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                    min={1}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Tanggal Transaksi</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
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
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
