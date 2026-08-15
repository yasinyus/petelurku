import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Server, 
  CheckCircle2, 
  Copy, 
  Download, 
  X, 
  RefreshCw, 
  Terminal, 
  Code2, 
  Table, 
  ShieldCheck, 
  Layers, 
  FileCode2,
  ExternalLink
} from 'lucide-react';
import { ApiService, HealthCheckResponse } from '../../services/api';

interface MySQLInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MySQLInspectorModal: React.FC<MySQLInspectorModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'status' | 'schema' | 'endpoints' | 'migration'>('status');
  const [healthData, setHealthData] = useState<HealthCheckResponse | null>(null);
  const [sqlSchema, setSqlSchema] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [migrationLog, setMigrationLog] = useState<string | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchStatusAndSchema();
    }
  }, [isOpen]);

  const fetchStatusAndSchema = async () => {
    setIsLoading(true);
    const health = await ApiService.getHealthStatus();
    const schema = await ApiService.getMySQLSchemaSQL();
    setHealthData(health);
    setSqlSchema(schema);
    setIsLoading(false);
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSchema = () => {
    const blob = new Blob([sqlSchema], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chicksync_mysql_schema.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRunMigration = async () => {
    setIsMigrating(true);
    setMigrationLog('⏳ Menjalankan script migrasi tabel & seeding akun SaaS Owner...');
    const result = await ApiService.runMigration();
    setIsMigrating(false);
    if (result && result.success) {
      setMigrationLog(
        `✅ MIGRASI SUKSES!\nEngine: ${result.source.toUpperCase()}\nStatus: ${result.message}\n\nAkun Owner SaaS Terdaftar:\n- Email: admin@chicksync.saas\n- Role: saas_owner\n- Nama: Super Admin PetelurKu.com`
      );
    } else {
      setMigrationLog(`❌ MIGRASI GAGAL: ${result?.message || 'Error tidak diketahui'}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-6 shadow-2xl text-slate-900 text-xs relative my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                Arsitektur Relational Database MySQL & Express API
                <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  MySQL 8.0 Ready
                </span>
              </h2>
              <p className="text-slate-500 text-[11px]">
                Aplikasi full-stack Express ini sudah dikonfigurasi dengan skema database relasional MySQL & REST API.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-2 mb-4">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-2 px-3 border-b-2 font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'status'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-4 h-4" /> Status Koneksi & API
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`py-2 px-3 border-b-2 font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'schema'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode2 className="w-4 h-4" /> Skema SQL (`schema.sql`)
          </button>

          <button
            onClick={() => setActiveTab('endpoints')}
            className={`py-2 px-3 border-b-2 font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'endpoints'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" /> REST API Endpoints (`/api/*`)
          </button>

          <button
            onClick={() => setActiveTab('migration')}
            className={`py-2 px-3 border-b-2 font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'migration'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" /> 🚀 Migrasi Data SaaS Owner
          </button>
        </div>

        {/* TAB 1: STATUS */}
        {activeTab === 'status' && (
          <div className="space-y-4">
            
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-blue-600" />
                  Status Engine Database:
                </span>
                <button
                  onClick={fetchStatusAndSchema}
                  disabled={isLoading}
                  className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-bold text-slate-700 flex items-center gap-1 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Status
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Engine / Driver</div>
                  <div className="font-extrabold text-slate-900 mt-0.5">MySQL 8.0 / MariaDB (`mysql2`)</div>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Koneksi Host / DB</div>
                  <div className="font-extrabold text-slate-900 mt-0.5">
                    {healthData?.database.host || 'localhost'} / {healthData?.database.dbName || 'kandang_baru'}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
                <div className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" /> API Express Server & Modul MySQL Aktif
                </div>
                <p className="text-[11px] text-blue-800 mt-1">
                  {healthData?.database.message}
                </p>
              </div>
            </div>

            {/* Config Variables */}
            <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-2">
              <div className="font-bold text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-400" /> Environment Variables (`.env.example` / `.env`):
              </div>
              <div className="text-emerald-400">
                MYSQL_HOST=localhost<br/>
                MYSQL_PORT=3306<br/>
                MYSQL_USER=root<br/>
                MYSQL_PASSWORD=<br/>
                MYSQL_DATABASE=kandang_baru
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: SCHEMA SQL */}
        {activeTab === 'schema' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Skema SQL Relasional (`src/db/schema.sql`):</span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopySchema}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  {copied ? 'Tersalin!' : 'Salin SQL'}
                </button>
                <button
                  onClick={handleDownloadSchema}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh `schema.sql`
                </button>
              </div>
            </div>

            <pre className="p-4 bg-slate-950 text-emerald-400 rounded-xl font-mono text-[11px] max-h-80 overflow-y-auto whitespace-pre-wrap border border-slate-800 leading-relaxed">
              {sqlSchema}
            </pre>
          </div>
        )}

        {/* TAB 3: ENDPOINTS */}
        {activeTab === 'endpoints' && (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            <div className="font-bold text-slate-800 mb-2">REST API Routes yang Disediakan Server (`server.ts`):</div>

            <div className="space-y-2">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] mr-2">GET</span>
                  <span className="font-mono font-bold text-slate-900">/api/health</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Status kesehatan server Express & pinger MySQL</p>
                </div>
                <a href="/api/health" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-[11px] font-bold flex items-center gap-1">
                  Uji Endpoint <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] mr-2">GET</span>
                  <span className="font-mono font-bold text-slate-900">/api/mysql/schema</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Unduh/Lihat file skema SQL mentah</p>
                </div>
                <a href="/api/mysql/schema" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-[11px] font-bold flex items-center gap-1">
                  Lihat SQL <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] mr-2">GET</span>
                  <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px] mr-2">POST</span>
                  <span className="font-mono font-bold text-slate-900">/api/farms</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">CRUD data peternakan & tenant SaaS</p>
                </div>
                <a href="/api/farms" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-[11px] font-bold flex items-center gap-1">
                  Data JSON <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] mr-2">GET</span>
                  <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px] mr-2">POST</span>
                  <span className="font-mono font-bold text-slate-900">/api/harvests</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">CRUD catatan panen telur & Hen Day (HDP %)</p>
                </div>
                <a href="/api/harvests" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-[11px] font-bold flex items-center gap-1">
                  Data JSON <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MIGRATION */}
        {activeTab === 'migration' && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
                  🚀
                </div>
                <div>
                  <h3 className="font-bold text-sm text-emerald-950">Migrasi Data SaaS Owner & Database Schema</h3>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    Fitur ini akan mengeksekusi migrasi skema tabel MySQL lengkap (`schema.sql`) dan secara otomatis membuat akun <strong>SaaS Owner (Super Admin)</strong> dengan kredensial <code>admin@chicksync.saas</code> agar Anda dapat langsung login dan mengelola seluruh tenant peternakan.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleRunMigration}
                  disabled={isMigrating}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition cursor-pointer flex items-center gap-2 shadow-sm text-xs"
                >
                  <RefreshCw className={`w-4 h-4 ${isMigrating ? 'animate-spin' : ''}`} />
                  {isMigrating ? 'Memproses Migrasi...' : 'Jalankan Migrasi Database Sekarang'}
                </button>
              </div>
            </div>

            {migrationLog && (
              <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto whitespace-pre-wrap border border-slate-800 shadow-inner max-h-60">
                {migrationLog}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
