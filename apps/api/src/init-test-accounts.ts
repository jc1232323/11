import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { appEntities, buildDataSourceOptions } from './config/database.config';
import { loadEnvFiles } from './config/load-env';
import { User } from './entities/user.entity';

const TEST_PASSWORD = 'test123456';

type TestAccount = {
  email: string;
  nickname: string;
  plan: User['plan'];
  planExpiresAt: Date | null;
};

export const testAccounts: TestAccount[] = [
  {
    email: 'vip@test.com',
    nickname: 'VIP用户',
    plan: 'yearly',
    planExpiresAt: new Date('2027-06-13T00:00:00'),
  },
  {
    email: 'vie@test.com',
    nickname: 'VIP用户',
    plan: 'yearly',
    planExpiresAt: new Date('2027-06-13T00:00:00'),
  },
  {
    email: 'free@test.com',
    nickname: '免费用户',
    plan: 'free',
    planExpiresAt: null,
  },
];

export async function seedTestAccounts(ds?: DataSource) {
  loadEnvFiles();

  const ownedDataSource =
    ds ??
    new DataSource({
      ...buildDataSourceOptions(),
      entities: appEntities,
    });

  if (!ownedDataSource.isInitialized) {
    await ownedDataSource.initialize();
  }

  try {
    const userRepo = ownedDataSource.getRepository(User);
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
    const results: Array<{ email: string; action: 'created' | 'updated' }> = [];

    for (const account of testAccounts) {
      const existing = await userRepo.findOne({ where: { email: account.email } });
      if (existing) {
        await userRepo.update(existing.id, {
          passwordHash,
          nickname: existing.nickname || account.nickname,
          defaultRole: 'guide',
          emailVerified: true,
          plan: account.plan,
          planExpiresAt: account.planExpiresAt,
        });
        results.push({ email: account.email, action: 'updated' });
        continue;
      }

      await userRepo.save(
        userRepo.create({
          email: account.email,
          passwordHash,
          nickname: account.nickname,
          defaultRole: 'guide',
          emailVerified: true,
          plan: account.plan,
          planExpiresAt: account.planExpiresAt,
        }),
      );
      results.push({ email: account.email, action: 'created' });
    }

    for (const result of results) {
      console.log(`[init-accounts] ${result.action}: ${result.email}`);
    }

    return results;
  } finally {
    if (!ds) {
      await ownedDataSource.destroy();
    }
  }
}

async function main() {
  await seedTestAccounts();
}

if (typeof require !== 'undefined' && require.main === module) {
  main().catch((err) => {
    console.error('[init-accounts] failed:', err);
    process.exit(1);
  });
}
