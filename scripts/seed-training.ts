/**
 * Seed training packs and questions from the static frontend data into the database.
 * Run: npx ts-node --project scripts/tsconfig.json scripts/seed-training.ts
 */
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';

// Import the static data
import { TRAINING_PACKS } from '../apps/web/src/lib/training-packs';

const ds = new DataSource({
  type: 'mysql',
  host: process.env.DATABASE_HOST ?? '127.0.0.1',
  port: Number(process.env.DATABASE_PORT ?? 3307),
  username: process.env.DATABASE_USER ?? 'chem_user',
  password: process.env.DATABASE_PASSWORD ?? 'chem_pass_dev_2026',
  database: process.env.DATABASE_NAME ?? 'chem_qa',
  synchronize: true,
  entities: [
    join(__dirname, '../apps/api/src/entities/training-pack.entity.ts'),
    join(__dirname, '../apps/api/src/entities/training-question.entity.ts'),
  ],
});

async function seed() {
  await ds.initialize();
  console.log('Connected to database');

  const packRepo = ds.getRepository('TrainingPack');
  const questionRepo = ds.getRepository('TrainingQuestion');

  for (let i = 0; i < TRAINING_PACKS.length; i++) {
    const pack = TRAINING_PACKS[i];

    // Upsert pack
    const existing = await packRepo.findOne({ where: { packId: pack.id } });
    if (!existing) {
      await packRepo.save({
        packId: pack.id,
        title: pack.title,
        color: pack.color,
        description: pack.description,
        tags: pack.tags,
        sortOrder: i,
      });
      console.log(`  ✓ Pack: ${pack.title}`);
    } else {
      console.log(`  ○ Pack exists: ${pack.title}`);
    }

    // Upsert questions
    for (let j = 0; j < pack.questions.length; j++) {
      const q = pack.questions[j];
      const existingQ = await questionRepo.findOne({ where: { packId: pack.id, title: q.title } });
      if (!existingQ) {
        await questionRepo.save({
          packId: pack.id,
          title: q.title,
          type: q.type,
          prompt: q.prompt,
          options: q.options ?? null,
          answer: q.answer,
          analysis: q.analysis,
          knowledgePoints: q.knowledgePoints,
          source: q.source,
          sortOrder: j,
        });
        console.log(`    ✓ Question: ${q.title}`);
      } else {
        console.log(`    ○ Question exists: ${q.title}`);
      }
    }
  }

  console.log('\nDone!');
  await ds.destroy();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
