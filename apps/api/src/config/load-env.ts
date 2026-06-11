import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

/** 在 Nest 启动前加载 monorepo 根目录 .env，避免读不到 LLM_API_KEY */
export function loadEnvFiles(): string | null {
  const candidates = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '../.env'),
    resolve(__dirname, '../../../.env'),
    resolve(__dirname, '../../../../.env'),
  ];

  let loaded: string | null = null;
  for (const path of candidates) {
    if (existsSync(path)) {
      config({ path, override: true });
      loaded = path;
    }
  }
  return loaded;
}
