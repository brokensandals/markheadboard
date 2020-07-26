const HEADING_REGEXP = /^(##?) *(.*)$/mg;

interface Section {
  start: number;
  heading: string;
  children: Section[];
}

export function parseHeadings(doc: string): Section {
  const root: Section = { start: 0, heading: '', children: [] };
  let h1: Section | null = null;

  for (const match of doc.matchAll(HEADING_REGEXP)) {
    if (match.index === undefined) {
      continue;
    }
    switch (match[1]) {
      case '#':
        h1 = { start: match.index, heading: match[2], children: [] };
        root.children.push(h1);
        break;
      case '##':
        if (h1) {
          h1.children.push({ start: match.index, heading: match[2], children: [] });
        }
        break;
    }
  }

  return root;
}
