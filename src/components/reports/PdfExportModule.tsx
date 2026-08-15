import React, { useState } from 'react';
import { FileSpreadsheet, Download, CheckCircle2, Calendar, FileText, Printer, ShieldCheck } from 'lucide-react';
import { Coop, EggProductionLog, FinancialTransaction, Organization } from '../../types';
import { PdfReportService } from '../../services/pdfReportService';

interface PdfExportModuleProps {
  org: Organization;
  coops: Coop[];
  productionLogs: EggProductionLog[];
  transactions: FinancialTransaction[];
}

export const PdfExportModule: React.FC<PdfExportModuleProps> = ({
  org,
  coops,
  productionLogs,
  transactions
}) => {
  const [reportType, setReportType] = useState<'production' | 'financial'>('production');
  const [datePeriod, setDatePeriod] = useState<string>('Agustus 2026');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = () => {
    setIsExporting(true);
    setTimeout(() => {
      if (reportType === 'production') {
        PdfReportService.generateProductionReport(org, coops, productionLogs, datePeriod);
      } else {
        PdfReportService.generateFinancialReport(org, transactions, datePeriod);
      }
      setIsExporting(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            Ekspor Laporan PDF Profesional
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Unduh laporan resmi format PDF lengkap dengan statistik produksi, rincian keuangan, dan tanda tangan digital.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-emerald-800 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Format Cetak A4 Standar Industri
        </div>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Production Card */}
        <div 
          onClick={() => setReportType('production')}
          className={`bg-white border rounded-2xl p-6 cursor-pointer transition shadow-xs ${
            reportType === 'production' 
              ? 'border-emerald-600 ring-1 ring-emerald-600' 
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold">
              🥚
            </div>
            {reportType === 'production' && (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            )}
          </div>
          <h3 className="text-base font-bold text-slate-900">Laporan Produksi & Performa Harian</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Menampilkan rincian panen telur utuh vs rusak, berat total (kg), dan grafik tren Hen Day Production (HDP %) per kandang.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold">
            {productionLogs.length} Catatan Siap Dicetak
          </div>
        </div>

        {/* Financial Card */}
        <div 
          onClick={() => setReportType('financial')}
          className={`bg-white border rounded-2xl p-6 cursor-pointer transition shadow-xs ${
            reportType === 'financial' 
              ? 'border-blue-600 ring-1 ring-blue-600' 
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
              💰
            </div>
            {reportType === 'financial' && (
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <h3 className="text-base font-bold text-slate-900">Laporan Keuangan & Arus Kas</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Menampilkan rincian pendapatan dari penjualan telur, pengeluaran pakan, obat, listrik, dan perhitungan net profit margin.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-blue-700 font-semibold">
            {transactions.length} Transaksi Siap Dicetak
          </div>
        </div>

      </div>

      {/* Generator Control Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Periode Laporan:</label>
          <input
            type="text"
            value={datePeriod}
            onChange={(e) => setDatePeriod(e.target.value)}
            className="block bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-semibold"
          />
        </div>

        <button
          onClick={handleExportPdf}
          disabled={isExporting}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Memproses PDF...' : `Unduh Laporan PDF ${reportType === 'production' ? 'Produksi' : 'Keuangan'}`}
        </button>
      </div>

    </div>
  );
};
