import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import mysql from 'mysql2/promise';

const farmId = process.argv[2];
if (!farmId) throw new Error('Usage: node scripts/export-farm.mjs <farm-id> [output-file]');

const outputFile = path.resolve(process.argv[3] || `exports/farm-${farmId}.sql`);
const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'kandang_baru',
  dateStrings: true,
});

const select = async (sql, params = []) => (await connection.execute(sql, params))[0];
const farmRows = await select('SELECT * FROM farms WHERE id = ?', [farmId]);
if (farmRows.length !== 1) throw new Error(`Farm tidak ditemukan: ${farmId}`);

const memberships = await select('SELECT * FROM farm_memberships WHERE farm_id = ?', [farmId]);
const houses = await select('SELECT * FROM houses WHERE farm_id = ?', [farmId]);
const assignments = await select('SELECT * FROM house_worker_assignments WHERE farm_id = ?', [farmId]);
const userIds = new Set([farmRows[0].owner_user_id]);
for (const row of memberships) {
  userIds.add(row.user_id);
  if (row.invited_by_user_id) userIds.add(row.invited_by_user_id);
}
for (const row of assignments) {
  userIds.add(row.worker_user_id);
  if (row.assigned_by_user_id) userIds.add(row.assigned_by_user_id);
}

const placeholders = values => values.map(() => '?').join(',');
const ids = [...userIds];
const houseIds = houses.map(row => row.id);
const users = ids.length ? await select(`SELECT * FROM users WHERE id IN (${placeholders(ids)})`, ids) : [];
const emailVerifications = ids.length ? await select(`SELECT * FROM email_verifications WHERE user_id IN (${placeholders(ids)})`, ids) : [];

const byFarm = async table => select(`SELECT * FROM \`${table}\` WHERE farm_id = ?`, [farmId]);
const byHouse = async table => houseIds.length
  ? select(`SELECT * FROM \`${table}\` WHERE house_id IN (${placeholders(houseIds)})`, houseIds)
  : [];

const groups = [
  ['users', users],
  ['farms', farmRows],
  ['email_verifications', emailVerifications],
  ['farm_memberships', memberships],
  ['houses', houses],
  ['egg_price_settings', await byFarm('egg_price_settings')],
  ['feed_composition_settings', await byFarm('feed_composition_settings')],
  ['feed_consumption_settings', await byFarm('feed_consumption_settings')],
  ['feed_inventory', await byFarm('feed_inventory')],
  ['financial_records', await byFarm('financial_records')],
  ['saas_subscriptions', await byFarm('saas_subscriptions')],
  ['harvest_logs', await byHouse('harvest_logs')],
  ['health_logs', await byHouse('health_logs')],
  ['vaccination_logs', await byHouse('vaccination_logs')],
  ['house_worker_assignments', assignments],
  ['feed_usage_logs', await byFarm('feed_usage_logs')],
];

// Keep exports compatible with the current application schema. Some local
// databases may still contain columns removed from schema.sql.
const excludedColumns = {
  egg_price_settings: new Set(['price_per_egg']),
};

const sqlLiteral = value => {
  if (value !== null && typeof value === 'object' && !Buffer.isBuffer(value) && !(value instanceof Date)) {
    return connection.escape(JSON.stringify(value));
  }
  return connection.escape(value);
};

const insertSql = (table, rows) => {
  if (!rows.length) return `-- ${table}: 0 rows\n`;
  const excluded = excludedColumns[table] || new Set();
  const columns = Object.keys(rows[0]).filter(column => !excluded.has(column));
  const columnSql = columns.map(column => `\`${column}\``).join(', ');
  const valuesSql = rows.map(row => `(${columns.map(column => sqlLiteral(row[column])).join(', ')})`).join(',\n');
  return `-- ${table}: ${rows.length} rows\nINSERT IGNORE INTO \`${table}\` (${columnSql}) VALUES\n${valuesSql};\n`;
};

const generatedAt = new Date().toISOString();
const sql = [
  '-- PetelurKu farm export',
  `-- Farm ID: ${farmId}`,
  `-- Farm name: ${farmRows[0].name}`,
  `-- Generated: ${generatedAt}`,
  '-- Non-overwriting import: INSERT IGNORE preserves rows already present on the target.',
  'START TRANSACTION;',
  ...groups.map(([table, rows]) => insertSql(table, rows)),
  'COMMIT;',
  '',
].join('\n');

await fs.mkdir(path.dirname(outputFile), { recursive: true });
await fs.writeFile(outputFile, sql, { encoding: 'utf8', flag: 'wx' });
await connection.end();

console.log(JSON.stringify({
  outputFile,
  farmId,
  farmName: farmRows[0].name,
  counts: Object.fromEntries(groups.map(([table, rows]) => [table, rows.length])),
}, null, 2));
