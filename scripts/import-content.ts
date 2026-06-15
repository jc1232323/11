import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import mysql from 'mysql2/promise';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '../.env') });

type MetaTopic = {
  slug: string;
  title: string;
  file: string;
  sort: number;
};

type MetaChapter = {
  slug: string;
  title: string;
  sort: number;
  topics: MetaTopic[];
};

type MetaModule = {
  slug: string;
  title: string;
  sort: number;
  chapters: MetaChapter[];
};

type MetaFile = {
  modules: MetaModule[];
};

const contentRoot = join(__dirname, '../content/chemistry');

async function main() {
  const metaPath = join(contentRoot, 'meta.json');
  if (!existsSync(metaPath)) {
    console.error('meta.json not found:', metaPath);
    process.exit(1);
  }

  const meta = JSON.parse(readFileSync(metaPath, 'utf-8')) as MetaFile;

  const conn = await mysql.createConnection({
    host: process.env.DATABASE_HOST ?? '127.0.0.1',
    port: Number(process.env.DATABASE_PORT ?? 3307),
    user: process.env.DATABASE_USER ?? 'chem_user',
    password: process.env.DATABASE_PASSWORD ?? 'chem_pass_dev_2026',
    database: process.env.DATABASE_NAME ?? 'chem_qa',
  });

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS knowledge_nodes (
      id varchar(36) NOT NULL PRIMARY KEY,
      parent_id varchar(36) NULL,
      slug varchar(255) NOT NULL UNIQUE,
      title varchar(255) NOT NULL,
      type varchar(32) NOT NULL DEFAULT 'chapter',
      sort_order int NOT NULL DEFAULT 0,
      md_body longtext NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
  await conn.execute('TRUNCATE TABLE knowledge_nodes');
  await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
  console.log('Cleared knowledge_nodes');

  for (const mod of meta.modules) {
    const moduleId = randomUUID();
    await conn.execute(
      `INSERT INTO knowledge_nodes (id, parent_id, slug, title, type, sort_order, md_body)
       VALUES (?, NULL, ?, ?, 'module', ?, NULL)`,
      [moduleId, mod.slug, mod.title, mod.sort],
    );
    console.log('Module:', mod.title);

    for (const chapter of mod.chapters) {
      const chapterId = randomUUID();
      await conn.execute(
        `INSERT INTO knowledge_nodes (id, parent_id, slug, title, type, sort_order, md_body)
         VALUES (?, ?, ?, ?, 'chapter', ?, NULL)`,
        [chapterId, moduleId, chapter.slug, chapter.title, chapter.sort],
      );
      console.log('  Chapter:', chapter.title);

      for (const topic of chapter.topics) {
        const filePath = join(contentRoot, topic.file);
        if (!existsSync(filePath)) {
          console.error('Missing file:', filePath);
          process.exit(1);
        }
        const mdBody = readFileSync(filePath, 'utf-8');
        await conn.execute(
          `INSERT INTO knowledge_nodes (id, parent_id, slug, title, type, sort_order, md_body)
           VALUES (?, ?, ?, ?, 'topic', ?, ?)`,
          [randomUUID(), chapterId, topic.slug, topic.title, topic.sort, mdBody],
        );
        console.log('    Topic:', topic.title);
      }
    }
  }

  await conn.end();
  console.log('Import completed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
