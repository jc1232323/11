/**
 * Seed two test accounts:
 *   1. VIP user (yearly plan, all features unlocked)
 *   2. Free user (no membership)
 *
 * Both use password: test123456
 *
 * Run: npx ts-node --project scripts/tsconfig.json scripts/seed-accounts.ts
 */
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';
import * as bcrypt from 'bcryptjs';

const ds = new DataSource({
  type: 'mysql',
  host: process.env.DATABASE_HOST ?? '127.0.0.1',
  port: Number(process.env.DATABASE_PORT ?? 3307),
  username: process.env.DATABASE_USER ?? 'chem_user',
  password: process.env.DATABASE_PASSWORD ?? 'chem_pass_dev_2026',
  database: process.env.DATABASE_NAME ?? 'chem_qa',
  synchronize: true,
  entities: [join(__dirname, '../apps/api/src/entities/*.entity.ts')],
});

async function seed() {
  await ds.initialize();
  console.log('Connected to database');

  const userRepo = ds.getRepository('User');
  const password = 'test123456';
  const passwordHash = await bcrypt.hash(password, 10);

  // 1. VIP account - yearly plan, expires 2027-06-13
  const vipEmail = 'vip@test.com';
  const existingVip = await userRepo.findOne({ where: { email: vipEmail } });
  if (existingVip) {
    await userRepo.update(existingVip.id, {
      plan: 'yearly',
      planExpiresAt: new Date('2027-06-13T00:00:00'),
      emailVerified: true,
    });
    console.log(`Updated VIP account: ${vipEmail}`);
  } else {
    await userRepo.save({
      email: vipEmail,
      passwordHash,
      nickname: 'VIP用户',
      defaultRole: 'guide',
      emailVerified: true,
      plan: 'yearly',
      planExpiresAt: new Date('2027-06-13T00:00:00'),
    });
    console.log(`Created VIP account: ${vipEmail}`);
  }

  // 2. Free account - no membership
  const freeEmail = 'free@test.com';
  const existingFree = await userRepo.findOne({ where: { email: freeEmail } });
  if (existingFree) {
    await userRepo.update(existingFree.id, {
      plan: 'free',
      planExpiresAt: null,
      emailVerified: true,
    });
    console.log(`Updated free account: ${freeEmail}`);
  } else {
    await userRepo.save({
      email: freeEmail,
      passwordHash,
      nickname: '免费用户',
      defaultRole: 'guide',
      emailVerified: true,
      plan: 'free',
      planExpiresAt: null,
    });
    console.log(`Created free account: ${freeEmail}`);
  }

  console.log('\n--- Test Accounts ---');
  console.log('VIP (全部付费功能):');
  console.log('  邮箱: vip@test.com');
  console.log('  密码: test123456');
  console.log('  套餐: 年卡 (到 2027-06-13)');
  console.log('');
  console.log('免费用户 (无会员):');
  console.log('  邮箱: free@test.com');
  console.log('  密码: test123456');
  console.log('  套餐: free');

  await ds.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
