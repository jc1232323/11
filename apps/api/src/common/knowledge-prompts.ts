export type AskMode = 'explain' | 'practice' | 'free';

function stripFrontmatter(md: string): string {
  return md.replace(/^---[\s\S]*?---\n/, '').trim();
}

export function buildKnowledgeLlmContent(
  mdBody: string,
  askMode: AskMode,
  userText?: string,
  meta?: { title?: string; chapterTitle?: string | null },
): string {
  const body = stripFrontmatter(mdBody).slice(0, 2000);
  const title = meta?.title ?? '该知识点';
  const chapter = meta?.chapterTitle ? `（章节：${meta.chapterTitle}）` : '';

  if (askMode === 'practice') {
    return `请根据以下高中化学知识点「${title}」${chapter}，出 3～5 道练习题（可含选择、填空、简答），并附参考答案与简要解析。难度适合高中生。

知识点内容：
${body}

${userText?.trim() ? `补充要求：${userText.trim()}` : ''}`.trim();
  }

  if (askMode === 'explain') {
    return `请帮我讲解高中化学知识点「${title}」${chapter}，我看完后还不太理解。

${body}

请用适合高中生的语言讲解重点；涉及公式时请说明含义。
${userText?.trim() ? `\n补充问题：${userText.trim()}` : ''}`.trim();
  }

  if (body) {
    return `${userText?.trim() ?? '请结合以下知识点回答我的问题。'}

参考知识点「${title}」${chapter}：
${body}`.trim();
  }

  return userText?.trim() ?? '';
}
