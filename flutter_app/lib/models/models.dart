// ChickSync Flutter Data Models

class AppUser {
  final String id;
  final String name;
  final String email;
  final String role;

  const AppUser(
      {required this.id,
      required this.name,
      required this.email,
      required this.role});

  factory AppUser.fromJson(Map<String, dynamic> json) => AppUser(
        id: json['id']?.toString() ?? '',
        name: json['name']?.toString() ?? '',
        email: json['email']?.toString() ?? '',
        role: json['role']?.toString() ?? '',
      );
}

class Farm {
  final String id;
  final String name;
  final String ownerName;
  final String city;
  final String subscriptionPlan;
  final double mrrAmount;

  Farm({
    required this.id,
    required this.name,
    required this.ownerName,
    required this.city,
    required this.subscriptionPlan,
    required this.mrrAmount,
  });

  factory Farm.fromJson(Map<String, dynamic> json) {
    return Farm(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      ownerName: json['owner_name'] ?? json['ownerName'] ?? '',
      city: json['city'] ?? '',
      subscriptionPlan:
          json['subscription_plan'] ?? json['subscriptionPlan'] ?? 'pro',
      mrrAmount:
          (json['mrr_amount'] ?? json['mrrAmount'] ?? 1500000).toDouble(),
    );
  }
}

class House {
  final String id;
  final String code;
  final String name;
  final String chickenType;
  final int initialChickens;
  final int currentChickens;
  final int ageWeeks;

  House({
    required this.id,
    required this.code,
    required this.name,
    required this.chickenType,
    required this.initialChickens,
    required this.currentChickens,
    required this.ageWeeks,
  });

  factory House.fromJson(Map<String, dynamic> json) {
    int asInt(dynamic value) => int.tryParse(value?.toString() ?? '') ?? 0;
    return House(
      id: json['id'] ?? '',
      code: json['code'] ?? '',
      name: json['name'] ?? '',
      chickenType: json['chicken_type'] ?? json['chickenType'] ?? 'Isa Brown',
      initialChickens:
          asInt(json['initial_chickens'] ?? json['initialChickens']),
      currentChickens:
          asInt(json['current_chickens'] ?? json['currentChickens']),
      ageWeeks: asInt(json['age_weeks'] ?? json['ageWeeks']),
    );
  }
}

class HarvestLog {
  final String id;
  final String houseId;
  final String harvestDate;
  final String timeSlot;
  final int goodEggsCount;
  final int damagedEggsCount;
  final double weightKg;
  final double henDayPercentage;
  final int deathCount;
  final double feedKg;
  final String notes;

  HarvestLog({
    required this.id,
    required this.houseId,
    required this.harvestDate,
    required this.timeSlot,
    required this.goodEggsCount,
    required this.damagedEggsCount,
    required this.weightKg,
    required this.henDayPercentage,
    required this.deathCount,
    required this.feedKg,
    required this.notes,
  });

  factory HarvestLog.fromJson(Map<String, dynamic> json) {
    int asInt(dynamic value) => int.tryParse(value?.toString() ?? '') ?? 0;
    double asDouble(dynamic value) =>
        double.tryParse(value?.toString() ?? '') ?? 0;
    return HarvestLog(
      id: json['id'] ?? '',
      houseId: json['house_id'] ?? json['houseId'] ?? '',
      harvestDate: json['harvest_date'] ?? json['harvestDate'] ?? '',
      timeSlot: json['time_slot'] ?? json['timeSlot'] ?? 'pagi',
      goodEggsCount: asInt(json['good_eggs_count'] ?? json['goodEggsCount']),
      damagedEggsCount:
          asInt(json['damaged_eggs_count'] ?? json['damagedEggsCount']),
      weightKg: asDouble(json['weight_kg'] ?? json['weightKg']),
      henDayPercentage:
          asDouble(json['hen_day_percentage'] ?? json['henDayPercentage']),
      deathCount: asInt(json['death_count'] ?? json['deathCount']),
      feedKg: asDouble(json['feed_kg'] ?? json['feedKg']),
      notes: json['notes']?.toString() ?? '',
    );
  }
}
