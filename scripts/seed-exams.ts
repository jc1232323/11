/**
 * Seed exam papers from existing training questions.
 * Run: npx ts-node --project scripts/tsconfig.json scripts/seed-exams.ts
 */
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';

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
    join(__dirname, '../apps/api/src/entities/exam.entity.ts'),
    join(__dirname, '../apps/api/src/entities/exam-attempt.entity.ts'),
  ],
});

async function seed() {
  await ds.initialize();
  console.log('Connected to database');

  const examRepo = ds.getRepository('Exam');
  const questionRepo = ds.getRepository('TrainingQuestion');

  // Fetch all training questions
  const allQuestions = await questionRepo.find() as Array<{
    id: string;
    packId: string;
    type: string;
    title: string;
  }>;

  if (allQuestions.length === 0) {
    console.log('No training questions found. Run seed-training.ts first.');
    await ds.destroy();
    return;
  }

  // Group by pack
  const byPack = new Map<string, typeof allQuestions>();
  for (const q of allQuestions) {
    const list = byPack.get(q.packId) ?? [];
    list.push(q);
    byPack.set(q.packId, list);
  }

  const choiceQuestions = allQuestions.filter((q) => q.type === '单选题');
  const otherQuestions = allQuestions.filter((q) => q.type !== '单选题');

  // Exam 1: 综合模拟卷 - mix of all types
  const exam1Questions = [
    ...choiceQuestions.slice(0, Math.min(20, choiceQuestions.length)),
    ...otherQuestions.slice(0, Math.min(4, otherQuestions.length)),
  ];

  const exam1 = {
    examId: 'comprehensive-mock-1',
    title: '高考化学综合模拟卷（一）',
    description: '涵盖电化学、实验、有机化学等高考重点内容，限时45分钟完成',
    duration: 45,
    totalScore: exam1Questions.length <= 20
      ? exam1Questions.filter((q) => q.type === '单选题').length * 3 + exam1Questions.filter((q) => q.type !== '单选题').length * 8
      : 100,
    questions: exam1Questions.map((q) => ({
      questionId: q.id,
      score: q.type === '单选题' ? 3 : 8,
    })),
    sortOrder: 1,
  };

  // Exam 2: 选择题专练
  const exam2Questions = choiceQuestions.slice(0, Math.min(25, choiceQuestions.length));
  const exam2 = {
    examId: 'choice-sprint',
    title: '选择题限时冲刺',
    description: '25道高考真题选择题，限时30分钟，训练选择题速度与准确率',
    duration: 30,
    totalScore: exam2Questions.length * 4,
    questions: exam2Questions.map((q) => ({
      questionId: q.id,
      score: 4,
    })),
    sortOrder: 2,
  };

  // Exam 3: specific topic exam if we have enough organic questions
  const organicQuestions = byPack.get('organic') ?? [];
  let exam3 = null;
  if (organicQuestions.length >= 5) {
    const exam3Questions = organicQuestions.slice(0, Math.min(15, organicQuestions.length));
    exam3 = {
      examId: 'organic-focus',
      title: '有机化学专项测试',
      description: '有机化学历年真题精选，检验有机反应与推断能力',
      duration: 35,
      totalScore: exam3Questions.reduce((sum, q) => sum + (q.type === '单选题' ? 4 : 10), 0),
      questions: exam3Questions.map((q) => ({
        questionId: q.id,
        score: q.type === '单选题' ? 4 : 10,
      })),
      sortOrder: 3,
    };
  }

  // Upsert exams
  const examsToSeed = [exam1, exam2, exam3].filter(Boolean);

  for (const examData of examsToSeed) {
    const existing = await examRepo.findOne({ where: { examId: examData!.examId } });
    if (existing) {
      await examRepo.update(existing.id, examData!);
      console.log(`Updated exam: ${examData!.title}`);
    } else {
      await examRepo.save(examData);
      console.log(`Created exam: ${examData!.title}`);
    }
  }

  console.log(`\nDone! Seeded ${examsToSeed.length} exam papers.`);
  await ds.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
