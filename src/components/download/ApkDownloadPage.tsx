import React from 'react';
import { ArrowLeft, CheckCircle2, Download, Egg, ExternalLink, FileKey2, History, Mail, MessageCircle, ShieldCheck, Smartphone } from 'lucide-react';

const APK_URL = '/downloads/petelurku-1.0.0.apk';
const APK_SHA256 = '5619F77EF940392B666C051E58B8028B53C8659C86BD992822E20BAF5D3C75C0';

export const ApkDownloadPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="/" className="flex items-center gap-2 font-black text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white"><Egg className="h-5 w-5" /></span>
            PetelurKu.com
          </a>
          <a href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700"><ArrowLeft className="h-4 w-4" /> Kembali ke beranda</a>
        </div>
      </header>

      <main>
        <section className="bg-slate-900 px-4 py-14 text-white sm:px-6">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_380px]">
            <div>
              <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">APK Resmi PetelurKu</span>
              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">PetelurKu untuk Android</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">Catat produksi, pakan, kesehatan, vaksinasi, dan operasional kandang langsung dari perangkat Android.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href={APK_URL} download className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-400"><Download className="h-5 w-5" /> Download APK</a>
                <a href="#panduan" className="inline-flex items-center gap-2 rounded-xl border border-slate-600 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">Panduan instalasi</a>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 shadow-2xl">
              <div className="flex items-center gap-3"><Smartphone className="h-8 w-8 text-emerald-400" /><div><div className="font-black">PetelurKu Mobile</div><div className="text-xs text-slate-400">Android 6.0 atau lebih baru</div></div></div>
              <dl className="mt-6 grid grid-cols-2 gap-4 text-xs">
                <div><dt className="text-slate-400">Nomor versi</dt><dd className="mt-1 font-bold">1.0.0 (Build 1)</dd></div>
                <div><dt className="text-slate-400">Tanggal rilis</dt><dd className="mt-1 font-bold">16 Agustus 2026</dd></div>
                <div><dt className="text-slate-400">Ukuran</dt><dd className="mt-1 font-bold">47,9 MB</dd></div>
                <div><dt className="text-slate-400">Format</dt><dd className="mt-1 font-bold">APK</dd></div>
              </dl>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs" aria-labelledby="checksum-title">
            <div className="flex items-start gap-3"><FileKey2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" /><div className="min-w-0"><h2 id="checksum-title" className="text-lg font-black">Verifikasi SHA-256</h2><p className="mt-1 text-xs leading-6 text-slate-600">Cocokkan nilai berikut setelah mengunduh APK untuk memastikan file tidak berubah.</p><code className="mt-3 block break-all rounded-xl bg-slate-950 p-4 text-xs leading-6 text-emerald-300">{APK_SHA256}</code><p className="mt-3 text-xs text-slate-500">Windows: <code className="rounded bg-slate-100 px-1.5 py-1">Get-FileHash petelurku-1.0.0.apk -Algorithm SHA256</code></p></div></div>
          </section>

          <section id="panduan" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs scroll-mt-24">
            <h2 className="flex items-center gap-2 text-lg font-black"><Smartphone className="h-5 w-5 text-emerald-600" /> Panduan instalasi lengkap</h2>
            <ol className="mt-5 space-y-4 text-sm text-slate-700">
              {[
                ['Unduh APK', 'Tekan tombol Download APK di halaman ini dan tunggu sampai unduhan selesai.'],
                ['Buka file', 'Buka notifikasi unduhan atau folder Download, lalu pilih petelurku-1.0.0.apk.'],
                ['Izinkan sumber ini', 'Jika Android menampilkan peringatan, buka Setelan lalu aktifkan Izinkan dari sumber ini hanya untuk browser atau pengelola file yang Anda gunakan.'],
                ['Lanjutkan pemeriksaan keamanan', 'Biarkan Google Play Protect memeriksa APK. Jangan menonaktifkan Play Protect secara permanen.'],
                ['Pasang aplikasi', 'Kembali ke layar instalasi, tekan Instal, lalu tunggu hingga selesai.'],
                ['Buka dan login', 'Tekan Buka, kemudian masuk menggunakan akun PetelurKu Anda. Pastikan internet aktif.'],
                ['Matikan kembali izin', 'Setelah instalasi, nonaktifkan kembali izin Install unknown apps untuk browser atau pengelola file tersebut.']
              ].map(([title, body], index) => <li key={title} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-800">{index + 1}</span><div><h3 className="font-bold text-slate-900">{title}</h3><p className="mt-1 text-xs leading-6 text-slate-600">{body}</p></div></li>)}
            </ol>
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-900"><strong>Catatan:</strong> unduh APK hanya dari halaman resmi ini. Jika signature atau SHA-256 berbeda, jangan lanjutkan instalasi.</div>
          </section>

          <section id="privasi" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs scroll-mt-24">
            <h2 className="flex items-center gap-2 text-lg font-black"><ShieldCheck className="h-5 w-5 text-emerald-600" /> Kebijakan privasi</h2>
            <p className="mt-2 text-xs text-slate-500">Terakhir diperbarui: 17 Agustus 2026</p>
            <div className="mt-5 space-y-5 text-xs leading-6 text-slate-600">
              <div><h3 className="font-bold text-slate-900">Data yang diproses</h3><p>PetelurKu memproses data akun seperti nama dan email, profil peternakan, data kandang, produksi telur, pakan, kesehatan, vaksinasi, anggota tim, serta catatan keuangan yang dimasukkan pengguna.</p></div>
              <div><h3 className="font-bold text-slate-900">Tujuan penggunaan</h3><p>Data digunakan untuk autentikasi, menyediakan fitur pengelolaan peternakan, sinkronisasi antarperangkat, pembuatan laporan, dukungan pelanggan, keamanan, dan pemeliharaan layanan.</p></div>
              <div><h3 className="font-bold text-slate-900">Penyimpanan dan keamanan</h3><p>Data dikirim melalui koneksi HTTPS dan disimpan pada sistem PetelurKu. Kredensial sesi pada perangkat disimpan menggunakan penyimpanan aman Android. Pengguna tetap bertanggung jawab menjaga kerahasiaan akun dan perangkatnya.</p></div>
              <div><h3 className="font-bold text-slate-900">Pembagian data</h3><p>PetelurKu tidak menjual data pribadi. Data hanya dapat diproses oleh penyedia infrastruktur atau layanan pembayaran yang diperlukan untuk menjalankan layanan, atau jika diwajibkan oleh hukum.</p></div>
              <div><h3 className="font-bold text-slate-900">Hak pengguna</h3><p>Pengguna dapat meminta koreksi, salinan, atau penghapusan akun dan data dengan menghubungi dukungan. Sebagian data dapat dipertahankan jika diwajibkan untuk keamanan, transaksi, atau kewajiban hukum.</p></div>
              <div><h3 className="font-bold text-slate-900">Perubahan kebijakan</h3><p>Perubahan material akan dicantumkan pada halaman ini bersama tanggal pembaruan terbaru.</p></div>
            </div>
          </section>

          <div className="grid gap-8 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="flex items-center gap-2 text-lg font-black"><History className="h-5 w-5 text-emerald-600" /> Riwayat pembaruan</h2>
              <div className="mt-5 border-l-2 border-emerald-200 pl-5"><div className="text-sm font-black">Versi 1.0.0</div><div className="text-xs text-slate-500">16 Agustus 2026</div><ul className="mt-3 space-y-2 text-xs text-slate-600"><li>• Rilis perdana PetelurKu Mobile.</li><li>• Login dan sesi akun aman.</li><li>• Pencatatan produksi dan operasional kandang.</li><li>• Sinkronisasi dengan server PetelurKu.</li></ul></div>
            </section>
            <section id="dukungan" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="flex items-center gap-2 text-lg font-black"><MessageCircle className="h-5 w-5 text-emerald-600" /> Kontak dukungan</h2>
              <p className="mt-3 text-xs leading-6 text-slate-600">Butuh bantuan instalasi atau menemukan masalah? Hubungi tim AUUF Farm.</p>
              <div className="mt-5 space-y-3">
                <a href="https://wa.me/6285707104107?text=Saya%20membutuhkan%20bantuan%20aplikasi%20PetelurKu" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white hover:bg-emerald-700"><span className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp 0857-0710-4107</span><ExternalLink className="h-4 w-4" /></a>
                <a href="mailto:yasinyusuf89@gmail.com?subject=Dukungan%20PetelurKu%20Mobile" className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"><span className="flex items-center gap-2"><Mail className="h-4 w-4" /> yasinyusuf89@gmail.com</span><ExternalLink className="h-4 w-4" /></a>
              </div>
            </section>
          </div>

          <section className="rounded-2xl bg-emerald-700 p-6 text-center text-white"><CheckCircle2 className="mx-auto h-8 w-8" /><h2 className="mt-3 text-xl font-black">Siap menggunakan PetelurKu?</h2><p className="mt-2 text-xs text-emerald-100">Unduh APK resmi dan mulai mencatat operasional kandang dari Android.</p><a href={APK_URL} download className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-emerald-800"><Download className="h-5 w-5" /> Download APK 1.0.0</a></section>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 text-center text-xs text-slate-500">© 2026 PetelurKu.com · Dikembangkan oleh AUUF Farm, Blitar</footer>
    </div>
  );
};
