const HEADING_REGEXP = /^(##?) +(.*)$/mg;
const LINK_REGEXP = /\[(.*?)\]\((\S+?)\)/g;

interface Section {
  start: number;
  end: number;
  index: number;
  heading: string;
  link?: string;
  children: Section[];
}

function parseSectionHeading(section: Section) {
  if (!section.heading) {
    return;
  }

  section.heading = section.heading.replace(LINK_REGEXP, function(m: string, title: string, href: string) {
    section.link = section.link || href;
    return title;
  });
}

export function parseHeadings(doc: string): Section {
  const root: Section = { start: 0, end: doc.length, index: 0, heading: '', children: [] };
  let h1: Section | null = null;
  let h2: Section | null = null;
  let h1index = 0;
  let h2index = 0;

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
        h1 = { start: match.index, end: 0, index: h1index, heading: match[2], children: [] };
        parseSectionHeading(h1);
        h1index += 1;
        h2index = 0;
        h2 = null;
        root.children.push(h1);
        break;
      case '##':
        if (h1) {
          h2 = { start: match.index, end: 0, index: h2index, heading: match[2], children: [] };
          parseSectionHeading(h2);
          h2index += 1;
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
