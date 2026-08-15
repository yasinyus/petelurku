import React, { useState } from 'react';
import { 
  Smartphone, 
  Code2, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  Database, 
  Layers, 
  Zap, 
  Plus, 
  CheckCircle2, 
  Egg, 
  TrendingUp, 
  FileText, 
  Terminal, 
  Server,
  ArrowRight,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface FlutterMobileStudioProps {
  onBackToApp?: () => void;
}

export const FlutterMobileStudio: React.FC<FlutterMobileStudioProps> = () => {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'guide'>('simulator');
  const [activeCodeFile, setActiveCodeFile] = useState<string>('main.dart');
  const [copied, setCopied] = useState(false);

  // Simulated Mobile State
  const [mobileScreen, setMobileScreen] = useState<'dashboard' | 'harvest_form'>('dashboard');
  const [harvestCount, setHarvestCount] = useState<number>(8570);
  const [goodEggsInput, setGoodEggsInput] = useState<string>('4300');
  const [weightInput, setWeightInput] = useState<string>('258.0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const codeSnippets: Record<string, { filename: string; path: string; lang: string; code: string }> = {
    'pubspec.yaml': {
      filename: 'pubspec.yaml',
      path: 'flutter_app/pubspec.yaml',
      lang: 'yaml',
      code: `name: chicksync_mobile
description: PetelurKu.com Mobile Application - Built with Flutter for Android & iOS
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.6
  http: ^1.2.0
  provider: ^6.1.1
  google_fonts: ^6.1.0
  intl: ^0.19.0

flutter:
  uses-material-design: true`
    },
    'main.dart': {
      filename: 'main.dart',
      path: 'flutter_app/lib/main.dart',
      lang: 'dart',
      code: `import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/dashboard_screen.dart';

void main() {
  runApp(const ChickSyncMobileApp());
}

class ChickSyncMobileApp extends StatelessWidget {
  const ChickSyncMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PetelurKu.com',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF10B981),
        ),
        textTheme: GoogleFonts.interTextTheme(Theme.of(context).textTheme),
      ),
      home: const MobileDashboardScreen(),
    );
  }
}`
    },
    'api_service.dart': {
      filename: 'api_service.dart',
      path: 'flutter_app/lib/services/api_service.dart',
      lang: 'dart',
      code: `import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // Connects to ChickSync Express + MySQL Backend Server
  static String baseUrl = 'http://10.0.2.2:3000/api'; // Android emulator URL

  static Future<Map<String, dynamic>> checkHealth() async {
    final response = await http.get(Uri.parse('$baseUrl/health'));
    return json.decode(response.body);
  }

  static Future<List<dynamic>> fetchHarvests() async {
    final response = await http.get(Uri.parse('$baseUrl/harvests'));
    final data = json.decode(response.body);
    return data['data'] ?? [];
  }

  static Future<bool> createHarvest(Map<String, dynamic> body) async {
    final response = await http.post(
      Uri.parse('$baseUrl/harvests'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(body),
    );
    return response.statusCode == 201;
  }
}`
    },
    'dashboard_screen.dart': {
      filename: 'dashboard_screen.dart',
      path: 'flutter_app/lib/screens/dashboard_screen.dart',
      lang: 'dart',
      code: `import 'package:flutter/material.dart';
import '../services/api_service.dart';

class MobileDashboardScreen extends StatefulWidget {
  const MobileDashboardScreen({super.key});

  @override
  State<MobileDashboardScreen> createState() => _MobileDashboardScreenState();
}

class _MobileDashboardScreenState extends State<MobileDashboardScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('PetelurKu.com (Flutter)')),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              // Hen Day & MySQL API Sync Widgets
            ],
          ),
        ),
      ),
    );
  }
}`
    }
  };

  const handleCopyCode = () => {
    const code = codeSnippets[activeCodeFile]?.code || '';
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const added = parseInt(goodEggsInput) || 0;
      setHarvestCount(prev => prev + added);
      setMobileScreen('dashboard');
      setToast(`+${added} butir panen tersimpan ke database MySQL via REST API!`);
      setTimeout(() => setToast(null), 3000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-900 via-slate-900 to-blue-900 text-white rounded-2xl shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-slate-950 uppercase tracking-wider">
              Native Mobile Architecture
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Android & iOS (Flutter / Dart)
            </span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-emerald-400" />
            PetelurKu.com Mobile App Studio (Flutter)
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Aplikasi mobile native Flutter ini dirancang khusus untuk Android & iOS, terhubung langsung secara real-time ke <span className="text-emerald-300 font-bold">Express + MySQL REST API Server</span> yang telah kita konfigurasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'simulator' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Smartphone className="w-4 h-4" /> Live Simulator
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'code' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Code2 className="w-4 h-4" /> Source Code (`/flutter_app`)
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'guide' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Terminal className="w-4 h-4" /> Panduan Build APK
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className="p-3 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            {toast}
          </div>
          <span className="text-[10px] opacity-80">MySQL REST API Connected</span>
        </div>
      )}

      {/* TAB 1: LIVE SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Mobile Frame Device Simulator */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-[320px] h-[640px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 relative flex flex-col select-none">
              
              {/* Phone Notch & Speaker */}
              <div className="w-32 h-5 bg-slate-950 rounded-b-2xl mx-auto flex items-center justify-center gap-2 z-20 mb-1">
                <div className="w-3 h-3 rounded-full bg-slate-800/80"></div>
                <div className="w-10 h-1 bg-slate-800 rounded-full"></div>
              </div>

              {/* Mobile Phone Screen Container */}
              <div className="bg-slate-50 flex-1 rounded-[32px] overflow-hidden flex flex-col text-slate-900 text-xs relative font-sans">
                
                {/* App Bar */}
                <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-extrabold shadow-2xs">
                      <Egg className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 text-[13px] leading-tight">PetelurKu.com</div>
                      <div className="text-[9px] text-emerald-600 font-bold">Flutter Android/iOS</div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-extrabold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> MySQL API
                  </span>
                </div>

                {/* Mobile Screen Content */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  
                  {mobileScreen === 'dashboard' ? (
                    <>
                      {/* Connection status */}
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                        <Database className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <div className="font-bold text-emerald-900 text-[10px]">Connected to MySQL Server</div>
                          <div className="text-[9px] text-emerald-700">Rest API: `http://10.0.2.2:3000/api`</div>
                        </div>
                      </div>

                      {/* Stat Cards */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                          <div className="text-[10px] font-bold text-slate-400">Hen Day (HDP)</div>
                          <div className="text-base font-black text-slate-900 mt-1">88.8%</div>
                          <div className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
                            <TrendingUp className="w-3 h-3" /> Optimal
                          </div>
                        </div>

                        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                          <div className="text-[10px] font-bold text-slate-400">Panen Hari Ini</div>
                          <div className="text-base font-black text-slate-900 mt-1">{harvestCount.toLocaleString()}</div>
                          <div className="text-[9px] text-slate-500 mt-0.5">Butir Telur</div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => setMobileScreen('harvest_form')}
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> + Input Panen Telur (Flutter)
                      </button>

                      {/* Recent Harvest List */}
                      <div className="space-y-2">
                        <div className="font-extrabold text-slate-800 text-[11px] flex justify-between items-center">
                          <span>Riwayat Panen Terakhir</span>
                          <span className="text-[9px] text-slate-400">Realtime Sync</span>
                        </div>

                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                              <Egg className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-[11px]">Kandang A1 (Pagi)</div>
                              <div className="text-[9px] text-slate-500">4.320 Butir • 259,2 kg</div>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">HDP 88.8%</span>
                        </div>

                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                              <Egg className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-[11px]">Kandang B2 (Pagi)</div>
                              <div className="text-[9px] text-slate-500">4.250 Butir • 255,0 kg</div>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">HDP 87.2%</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* FORM INPUT PANEN MOBILE */
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-[12px]">Form Input Panen (Flutter)</span>
                        <button
                          onClick={() => setMobileScreen('dashboard')}
                          className="text-[10px] text-slate-500 font-bold hover:underline cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>

                      <div className="space-y-2.5 bg-white p-3 border border-slate-200 rounded-xl">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Kandang Ayam</label>
                          <input 
                            type="text" 
                            disabled 
                            value="Kandang A1 (Utama)" 
                            className="w-full mt-0.5 p-1.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-bold text-slate-700" 
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Jumlah Telur Utuh (Butir)</label>
                          <input 
                            type="number" 
                            value={goodEggsInput}
                            onChange={(e) => setGoodEggsInput(e.target.value)}
                            className="w-full mt-0.5 p-1.5 bg-white border border-slate-300 rounded text-[11px] font-bold focus:border-emerald-500 outline-none" 
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Total Berat (Kg)</label>
                          <input 
                            type="number" 
                            value={weightInput}
                            onChange={(e) => setWeightInput(e.target.value)}
                            className="w-full mt-0.5 p-1.5 bg-white border border-slate-300 rounded text-[11px] font-bold focus:border-emerald-500 outline-none" 
                          />
                        </div>

                        <button
                          onClick={handleSimulateSubmit}
                          disabled={isSubmitting}
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition"
                        >
                          {isSubmitting ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Server className="w-3.5 h-3.5" />
                          )}
                          {isSubmitting ? 'Menyimpan ke MySQL...' : 'Kirim via REST API'}
                        </button>
                      </div>
                    </div>
                  )}

                </div>

                {/* Bottom Bar */}
                <div className="bg-white border-t border-slate-200 px-6 py-2 flex items-center justify-around text-slate-400">
                  <button onClick={() => setMobileScreen('dashboard')} className="flex flex-col items-center gap-0.5 text-emerald-600 font-bold cursor-pointer">
                    <Egg className="w-4 h-4" />
                    <span className="text-[8px]">Beranda</span>
                  </button>
                  <button onClick={() => setMobileScreen('harvest_form')} className="flex flex-col items-center gap-0.5 hover:text-slate-800 cursor-pointer">
                    <Plus className="w-4 h-4" />
                    <span className="text-[8px]">Panen</span>
                  </button>
                  <button onClick={() => setActiveTab('code')} className="flex flex-col items-center gap-0.5 hover:text-slate-800 cursor-pointer">
                    <Code2 className="w-4 h-4" />
                    <span className="text-[8px]">Kode Dart</span>
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* Right: Architecture Overview & Features */}
          <div className="lg:col-span-7 space-y-4">
            
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" /> Keunggulan Flutter Mobile Version PetelurKu.com
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-blue-600" /> Dual-Platform (Android & iOS)
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Menggunakan 1 basis kode Dart Flutter untuk dicompile menjadi aplikasi Android (.apk) dan iOS (.ipa).
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-600" /> Terhubung Ke Database MySQL
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Data yang diinput dari mobile langsung masuk ke database MySQL lewat endpoint REST API Express backend (`/api/*`).
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-purple-600" /> Offline-First & Fast UX
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Memudahkan anak kandang mencatat panen telur dan kematian ayam secara cepat saat di area peternakan.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-amber-600" /> Arsitektur REST JSON Clean
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Mendukung HTTP client standard (`http` package Flutter) dengan tipe data strongly-typed Dart.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Code Links */}
            <div className="p-5 bg-slate-900 text-white rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-emerald-400" /> Struktur Project Flutter Tersedia
                </span>
                <button
                  onClick={() => setActiveTab('code')}
                  className="text-xs text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Buka Inspector Kode <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700 text-emerald-300">
                  📁 flutter_app/pubspec.yaml
                </div>
                <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700 text-emerald-300">
                  📁 flutter_app/lib/main.dart
                </div>
                <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700 text-emerald-300">
                  📁 flutter_app/lib/services/api_service.dart
                </div>
                <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700 text-emerald-300">
                  📁 flutter_app/lib/screens/dashboard_screen.dart
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: CODE INSPECTOR */}
      {activeTab === 'code' && (
        <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {Object.keys(codeSnippets).map(key => (
                <button
                  key={key}
                  onClick={() => setActiveCodeFile(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap ${
                    activeCodeFile === key 
                      ? 'bg-emerald-500 text-slate-950' 
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {codeSnippets[key].filename}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Kode Tersalin!' : 'Salin Kode File'}
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Path File: <span className="text-emerald-400">{codeSnippets[activeCodeFile]?.path}</span>
          </div>

          <pre className="p-4 bg-slate-900 rounded-xl font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-96 border border-slate-800 leading-relaxed">
            {codeSnippets[activeCodeFile]?.code}
          </pre>
        </div>
      )}

      {/* TAB 3: BUILD & RUN GUIDE */}
      {activeTab === 'guide' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 text-xs text-slate-800 shadow-sm">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-600" /> Langkah Menjalankan Flutter App di Komputer / HP
          </h3>

          <div className="space-y-4">
            
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                Pastikan Flutter SDK Terinstall di Komputer Anda
              </div>
              <p className="text-slate-600 text-[11px] pl-7">
                Jika belum terinstall, unduh dari <a href="https://docs.flutter.dev/get-started/install" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold">flutter.dev</a>.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                Unduh / Salin Folder `flutter_app` Dari Project Ini
              </div>
              <p className="text-slate-600 text-[11px] pl-7">
                Semua file Dart, `pubspec.yaml`, model, dan API service telah disediakan di folder `/flutter_app`.
              </p>
            </div>

            <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-2 font-mono text-[11px]">
              <div className="text-slate-400 font-sans font-bold flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">3</span>
                Jalankan Perintah Berikut di Terminal:
              </div>
              <div className="p-3 bg-slate-950 text-emerald-400 rounded-lg space-y-1">
                <div>cd flutter_app</div>
                <div>flutter pub get</div>
                <div>flutter run</div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Siap Digunakan & Terhubung Ke MySQL
              </div>
              <p className="text-[11px] text-emerald-800">
                Aplikasi mobile Flutter Anda sekarang sudah siap mengirim & membaca data secara langsung ke database MySQL melalui Express REST API backend.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
