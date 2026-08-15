import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class OwnerModuleScreen extends StatefulWidget {
  final String title, subtitle, endpoint;
  final IconData icon;
  final AppUser user;
  const OwnerModuleScreen({super.key, required this.title, required this.subtitle, required this.endpoint, required this.icon, required this.user});
  @override State<OwnerModuleScreen> createState() => _OwnerModuleScreenState();
}

class _OwnerModuleScreenState extends State<OwnerModuleScreen> {
  bool loading = true; String? error; List<Map<String, dynamic>> rows = [];
  @override void initState() { super.initState(); load(); }
  Future<void> load() async { setState(() { loading = true; error = null; }); try { final value = await ApiService.fetchList(widget.endpoint); if (mounted) setState(() { rows = value; loading = false; }); } catch (e) { if (mounted) setState(() { error = e.toString().replaceFirst('Exception: ', ''); loading = false; }); } }
  String value(Map<String, dynamic> row, List<String> keys, [String fallback = '-']) { for (final key in keys) { if (row[key] != null && '${row[key]}'.isNotEmpty) return '${row[key]}'; } return fallback; }
  String get actionLabel => switch (widget.endpoint) { 'houses' => 'Tambah kandang', 'feeds' => 'Restock', 'vaccinations' => 'Jadwal vaksin', 'health-logs' => 'Catat kesehatan', 'finances' => 'Catat transaksi', 'members' => 'Undang anggota', _ => 'Tambah' };
  Future<void> add() async { final changed = await showModalBottomSheet<bool>(context: context, isScrollControlled: true, backgroundColor: Colors.transparent, builder: (_) => _ModuleForm(endpoint: widget.endpoint, rows: rows, user: widget.user)); if (changed == true) load(); }
  @override Widget build(BuildContext context) => Scaffold(
    backgroundColor: const Color(0xFFF5F7F8),
    appBar: AppBar(title: Text(widget.title, style: const TextStyle(fontWeight: FontWeight.w900))),
    body: RefreshIndicator(onRefresh: load, child: ListView(padding: const EdgeInsets.fromLTRB(16, 10, 16, 100), children: [
      Container(padding: const EdgeInsets.all(20), decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFF064E3B), Color(0xFF0B8F68)]), borderRadius: BorderRadius.circular(24)), child: Row(children: [Container(width: 54, height: 54, decoration: BoxDecoration(color: Colors.white.withValues(alpha: .15), borderRadius: BorderRadius.circular(17)), child: Icon(widget.icon, color: Colors.white, size: 27)), const SizedBox(width: 15), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(widget.title, style: const TextStyle(color: Colors.white, fontSize: 19, fontWeight: FontWeight.w900)), const SizedBox(height: 4), Text(widget.subtitle, style: const TextStyle(color: Color(0xFFD1FAE5), fontSize: 12))]))])),
      const SizedBox(height: 16),
      if (loading) const Padding(padding: EdgeInsets.all(50), child: Center(child: CircularProgressIndicator()))
      else if (error != null) _empty(Icons.cloud_off_rounded, 'Gagal memuat data', error!)
      else if (rows.isEmpty) _empty(widget.icon, 'Belum ada data', 'Gunakan tombol $actionLabel untuk memulai.')
      else ...rows.map(card),
    ])),
    floatingActionButton: FilledButton.icon(onPressed: add, icon: const Icon(Icons.add_rounded), label: Padding(padding: const EdgeInsets.symmetric(vertical: 14), child: Text(actionLabel, style: const TextStyle(fontWeight: FontWeight.w800)))),
  );
  Widget card(Map<String, dynamic> r) {
    final title = switch (widget.endpoint) { 'houses' => value(r, ['name']), 'feeds' => value(r, ['feed_name']), 'vaccinations' => value(r, ['vaccine_name']), 'health-logs' => value(r, ['diagnosis'], 'Catatan kesehatan'), 'finances' => value(r, ['description']), 'members' => value(r, ['full_name']), _ => 'Data' };
    final subtitle = switch (widget.endpoint) { 'houses' => '${value(r, ['code'])} • ${value(r, ['current_chickens'], '0')} ekor', 'feeds' => 'Stok ${value(r, ['current_stock_kg'], '0')} kg • Rp ${value(r, ['price_per_kg'], '0')}/kg', 'vaccinations' => '${value(r, ['scheduled_date'])} • ${value(r, ['status'])}', 'health-logs' => '${value(r, ['record_date'])} • Mortalitas ${value(r, ['mortality_count'], '0')}', 'finances' => '${value(r, ['transaction_date'])} • Rp ${value(r, ['amount'], '0')}', 'members' => '${value(r, ['email'])} • ${value(r, ['role'])}', _ => '' };
    return Container(margin: const EdgeInsets.only(bottom: 10), padding: const EdgeInsets.all(15), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(19), border: Border.all(color: const Color(0xFFE8EDF2))), child: Row(children: [Container(width: 44, height: 44, decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(14)), child: Icon(widget.icon, color: const Color(0xFF087F5B), size: 21)), const SizedBox(width: 13), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: const TextStyle(fontWeight: FontWeight.w900)), const SizedBox(height: 4), Text(subtitle, style: const TextStyle(color: Color(0xFF64748B), fontSize: 12))])), const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8))]));
  }
  Widget _empty(IconData icon, String title, String text) => Padding(padding: const EdgeInsets.all(36), child: Column(children: [Icon(icon, size: 48, color: const Color(0xFF94A3B8)), const SizedBox(height: 12), Text(title, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 17)), const SizedBox(height: 5), Text(text, textAlign: TextAlign.center, style: const TextStyle(color: Color(0xFF64748B)))]));
}

class _ModuleForm extends StatefulWidget {
  final String endpoint; final List<Map<String, dynamic>> rows; final AppUser user;
  const _ModuleForm({required this.endpoint, required this.rows, required this.user});
  @override State<_ModuleForm> createState() => _ModuleFormState();
}
class _ModuleFormState extends State<_ModuleForm> {
  final a = TextEditingController(), b = TextEditingController(), c = TextEditingController(), d = TextEditingController(); bool saving = false;
  String get title => switch(widget.endpoint) {'houses'=>'Tambah Kandang','feeds'=>'Restock Pakan','vaccinations'=>'Jadwal Vaksin','health-logs'=>'Catat Kesehatan','finances'=>'Catat Transaksi','members'=>'Undang Anggota',_=>'Tambah Data'};
  Future<void> save() async { setState(()=>saving=true); try {
    switch(widget.endpoint) {
      case 'houses': await ApiService.createHouse({'name':a.text,'code':b.text,'chickenType':c.text.isEmpty?'ISA Brown':c.text,'initialChickens':double.tryParse(d.text)?.round()??0,'currentChickens':double.tryParse(d.text)?.round()??0,'entryDate':DateFormat('yyyy-MM-dd').format(DateTime.now()),'housingType':'battery','status':'active'}); break;
      case 'feeds': if(widget.rows.isEmpty) throw Exception('Belum ada bahan pakan.'); await ApiService.restockFeed('${widget.rows.first['id']}', double.tryParse(a.text)??0); break;
      case 'vaccinations': await ApiService.postData('vaccinations', {'houseId':a.text,'vaccineName':b.text,'diseaseTarget':c.text,'scheduledDate':d.text,'notes':'','status':'scheduled'}); break;
      case 'health-logs': await ApiService.postData('health-logs', {'coopId':a.text,'date':DateFormat('yyyy-MM-dd').format(DateTime.now()),'mortalityCount':int.tryParse(b.text)??0,'culledCount':0,'symptoms':[],'diagnosis':c.text,'recordedBy':widget.user.name}); break;
      case 'finances': await ApiService.postData('finances', {'type':'expense','category':'other_expense','amount':double.tryParse(b.text)??0,'date':DateFormat('yyyy-MM-dd').format(DateTime.now()),'description':a.text}); break;
      case 'members': await ApiService.postData('members', {'name':a.text,'email':b.text,'role':c.text.isEmpty?'worker':c.text}); break;
    }
    if(mounted) Navigator.pop(context,true);
  } catch(e) { if(mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content:Text(e.toString().replaceFirst('Exception: ','')))); } finally { if(mounted)setState(()=>saving=false); } }
  @override Widget build(BuildContext context) { final labels = switch(widget.endpoint) {'houses'=>['Nama kandang','Kode','Ras/strain','Populasi awal'],'feeds'=>['Jumlah restock (kg)','','',''],'vaccinations'=>['ID kandang','Nama vaksin','Target penyakit','Tanggal YYYY-MM-DD'],'health-logs'=>['ID kandang','Ayam mati','Diagnosis/catatan',''],'finances'=>['Deskripsi','Nominal (Rp)','',''],'members'=>['Nama lengkap','Email','Role: worker/manager/vet',''],_=>['Data','','','']}; final controls=[a,b,c,d]; return Container(padding: EdgeInsets.fromLTRB(20,20,20,MediaQuery.of(context).viewInsets.bottom+24), decoration: const BoxDecoration(color:Color(0xFFF8FAFC),borderRadius:BorderRadius.vertical(top:Radius.circular(28))), child: SingleChildScrollView(child:Column(crossAxisAlignment:CrossAxisAlignment.stretch,children:[Container(width:40,height:4,margin:const EdgeInsets.only(bottom:18),decoration:BoxDecoration(color:const Color(0xFFCBD5E1),borderRadius:BorderRadius.circular(9))),Text(title,style:const TextStyle(fontSize:21,fontWeight:FontWeight.w900)),const SizedBox(height:18),for(int i=0;i<labels.length;i++)if(labels[i].isNotEmpty)...[TextField(controller:controls[i],keyboardType:i==3||widget.endpoint=='feeds'||(widget.endpoint=='finances'&&i==1)?TextInputType.number:TextInputType.text,decoration:InputDecoration(labelText:labels[i])),const SizedBox(height:12)],FilledButton(onPressed:saving?null:save,child:Padding(padding:const EdgeInsets.symmetric(vertical:15),child:Text(saving?'Menyimpan...':'Simpan',style:const TextStyle(fontWeight:FontWeight.w900))))]))); }
}
