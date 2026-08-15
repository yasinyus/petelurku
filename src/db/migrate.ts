import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  const host = process.env.MYSQL_HOST || 'localhost';
  const port = Number(process.env.MYSQL_PORT) || 3306;
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || 'kandang_baru';

  console.log(`🔌 Terhubung ke MySQL [${host}:${port}] sebagai user '${user}'...`);

  try {
    // Connect without database first to ensure database exists or create it
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true,
    });
    const safeDatabase = database.replace(/`/g, '');
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${safeDatabase}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.changeUser({ database: safeDatabase });

    console.log(`📂 Membaca file skema SQL: src/db/schema.sql ...`);
    const schemaPath = path.resolve(process.cwd(), 'src/db/schema.sql');
    const sqlScript = fs.readFileSync(schemaPath, 'utf-8');

    // Upgrade the legacy price table before the schema seed references price_per_kg.
    const [priceTable]: any = await connection.query("SHOW TABLES LIKE 'egg_price_settings'");
    if (priceTable.length) {
      const [legacyPriceColumn]: any = await connection.query("SHOW COLUMNS FROM egg_price_settings LIKE 'price_per_kg'");
      if (!legacyPriceColumn.length) {
        await connection.query('ALTER TABLE egg_price_settings ADD COLUMN price_per_kg DECIMAL(10, 2) NOT NULL DEFAULT 26000.00 AFTER farm_id');
        await connection.query('UPDATE egg_price_settings SET price_per_kg = 26000.00');
      }
    }

    console.log(`🚀 Menjalankan migrasi DDL & seeder awal...`);
    await connection.query(sqlScript);

    // Keep existing local installations compatible with the membership phone field.
    const [phoneColumn]: any = await connection.query("SHOW COLUMNS FROM farm_memberships LIKE 'phone'");
    if (!phoneColumn.length) {
      await connection.query('ALTER TABLE farm_memberships ADD COLUMN phone VARCHAR(30) NULL AFTER role');
    }

    const [farmLogoColumn]: any = await connection.query("SHOW COLUMNS FROM farms LIKE 'logo_data'");
    if (!farmLogoColumn.length) {
      await connection.query('ALTER TABLE farms ADD COLUMN logo_data MEDIUMTEXT NULL AFTER city');
    }

    const [houseTypeColumn]: any = await connection.query("SHOW COLUMNS FROM houses LIKE 'housing_type'");
    if (!houseTypeColumn.length) {
      await connection.query("ALTER TABLE houses ADD COLUMN housing_type ENUM('battery', 'open_house', 'closed_house') NOT NULL DEFAULT 'battery' AFTER age_weeks");
    }
    const [houseStatusColumn]: any = await connection.query("SHOW COLUMNS FROM houses LIKE 'status'");
    if (!houseStatusColumn.length) {
      await connection.query("ALTER TABLE houses ADD COLUMN status ENUM('active', 'quarantine', 'maintenance', 'empty') NOT NULL DEFAULT 'active' AFTER housing_type");
    }

    await connection.query('ALTER TABLE feed_inventory MODIFY feed_type VARCHAR(64) NOT NULL');
    await connection.query('ALTER TABLE feed_composition_settings MODIFY feed_type VARCHAR(64) NOT NULL');

    // Earlier versions allowed each worker on only one house. Remove that
    // unique index so one worker may be responsible for multiple houses.
    const [assignmentTable]: any = await connection.query("SHOW TABLES LIKE 'house_worker_assignments'");
    if (assignmentTable.length) {
      const [workerIndexes]: any = await connection.query("SHOW INDEX FROM house_worker_assignments WHERE Column_name = 'worker_user_id' AND Non_unique = 0 AND Key_name <> 'PRIMARY'");
      for (const index of workerIndexes) {
        const indexName = String(index.Key_name).replace(/`/g, '');
        await connection.query('ALTER TABLE house_worker_assignments DROP FOREIGN KEY fk_house_worker_assignment_worker');
        await connection.query(`ALTER TABLE house_worker_assignments DROP INDEX \`${indexName}\``);
        await connection.query('ALTER TABLE house_worker_assignments ADD CONSTRAINT fk_house_worker_assignment_worker FOREIGN KEY (worker_user_id) REFERENCES users(id) ON DELETE CASCADE');
      }
    }

    console.log(`✅ Migrasi Database Berhasil!`);
    console.log(`📊 Database '${database}' beserta tabel dan data awal (seeds) telah terpasang.`);

    await connection.end();
    process.exit(0);
  } catch (error: any) {
    console.error(`❌ Gagal Menjalankan Migrasi Database:`, error.message);
    console.error(`💡 Pastikan MySQL server lokal Anda sedang berjalan di ${host}:${port} dan kredensial di .env sesuai.`);
    process.exit(1);
  }
}

runMigration();
