import React, { useEffect, useState } from 'react';
import { Users, Shield, UserPlus, CheckCircle2, Lock, Mail, Phone, Crown, Stethoscope, HardHat, Briefcase, Settings } from 'lucide-react';
import { Coop, Organization, User, UserRole } from '../../types';

interface OrgRoleManagementProps {
  org: Organization;
  coops: Coop[];
  currentUser: User;
  onInviteUser: (user: Omit<User, 'id'>) => Promise<void> | void;
  onUpdateMemberAccount: (id: string, data: { name: string; email: string; password?: string }) => Promise<void> | void;
  onAssignHouseWorker: (houseId: string, workerId: string | null) => Promise<void> | void;
}

export const OrgRoleManagement: React.FC<OrgRoleManagementProps> = ({
  org,
  coops,
  currentUser,
  onInviteUser,
  onUpdateMemberAccount,
  onAssignHouseWorker
}) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('worker');
  const [phone, setPhone] = useState('');
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [accountName, setAccountName] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [assigningHouseId, setAssigningHouseId] = useState<string | null>(null);
  const [houseWorkerIds, setHouseWorkerIds] = useState<Record<string, string>>({});

  // Keep the access view within the active reporting line. A farm owner must
  // not see a different owner account that happens to exist in demo data.
  const visibleMembers = [
    currentUser,
    ...org.members.filter((member) => {
      if (member.id === currentUser.id) return false;
      if (currentUser.role === 'owner') return member.role !== 'owner';
      if (currentUser.role === 'manager') return member.role === 'worker' || member.role === 'vet';
      return false;
    })
  ];

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    try {
      await onInviteUser({
      name,
      email,
      role,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?w=150&auto=format&fit=crop&q=80`,
      phone
      });

      setName('');
      setEmail('');
      setShowInviteModal(false);
    } catch (error: any) {
      window.alert(error.message || 'Gagal menyimpan undangan anggota');
    }
  };

  const openAccountSettings = (member: User) => {
    setEditingMember(member);
    setAccountName(member.name);
    setAccountEmail(member.email);
    setAccountPassword('');
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      await onUpdateMemberAccount(editingMember.id, { name: accountName, email: accountEmail, password: accountPassword || undefined });
      setEditingMember(null);
    } catch (error: any) {
      window.alert(error.message || 'Gagal memperbarui akun downline');
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-amber-400" />;
      case 'manager': return <Briefcase className="w-4 h-4 text-emerald-400" />;
      case 'vet': return <Stethoscope className="w-4 h-4 text-blue-400" />;
      case 'worker': default: return <HardHat className="w-4 h-4 text-teal-400" />;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'owner': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'manager': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'vet': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'worker': default: return 'bg-teal-50 text-teal-800 border-teal-200';
    }
  };

  const workers = visibleMembers
    .filter((member) => member.role === 'worker')
    .sort((a, b) => a.name.localeCompare(b.name, 'id', { numeric: true, sensitivity: 'base' }));
  const sortedCoops = [...coops].sort((a, b) => a.name.localeCompare(b.name, 'id', { numeric: true, sensitivity: 'base' }));
  useEffect(() => {
    const assignments: Record<string, string> = {};
    workers.forEach((worker) => worker.assignedHouseIds?.forEach((houseId) => {
      assignments[houseId] = worker.id;
    }));
    setHouseWorkerIds(assignments);
  }, [org.members, coops]);


  const handleWorkerAssignment = async (houseId: string, workerId: string) => {
    const previousWorkerId = houseWorkerIds[houseId] || '';
    try {
      setAssigningHouseId(houseId);
      setHouseWorkerIds((assignments) => ({ ...assignments, [houseId]: workerId }));
      await onAssignHouseWorker(houseId, workerId || null);
    } catch (error: any) {
      setHouseWorkerIds((assignments) => ({ ...assignments, [houseId]: previousWorkerId }));
      window.alert(error.message || 'Gagal menyimpan penugasan worker kandang');
    } finally {
      setAssigningHouseId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Manajemen Peran dan Pengguna
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Atur hak akses staf peternakan (Owner, Manager, Anak Kandang, Dokter Hewan) secara mandiri.
          </p>
        </div>

        {currentUser.role === 'owner' && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            Undang Anggota Baru
          </button>
        )}
      </div>

      {/* Role Access Matrix */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-600" />
          Matriks Hak Akses Peran (Access Control)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <Crown className="w-4 h-4 text-amber-600" /> Pemilik (Owner)
            </div>
            <p className="text-[11px] text-slate-500">Akses penuh: kelola tagihan, tambah atau hapus anggota, serta ekspor laporan.</p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-emerald-800">
              <Briefcase className="w-4 h-4 text-emerald-600" /> Manajer Kandang
            </div>
            <p className="text-[11px] text-slate-500">Kelola operasional harian: Input produksi, stok pakan, keuangan, & jadwal kerja.</p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-teal-800">
              <HardHat className="w-4 h-4 text-teal-600" /> Anak Kandang
            </div>
            <p className="text-[11px] text-slate-500">Input panen telur harian, cek stok pakan, dan sampaikan catatan kondisi ayam.</p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-blue-800">
              <Stethoscope className="w-4 h-4 text-blue-600" /> Dokter Hewan (Vet)
            </div>
            <p className="text-[11px] text-slate-500">Kelola rekam medis, penanganan penyakit, dan verifikasi jadwal vaksinasi.</p>
          </div>

        </div>
      </div>

      {currentUser.role === 'owner' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-start gap-2 mb-4">
            <HardHat className="w-5 h-5 text-teal-600 mt-0.5" />
            <div><h3 className="text-base font-bold text-slate-900">Worker Per Kandang</h3><p className="text-sm text-slate-500 mt-1">Tetapkan satu Anak Kandang sebagai penanggung jawab tiap kandang. Satu worker dapat memegang beberapa kandang.</p></div>
          </div>
          {coops.length === 0 ? <p className="text-sm text-slate-500">Belum ada kandang untuk ditetapkan.</p> : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="px-4 py-3">Nama Kandang</th>
                      <th className="px-4 py-3">Kode</th>
                      <th className="px-4 py-3">Worker Saat Ini</th>
                      <th className="px-4 py-3">Tetapkan Worker</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {sortedCoops.map((coop) => {
                      const assignedWorker = workers.find((worker) => worker.id === houseWorkerIds[coop.id]);
                      const isSavingAssignment = assigningHouseId === coop.id;
                      return (
                        <tr key={coop.id} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3 font-bold text-slate-900">{coop.name}</td>
                          <td className="px-4 py-3"><span className="font-mono font-bold bg-slate-100 border border-slate-200 rounded px-2 py-1">{coop.code}</span></td>
                          <td className="px-4 py-3 text-slate-700">{assignedWorker?.name || <span className="text-slate-400">Belum ada worker</span>}</td>
                          <td className="px-4 py-3">
                            <select value={assignedWorker?.id || ''} disabled={isSavingAssignment} onChange={(event) => handleWorkerAssignment(coop.id, event.target.value)} className="w-full min-w-48 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 disabled:opacity-60">
                              <option value="">Belum ditetapkan</option>
                              {workers.map((worker) => <option key={worker.id} value={worker.id}>{worker.name}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${isSavingAssignment ? 'bg-amber-50 text-amber-700' : assignedWorker ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                              {isSavingAssignment ? 'Menyimpan...' : assignedWorker ? 'Ditugaskan' : 'Kosong'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {workers.length === 0 && <p className="text-xs text-amber-700 mt-3">Tambahkan anggota dengan peran Anak Kandang terlebih dahulu.</p>}
        </div>
      )}

      {/* Members List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Daftar Akses Saya ({visibleMembers.length} Orang)</h3>
          <span className="text-xs text-slate-500 font-medium">{org.name}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Peran (Role)</th>
                <th className="py-3 px-4">Kandang Tugas</th>
                <th className="py-3 px-4">Telepon</th>
                <th className="py-3 px-4 text-center">Status</th>
                {currentUser.role === 'owner' && <th className="py-3 px-4 text-center">Akun</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {visibleMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover border border-emerald-300" />
                    <div>
                      <div className="font-bold text-slate-900">{member.name}</div>
                      {member.id === currentUser.id && (
                        <span className="text-[10px] text-emerald-700 font-semibold">(Anda)</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono">{member.email}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold capitalize ${getRoleBadge(member.role)}`}>
                      {getRoleIcon(member.role)}
                      {member.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{member.role === 'worker' ? member.assignedHouseNames?.join(', ') || 'Belum ditetapkan' : '-'}</td>
                  <td className="py-3 px-4 text-slate-500">{member.phone || '-'}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-bold text-[10px] flex items-center justify-center gap-1 ${member.status === 'active' || !member.status ? 'text-emerald-700' : 'text-amber-700'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> {member.status === 'active' || !member.status ? 'Aktif' : 'Menunggu aktivasi'}
                    </span>
                  </td>
                  {currentUser.role === 'owner' && (
                    <td className="py-3 px-4 text-center">
                      {member.id !== currentUser.id && (
                        <button onClick={() => openAccountSettings(member)} className="p-1.5 rounded-md text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer" title="Atur username dan password">
                          <Settings className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl text-slate-900">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Undang Anggota Tim Baru</h3>
            <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-medium">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Contoh: drh. Annisa Rahma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">Email Pengguna</label>
                <input
                  type="email"
                  placeholder="annisa@poultryvet.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Pilih Peran (Role)</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 capitalize font-bold"
                  >
                    <option value="worker">Anak Kandang</option>
                    <option value="manager">Manajer Kandang</option>
                    <option value="vet">Dokter Hewan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">No. Telepon (WA)</label>
                  <input
                    type="text"
                    placeholder="+62 812..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Kirim Undangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingMember && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl text-slate-900">
            <h3 className="text-lg font-bold mb-4">Atur Akun Downline</h3>
            <form onSubmit={handleAccountSubmit} className="space-y-4 text-xs">
              <div><label className="block text-slate-700 mb-1 font-medium">Nama</label><input value={accountName} onChange={(e) => setAccountName(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2" /></div>
              <div><label className="block text-slate-700 mb-1 font-medium">Username / Email</label><input type="email" value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2" /></div>
              <div><label className="block text-slate-700 mb-1 font-medium">Password Baru</label><input type="password" minLength={8} value={accountPassword} onChange={(e) => setAccountPassword(e.target.value)} placeholder="Kosongkan jika tidak diubah" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2" /></div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100"><button type="button" onClick={() => setEditingMember(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold cursor-pointer">Batal</button><button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold cursor-pointer">Simpan Akun</button></div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
