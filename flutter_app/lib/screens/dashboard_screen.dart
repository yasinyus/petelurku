import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import 'harvest_form_screen.dart';
import 'profile_screen.dart';
import 'owner_modules.dart';
import 'ai_assistant_screen.dart';

class MobileDashboardScreen extends StatefulWidget {
  final AppUser user;
  const MobileDashboardScreen({super.key, required this.user});
  @override
  State<MobileDashboardScreen> createState() => _MobileDashboardScreenState();
}

class _MobileDashboardScreenState extends State<MobileDashboardScreen> {
  bool _loading = true;
  String? _error;
  List<HarvestLog> _harvests = [];
  List<House> _houses = [];
  bool _showYesterday = false;
  String _houseCode(String id) {
    for (final h in _houses) {
      if (h.id == id) return h.code;
    }
    return id;
  }

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final results = await Future.wait(
          [ApiService.fetchHarvests(), ApiService.fetchHouses()]);
      if (mounted) {
        setState(() {
          _harvests = results[0] as List<HarvestLog>;
          _houses = results[1] as List<House>;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString().replaceFirst('Exception: ', '');
          _loading = false;
        });
      }
    }
  }

  Future<void> _openForm([HarvestLog? item]) async {
    final changed = await Navigator.push(
        context,
        MaterialPageRoute(
            builder: (_) => HarvestFormScreen(
                houses: _houses, user: widget.user, existing: item)));
    if (changed == true) _load();
  }

  Future<void> _deleteHarvest(HarvestLog item) async {
    final confirmed = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
              title: const Text('Hapus produksi?'),
              content: const Text(
                  'Stok pakan dan populasi terkait akan dikembalikan oleh server.'),
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
      await ApiService.deleteData('harvests/${item.id}');
      await _load();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(e.toString().replaceFirst('Exception: ', ''))));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final today = DateFormat('yyyy-MM-dd').format(now);
    final selectedDate = DateFormat('yyyy-MM-dd')
        .format(_showYesterday ? now.subtract(const Duration(days: 1)) : now);
    final selectedData = _harvests
        .where((h) =>
            h.harvestDate.length >= 10 &&
            h.harvestDate.substring(0, 10) == selectedDate)
        .toList();
    final eggs = selectedData.fold<int>(
        0, (s, h) => s + h.goodEggsCount + h.damagedEggsCount);
    final good = selectedData.fold<int>(0, (s, h) => s + h.goodEggsCount);
    final damaged = selectedData.fold<int>(0, (s, h) => s + h.damagedEggsCount);
    final weight = selectedData.fold<double>(0, (s, h) => s + h.weightKg);
    final feed = selectedData.fold<double>(0, (s, h) => s + h.feedKg);
    final fcr = weight > 0 && feed > 0 ? feed / weight : null;
    final population = _houses.fold<int>(0, (s, h) => s + h.currentChickens);
    final hdp = population == 0 ? 0.0 : eggs / population * 100;
    return Scaffold(
      drawer: widget.user.role == 'owner' ? _ownerDrawer() : null,
      body: RefreshIndicator(
          onRefresh: _load,
          child: CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                SliverToBoxAdapter(child: _hero(hdp, eggs, weight)),
                SliverPadding(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                    sliver: SliverToBoxAdapter(
                        child: _periodSelector(selectedDate))),
                SliverPadding(
                    padding: const EdgeInsets.fromLTRB(16, 18, 16, 8),
                    sliver: SliverToBoxAdapter(
                        child: LayoutBuilder(builder: (_, box) {
                      final width = box.maxWidth > 620
                          ? (box.maxWidth - 36) / 4
                          : (box.maxWidth - 12) / 2;
                      return Wrap(spacing: 12, runSpacing: 12, children: [
                        _metric(
                            width,
                            'Telur utuh',
                            NumberFormat.decimalPattern('id_ID').format(good),
                            Icons.egg_outlined,
                            const Color(0xFF087F5B),
                            const Color(0xFFECFDF5)),
                        _metric(
                            width,
                            'Rusak / retak',
                            NumberFormat.decimalPattern('id_ID')
                                .format(damaged),
                            Icons.warning_amber_rounded,
                            const Color(0xFFE11D48),
                            const Color(0xFFFFF1F2)),
                        _metric(
                            width,
                            'Berat panen',
                            '${weight.toStringAsFixed(1)} kg',
                            Icons.scale_rounded,
                            const Color(0xFF2563EB),
                            const Color(0xFFEFF6FF)),
                        _metric(
                            width,
                            'Populasi',
                            NumberFormat.decimalPattern('id_ID')
                                .format(population),
                            Icons.groups_rounded,
                            const Color(0xFF7C3AED),
                            const Color(0xFFF5F3FF)),
                      ]);
                    }))),
                SliverPadding(
                    padding: const EdgeInsets.fromLTRB(16, 4, 16, 4),
                    sliver: SliverToBoxAdapter(
                        child: _fcrCard(fcr, feed, weight))),
                SliverPadding(
                    padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
                    sliver: SliverToBoxAdapter(
                        child: Row(children: [
                      const Expanded(
                          child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                            Text('Riwayat produksi',
                                style: TextStyle(
                                    fontSize: 19, fontWeight: FontWeight.w900)),
                            SizedBox(height: 3),
                            Text('Data terbaru seluruh kandang',
                                style: TextStyle(
                                    color: Color(0xFF64748B), fontSize: 12))
                          ])),
                      FilledButton.icon(
                          onPressed: _houses.isEmpty ? null : () => _openForm(),
                          icon: const Icon(Icons.add_rounded),
                          label: const Text('Catat',
                              style: TextStyle(fontWeight: FontWeight.w800))),
                    ]))),
                if (_loading)
                  const SliverFillRemaining(
                      child: Center(child: CircularProgressIndicator()))
                else if (_error != null)
                  SliverFillRemaining(
                      child: _message(Icons.cloud_off_rounded,
                          'Gagal memuat data', _error!, 'Coba lagi', _load))
                else if (selectedData.isEmpty)
                  SliverFillRemaining(
                      hasScrollBody: false,
                      child: _message(
                          Icons.event_busy_rounded,
                          'Belum ada produksi',
                          'Tidak ada catatan produksi untuk ${_showYesterday ? 'kemarin' : 'hari ini'}.',
                          _showYesterday ? 'Lihat hari ini' : 'Catat produksi',
                          _showYesterday
                              ? () => setState(() => _showYesterday = false)
                              : () => _openForm()))
                else
                  SliverPadding(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                      sliver: SliverList.separated(
                          itemCount: selectedData.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: 10),
                          itemBuilder: (_, i) =>
                              _harvestCard(selectedData[i], today))),
              ])),
      floatingActionButton: FloatingActionButton.extended(
          onPressed: _houses.isEmpty ? null : () => _openForm(),
          backgroundColor: const Color(0xFF087F5B),
          foregroundColor: Colors.white,
          icon: const Icon(Icons.add_rounded),
          label: const Text('Produksi',
              style: TextStyle(fontWeight: FontWeight.w800))),
    );
  }

  Widget _hero(double hdp, int eggs, double weight) => Container(
      padding: const EdgeInsets.fromLTRB(20, 48, 20, 25),
      decoration: const BoxDecoration(
          gradient: LinearGradient(
              colors: [Color(0xFF064E3B), Color(0xFF0B8F68)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight),
          borderRadius: BorderRadius.vertical(bottom: Radius.circular(34))),
      child: SafeArea(
          bottom: false,
          child: Column(children: [
            Row(children: [
              if (widget.user.role == 'owner')
                Builder(
                    builder: (context) => IconButton(
                        onPressed: () => Scaffold.of(context).openDrawer(),
                        icon: const Icon(Icons.menu_rounded,
                            color: Colors.white))),
              Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: .14),
                      borderRadius: BorderRadius.circular(14)),
                  child:
                      const Icon(Icons.egg_alt_rounded, color: Colors.white)),
              const SizedBox(width: 12),
              Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    const Text('PetelurKu.com',
                        style: TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.w900)),
                    Text(
                        _showYesterday
                            ? 'Produksi kemarin'
                            : 'Produksi hari ini',
                        style: const TextStyle(
                            color: Color(0xFFA7F3D0), fontSize: 12))
                  ])),
              InkWell(
                  borderRadius: BorderRadius.circular(16),
                  onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (_) => ProfileScreen(user: widget.user))),
                  child: Container(
                      padding: const EdgeInsets.fromLTRB(7, 6, 12, 6),
                      decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: .14),
                          borderRadius: BorderRadius.circular(18)),
                      child: Row(children: [
                        CircleAvatar(
                            radius: 15,
                            backgroundColor: Colors.white,
                            child: Text(
                                widget.user.name.isEmpty
                                    ? '?'
                                    : widget.user.name[0].toUpperCase(),
                                style: const TextStyle(
                                    color: Color(0xFF087F5B),
                                    fontWeight: FontWeight.w900))),
                        const SizedBox(width: 8),
                        Text(widget.user.name.split(' ').first,
                            style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w700))
                      ])))
            ]),
            const SizedBox(height: 28),
            Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
              Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    const Text('TOTAL PANEN',
                        style: TextStyle(
                            color: Color(0xFFA7F3D0),
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 1.2)),
                    const SizedBox(height: 6),
                    Text(NumberFormat.decimalPattern('id_ID').format(eggs),
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 38,
                            height: 1,
                            fontWeight: FontWeight.w900)),
                    const SizedBox(height: 6),
                    Text('${weight.toStringAsFixed(1)} kg telur',
                        style: const TextStyle(color: Color(0xFFD1FAE5)))
                  ])),
              Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
                  decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18)),
                  child: Column(children: [
                    Text('${hdp.toStringAsFixed(1)}%',
                        style: const TextStyle(
                            color: Color(0xFF087F5B),
                            fontSize: 22,
                            fontWeight: FontWeight.w900)),
                    const Text('HDP',
                        style: TextStyle(
                            color: Color(0xFF64748B),
                            fontSize: 10,
                            fontWeight: FontWeight.w800))
                  ]))
            ]),
          ])));
  Widget _metric(double w, String title, String value, IconData icon,
          Color color, Color bg) =>
      SizedBox(
          width: w,
          child: Container(
              padding: const EdgeInsets.all(15),
              decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(19),
                  border: Border.all(color: const Color(0xFFE8EDF2))),
              child: Row(children: [
                Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                        color: bg, borderRadius: BorderRadius.circular(13)),
                    child: Icon(icon, color: color, size: 21)),
                const SizedBox(width: 11),
                Expanded(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                      Text(title,
                          style: const TextStyle(
                              color: Color(0xFF64748B), fontSize: 11)),
                      Text(value,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                              fontWeight: FontWeight.w900, fontSize: 16))
                    ]))
              ])));

  Widget _fcrCard(double? fcr, double feed, double weight) {
    final value = fcr?.toStringAsFixed(2) ?? '-';
    final (label, color, background) = fcr == null
        ? ('Data belum cukup', const Color(0xFF64748B), const Color(0xFFF1F5F9))
        : fcr > 2.3
            ? ('Perlu evaluasi', const Color(0xFFBE123C), const Color(0xFFFFF1F2))
            : fcr > 2.1
                ? ('Standar normal', const Color(0xFFB45309), const Color(0xFFFFFBEB))
                : ('Sangat efisien', const Color(0xFF047857), const Color(0xFFECFDF5));
    return Container(
        padding: const EdgeInsets.all(17),
        decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(19),
            border: Border.all(color: const Color(0xFFE8EDF2))),
        child: Row(children: [
          Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                  color: background, borderRadius: BorderRadius.circular(15)),
              child: Icon(Icons.calculate_rounded, color: color)),
          const SizedBox(width: 13),
          Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                const Text('Feed Conversion Ratio (FCR)',
                    style: TextStyle(fontWeight: FontWeight.w900)),
                const SizedBox(height: 3),
                Text(
                    '${feed.toStringAsFixed(1)} kg pakan ÷ ${weight.toStringAsFixed(1)} kg telur',
                    style: const TextStyle(
                        color: Color(0xFF64748B), fontSize: 11)),
                const SizedBox(height: 5),
                Text(label,
                    style: TextStyle(
                        color: color,
                        fontSize: 11,
                        fontWeight: FontWeight.w800))
              ])),
          Text(value,
              style: TextStyle(
                  color: color, fontSize: 28, fontWeight: FontWeight.w900))
        ]));
  }
  Widget _periodSelector(String date) => Container(
      padding: const EdgeInsets.all(5),
      decoration: BoxDecoration(
          color: const Color(0xFFE8EDF2),
          borderRadius: BorderRadius.circular(17)),
      child: Row(children: [
        Expanded(
            child: _periodButton('Hari Ini', Icons.today_rounded,
                !_showYesterday, () => setState(() => _showYesterday = false))),
        Expanded(
            child: _periodButton('Kemarin', Icons.history_rounded,
                _showYesterday, () => setState(() => _showYesterday = true))),
        Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            child: Text(DateFormat('dd MMM').format(DateTime.parse(date)),
                style: const TextStyle(
                    color: Color(0xFF64748B),
                    fontSize: 11,
                    fontWeight: FontWeight.w700))),
      ]));
  Widget _periodButton(
          String text, IconData icon, bool active, VoidCallback tap) =>
      InkWell(
          onTap: tap,
          borderRadius: BorderRadius.circular(13),
          child: AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              padding: const EdgeInsets.symmetric(vertical: 11),
              decoration: BoxDecoration(
                  color: active ? Colors.white : Colors.transparent,
                  borderRadius: BorderRadius.circular(13),
                  boxShadow: active
                      ? const [
                          BoxShadow(color: Color(0x120F172A), blurRadius: 8)
                        ]
                      : null),
              child:
                  Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                Icon(icon,
                    size: 17,
                    color: active
                        ? const Color(0xFF087F5B)
                        : const Color(0xFF64748B)),
                const SizedBox(width: 6),
                Text(text,
                    style: TextStyle(
                        fontWeight: FontWeight.w800,
                        color: active
                            ? const Color(0xFF087F5B)
                            : const Color(0xFF64748B)))
              ])));
  Widget _harvestCard(HarvestLog h, String today) {
    final edit = widget.user.role == 'owner' ||
        h.harvestDate.substring(0, 10) == today;
    return Container(
        padding: const EdgeInsets.all(15),
        decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(19),
            border: Border.all(color: const Color(0xFFE8EDF2))),
        child: Row(children: [
          Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                  color: const Color(0xFFFFF7ED),
                  borderRadius: BorderRadius.circular(15)),
              child:
                  const Icon(Icons.egg_alt_rounded, color: Color(0xFFEA580C))),
          const SizedBox(width: 13),
          Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                Row(children: [
                  Text(_houseCode(h.houseId),
                      style: const TextStyle(
                          fontWeight: FontWeight.w900, fontSize: 14)),
                  const SizedBox(width: 8),
                  _badge(h.timeSlot.toUpperCase())
                ]),
                const SizedBox(height: 6),
                Text(
                    '${NumberFormat.decimalPattern('id_ID').format(h.goodEggsCount)} butir  •  ${h.weightKg} kg',
                    style: const TextStyle(fontWeight: FontWeight.w700)),
                const SizedBox(height: 3),
                Text(
                    DateFormat('dd MMM yyyy')
                        .format(DateTime.parse(h.harvestDate.substring(0, 10))),
                    style:
                        const TextStyle(color: Color(0xFF64748B), fontSize: 11))
              ])),
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text('${h.henDayPercentage}%',
                style: const TextStyle(
                    color: Color(0xFF087F5B), fontWeight: FontWeight.w900)),
            const Text('HDP',
                style: TextStyle(fontSize: 9, color: Color(0xFF64748B))),
            if (edit)
              Row(mainAxisSize: MainAxisSize.min, children: [
                IconButton(
                    visualDensity: VisualDensity.compact,
                    tooltip: 'Edit',
                    onPressed: () => _openForm(h),
                    icon: const Icon(Icons.edit_rounded,
                        color: Color(0xFF087F5B), size: 19)),
                if (widget.user.role == 'owner')
                  IconButton(
                      visualDensity: VisualDensity.compact,
                      tooltip: 'Hapus',
                      onPressed: () => _deleteHarvest(h),
                      icon: const Icon(Icons.delete_outline_rounded,
                          color: Colors.red, size: 19))
              ])
          ])
        ]));
  }

  Widget _badge(String text) => Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
          color: const Color(0xFFECFDF5),
          borderRadius: BorderRadius.circular(7)),
      child: Text(text,
          style: const TextStyle(
              color: Color(0xFF047857),
              fontSize: 9,
              fontWeight: FontWeight.w900)));
  Widget _message(IconData icon, String title, String body, String action,
          VoidCallback tap) =>
      Center(
          child: Padding(
              padding: const EdgeInsets.all(30),
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                        color: const Color(0xFFECFDF5),
                        borderRadius: BorderRadius.circular(24)),
                    child:
                        Icon(icon, size: 34, color: const Color(0xFF087F5B))),
                const SizedBox(height: 16),
                Text(title,
                    style: const TextStyle(
                        fontSize: 18, fontWeight: FontWeight.w900)),
                const SizedBox(height: 6),
                Text(body,
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Color(0xFF64748B))),
                const SizedBox(height: 18),
                FilledButton(onPressed: tap, child: Text(action))
              ])));
  Widget _ownerDrawer() {
    final modules = [
      (
        'Kandang & Populasi',
        'Kelola kandang dan populasi ayam',
        'houses',
        Icons.home_work_rounded
      ),
      (
        'Stok & Pakan',
        'Stok bahan dan kebutuhan pakan',
        'feeds',
        Icons.grass_rounded
      ),
      (
        'Kesehatan',
        'Catatan kesehatan dan mortalitas',
        'health-logs',
        Icons.health_and_safety_rounded
      ),
      (
        'Vaksinasi',
        'Jadwal dan status vaksinasi',
        'vaccinations',
        Icons.vaccines_rounded
      ),
      (
        'Keuangan',
        'Keuangan dan keuntungan',
        'finances',
        Icons.account_balance_wallet_rounded
      ),
      (
        'Kelola Akses',
        'Anggota dan role peternakan',
        'members',
        Icons.manage_accounts_rounded
      ),
    ];
    return Drawer(
        child: SafeArea(
            child: Column(children: [
      Container(
          margin: const EdgeInsets.all(12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
              gradient: const LinearGradient(
                  colors: [Color(0xFF064E3B), Color(0xFF0B8F68)]),
              borderRadius: BorderRadius.circular(22)),
          child: Row(children: [
            CircleAvatar(
                radius: 23,
                backgroundColor: Colors.white,
                child: Text(
                    widget.user.name.isEmpty
                        ? '?'
                        : widget.user.name[0].toUpperCase(),
                    style: const TextStyle(
                        color: Color(0xFF087F5B),
                        fontWeight: FontWeight.w900,
                        fontSize: 18))),
            const SizedBox(width: 12),
            Expanded(
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                  Text(widget.user.name,
                      style: const TextStyle(
                          color: Colors.white, fontWeight: FontWeight.w900)),
                  const Text('Owner Peternakan',
                      style: TextStyle(color: Color(0xFFA7F3D0), fontSize: 11))
                ]))
          ])),
      ListTile(
          leading:
              const Icon(Icons.dashboard_rounded, color: Color(0xFF087F5B)),
          title: const Text('Dashboard',
              style: TextStyle(fontWeight: FontWeight.w800)),
          selected: true,
          onTap: () => Navigator.pop(context)),
      ListTile(
          leading:
              const Icon(Icons.auto_awesome_rounded, color: Color(0xFF7C3AED)),
          title: const Text('AI Farm Assistant',
              style: TextStyle(fontWeight: FontWeight.w900)),
          subtitle: const Text('Analisis, saran, dan chatbot',
              style: TextStyle(fontSize: 10)),
          onTap: () {
            Navigator.pop(context);
            Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (_) => AiAssistantScreen(user: widget.user)));
          }),
      const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16), child: Divider()),
      Expanded(
          child: ListView(
              children: modules
                  .map((m) => ListTile(
                      leading: Icon(m.$4, color: const Color(0xFF64748B)),
                      title: Text(m.$1,
                          style: const TextStyle(fontWeight: FontWeight.w700)),
                      subtitle:
                          Text(m.$2, style: const TextStyle(fontSize: 10)),
                      onTap: () {
                        Navigator.pop(context);
                        Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (_) => OwnerModuleScreen(
                                    title: m.$1,
                                    subtitle: m.$2,
                                    endpoint: m.$3,
                                    icon: m.$4,
                                    user: widget.user)));
                      }))
                  .toList())),
      ListTile(
          leading: const Icon(Icons.person_rounded),
          title: const Text('Profil Saya'),
          onTap: () {
            Navigator.pop(context);
            Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (_) => ProfileScreen(user: widget.user)));
          }),
      const SizedBox(height: 8),
    ])));
  }
}
