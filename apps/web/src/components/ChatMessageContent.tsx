import { MarkdownView } from './MarkdownView';

type Props = {
  content: string;
  streaming?: boolean;
};

export function ChatMessageContent({ content, streaming }: Props) {
  if (!content.trim()) {
    return <span className="chat-typing">{streaming ? '…' : ''}</span>;
  }

  return (
    <div className="chat-markdown">
      <MarkdownView content={content} />
    </div>
  );
}
