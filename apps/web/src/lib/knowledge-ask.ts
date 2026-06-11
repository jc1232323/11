/** 从知识点页跳转到 AI 问答时携带的状态 */
export type KnowledgeAskMode = 'explain' | 'practice';

export type KnowledgeAskState = {
  slug: string;
  title: string;
  chapterTitle: string | null;
  mdBody: string;
  mode: KnowledgeAskMode;
};

/** 发给大模型的触发内容（正文由服务端按 slug 加载） */
export function buildKnowledgeAskMessage(state: KnowledgeAskState): string {
  if (state.mode === 'practice') {
    return `请根据知识点「${state.title}」出练习题`;
  }
  return `请讲解知识点「${state.title}」`;
}

/** 聊天界面里展示的简短用户消息 */
export function buildKnowledgeAskDisplay(state: KnowledgeAskState): string {
  const chapter = state.chapterTitle ? ` · ${state.chapterTitle}` : '';
  if (state.mode === 'practice') {
    return `出题练习：**${state.title}**${chapter}`;
  }
  return `学习讲解：**${state.title}**${chapter}`;
}
