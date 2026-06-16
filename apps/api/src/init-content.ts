import 'reflect-metadata';
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { DataSource } from 'typeorm';
import { loadEnvFiles } from './config/load-env';
import { appEntities, buildDataSourceOptions } from './config/database.config';
import { KnowledgeNode } from './entities/knowledge-node.entity';
import { seedTestAccounts } from './init-test-accounts';

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

function resolveContentRoot() {
  const candidates = [
    resolve(process.cwd(), 'content/chemistry'),
    resolve(process.cwd(), '../../content/chemistry'),
    resolve(__dirname, '../../content/chemistry'),
    resolve(__dirname, '../../../content/chemistry'),
  ];

  const found = candidates.find((candidate) => existsSync(join(candidate, 'meta.json')));
  if (!found) {
    throw new Error(`meta.json not found in candidates: ${candidates.join(', ')}`);
  }
  return found;
}

export async function importKnowledgeContent(options: { force?: boolean } = {}) {
  loadEnvFiles();

  const ds = new DataSource({
    ...buildDataSourceOptions(),
    entities: appEntities,
  });
  await ds.initialize();

  try {
    const repo = ds.getRepository(KnowledgeNode);
    const existingCount = await repo.count();
    if (existingCount > 0 && !options.force) {
      console.log(`[init-content] knowledge_nodes already has ${existingCount} rows; skipped`);
      return { imported: false, count: existingCount };
    }

    const contentRoot = resolveContentRoot();
    const meta = JSON.parse(
      readFileSync(join(contentRoot, 'meta.json'), 'utf-8'),
    ) as MetaFile;

    await repo.clear();

    const nodes: KnowledgeNode[] = [];
    for (const mod of meta.modules) {
      const moduleNode = repo.create({
        parentId: null,
        slug: mod.slug,
        title: mod.title,
        type: 'module',
        sortOrder: mod.sort,
        mdBody: null,
      });
      nodes.push(await repo.save(moduleNode));

      for (const chapter of mod.chapters) {
        const chapterNode = repo.create({
          parentId: moduleNode.id,
          slug: chapter.slug,
          title: chapter.title,
          type: 'chapter',
          sortOrder: chapter.sort,
          mdBody: null,
        });
        nodes.push(await repo.save(chapterNode));

        for (const topic of chapter.topics) {
          const filePath = join(contentRoot, topic.file);
          if (!existsSync(filePath)) {
            throw new Error(`Missing topic markdown: ${filePath}`);
          }

          const topicNode = repo.create({
            parentId: chapterNode.id,
            slug: topic.slug,
            title: topic.title,
            type: 'topic',
            sortOrder: topic.sort,
            mdBody: readFileSync(filePath, 'utf-8'),
          });
          nodes.push(await repo.save(topicNode));
        }
      }
    }

    console.log(`[init-content] imported ${nodes.length} knowledge nodes`);
    return { imported: true, count: nodes.length };
  } finally {
    await ds.destroy();
  }
}

async function main() {
  const mode = process.env.INIT_CONTENT ?? 'always';
  if (mode === 'never') {
    console.log('[init-content] skipped because INIT_CONTENT=never');
  } else {
    await importKnowledgeContent({ force: mode !== 'missing' });
  }

  await seedTestAccounts();
}

if (typeof require !== 'undefined' && require.main === module) {
  main().catch((err) => {
    console.error('[init-content] failed:', err);
    process.exit(1);
  });
}
