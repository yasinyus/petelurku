-- ============================================================
-- PetelurKu.com SaaS Platform - MySQL Relational Database Schema
-- Compatible with MySQL 5.7, 8.0+, MariaDB, AWS RDS, GCP Cloud SQL
-- ============================================================

-- Database dibuat dan dipilih oleh src/db/migrate.ts berdasarkan
-- MYSQL_DATABASE. Jangan hard-code nama database di berkas skema ini.

-- 1. SaaS Owner & Admin Users
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `role` ENUM('saas_owner', 'farm_owner', 'farm_manager', 'farm_worker', 'vet') NOT NULL DEFAULT 'farm_owner',
  `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `email_verifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `token_hash` CHAR(64) NOT NULL UNIQUE,
  `expires_at` DATETIME NOT NULL,
  `verified_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_email_verification_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_email_verification_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Farm / Peternakan Tenants
CREATE TABLE IF NOT EXISTS `farms` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `owner_user_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `owner_name` VARCHAR(100) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `logo_data` MEDIUMTEXT NULL,
  `address` TEXT,
  `subscription_plan` ENUM('basic', 'pro', 'enterprise') NOT NULL DEFAULT 'pro',
  `subscription_status` ENUM('active', 'trialing', 'past_due', 'canceled') NOT NULL DEFAULT 'active',
  `trial_ends_at` DATETIME NULL,
  `mrr_amount` DECIMAL(12, 2) NOT NULL DEFAULT 1500000.00,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_farms_owner` FOREIGN KEY (`owner_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `farm_memberships` (
  `farm_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `role` ENUM('farm_manager', 'farm_worker', 'vet') NOT NULL,
  `phone` VARCHAR(30) NULL,
  `invited_by_user_id` VARCHAR(36) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`farm_id`, `user_id`),
  CONSTRAINT `fk_membership_farm` FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_membership_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_membership_inviter` FOREIGN KEY (`invited_by_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Poultry Houses / Kandang Ayam
CREATE TABLE IF NOT EXISTS `houses` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `farm_id` VARCHAR(36) NOT NULL,
  `code` VARCHAR(20) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `chicken_type` VARCHAR(50) NOT NULL DEFAULT 'Isa Brown Layer',
  `initial_chickens` INT NOT NULL DEFAULT 10000,
  `current_chickens` INT NOT NULL DEFAULT 9850,
  `housed_date` DATE NOT NULL,
  `age_weeks` INT NOT NULL DEFAULT 32,
  `housing_type` ENUM('battery', 'open_house', 'closed_house') NOT NULL DEFAULT 'battery',
  `status` ENUM('active', 'quarantine', 'maintenance', 'empty') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_houses_farm` FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE CASCADE,
  INDEX `idx_houses_farm` (`farm_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `house_worker_assignments` (
  `house_id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `farm_id` VARCHAR(36) NOT NULL,
  `worker_user_id` VARCHAR(36) NOT NULL,
  `assigned_by_user_id` VARCHAR(36) NOT NULL,
  `assigned_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_house_worker_assignment_house` FOREIGN KEY (`house_id`) REFERENCES `houses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_house_worker_assignment_farm` FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_house_worker_assignment_worker` FOREIGN KEY (`worker_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_house_worker_assignment_assigner` FOREIGN KEY (`assigned_by_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Daily Egg Harvest Logs / Panen Telur
CREATE TABLE IF NOT EXISTS `harvest_logs` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `house_id` VARCHAR(36) NOT NULL,
  `harvest_date` DATE NOT NULL,
  `time_slot` ENUM('pagi', 'siang', 'sore') NOT NULL DEFAULT 'pagi',
  `good_eggs_count` INT NOT NULL DEFAULT 0,
  `damaged_eggs_count` INT NOT NULL DEFAULT 0,
  `weight_kg` DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
  `hen_day_percentage` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `death_count` INT NOT NULL DEFAULT 0,
  `cull_count` INT NOT NULL DEFAULT 0,
  `notes` TEXT,
  `recorded_by` VARCHAR(100) DEFAULT 'Anak Kandang',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_harvest_house` FOREIGN KEY (`house_id`) REFERENCES `houses` (`id`) ON DELETE CASCADE,
  INDEX `idx_harvest_date` (`harvest_date`),
  INDEX `idx_harvest_house` (`house_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Feed Inventory & FCR / Stok Pakan
CREATE TABLE IF NOT EXISTS `feed_inventory` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `farm_id` VARCHAR(36) NOT NULL,
  `feed_name` VARCHAR(100) NOT NULL,
  `feed_type` VARCHAR(64) NOT NULL,
  `current_stock_kg` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `min_threshold_kg` DECIMAL(10, 2) NOT NULL DEFAULT 500.00,
  `price_per_kg` DECIMAL(10, 2) NOT NULL DEFAULT 8500.00,
  `last_restocked_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_feed_farm` FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `feed_composition_settings` (
  `farm_id` VARCHAR(36) NOT NULL,
  `feed_type` VARCHAR(64) NOT NULL,
  `percentage` DECIMAL(5, 2) NOT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`farm_id`, `feed_type`),
  CONSTRAINT `fk_feed_composition_farm` FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `feed_consumption_settings` (
  `farm_id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `grams_per_chicken` DECIMAL(8, 2) NOT NULL DEFAULT 110.00,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_feed_consumption_farm` FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `feed_usage_logs` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `farm_id` VARCHAR(36) NOT NULL,
  `house_id` VARCHAR(36) NOT NULL,
  `harvest_id` VARCHAR(36) NOT NULL UNIQUE,
  `usage_date` DATE NOT NULL,
  `time_slot` ENUM('pagi', 'siang') NOT NULL,
  `total_feed_kg` DECIMAL(10, 2) NOT NULL,
  `composition` JSON NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_feed_usage_farm` FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_feed_usage_house` FOREIGN KEY (`house_id`) REFERENCES `houses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_feed_usage_harvest` FOREIGN KEY (`harvest_id`) REFERENCES `harvest_logs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `egg_price_settings` (
  `farm_id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `price_per_kg` DECIMAL(10, 2) NOT NULL DEFAULT 26000.00,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_egg_price_farm` FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Medical & Vaccination Logs / Rekam Medis
CREATE TABLE IF NOT EXISTS `vaccination_logs` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `house_id` VARCHAR(36) NOT NULL,
  `vaccine_name` VARCHAR(100) NOT NULL,
  `disease_target` VARCHAR(100) NOT NULL,
  `scheduled_date` DATE NOT NULL,
  `administered_date` DATE NULL,
  `status` ENUM('scheduled', 'completed', 'overdue') NOT NULL DEFAULT 'scheduled',
  `vet_name` VARCHAR(100),
  `notes` TEXT,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_vaccination_house` FOREIGN KEY (`house_id`) REFERENCES `houses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6b. Health and mortality records
CREATE TABLE IF NOT EXISTS `health_logs` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `house_id` VARCHAR(36) NOT NULL,
  `record_date` DATE NOT NULL,
  `mortality_count` INT NOT NULL DEFAULT 0,
  `culled_count` INT NOT NULL DEFAULT 0,
  `symptoms` TEXT,
  `diagnosis` VARCHAR(255),
  `treatment_given` TEXT,
  `medication_cost` DECIMAL(12, 2) NULL,
  `vet_notes` TEXT,
  `recorded_by` VARCHAR(100) NOT NULL DEFAULT 'Anak Kandang',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_health_house` FOREIGN KEY (`house_id`) REFERENCES `houses` (`id`) ON DELETE CASCADE,
  INDEX `idx_health_date` (`record_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Financial Transactions / Arus Kas
CREATE TABLE IF NOT EXISTS `financial_records` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `farm_id` VARCHAR(36) NOT NULL,
  `transaction_type` ENUM('income', 'expense') NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `transaction_date` DATE NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `payment_method` VARCHAR(50) DEFAULT 'Transfer Bank',
  `invoice_number` VARCHAR(50),
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_finance_farm` FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. SaaS Owner Subscriptions & Midtrans Invoices
CREATE TABLE IF NOT EXISTS `saas_subscriptions` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `farm_id` VARCHAR(36) NOT NULL,
  `plan_type` ENUM('basic', 'pro', 'enterprise') NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `billing_cycle` ENUM('monthly', 'annual') NOT NULL DEFAULT 'monthly',
  `status` ENUM('active', 'pending', 'failed', 'canceled') NOT NULL DEFAULT 'active',
  `midtrans_order_id` VARCHAR(100) UNIQUE,
  `payment_type` VARCHAR(50),
  `paid_at` DATETIME NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_saas_sub_farm` FOREIGN KEY (`farm_id`) REFERENCES `farms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert Default Seed Data for Testing & Demo
INSERT IGNORE INTO `users` (`id`, `email`, `password_hash`, `full_name`, `role`, `status`) VALUES
('usr-saas-1', 'admin@chicksync.saas', 'hash_secret_123', 'Super Admin PetelurKu.com', 'saas_owner', 'active'),
('usr-owner-1', 'owner@chicksync.saas', 'hash_secret_owner', 'Pemilik SaaS PetelurKu.com', 'saas_owner', 'active'),
('usr-farm-1', 'yasin@barokahfarm.id', 'hash_secret_456', 'H. Yasin Yusuf', 'farm_owner', 'active');

INSERT IGNORE INTO `farms` (`id`, `owner_user_id`, `name`, `owner_name`, `city`, `subscription_plan`, `subscription_status`, `mrr_amount`) VALUES
('farm-barokah-01', 'usr-farm-1', 'Peternakan Barokah Layer Farm', 'H. Yasin Yusuf', 'Blitar', 'pro', 'active', 1500000.00);

INSERT IGNORE INTO `houses` (`id`, `farm_id`, `code`, `name`, `chicken_type`, `initial_chickens`, `current_chickens`, `housed_date`, `age_weeks`) VALUES
('house-A1', 'farm-barokah-01', 'KD-A1', 'Kandang A1 (Utama)', 'Isa Brown Layer', 5000, 4920, '2025-06-15', 34),
('house-B2', 'farm-barokah-01', 'KD-B2', 'Kandang B2 (Timur)', 'Hisex Brown', 5000, 4930, '2025-07-01', 32);

INSERT IGNORE INTO `feed_inventory` (`id`, `farm_id`, `feed_name`, `feed_type`, `current_stock_kg`, `min_threshold_kg`, `price_per_kg`) VALUES
('feed-01', 'farm-barokah-01', 'Konsentrat Layer KL-36', 'concentrate', 1250.00, 500.00, 9200.00),
('feed-02', 'farm-barokah-01', 'Jagung Giling Super', 'corn', 2800.00, 1000.00, 5400.00),
('feed-03', 'farm-barokah-01', 'Dedak / Bekatul Halus', 'bran', 450.00, 300.00, 3800.00);

INSERT IGNORE INTO `feed_inventory` (`id`, `farm_id`, `feed_name`, `feed_type`, `current_stock_kg`, `min_threshold_kg`, `price_per_kg`) VALUES
('feed-04', 'farm-barokah-01', 'Premix / Mineral / Tepung Karang', 'premix', 100.00, 25.00, 18000.00);

INSERT IGNORE INTO `feed_composition_settings` (`farm_id`, `feed_type`, `percentage`) VALUES
('farm-barokah-01', 'corn', 50.00),
('farm-barokah-01', 'concentrate', 30.00),
('farm-barokah-01', 'bran', 15.00),
('farm-barokah-01', 'premix', 5.00);

INSERT IGNORE INTO `egg_price_settings` (`farm_id`, `price_per_kg`) VALUES ('farm-barokah-01', 26000.00);
