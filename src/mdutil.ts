const HEADING_REGEXP = /^(##?) +(.*)$/mg;

interface Section {
  start: number;
  end: number;
  heading: string;
  children: Section[];
}

export function parseHeadings(doc: string): Section {
  const root: Section = { start: 0, end: doc.length, heading: '', children: [] };
  let h1: Section | null = null;
  let h2: Section | null = null;

  for (const match of doc.matchAll(HEADING_REGEXP)) {
    if (match.index === undefined) {
      continue;
    }
    if (h2) {
      h2.end = match.index;
    }
    switch (match[1]) {
      case '#':
        if (h1) {
          h1.end = match.index;
        }
        h1 = { start: match.index, end: 0, heading: match[2], children: [] };
        h2 = null;
        root.children.push(h1);
        break;
      case '##':
        if (h1) {
          h2 = { start: match.index, end: 0, heading: match[2], children: [] };
          h1.children.push(h2);
        }
        break;
    }
  }

  if (h1) {
    h1.end = root.end;
  }
  if (h2) {
    h2.end = root.end;
  }

  return root;
}
