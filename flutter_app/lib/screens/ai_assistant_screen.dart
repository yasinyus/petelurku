import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class AiAssistantScreen extends StatefulWidget {
  final AppUser user;
  const AiAssistantScreen({super.key, required this.user});
  @override State<AiAssistantScreen> createState() => _AiAssistantScreenState();
}
class _AiAssistantScreenState extends State<AiAssistantScreen> {
  final input = TextEditingController();
  final scroll = ScrollController();
  final messages = <({bool user, String text})>[];
  bool loading = false;
  final suggestions = const ['Ringkas kondisi farm hari ini', 'Mengapa produksi telur menurun?', 'Apakah stok pakan cukup?', 'Kandang mana yang perlu diperiksa?', 'Hitung tren produksi 7 hari terakhir'];
  Future<void> send([String? suggestion]) async {
    final question = (suggestion ?? input.text).trim(); if(question.isEmpty || loading) return;
    input.clear(); setState(() { messages.add((user:true,text:question)); loading=true; }); _bottom();
    try { final answer=await ApiService.askAi(question); if(mounted)setState(()=>messages.add((user:false,text:answer))); }
    catch(e) { if(mounted)setState(()=>messages.add((user:false,text:'Maaf, ${e.toString().replaceFirst('Exception: ','')}'))); }
    finally { if(mounted)setState(()=>loading=false); _bottom(); }
  }
  void _bottom()=>WidgetsBinding.instance.addPostFrameCallback((_) { if(scroll.hasClients)scroll.animateTo(scroll.position.maxScrollExtent,duration:const Duration(milliseconds:250),curve:Curves.easeOut); });
  @override Widget build(BuildContext context)=>Scaffold(
    backgroundColor:const Color(0xFFF5F7F8),
    appBar:AppBar(title:const Text('AI Farm Assistant',style:TextStyle(fontWeight:FontWeight.w900)),actions:[Container(margin:const EdgeInsets.only(right:12),padding:const EdgeInsets.symmetric(horizontal:9,vertical:5),decoration:BoxDecoration(color:const Color(0xFFECFDF5),borderRadius:BorderRadius.circular(10)),child:const Row(children:[Icon(Icons.auto_awesome_rounded,size:14,color:Color(0xFF087F5B)),SizedBox(width:5),Text('Gemini',style:TextStyle(fontSize:11,fontWeight:FontWeight.w900,color:Color(0xFF087F5B)))]))]),
    body:Column(children:[Expanded(child:messages.isEmpty?_welcome():ListView.builder(controller:scroll,padding:const EdgeInsets.all(16),itemCount:messages.length+(loading?1:0),itemBuilder:(_,i){if(i==messages.length)return _thinking();final m=messages[i];return _bubble(m.text,m.user);})),_composer()]),
  );
  Widget _welcome()=>ListView(padding:const EdgeInsets.all(20),children:[Container(padding:const EdgeInsets.all(22),decoration:BoxDecoration(gradient:const LinearGradient(colors:[Color(0xFF064E3B),Color(0xFF0B8F68)]),borderRadius:BorderRadius.circular(25)),child:const Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Icon(Icons.auto_awesome_rounded,color:Colors.white,size:34),SizedBox(height:14),Text('Halo, saya asisten farm Anda',style:TextStyle(color:Colors.white,fontSize:21,fontWeight:FontWeight.w900)),SizedBox(height:7),Text('Saya menganalisis data kandang, produksi, pakan, kesehatan, vaksinasi, dan keuangan. Semua saran bersifat read-only dan tetap membutuhkan keputusan Anda.',style:TextStyle(color:Color(0xFFD1FAE5),height:1.45))])),const SizedBox(height:20),const Text('Coba tanyakan',style:TextStyle(fontWeight:FontWeight.w900,fontSize:16)),const SizedBox(height:10),...suggestions.map((s)=>Padding(padding:const EdgeInsets.only(bottom:8),child:InkWell(onTap:()=>send(s),borderRadius:BorderRadius.circular(15),child:Container(padding:const EdgeInsets.all(14),decoration:BoxDecoration(color:Colors.white,borderRadius:BorderRadius.circular(15),border:Border.all(color:const Color(0xFFE2E8F0))),child:Row(children:[const Icon(Icons.chat_bubble_outline_rounded,color:Color(0xFF087F5B),size:19),const SizedBox(width:11),Expanded(child:Text(s,style:const TextStyle(fontWeight:FontWeight.w700))),const Icon(Icons.arrow_forward_ios_rounded,size:13,color:Color(0xFF94A3B8))])))))]);
  Widget _bubble(String text,bool mine)=>Align(alignment:mine?Alignment.centerRight:Alignment.centerLeft,child:Container(constraints:const BoxConstraints(maxWidth:620),margin:const EdgeInsets.only(bottom:12),padding:const EdgeInsets.all(15),decoration:BoxDecoration(color:mine?const Color(0xFF087F5B):Colors.white,borderRadius:BorderRadius.only(topLeft:const Radius.circular(18),topRight:const Radius.circular(18),bottomLeft:Radius.circular(mine?18:4),bottomRight:Radius.circular(mine?4:18)),border:mine?null:Border.all(color:const Color(0xFFE2E8F0))),child:Text(text,style:TextStyle(color:mine?Colors.white:const Color(0xFF0F172A),height:1.45))));
  Widget _thinking()=>Align(alignment:Alignment.centerLeft,child:Container(margin:const EdgeInsets.only(bottom:12),padding:const EdgeInsets.all(15),decoration:BoxDecoration(color:Colors.white,borderRadius:BorderRadius.circular(18)),child:const Row(mainAxisSize:MainAxisSize.min,children:[SizedBox(width:16,height:16,child:CircularProgressIndicator(strokeWidth:2)),SizedBox(width:10),Text('Menganalisis data farm...')])));
  Widget _composer() => SafeArea(
    top: false,
    child: Container(
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
      decoration: const BoxDecoration(color: Colors.white, border: Border(top: BorderSide(color: Color(0xFFE2E8F0)))),
      child: Row(children: [
        Expanded(child: TextField(controller: input, maxLines: 4, minLines: 1, onSubmitted: (_) => send(), decoration: const InputDecoration(hintText: 'Tanyakan kondisi farm...', prefixIcon: Icon(Icons.auto_awesome_rounded)))),
        const SizedBox(width: 8),
        IconButton.filled(onPressed: loading ? null : () => send(), icon: const Icon(Icons.send_rounded), style: IconButton.styleFrom(backgroundColor: const Color(0xFF087F5B), foregroundColor: Colors.white, padding: const EdgeInsets.all(14))),
      ]),
    ),
  );
}
