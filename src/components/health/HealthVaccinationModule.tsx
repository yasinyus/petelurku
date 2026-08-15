import React, { useState } from 'react';
import { Syringe, AlertTriangle, CheckCircle2, Calendar, Plus, Activity, User as UserIcon, Clock, ShieldAlert } from 'lucide-react';
import { Coop, HealthLog, VaccinationTask, User } from '../../types';
import { getLocalDateInputValue } from '../../utils/date';

interface HealthVaccinationModuleProps {
  coops: Coop[];
  vaccinations: VaccinationTask[];
  healthLogs: HealthLog[];
  onAddVaccination: (task: Omit<VaccinationTask, 'id'>) => void;
  onCompleteVaccination: (id: string, vetName: string) => void;
  onAddHealthLog: (log: Omit<HealthLog, 'id' | 'synced'>) => void;
  currentUser: User;
}

export const HealthVaccinationModule: React.FC<HealthVaccinationModuleProps> = ({
  coops,
  vaccinations,
  healthLogs,
  onAddVaccination,
  onCompleteVaccination,
  onAddHealthLog,
  currentUser
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'vaccines' | 'health'>('vaccines');
  const [showAddVaccineModal, setShowAddVaccineModal] = useState(false);
  const [showAddHealthModal, setShowAddHealthModal] = useState(false);

  // Vaccine Form
  const [vacCoopId, setVacCoopId] = useState(coops[0]?.id || '');
  const [vacName, setVacName] = useState('AI H5N1 Booster (Killed)');
  const [vacDisease, setVacDisease] = useState('Flu Burung (Avian Influenza)');
  const [vacTargetAge, setVacTargetAge] = useState(20);
  const [vacScheduledDate, setVacScheduledDate] = useState('2026-08-15');
  const [vacMethod, setVacMethod] = useState<'air_minum' | 'suntik_muskul' | 'tetes_mata' | 'tetes_hidung' | 'spray'>('suntik_muskul');
  const [vacDose, setVacDose] = useState('0.5 ml / ekor');

  // Health Log Form
  const [hlCoopId, setHlCoopId] = useState(coops[0]?.id || '');
  const [hlDate, setHlDate] = useState(getLocalDateInputValue());
  const [mortalityCount, setMortalityCount] = useState(0);
  const [culledCount, setCulledCount] = useState(0);
  const [symptomsText, setSymptomsText] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentGiven, setTreatmentGiven] = useState('');
  const [medicationCost, setMedicationCost] = useState(0);

  const handleAddVacSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacCoopId || !vacName) return;

    onAddVaccination({
      coopId: vacCoopId,
      vaccineName: vacName,
      diseaseTarget: vacDisease,
      targetAgeWeeks: vacTargetAge,
      scheduledDate: vacScheduledDate,
      status: 'scheduled',
      dose: vacDose,
      method: vacMethod,
      notes: 'Jadwal otomatis vaksinasi layer.'
    });

    setShowAddVaccineModal(false);
  };

  const handleAddHealthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hlCoopId) return;

    onAddHealthLog({
      coopId: hlCoopId,
      date: hlDate,
      mortalityCount,
      culledCount,
      symptoms: symptomsText ? symptomsText.split(',').map(s => s.trim()) : ['Gejala ringan'],
      diagnosis,
      treatmentGiven,
      medicationCost,
      recordedBy: currentUser.name
    });

    setShowAddHealthModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Syringe className="w-5 h-5 text-emerald-600" />
            Kesehatan & Pengingat Vaksinasi Otomatis
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Matriks jadwal vaksinasi layer sesuai umur dan pencatatan mortalitas / penanganan medis harian.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddHealthModal(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl text-xs border border-slate-200 transition cursor-pointer"
          >
            + Catat Kesehatan
          </button>
          <button
            onClick={() => setShowAddVaccineModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl text-xs transition cursor-pointer"
          >
            + Buat Jadwal Vaksin
          </button>
        </div>
      </div>

      {/* Sub Tabs Toggle */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('vaccines')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'vaccines'
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Syringe className="w-4 h-4" />
          Jadwal Vaksinasi ({vaccinations.length})
        </button>
        <button
          onClick={() => setActiveSubTab('health')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'health'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          Jurnal Kesehatan & Mortalitas ({healthLogs.length})
        </button>
      </div>

      {activeSubTab === 'vaccines' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vaccinations.map((vac) => {
              const coop = coops.find(c => c.id === vac.coopId);
              const isOverdue = vac.status === 'overdue';
              const isDone = vac.status === 'completed';

              return (
                <div 
                  key={vac.id}
                  className={`bg-white border rounded-2xl p-5 flex flex-col justify-between transition shadow-xs ${
                    isOverdue 
                      ? 'border-rose-300 shadow-rose-50' 
                      : isDone
                      ? 'border-emerald-200 opacity-90'
                      : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded font-bold">
                        {coop ? coop.code : vac.coopId} (Umur {coop?.ageWeeks || 20} mg)
                      </span>
                      {isOverdue && (
                        <span className="bg-rose-50 text-rose-800 border border-rose-200 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                          Overdue / Terlewat
                        </span>
                      )}
                      {isDone && (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                          Selesai
                        </span>
                      )}
                      {vac.status === 'scheduled' && (
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                          Dijadwalkan
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-slate-900">{vac.vaccineName}</h4>
                    <p className="text-xs text-amber-700 font-medium mt-0.5">Target: {vac.diseaseTarget}</p>

                    <div className="space-y-1.5 mt-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Metode & Dosis:</span>
                        <span className="font-semibold text-slate-800 capitalize">{vac.method.replace('_', ' ')} ({vac.dose})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Jadwal Tgl:</span>
                        <span className="font-bold text-slate-900">{vac.scheduledDate}</span>
                      </div>
                      {vac.notes && (
                        <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200">
                          "{vac.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {!isDone && (
                    <button
                      onClick={() => onCompleteVaccination(vac.id, currentUser.name)}
                      className="w-full mt-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Tandai Vaksin Selesai
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Health Logs List */
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Kandang</th>
                    <th className="py-3 px-4 text-center">Ayam Mati</th>
                    <th className="py-3 px-4 text-center">Afkir (Cull)</th>
                    <th className="py-3 px-4">Gejala & Diagnosis</th>
                    <th className="py-3 px-4">Penanganan Diberikan</th>
                    <th className="py-3 px-4 text-right">Biaya Medis</th>
                    <th className="py-3 px-4">Petugas / Vet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                  {healthLogs.map((log) => {
                    const coop = coops.find(c => c.id === log.coopId);

                    return (
                      <tr key={log.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-semibold text-slate-900">{log.date}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {coop ? coop.code : log.coopId}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-rose-600">
                          {log.mortalityCount}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-amber-700">
                          {log.culledCount}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{log.diagnosis || 'Pemeriksaan Rutin'}</div>
                          <div className="text-[10px] text-slate-500">{log.symptoms.join(', ')}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {log.treatmentGiven || '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          Rp {(log.medicationCost || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {log.recordedBy}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Vaccine Schedule Modal */}
      {showAddVaccineModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl text-slate-900">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Buat Jadwal Vaksinasi Baru</h3>
            <form onSubmit={handleAddVacSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-medium">Pilih Kandang Target</label>
                <select
                  value={vacCoopId}
                  onChange={(e) => setVacCoopId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
                >
                  {coops.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code}) - Umur {c.ageWeeks} mg</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">Nama Vaksin</label>
                <input
                  type="text"
                  value={vacName}
                  onChange={(e) => setVacName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Penyakit Target</label>
                  <input
                    type="text"
                    value={vacDisease}
                    onChange={(e) => setVacDisease(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Tanggal Pelaksanaan</label>
                  <input
                    type="date"
                    value={vacScheduledDate}
                    onChange={(e) => setVacScheduledDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Metode Vaksinasi</label>
                  <select
                    value={vacMethod}
                    onChange={(e) => setVacMethod(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 capitalize"
                  >
                    <option value="suntik_muskul">Suntik Otot (Muskular)</option>
                    <option value="air_minum">Air Minum</option>
                    <option value="tetes_mata">Tetes Mata</option>
                    <option value="tetes_hidung">Tetes Hidung</option>
                    <option value="spray">Spray / Semprot</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Dosis</label>
                  <input
                    type="text"
                    value={vacDose}
                    onChange={(e) => setVacDose(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddVaccineModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Health Log Modal */}
      {showAddHealthModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl text-slate-900">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Catat Kesehatan & Mortalitas</h3>
            <form onSubmit={handleAddHealthSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Pilih Kandang</label>
                  <select
                    value={hlCoopId}
                    onChange={(e) => setHlCoopId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
                  >
                    {coops.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Tanggal</label>
                  <input
                    type="date"
                    value={hlDate}
                    onChange={(e) => setHlDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-rose-600 mb-1 font-bold">Ayam Mati (Ekor)</label>
                  <input
                    type="number"
                    value={mortalityCount}
                    onChange={(e) => setMortalityCount(Number(e.target.value))}
                    required
                    min={0}
                    className="w-full bg-slate-50 border border-rose-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-rose-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-amber-700 mb-1 font-bold">Ayam Afkir (Ekor)</label>
                  <input
                    type="number"
                    value={culledCount}
                    onChange={(e) => setCulledCount(Number(e.target.value))}
                    required
                    min={0}
                    className="w-full bg-slate-50 border border-amber-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-600 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">Diagnosis / Penyakit</label>
                <input
                  type="text"
                  placeholder="Contoh: Coryza ringan / Prolapsus"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">Penanganan Medis & Obat</label>
                <input
                  type="text"
                  placeholder="Contoh: Vita Stress + Injeksi Medoxy"
                  value={treatmentGiven}
                  onChange={(e) => setTreatmentGiven(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">Biaya Obat (Rp)</label>
                <input
                  type="number"
                  value={medicationCost}
                  onChange={(e) => setMedicationCost(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddHealthModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
