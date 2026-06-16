/**
 * Grant admin access to a user by email.
 * If the email does not exist, create the account as an admin.
 *
 * Run:
 *   npm run make-admin <email> [password]
 *
 * Examples:
 *   npm run make-admin vip@test.com
 *   npm run make-admin admin@chem.com admin123456
 */
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

const ds = new DataSource({
  type: 'mysql',
  host: process.env.DATABASE_HOST ?? '127.0.0.1',
  port: Number(process.env.DATABASE_PORT ?? 3307),
  username: process.env.DATABASE_USER ?? 'chem_user',
  password: process.env.DATABASE_PASSWORD ?? 'chem_pass_dev_2026',
  database: process.env.DATABASE_NAME ?? 'chem_qa',
  // No entities — we use raw SQL so this script never loads the entity graph.
});

async function ensureColumn() {
  const rows: Array<{ c: number }> = await ds.query(
    `SELECT COUNT(*) AS c FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'is_admin'`,
  );
  if (Number(rows[0]?.c ?? 0) === 0) {
    await ds.query(
      `ALTER TABLE users ADD COLUMN is_admin TINYINT NOT NULL DEFAULT 0`,
    );
    console.log('🔧 已为 users 表新增 is_admin 列');
  }
}

async function main() {
  const email = (process.argv[2] || '').trim().toLowerCase();
  const password = process.argv[3]; // optional, only used when creating a new account
  if (!email) {
    console.error('用法: npm run make-admin <email> [password]');
    process.exit(1);
  }

  await ds.initialize();
  await ensureColumn();

  const existing: Array<{ id: string }> = await ds.query(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [email],
  );

  if (existing.length > 0) {
    await ds.query('UPDATE users SET is_admin = 1 WHERE email = ?', [email]);
    console.log(`✅ 已将 ${email} 设为管理员`);
  } else {
    const pwd = password || 'admin123456';
    const passwordHash = await bcrypt.hash(pwd, 10);
    await ds.query(
      `INSERT INTO users
         (id, email, password_hash, nickname, default_role, email_verified, is_admin, plan, plan_expires_at)
       VALUES (?, ?, ?, ?, 'guide', 1, 1, 'yearly', '2099-01-01 00:00:00')`,
      [randomUUID(), email, passwordHash, email.split('@')[0]],
    );
    console.log(`✅ 已创建管理员账号 ${email}，密码：${pwd}`);
  }

  await ds.destroy();
}

main().catch((err) => {
  console.error('❌ 失败:', err);
  process.exit(1);
});
