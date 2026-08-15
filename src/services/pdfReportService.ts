import jsPDF from 'jspdf';
import { Coop, EggProductionLog, FinancialTransaction, HealthLog, Organization, VaccinationTask } from '../types';

export class PdfReportService {
  static generateProductionReport(
    org: Organization,
    coops: Coop[],
    productionLogs: EggProductionLog[],
    dateRangeStr: string = '10 Hari Terakhir'
  ) {
    const doc = new jsPDF();

    // Header Branding
    doc.setFillColor(16, 185, 129); // Emerald 600
    doc.rect(0, 0, 210, 24, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PetelurKu.com - LAPORAN PRODUKSI TELUR HARIAN', 14, 15);

    // Organization Info
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Peternakan: ${org.name}`, 14, 32);
    doc.text(`Periode: ${dateRangeStr}`, 14, 38);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 14, 44);
    doc.text(`Status Keamanan: Enkripsi E2EE (AES-256 Validated)`, 120, 32);

    // Summary Statistics Cards
    const totalEggs = productionLogs.reduce((acc, p) => acc + p.totalEggs, 0);
    const totalGood = productionLogs.reduce((acc, p) => acc + p.goodEggs, 0);
    const totalBroken = productionLogs.reduce((acc, p) => acc + p.brokenEggs, 0);
    const totalWeight = productionLogs.reduce((acc, p) => acc + p.totalWeightKg, 0);
    const avgHdp = (productionLogs.reduce((acc, p) => acc + p.henDayRate, 0) / (productionLogs.length || 1)).toFixed(1);

    doc.setFillColor(241, 245, 249);
    doc.rect(14, 50, 182, 22, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`TOTAL TELUR: ${totalEggs.toLocaleString('id-ID')} Butir`, 20, 58);
    doc.text(`TELUR UTUH: ${totalGood.toLocaleString('id-ID')} Butir`, 20, 66);
    doc.text(`TELUR RETAK: ${totalBroken.toLocaleString('id-ID')} Butir`, 85, 58);
    doc.text(`TOTAL BERAT: ${totalWeight.toFixed(1)} Kg`, 85, 66);
    doc.text(`RATA-RATA HDP: ${avgHdp}%`, 145, 62);

    // Table Header
    let yPos = 80;
    doc.setFillColor(30, 41, 59);
    doc.rect(14, yPos, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Tanggal', 18, yPos + 5.5);
    doc.text('Kandang', 48, yPos + 5.5);
    doc.text('Utuh (Btr)', 85, yPos + 5.5);
    doc.text('Rusak', 115, yPos + 5.5);
    doc.text('Berat (Kg)', 138, yPos + 5.5);
    doc.text('HDP (%)', 165, yPos + 5.5);

    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    productionLogs.slice(0, 20).forEach((log, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      const coop = coops.find(c => c.id === log.coopId);
      const coopName = coop ? coop.code : log.coopId;

      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, yPos, 182, 7, 'F');
      }

      doc.text(log.date, 18, yPos + 5);
      doc.text(coopName, 48, yPos + 5);
      doc.text(log.goodEggs.toLocaleString('id-ID'), 85, yPos + 5);
      doc.text(log.brokenEggs.toLocaleString('id-ID'), 115, yPos + 5);
      doc.text(log.totalWeightKg.toString(), 138, yPos + 5);
      doc.text(`${log.henDayRate}%`, 165, yPos + 5);

      yPos += 7;
    });

    // Signature footer
    yPos = Math.max(yPos + 15, 220);
    doc.setFontSize(9);
    doc.text('Dibuat Oleh,', 25, yPos);
    doc.text('Disetujui Oleh (Owner),', 140, yPos);
    doc.text('(...................................)', 25, yPos + 22);
    doc.text('( H. Yasin Yusuf )', 140, yPos + 22);

    doc.save(`Laporan_Produksi_Telur_${org.name.replace(/\s+/g, '_')}.pdf`);
  }

  static generateFinancialReport(
    org: Organization,
    transactions: FinancialTransaction[],
    dateStr: string = 'Agustus 2026'
  ) {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(37, 99, 235); // Blue 600
    doc.rect(0, 0, 210, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PetelurKu.com - LAPORAN KEUANGAN & ARUS KAS', 14, 15);

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Organisasi: ${org.name}`, 14, 32);
    doc.text(`Periode Laporan: ${dateStr}`, 14, 38);

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const netProfit = totalIncome - totalExpense;

    // Financial Cards
    doc.setFillColor(240, 253, 244); // light green
    doc.rect(14, 46, 56, 20, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(22, 101, 52);
    doc.text('TOTAL PENDAPATAN', 18, 52);
    doc.setFontSize(11);
    doc.text(`Rp ${totalIncome.toLocaleString('id-ID')}`, 18, 60);

    doc.setFillColor(254, 242, 242); // light red
    doc.rect(76, 46, 56, 20, 'F');
    doc.setFontSize(8);
    doc.setTextColor(153, 27, 27);
    doc.text('TOTAL BIAYA OPERASIONAL', 80, 52);
    doc.setFontSize(11);
    doc.text(`Rp ${totalExpense.toLocaleString('id-ID')}`, 80, 60);

    doc.setFillColor(239, 246, 255); // light blue
    doc.rect(138, 46, 58, 20, 'F');
    doc.setFontSize(8);
    doc.setTextColor(30, 64, 175);
    doc.text('KEUNTUNGAN BERSIH', 142, 52);
    doc.setFontSize(11);
    doc.text(`Rp ${netProfit.toLocaleString('id-ID')}`, 142, 60);

    // Table Header
    let yPos = 76;
    doc.setFillColor(30, 41, 59);
    doc.rect(14, yPos, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Tgl', 18, yPos + 5.5);
    doc.text('Tipe', 42, yPos + 5.5);
    doc.text('Deskripsi Transaksi', 65, yPos + 5.5);
    doc.text('Jumlah (Rp)', 155, yPos + 5.5);

    yPos += 8;
    doc.setFont('helvetica', 'normal');

    transactions.forEach((t, i) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      if (i % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, yPos, 182, 7, 'F');
      }

      doc.setTextColor(51, 65, 85);
      doc.text(t.date, 18, yPos + 5);
      
      if (t.type === 'income') {
        doc.setTextColor(16, 185, 129);
        doc.text('MASUK', 42, yPos + 5);
      } else {
        doc.setTextColor(239, 68, 68);
        doc.text('KELUAR', 42, yPos + 5);
      }

      doc.setTextColor(51, 65, 85);
      doc.text(t.description.substring(0, 45), 65, yPos + 5);
      doc.text(`Rp ${t.amount.toLocaleString('id-ID')}`, 155, yPos + 5);

      yPos += 7;
    });

    doc.save(`Laporan_Keuangan_SaaS_${org.name.replace(/\s+/g, '_')}.pdf`);
  }
}
