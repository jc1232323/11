import { createRequire } from 'module';
import { existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compiledInitializer = resolve(__dirname, '../apps/api/dist/init-test-accounts.js');

if (!existsSync(compiledInitializer)) {
  throw new Error('缺少 apps/api/dist/init-test-accounts.js，请先运行 npm run build -w @chem-qa/api');
}

const { seedTestAccounts, testAccounts } = require(compiledInitializer);

seedTestAccounts().then(() => {
  console.log('\n--- Test Accounts ---');
  for (const account of testAccounts) {
    console.log(`邮箱: ${account.email}`);
    console.log('密码: test123456');
    console.log(`套餐: ${account.plan}`);
    console.log('');
  }
}).catch((err: unknown) => {
  console.error('[seed-accounts] failed:', err);
  process.exit(1);
});
