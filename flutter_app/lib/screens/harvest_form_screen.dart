import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class HarvestFormScreen extends StatefulWidget {
  final List<House> houses;
  final AppUser user;
  final HarvestLog? existing;
  const HarvestFormScreen(
      {super.key, required this.houses, required this.user, this.existing});
  @override
  State<HarvestFormScreen> createState() => _HarvestFormScreenState();
}

class _HarvestFormScreenState extends State<HarvestFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _good = TextEditingController();
  final _damaged = TextEditingController(text: '0');
  final _weight = TextEditingController();
  final _death = TextEditingController(text: '0');
  final _feed = TextEditingController(text: '0');
  final _notes = TextEditingController();
  String? _houseId;
  String _timeSlot = 'pagi';
  DateTime _date = DateTime.now();
  bool _saving = false;
  double _gramsPerChicken = 110;

  @override
  void initState() {
    super.initState();
    final item = widget.existing;
    _houseId = item?.houseId ??
        (widget.houses.isEmpty ? null : widget.houses.first.id);
    if (item != null) {
      _date = DateTime.parse(item.harvestDate.substring(0, 10));
      _timeSlot = item.timeSlot;
      _good.text = item.goodEggsCount.toString();
      _damaged.text = item.damagedEggsCount.toString();
      _weight.text = item.weightKg.toString();
      _death.text = item.deathCount.toString();
      _feed.text = item.feedKg.toString();
      _notes.text = item.notes;
    } else {
      _loadFeedSetting();
    }
  }

  House? get _selectedHouse {
    for (final house in widget.houses) {
      if (house.id == _houseId) return house;
    }
    return null;
  }

  Future<void> _loadFeedSetting() async {
    try {
      _gramsPerChicken = await ApiService.fetchFeedGramsPerChicken();
    } catch (_) {
      _gramsPerChicken = 110;
    }
    if (!mounted) return;
    setState(_updateAutomaticFeed);
  }

  void _updateAutomaticFeed() {
    if (widget.existing != null) return;
    final chickens = _selectedHouse?.currentChickens ?? 0;
    final feedKg = _timeSlot == 'pagi'
        ? double.parse((chickens * _gramsPerChicken / 1000).toStringAsFixed(2))
        : 0.0;
    _feed.text = feedKg.toStringAsFixed(feedKg.truncateToDouble() == feedKg ? 0 : 2);
  }

  int? _int(String? value) => int.tryParse(value ?? '');
  double? _double(String? value) =>
      double.tryParse((value ?? '').replaceAll(',', '.'));

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final values =
          (houseId: _houseId!, date: DateFormat('yyyy-MM-dd').format(_date));
      if (widget.existing == null) {
        await ApiService.createHarvest(
            houseId: values.houseId,
            harvestDate: values.date,
            timeSlot: _timeSlot,
            goodEggs: _int(_good.text)!,
            damagedEggs: _int(_damaged.text) ?? 0,
            weightKg: _double(_weight.text)!,
            deathCount: _int(_death.text) ?? 0,
            feedKg: _double(_feed.text) ?? 0,
            notes: _notes.text.trim(),
            recordedBy: widget.user.name);
      } else {
        await ApiService.updateHarvest(
            id: widget.existing!.id,
            houseId: values.houseId,
            harvestDate: values.date,
            timeSlot: _timeSlot,
            goodEggs: _int(_good.text)!,
            damagedEggs: _int(_damaged.text) ?? 0,
            weightKg: _double(_weight.text)!,
            deathCount: _int(_death.text) ?? 0,
            feedKg: _double(_feed.text) ?? 0,
            notes: _notes.text.trim(),
            recordedBy: widget.user.name);
      }
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(widget.existing == null
              ? 'Produksi berhasil disimpan.'
              : 'Produksi berhasil diperbarui.'),
          backgroundColor: const Color(0xFF059669)));
      Navigator.pop(context, true);
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(error.toString().replaceFirst('Exception: ', '')),
            backgroundColor: Colors.red));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  InputDecoration _decoration(String label, IconData icon) => InputDecoration(
      labelText: label,
      prefixIcon: Icon(icon),
      border: const OutlineInputBorder());
  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
            title: Text(
                widget.existing == null
                    ? 'Catat Produksi Telur'
                    : 'Edit Produksi Hari Ini',
                style: const TextStyle(fontWeight: FontWeight.bold))),
        body: Form(
            key: _formKey,
            child: ListView(padding: const EdgeInsets.all(20), children: [
              DropdownButtonFormField<String>(
                  value: _houseId,
                  decoration: _decoration('Kandang', Icons.home_work_outlined),
                  items: widget.houses
                      .map((h) => DropdownMenuItem(
                          value: h.id, child: Text('${h.code} — ${h.name}')))
                      .toList(),
                  onChanged: (v) => setState(() {
                        _houseId = v;
                        _updateAutomaticFeed();
                      }),
                  validator: (v) => v == null ? 'Pilih kandang' : null),
              const SizedBox(height: 14),
              InkWell(
                  onTap: widget.existing != null
                      ? null
                      : () async {
                          final value = await showDatePicker(
                              context: context,
                              initialDate: _date,
                              firstDate: DateTime(2020),
                              lastDate: DateTime.now());
                          if (value != null) setState(() => _date = value);
                        },
                  child: InputDecorator(
                      decoration:
                          _decoration('Tanggal Produksi', Icons.calendar_today),
                      child: Text(DateFormat('dd-MM-yyyy').format(_date)))),
              const SizedBox(height: 14),
              DropdownButtonFormField<String>(
                  value: _timeSlot,
                  decoration: _decoration('Sesi Produksi', Icons.schedule),
                  items: const [
                    DropdownMenuItem(value: 'pagi', child: Text('Pagi')),
                    DropdownMenuItem(value: 'siang', child: Text('Siang')),
                    DropdownMenuItem(value: 'sore', child: Text('Sore'))
                  ],
                  onChanged: (v) => setState(() {
                        _timeSlot = v!;
                        _updateAutomaticFeed();
                      })),
              const SizedBox(height: 14),
              TextFormField(
                  controller: _good,
                  keyboardType: TextInputType.number,
                  decoration:
                      _decoration('Telur Utuh (butir)', Icons.egg_alt_outlined),
                  validator: (v) => (_int(v) ?? -1) < 0
                      ? 'Masukkan jumlah yang valid'
                      : null),
              const SizedBox(height: 14),
              TextFormField(
                  controller: _damaged,
                  keyboardType: TextInputType.number,
                  decoration: _decoration(
                      'Telur Rusak/Retak (butir)', Icons.warning_amber),
                  validator: (v) => (_int(v) ?? -1) < 0
                      ? 'Masukkan jumlah yang valid'
                      : null),
              const SizedBox(height: 14),
              TextFormField(
                  controller: _weight,
                  keyboardType:
                      const TextInputType.numberWithOptions(decimal: true),
                  decoration:
                      _decoration('Total Berat Telur (kg)', Icons.scale),
                  validator: (v) => (_double(v) ?? 0) <= 0
                      ? 'Berat harus lebih dari 0'
                      : null),
              const SizedBox(height: 14),
              TextFormField(
                  controller: _feed,
                  keyboardType:
                      const TextInputType.numberWithOptions(decimal: true),
                  decoration: _decoration('Pakan Terpakai (kg)', Icons.grass),
                  validator: (v) => (_double(v) ?? -1) < 0
                      ? 'Masukkan jumlah yang valid'
                      : null),
              if (widget.existing == null && _timeSlot == 'pagi') ...[
                const SizedBox(height: 6),
                Text(
                    'Terisi otomatis: ${NumberFormat.decimalPattern('id_ID').format(_selectedHouse?.currentChickens ?? 0)} ekor × ${NumberFormat.decimalPattern('id_ID').format(_gramsPerChicken)} gram.',
                    style: Theme.of(context)
                        .textTheme
                        .bodySmall
                        ?.copyWith(color: Colors.grey.shade600)),
              ],
              const SizedBox(height: 14),
              TextFormField(
                  controller: _death,
                  keyboardType: TextInputType.number,
                  decoration: _decoration(
                      'Ayam Mati (ekor)', Icons.remove_circle_outline),
                  validator: (v) => (_int(v) ?? -1) < 0
                      ? 'Masukkan jumlah yang valid'
                      : null),
              const SizedBox(height: 14),
              TextFormField(
                  controller: _notes,
                  maxLines: 3,
                  decoration: _decoration('Catatan', Icons.notes)),
              const SizedBox(height: 22),
              FilledButton.icon(
                  onPressed: _saving ? null : _submit,
                  icon: _saving
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2))
                      : const Icon(Icons.save),
                  label: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      child: Text(widget.existing == null
                          ? 'Simpan Produksi'
                          : 'Simpan Perubahan'))),
            ])),
      );
}
