import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import 'dashboard_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _loading = false, _obscure = true;
  String? _error;
  Future<void> _login() async {
    if (_email.text.trim().isEmpty || _password.text.isEmpty) { setState(() => _error = 'Email dan password wajib diisi.'); return; }
    setState(() { _loading = true; _error = null; });
    try {
      final result = await ApiService.login(_email.text, _password.text);
      final user = AppUser.fromJson(result['user'] as Map<String, dynamic>);
      if (mounted) Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => MobileDashboardScreen(user: user)));
    } catch (e) { if (mounted) setState(() => _error = e.toString().replaceFirst('Exception: ', '')); }
    finally { if (mounted) setState(() => _loading = false); }
  }
  @override Widget build(BuildContext context) => Scaffold(
    body: Stack(children: [
      Container(height: 300, decoration: const BoxDecoration(gradient: LinearGradient(colors: [Color(0xFF064E3B), Color(0xFF0F9F73)], begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.vertical(bottom: Radius.circular(42)))),
      SafeArea(child: Center(child: SingleChildScrollView(padding: const EdgeInsets.all(24), child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 430), child: Column(children: [
        Container(width: 72, height: 72, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(22), boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 24)]), child: const Icon(Icons.egg_alt_rounded, size: 38, color: Color(0xFF087F5B))),
        const SizedBox(height: 16),
        const Text('PetelurKu.com', style: TextStyle(color: Colors.white, fontSize: 30, fontWeight: FontWeight.w900, letterSpacing: -.8)),
        const Text('Produksi kandang dalam satu genggaman', style: TextStyle(color: Color(0xFFD1FAE5))),
        const SizedBox(height: 30),
        Container(padding: const EdgeInsets.all(24), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(26), boxShadow: const [BoxShadow(color: Color(0x220F172A), blurRadius: 32, offset: Offset(0, 14))]), child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          const Text('Selamat datang', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900)),
          const SizedBox(height: 5), const Text('Masuk dengan akun peternakan Anda.', style: TextStyle(color: Color(0xFF64748B))),
          const SizedBox(height: 24),
          TextField(controller: _email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Alamat email', prefixIcon: Icon(Icons.alternate_email_rounded))),
          const SizedBox(height: 14),
          TextField(controller: _password, obscureText: _obscure, onSubmitted: (_) => _login(), decoration: InputDecoration(labelText: 'Password', prefixIcon: const Icon(Icons.lock_outline_rounded), suffixIcon: IconButton(onPressed: () => setState(() => _obscure = !_obscure), icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined)))),
          if (_error != null) Container(margin: const EdgeInsets.only(top: 14), padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: const Color(0xFFFFF1F2), borderRadius: BorderRadius.circular(12)), child: Text(_error!, style: const TextStyle(color: Color(0xFFBE123C), fontWeight: FontWeight.w600))),
          const SizedBox(height: 20),
          FilledButton(onPressed: _loading ? null : _login, child: Padding(padding: const EdgeInsets.symmetric(vertical: 16), child: _loading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Row(mainAxisAlignment: MainAxisAlignment.center, children: [Text('Masuk ke PetelurKu.com', style: TextStyle(fontWeight: FontWeight.w800)), SizedBox(width: 8), Icon(Icons.arrow_forward_rounded, size: 18)]))),
        ])),
      ]))))),
    ]),
  );
}
