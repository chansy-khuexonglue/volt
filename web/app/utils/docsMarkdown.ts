export type InlineToken = { kind: 'text' | 'code' | 'strong' | 'link'; text: string; href?: string };
export type DocBlock =
  | { kind: 'heading'; text: string; depth: number; id: string }
  | { kind: 'code'; code: string; language: string; filename?: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'table'; headers: string[]; rows: string[][] };

function safeHref(href: string): boolean {
  return /^https:\/\//.test(href) || /^\/(?!\/)/.test(href) || /^#[\w-]+$/.test(href);
}

// Render the docs' small Markdown vocabulary as Vue nodes, never raw HTML.
export function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const pattern = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^\s)]+)\)/g;
  let offset = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index! > offset) tokens.push({ kind: 'text', text: text.slice(offset, match.index) });
    if (match[1]) tokens.push({ kind: 'code', text: match[1] });
    else if (match[2]) tokens.push({ kind: 'strong', text: match[2] });
    else if (match[3] && match[4] && safeHref(match[4])) {
      tokens.push({ kind: 'link', text: match[3], href: match[4] });
    } else tokens.push({ kind: 'text', text: match[0] });
    offset = match.index! + match[0].length;
  }
  if (offset < text.length) tokens.push({ kind: 'text', text: text.slice(offset) });
  return tokens;
}

function tableCells(line: string): string[] {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
}

export function parseDocBlocks(markdown: string): DocBlock[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: DocBlock[] = [];
  const headings = new Map<string, number>();
  let index = 0;
  while (index < lines.length) {
    const line = lines[index]!;
    if (!line.trim()) { index++; continue; }
    const fence = line.match(/^```([^\s`]*)\s*(.*)$/);
    if (fence) {
      index++;
      const code: string[] = [];
      while (index < lines.length && !/^```\s*$/.test(lines[index]!)) code.push(lines[index++]!);
      if (index < lines.length) index++;
      blocks.push({ kind: 'code', code: code.join('\n'), language: fence[1] || 'text', filename: fence[2] || undefined });
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const base = heading[2]!.toLowerCase().replace(/[`*]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const count = headings.get(base) ?? 0;
      headings.set(base, count + 1);
      blocks.push({ kind: 'heading', text: heading[2]!, depth: heading[1]!.length, id: count ? `${base}-${count + 1}` : base });
      index++;
      continue;
    }
    if (line.trim().startsWith('|') && /^\|?\s*:?-{3,}/.test(lines[index + 1]?.trim() ?? '')) {
      const headers = tableCells(line);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index]!.trim().startsWith('|')) rows.push(tableCells(lines[index++]!));
      blocks.push({ kind: 'table', headers, rows });
      continue;
    }
    const list = line.match(/^(- |\d+\. )(.+)$/);
    if (list) {
      const ordered = !line.startsWith('- ');
      const items: string[] = [];
      const marker = ordered ? /^\d+\. (.+)$/ : /^- (.+)$/;
      while (index < lines.length) {
        const item = lines[index]!.match(marker);
        if (!item) break;
        items.push(item[1]!);
        index++;
      }
      blocks.push({ kind: 'list', ordered, items });
      continue;
    }
    const paragraph: string[] = [line];
    index++;
    while (index < lines.length && lines[index]!.trim() && !/^(#{1,3} |```|- |\d+\. |\|)/.test(lines[index]!)) {
      paragraph.push(lines[index++]!);
    }
    blocks.push({ kind: 'paragraph', text: paragraph.join(' ') });
  }
  return blocks;
}
