import { Fragment, type ReactNode } from 'react';

const CHEM_TOKEN_RE = /([A-Za-z0-9()[\]^+\-−=→←⇌·]+)/g;

function shouldFormatToken(token: string) {
  return /[A-Z]|\^/.test(token);
}

function renderFormulaToken(token: string, keyPrefix: string) {
  const parts: Array<string | ReactNode> = [];
  let index = 0;

  while (index < token.length) {
    const char = token[index];

    if (char === '^') {
      let end = index + 1;
      while (end < token.length && /[0-9+\-−]/.test(token[end])) {
        end += 1;
      }

      const sup = token.slice(index + 1, end);
      if (sup.length > 0) {
        parts.push(
          <sup key={`${keyPrefix}-sup-${index}`}>{sup}</sup>,
        );
        index = end;
        continue;
      }
    }

    if (
      /[0-9]/.test(char)
      && index > 0
      && /[A-Za-z)\]]/.test(token[index - 1])
    ) {
      let end = index + 1;
      while (end < token.length && /[0-9]/.test(token[end])) {
        end += 1;
      }

      parts.push(
        <sub key={`${keyPrefix}-sub-${index}`}>{token.slice(index, end)}</sub>,
      );
      index = end;
      continue;
    }

    parts.push(char);
    index += 1;
  }

  return <Fragment key={keyPrefix}>{parts}</Fragment>;
}

function renderLine(line: string, lineIndex: number) {
  const segments = line.split(CHEM_TOKEN_RE);

  return segments.map((segment, segmentIndex) => {
    if (!segment) return null;
    if (!shouldFormatToken(segment)) {
      return (
        <Fragment key={`line-${lineIndex}-text-${segmentIndex}`}>
          {segment}
        </Fragment>
      );
    }

    return renderFormulaToken(segment, `line-${lineIndex}-token-${segmentIndex}`);
  });
}

export function ChemText({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <span className="chem-text">
      {lines.map((line, lineIndex) => (
        <Fragment key={`line-${lineIndex}`}>
          {lineIndex > 0 && <br />}
          {renderLine(line, lineIndex)}
        </Fragment>
      ))}
    </span>
  );
}
