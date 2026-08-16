import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import 'login_screen.dart';

class ProfileScreen extends StatelessWidget {
  final AppUser user;
  const ProfileScreen({super.key, required this.user});

  String get _roleLabel => switch (user.role) {
        'owner' => 'Pemilik Peternakan',
        'manager' => 'Manajer Kandang',
        'worker' => 'Anak Kandang',
        'vet' => 'Dokter Hewan',
        _ => user.role,
      };

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: const Color(0xFFF1F5F9),
        appBar: AppBar(
            title: const Text('Profil Pengguna',
                style: TextStyle(fontWeight: FontWeight.bold))),
        body: Center(
            child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 520),
                  child: Card(
                      elevation: 0,
                      color: Colors.white,
                      child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(children: [
                            CircleAvatar(
                                radius: 42,
                                backgroundColor: const Color(0xFFD1FAE5),
                                child: Text(
                                    user.name.isEmpty
                                        ? '?'
                                        : user.name[0].toUpperCase(),
                                    style: const TextStyle(
                                        fontSize: 32,
                                        fontWeight: FontWeight.w900,
                                        color: Color(0xFF047857)))),
                            const SizedBox(height: 16),
                            Text(user.name,
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                    fontSize: 22, fontWeight: FontWeight.w900)),
                            const SizedBox(height: 6),
                            Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 12, vertical: 5),
                                decoration: BoxDecoration(
                                    color: const Color(0xFFECFDF5),
                                    borderRadius: BorderRadius.circular(99)),
                                child: Text(_roleLabel,
                                    style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF047857)))),
                            const SizedBox(height: 24),
                            const Divider(),
                            ListTile(
                                contentPadding: EdgeInsets.zero,
                                leading: const Icon(Icons.email_outlined),
                                title: const Text('Email'),
                                subtitle: Text(user.email)),
                            ListTile(
                                contentPadding: EdgeInsets.zero,
                                leading: const Icon(Icons.badge_outlined),
                                title: const Text('ID Pengguna'),
                                subtitle: Text(user.id)),
                            const SizedBox(height: 16),
                            SizedBox(
                                width: double.infinity,
                                child: OutlinedButton.icon(
                                    icon: const Icon(Icons.logout_rounded),
                                    label: const Padding(
                                        padding:
                                            EdgeInsets.symmetric(vertical: 13),
                                        child: Text('Keluar dari akun')),
                                    onPressed: () async {
                                      await ApiService.logout();
                                      if (!context.mounted) return;
                                      Navigator.of(context).pushAndRemoveUntil(
                                          MaterialPageRoute(
                                              builder: (_) =>
                                                  const LoginScreen()),
                                          (_) => false);
                                    }))
                          ]))),
                ))),
      );
}
