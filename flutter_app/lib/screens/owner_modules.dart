import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class OwnerModuleScreen extends StatefulWidget {
  final String title, subtitle, endpoint;
  final IconData icon;
  final AppUser user;
  const OwnerModuleScreen(
      {super.key,
      required this.title,
      required this.subtitle,
      required this.endpoint,
      required this.icon,
      required this.user});
  @override
  State<OwnerModuleScreen> createState() => _OwnerModuleScreenState();
}

class _OwnerModuleScreenState extends State<OwnerModuleScreen> {
  bool loading = true;
  String? error;
  List<Map<String, dynamic>> rows = [];
  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      final value = await ApiService.fetchList(widget.endpoint);
      if (mounted) {
        setState(() {
          rows = value;
          loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          error = e.toString().replaceFirst('Exception: ', '');
          loading = false;
        });
      }
    }
  }

  String value(Map<String, dynamic> row, List<String> keys,
      [String fallback = '-']) {
    for (final key in keys) {
      if (row[key] != null && '${row[key]}'.isNotEmpty) return '${row[key]}';
    }
    return fallback;
  }

  String get actionLabel => switch (widget.endpoint) {
        'houses' => 'Tambah kandang',
        'feeds' => 'Restock',
        'vaccinations' => 'Jadwal vaksin',
        'health-logs' => 'Catat kesehatan',
        'finances' => 'Catat transaksi',
        'members' => 'Undang anggota',
        _ => 'Tambah'
      };
  Future<void> add() async {
    final changed = await showModalBottomSheet<bool>(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (_) => _ModuleForm(
            endpoint: widget.endpoint, rows: rows, user: widget.user));
    if (changed == true) load();
  }

  Future<void> edit(Map<String, dynamic> row) async {
    final changed = await showModalBottomSheet<bool>(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (_) => _ModuleForm(
            endpoint: widget.endpoint,
            rows: rows,
            user: widget.user,
            existing: row));
    if (changed == true) load();
  }

  Future<void> remove(Map<String, dynamic> row) async {
    if (widget.endpoint == 'members' && '${row['role']}' == 'owner') {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Akun owner tidak dapat dihapus.')));
      return;
    }
    final confirmed = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
              title: const Text('Hapus data?'),
              content: const Text('Tindakan ini tidak dapat dibatalkan.'),
              actions: [
                TextButton(
                    onPressed: () => Navigator.pop(context, false),
                    child: const Text('Batal')),
                FilledButton(
                    onPressed: () => Navigator.pop(context, true),
                    child: const Text('Hapus'))
              ],
            ));
    if (confirmed != true) return;
    try {
      await ApiService.deleteData('${widget.endpoint}/${row['id']}');
      await load();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(e.toString().replaceFirst('Exception: ', ''))));
      }
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: const Color(0xFFF5F7F8),
        appBar: AppBar(
            title: Text(widget.title,
                style: const TextStyle(fontWeight: FontWeight.w900))),
        body: RefreshIndicator(
            onRefresh: load,
            child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 10, 16, 100),
                children: [
                  Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                          gradient: const LinearGradient(
                              colors: [Color(0xFF064E3B), Color(0xFF0B8F68)]),
                          borderRadius: BorderRadius.circular(24)),
                      child: Row(children: [
                        Container(
                            width: 54,
                            height: 54,
                            decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: .15),
                                borderRadius: BorderRadius.circular(17)),
                            child: Icon(widget.icon,
                                color: Colors.white, size: 27)),
                        const SizedBox(width: 15),
                        Expanded(
                            child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                              Text(widget.title,
                                  style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 19,
                                      fontWeight: FontWeight.w900)),
                              const SizedBox(height: 4),
                              Text(widget.subtitle,
                                  style: const TextStyle(
                                      color: Color(0xFFD1FAE5), fontSize: 12))
                            ]))
                      ])),
                  const SizedBox(height: 16),
                  if (loading)
                    const Padding(
                        padding: EdgeInsets.all(50),
                        child: Center(child: CircularProgressIndicator()))
                  else if (error != null)
                    _empty(Icons.cloud_off_rounded, 'Gagal memuat data', error!)
                  else if (rows.isEmpty)
                    _empty(widget.icon, 'Belum ada data',
                        'Gunakan tombol $actionLabel untuk memulai.')
                  else
                    ...rows.map(card),
                ])),
        floatingActionButton: FilledButton.icon(
            onPressed: add,
            icon: const Icon(Icons.add_rounded),
            label: Padding(
                padding: const EdgeInsets.symmetric(vertical: 14),
                child: Text(actionLabel,
                    style: const TextStyle(fontWeight: FontWeight.w800)))),
      );
  Widget card(Map<String, dynamic> r) {
    final title = switch (widget.endpoint) {
      'houses' => value(r, ['name']),
      'feeds' => value(r, ['feed_name']),
      'vaccinations' => value(r, ['vaccine_name']),
      'health-logs' => value(r, ['diagnosis'], 'Catatan kesehatan'),
      'finances' => value(r, ['description']),
      'members' => value(r, ['full_name']),
      _ => 'Data'
    };
    final subtitle = switch (widget.endpoint) {
      'houses' =>
        '${value(r, ['code'])} • ${value(r, ['current_chickens'], '0')} ekor',
      'feeds' => 'Stok ${value(r, [
            'current_stock_kg'
          ], '0')} kg • Rp ${value(r, ['price_per_kg'], '0')}/kg',
      'vaccinations' =>
        '${value(r, ['scheduled_date'])} • ${value(r, ['status'])}',
      'health-logs' => '${value(r, ['record_date'])} • Mortalitas ${value(r, [
            'mortality_count'
          ], '0')}',
      'finances' =>
        '${value(r, ['transaction_date'])} • Rp ${value(r, ['amount'], '0')}',
      'members' => '${value(r, ['email'])} • ${value(r, ['role'])}',
      _ => ''
    };
    return Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(15),
        decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(19),
            border: Border.all(color: const Color(0xFFE8EDF2))),
        child: Row(children: [
          Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(14)),
              child:
                  Icon(widget.icon, color: const Color(0xFF087F5B), size: 21)),
          const SizedBox(width: 13),
          Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                Text(title,
                    style: const TextStyle(fontWeight: FontWeight.w900)),
                const SizedBox(height: 4),
                Text(subtitle,
                    style:
                        const TextStyle(color: Color(0xFF64748B), fontSize: 12))
              ])),
          PopupMenuButton<String>(
              tooltip: 'Aksi',
              onSelected: (action) =>
                  action == 'edit' ? edit(r) : remove(r),
              itemBuilder: (_) => [
                    const PopupMenuItem(
                        value: 'edit',
                        child: ListTile(
                            leading: Icon(Icons.edit_outlined),
                            title: Text('Edit'))),
                    if (!(widget.endpoint == 'members' &&
                        '${r['role']}' == 'owner'))
                      const PopupMenuItem(
                          value: 'delete',
                          child: ListTile(
                              leading: Icon(Icons.delete_outline,
                                  color: Colors.red),
                              title: Text('Hapus')))
                  ])
        ]));
  }

  Widget _empty(IconData icon, String title, String text) => Padding(
      padding: const EdgeInsets.all(36),
      child: Column(children: [
        Icon(icon, size: 48, color: const Color(0xFF94A3B8)),
        const SizedBox(height: 12),
        Text(title,
            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 17)),
        const SizedBox(height: 5),
        Text(text,
            textAlign: TextAlign.center,
            style: const TextStyle(color: Color(0xFF64748B)))
      ]));
}

class _ModuleForm extends StatefulWidget {
  final String endpoint;
  final List<Map<String, dynamic>> rows;
  final AppUser user;
  final Map<String, dynamic>? existing;
  const _ModuleForm(
      {required this.endpoint,
      required this.rows,
      required this.user,
      this.existing});
  @override
  State<_ModuleForm> createState() => _ModuleFormState();
}

class _ModuleFormState extends State<_ModuleForm> {
  final a = TextEditingController(),
      b = TextEditingController(),
      c = TextEditingController(),
      d = TextEditingController(),
      e = TextEditingController(),
      f = TextEditingController();
  bool saving = false;
  List<Map<String, dynamic>> houses = [];
  String housingType = 'battery', houseStatus = 'active';
  String financeType = 'income', financeCategory = 'egg_sales';
  String vaccineMethod = 'air_minum';
  bool get editing => widget.existing != null;

  @override
  void initState() {
    super.initState();
    if (widget.endpoint == 'vaccinations' ||
        widget.endpoint == 'health-logs') {
      ApiService.fetchList('houses').then((value) {
        if (!mounted) return;
        setState(() {
          houses = value;
          if (a.text.isEmpty && houses.isNotEmpty) a.text = '${houses.first['id']}';
        });
      });
    }
    final r = widget.existing;
    if (r == null) {
      if (widget.endpoint == 'houses') f.text = DateFormat('yyyy-MM-dd').format(DateTime.now());
      if (widget.endpoint == 'vaccinations') d.text = DateFormat('yyyy-MM-dd').format(DateTime.now());
      if (widget.endpoint == 'finances') c.text = DateFormat('yyyy-MM-dd').format(DateTime.now());
      return;
    }
    switch (widget.endpoint) {
      case 'houses':
        a.text = '${r['name'] ?? ''}';
        b.text = '${r['code'] ?? ''}';
        c.text = '${r['chicken_type'] ?? ''}';
        d.text = '${r['initial_chickens'] ?? 0}';
        e.text = '${r['current_chickens'] ?? 0}';
        f.text = '${r['housed_date'] ?? ''}'.substring(0, 10);
        housingType = '${r['housing_type'] ?? 'battery'}';
        houseStatus = '${r['status'] ?? 'active'}';
        break;
      case 'feeds':
        a.text = '${r['feed_name'] ?? ''}';
        b.text = '${r['current_stock_kg'] ?? 0}';
        c.text = '${r['min_threshold_kg'] ?? 0}';
        d.text = '${r['price_per_kg'] ?? 0}';
        break;
      case 'vaccinations':
        a.text = '${r['house_id'] ?? ''}';
        b.text = '${r['vaccine_name'] ?? ''}';
        c.text = '${r['disease_target'] ?? ''}';
        d.text = '${r['scheduled_date'] ?? ''}'.substring(0, 10);
        e.text = '${r['notes'] ?? ''}';
        break;
      case 'health-logs':
        a.text = '${r['house_id'] ?? ''}';
        b.text = '${r['mortality_count'] ?? 0}';
        c.text = '${r['diagnosis'] ?? ''}';
        break;
      case 'finances':
        a.text = '${r['description'] ?? ''}';
        b.text = '${r['amount'] ?? 0}';
        c.text = '${r['transaction_date'] ?? ''}'.substring(0, 10);
        financeType = '${r['transaction_type'] ?? 'income'}';
        financeCategory = '${r['category'] ?? 'egg_sales'}';
        break;
      case 'members':
        a.text = '${r['full_name'] ?? ''}';
        b.text = '${r['email'] ?? ''}';
        c.text = '${r['role'] ?? ''}';
        break;
    }
  }
  String get title => editing ? 'Edit Data' : switch (widget.endpoint) {
        'houses' => 'Tambah Kandang',
        'feeds' => 'Restock Pakan',
        'vaccinations' => 'Jadwal Vaksin',
        'health-logs' => 'Catat Kesehatan',
        'finances' => 'Catat Transaksi',
        'members' => 'Undang Anggota',
        _ => 'Tambah Data'
      };
  Future<void> save() async {
    setState(() => saving = true);
    try {
      if (editing) {
        final id = '${widget.existing!['id']}';
        switch (widget.endpoint) {
          case 'houses':
            await ApiService.patchData('houses/$id', {
              'name': a.text,
              'code': b.text,
              'breed': c.text,
              'capacity': int.tryParse(d.text) ?? 0,
              'currentChickens': int.tryParse(e.text) ?? 0,
              'entryDate': f.text,
              'housingType': housingType,
              'status': houseStatus
            });
            break;
          case 'feeds':
            await ApiService.patchData('feeds/$id', {
              'name': a.text,
              'stockKg': double.tryParse(b.text) ?? 0,
              'minThresholdKg': double.tryParse(c.text) ?? 0,
              'pricePerKg': double.tryParse(d.text) ?? 0
            });
            break;
          case 'vaccinations':
            await ApiService.patchData('vaccinations/$id', {
              'houseId': a.text,
              'vaccineName': b.text,
              'diseaseTarget': c.text,
              'scheduledDate': d.text,
              'status': widget.existing!['status'] ?? 'scheduled',
              'notes': 'Metode: $vaccineMethod; Dosis: ${e.text}'
            });
            break;
          case 'health-logs':
            await ApiService.patchData('health-logs/$id', {
              'houseId': a.text,
              'date': '${widget.existing!['record_date']}'.substring(0, 10),
              'mortalityCount': int.tryParse(b.text) ?? 0,
              'culledCount': widget.existing!['culled_count'] ?? 0,
              'diagnosis': c.text
            });
            break;
          case 'finances':
            await ApiService.patchData('finances/$id', {
              'type': financeType,
              'category': financeCategory,
              'amount': double.tryParse(b.text) ?? 0,
              'date': c.text,
              'description': a.text
            });
            break;
          case 'members':
            if ('${widget.existing!['role']}' == 'owner') {
              throw Exception('Akun owner tidak dapat diubah dari menu anggota.');
            }
            await ApiService.patchData('members/$id/account', {
              'name': a.text,
              'email': b.text
            });
            break;
        }
        if (mounted) Navigator.pop(context, true);
        return;
      }
      switch (widget.endpoint) {
        case 'houses':
          await ApiService.createHouse({
            'name': a.text,
            'code': b.text,
            'chickenType': c.text.isEmpty ? 'ISA Brown' : c.text,
            'initialChickens': double.tryParse(d.text)?.round() ?? 0,
            'currentChickens': double.tryParse(e.text)?.round() ?? 0,
            'entryDate': f.text,
            'housingType': housingType,
            'status': houseStatus
          });
          break;
        case 'feeds':
          if (widget.rows.isEmpty) throw Exception('Belum ada bahan pakan.');
          await ApiService.restockFeed(
              '${widget.rows.first['id']}', double.tryParse(a.text) ?? 0);
          break;
        case 'vaccinations':
          await ApiService.postData('vaccinations', {
            'coopId': a.text,
            'vaccineName': b.text,
            'diseaseTarget': c.text,
            'scheduledDate': d.text,
            'notes': 'Metode: $vaccineMethod; Dosis: ${e.text}',
            'status': 'scheduled'
          });
          break;
        case 'health-logs':
          await ApiService.postData('health-logs', {
            'coopId': a.text,
            'date': DateFormat('yyyy-MM-dd').format(DateTime.now()),
            'mortalityCount': int.tryParse(b.text) ?? 0,
            'culledCount': 0,
            'symptoms': [],
            'diagnosis': c.text,
            'recordedBy': widget.user.name
          });
          break;
        case 'finances':
          await ApiService.postData('finances', {
            'type': financeType,
            'category': financeCategory,
            'amount': double.tryParse(b.text) ?? 0,
            'date': c.text,
            'description': a.text
          });
          break;
        case 'members':
          await ApiService.postData('members', {
            'name': a.text,
            'email': b.text,
            'role': c.text.isEmpty ? 'worker' : c.text
          });
          break;
      }
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(e.toString().replaceFirst('Exception: ', ''))));
      }
    } finally {
      if (mounted) setState(() => saving = false);
    }
  }

  Widget _text(TextEditingController controller, String label,
          {bool number = false}) =>
      TextField(
          controller: controller,
          keyboardType: number ? TextInputType.number : TextInputType.text,
          decoration: InputDecoration(labelText: label));

  Widget _date(TextEditingController controller, String label) => TextField(
      controller: controller,
      readOnly: true,
      decoration: InputDecoration(
          labelText: label, suffixIcon: const Icon(Icons.calendar_today)),
      onTap: () async {
        final initial = DateTime.tryParse(controller.text) ?? DateTime.now();
        final picked = await showDatePicker(
            context: context,
            initialDate: initial,
            firstDate: DateTime(2000),
            lastDate: DateTime(2100));
        if (picked != null) {
          setState(() =>
              controller.text = DateFormat('yyyy-MM-dd').format(picked));
        }
      });

  int _ageWeeks(String date) {
    final value = DateTime.tryParse(date);
    if (value == null) return 0;
    return DateTime.now().difference(value).inDays ~/ 7;
  }

  List<Widget> _specialFields() {
    if (widget.endpoint == 'houses') {
      return [
        _text(a, 'Nama Kandang'),
        _text(b, 'Kode Kandang'),
        DropdownButtonFormField<String>(
            value: housingType,
            decoration: const InputDecoration(labelText: 'Tipe Kandang'),
            items: const [
              DropdownMenuItem(value: 'battery', child: Text('Battery Cage')),
              DropdownMenuItem(value: 'closed_house', child: Text('Closed House')),
              DropdownMenuItem(value: 'open_house', child: Text('Open House'))
            ],
            onChanged: (v) => setState(() => housingType = v!)),
        _date(f, 'Tanggal Check-in'),
        _text(d, 'Kapasitas Maksimal', number: true),
        _text(e, editing ? 'Jumlah Ayam Hidup' : 'Populasi Awal (Ekor)',
            number: true),
        InputDecorator(
            decoration: const InputDecoration(labelText: 'Umur Ayam (Minggu)'),
            child: Text('${_ageWeeks(f.text)} minggu')),
        _text(c, 'Ras / Strain'),
        if (editing)
          DropdownButtonFormField<String>(
              value: houseStatus,
              decoration: const InputDecoration(labelText: 'Status'),
              items: const [
                DropdownMenuItem(value: 'active', child: Text('Aktif')),
                DropdownMenuItem(value: 'quarantine', child: Text('Karantina')),
                DropdownMenuItem(value: 'maintenance', child: Text('Pemeliharaan')),
                DropdownMenuItem(value: 'empty', child: Text('Kosong'))
              ],
              onChanged: (v) => setState(() => houseStatus = v!))
      ];
    }
    if (widget.endpoint == 'vaccinations') {
      final selected = houses.any((h) => '${h['id']}' == a.text) ? a.text : null;
      return [
        if (houses.isEmpty)
          const LinearProgressIndicator()
        else
          DropdownButtonFormField<String>(
              value: selected,
              decoration: const InputDecoration(labelText: 'Pilih Kandang Target'),
              items: houses
                  .map((h) => DropdownMenuItem(
                      value: '${h['id']}',
                      child: Text('${h['name']} (${h['code']}) - Umur ${h['age_weeks'] ?? 0} mg')))
                  .toList(),
              onChanged: (v) => setState(() => a.text = v!)),
        _text(b, 'Nama Vaksin'),
        _text(c, 'Penyakit Target'),
        _date(d, 'Tanggal Pelaksanaan'),
        DropdownButtonFormField<String>(
            value: vaccineMethod,
            decoration: const InputDecoration(labelText: 'Metode Vaksinasi'),
            items: const [
              DropdownMenuItem(value: 'suntik_muskul', child: Text('Suntik Otot (Muskular)')),
              DropdownMenuItem(value: 'air_minum', child: Text('Air Minum')),
              DropdownMenuItem(value: 'tetes_mata', child: Text('Tetes Mata')),
              DropdownMenuItem(value: 'tetes_hidung', child: Text('Tetes Hidung')),
              DropdownMenuItem(value: 'spray', child: Text('Spray / Semprot'))
            ],
            onChanged: (v) => setState(() => vaccineMethod = v!)),
        _text(e, 'Dosis')
      ];
    }
    if (widget.endpoint == 'finances') {
      final categories = financeType == 'income'
          ? const {'egg_sales': 'Penjualan Telur', 'culled_chicken_sales': 'Penjualan Ayam Afkir', 'manure_sales': 'Penjualan Pupuk Kotoran'}
          : const {'feed_purchase': 'Pembelian Pakan', 'medication_vaccine': 'Obat & Vaksin', 'electricity_utility': 'Listrik & Air', 'labor_salary': 'Gaji Pekerja', 'equipment_repair': 'Peralatan / Perbaikan', 'other_expense': 'Lain-lain'};
      if (!categories.containsKey(financeCategory)) financeCategory = categories.keys.first;
      return [
        DropdownButtonFormField<String>(
            value: financeType,
            decoration: const InputDecoration(labelText: 'Tipe Transaksi'),
            items: const [
              DropdownMenuItem(value: 'income', child: Text('Pemasukan (Income)')),
              DropdownMenuItem(value: 'expense', child: Text('Pengeluaran (Expense)'))
            ],
            onChanged: (v) => setState(() {
                  financeType = v!;
                  financeCategory = v == 'income' ? 'egg_sales' : 'feed_purchase';
                })),
        DropdownButtonFormField<String>(
            value: financeCategory,
            decoration: const InputDecoration(labelText: 'Kategori'),
            items: categories.entries.map((x) => DropdownMenuItem(value: x.key, child: Text(x.value))).toList(),
            onChanged: (v) => setState(() => financeCategory = v!)),
        _text(a, 'Deskripsi Transaksi'),
        _text(b, 'Total Nominal (Rp)', number: true),
        _date(c, 'Tanggal Transaksi')
      ];
    }
    return [];
  }

  @override
  Widget build(BuildContext context) {
    final labels = switch (widget.endpoint) {
      'houses' => ['Nama kandang', 'Kode', 'Ras/strain', 'Populasi awal'],
      'feeds' => ['Jumlah restock (kg)', '', '', ''],
      'vaccinations' => [
          'ID kandang',
          'Nama vaksin',
          'Target penyakit',
          'Tanggal YYYY-MM-DD'
        ],
      'health-logs' => ['ID kandang', 'Ayam mati', 'Diagnosis/catatan', ''],
      'finances' => ['Deskripsi', 'Nominal (Rp)', '', ''],
      'members' => ['Nama lengkap', 'Email', 'Role: worker/manager/vet', ''],
      _ => ['Data', '', '', '']
    };
    final effectiveLabels = editing && widget.endpoint == 'feeds'
        ? ['Nama bahan', 'Stok (kg)', 'Batas minimum (kg)', 'Harga/kg']
        : labels;
    final controls = [a, b, c, d];
    return Container(
        padding: EdgeInsets.fromLTRB(
            20, 20, 20, MediaQuery.of(context).viewInsets.bottom + 24),
        decoration: const BoxDecoration(
            color: Color(0xFFF8FAFC),
            borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
        child: SingleChildScrollView(
            child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
              Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 18),
                  decoration: BoxDecoration(
                      color: const Color(0xFFCBD5E1),
                      borderRadius: BorderRadius.circular(9))),
              Text(title,
                  style: const TextStyle(
                      fontSize: 21, fontWeight: FontWeight.w900)),
              const SizedBox(height: 18),
              if (['houses', 'vaccinations', 'finances'].contains(widget.endpoint))
                for (final field in _specialFields()) ...[
                  field,
                  const SizedBox(height: 12)
                ]
              else
                for (int i = 0; i < effectiveLabels.length; i++)
                  if (effectiveLabels[i].isNotEmpty) ...[
                    TextField(
                        controller: controls[i],
                        keyboardType: i == 3 ||
                                widget.endpoint == 'feeds'
                            ? TextInputType.number
                            : TextInputType.text,
                        decoration:
                            InputDecoration(labelText: effectiveLabels[i])),
                    const SizedBox(height: 12)
                  ],
              FilledButton(
                  onPressed: saving ? null : save,
                  child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 15),
                      child: Text(saving ? 'Menyimpan...' : 'Simpan',
                          style: const TextStyle(fontWeight: FontWeight.w900))))
            ])));
  }
}
