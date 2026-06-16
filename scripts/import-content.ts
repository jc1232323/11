import { importKnowledgeContent } from '../apps/api/src/init-content';

const mode = process.env.INIT_CONTENT ?? 'always';

if (mode === 'never') {
  console.log('[init-content] skipped because INIT_CONTENT=never');
} else {
  importKnowledgeContent({ force: mode !== 'missing' }).catch((err) => {
    console.error('[init-content] failed:', err);
    process.exit(1);
  });
}
