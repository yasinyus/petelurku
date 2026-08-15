import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/models.dart';

class ApiService {
  // Replace with your Express + MySQL Server Base URL
  // For Android Emulator: http://10.0.2.2:3000/api
  // For Real Device or Web: http://your-server-ip:3000/api
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3001/api',
  );
  static String? _sessionCookie;

  static Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_sessionCookie != null) 'Cookie': _sessionCookie!,
  };

  static Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: _headers,
      body: json.encode({'email': email.trim(), 'password': password}),
    );
    final data = json.decode(response.body) as Map<String, dynamic>;
    if (response.statusCode != 200) {
      throw Exception(data['message'] ?? 'Login gagal');
    }
    final rawCookie = response.headers['set-cookie'];
    _sessionCookie = rawCookie?.split(';').first;
    if (_sessionCookie == null) throw Exception('Server tidak mengirim sesi login.');
    return data;
  }

  static Future<List<House>> fetchHouses() async {
    final response = await http.get(Uri.parse('$baseUrl/houses'), headers: _headers);
    final data = json.decode(response.body) as Map<String, dynamic>;
    if (response.statusCode != 200) throw Exception(data['error'] ?? 'Gagal mengambil kandang');
    return (data['data'] as List? ?? []).map((item) => House.fromJson(item)).toList();
  }

  static Future<List<Map<String, dynamic>>> fetchList(String path) async {
    final response = await http.get(Uri.parse('$baseUrl/$path'), headers: _headers);
    final payload = json.decode(response.body) as Map<String, dynamic>;
    if (response.statusCode != 200) throw Exception(payload['error'] ?? 'Gagal memuat data');
    return (payload['data'] as List? ?? []).map((item) => Map<String, dynamic>.from(item)).toList();
  }

  static Future<void> postData(String path, Map<String, dynamic> data) async {
    final response = await http.post(Uri.parse('$baseUrl/$path'), headers: _headers, body: json.encode(data));
    final payload = json.decode(response.body) as Map<String, dynamic>;
    if (response.statusCode < 200 || response.statusCode >= 300) throw Exception(payload['error'] ?? payload['message'] ?? 'Gagal menyimpan data');
  }

  static Future<void> createHouse(Map<String, dynamic> data) => postData('houses', data);
  static Future<void> restockFeed(String id, double amountKg) => postData('feeds/$id/restock', {'amountKg': amountKg});

  static Future<String> askAi(String question) async {
    final response = await http.post(Uri.parse('$baseUrl/ai/chat'), headers: _headers, body: json.encode({'question': question}));
    final payload = json.decode(response.body) as Map<String, dynamic>;
    if (response.statusCode != 200) throw Exception(payload['error'] ?? 'AI gagal menjawab');
    return payload['data']?['answer']?.toString() ?? 'Tidak ada jawaban.';
  }

  // 1. Check Server & MySQL Health
  static Future<Map<String, dynamic>> checkHealth() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/health'), headers: _headers);
      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
      return {'status': 'error', 'message': 'HTTP ${response.statusCode}'};
    } catch (e) {
      return {'status': 'offline', 'message': e.toString()};
    }
  }

  // 2. Fetch Farms
  static Future<List<Farm>> fetchFarms() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/farms'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List items = data['data'] ?? [];
        return items.map((item) => Farm.fromJson(item)).toList();
      }
    } catch (_) {}
    return [];
  }

  // 3. Fetch Harvest Logs
  static Future<List<HarvestLog>> fetchHarvests() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/harvests'), headers: _headers);
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List items = data['data'] ?? [];
        return items.map((item) => HarvestLog.fromJson(item)).toList();
      }
    } catch (_) {}
    return [];
  }

  // 4. Submit New Egg Harvest Log
  static Future<bool> createHarvest({
    required String houseId,
    required String harvestDate,
    required String timeSlot,
    required int goodEggs,
    required int damagedEggs,
    required double weightKg,
    required int deathCount,
    required double feedKg,
    required String notes,
    required String recordedBy,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/harvests'),
        headers: _headers,
        body: json.encode({
          'houseId': houseId,
          'harvestDate': harvestDate,
          'timeSlot': timeSlot,
          'goodEggsCount': goodEggs,
          'damagedEggsCount': damagedEggs,
          'weightKg': weightKg,
          'deathCount': deathCount,
          'feedKg': feedKg,
          'notes': notes,
          'recordedBy': recordedBy,
        }),
      );
      if (response.statusCode != 201) {
        final data = json.decode(response.body);
        throw Exception(data['error'] ?? 'Gagal menyimpan produksi');
      }
      return true;
    } catch (e) {
      if (e is Exception) rethrow;
      throw Exception('Gagal menghubungi server: $e');
    }
  }

  static Future<void> updateHarvest({
    required String id,
    required String houseId,
    required String harvestDate,
    required String timeSlot,
    required int goodEggs,
    required int damagedEggs,
    required double weightKg,
    required int deathCount,
    required double feedKg,
    required String notes,
    required String recordedBy,
  }) async {
    final response = await http.patch(Uri.parse('$baseUrl/harvests/$id'), headers: _headers, body: json.encode({
      'houseId': houseId, 'harvestDate': harvestDate, 'timeSlot': timeSlot,
      'goodEggsCount': goodEggs, 'damagedEggsCount': damagedEggs, 'weightKg': weightKg,
      'deathCount': deathCount, 'feedKg': feedKg, 'notes': notes, 'recordedBy': recordedBy,
    }));
    final data = json.decode(response.body);
    if (response.statusCode != 200) throw Exception(data['error'] ?? 'Gagal memperbarui produksi');
  }
}
