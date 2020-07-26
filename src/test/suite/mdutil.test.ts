import * as assert from 'assert';
import * as mdutil from '../../mdutil';

suite('mdutil', () => {
  suite('parseHeadings', () => {
    test('no headings', () => {
      const doc = 'Hello!\nThis is a #test document.\nIt has no sections.';
      assert.deepStrictEqual(mdutil.parseHeadings(doc).children, []);
    });

    test('normal doc', () => {
      const doc = `# First List
## Card 1.1
## Card 1.2

some text

## Card 1.3

more
text

# Second List

# Third List

## Card 3.1

foo bar baz`;
      const expected = {
        start: 0,
        heading: '',
        children: [
          {
            start: 0,
            heading: 'First List',
            children: [
              { start: doc.indexOf('## Card 1.1'), heading: 'Card 1.1', children: [] },
              { start: doc.indexOf('## Card 1.2'), heading: 'Card 1.2', children: [] },
              { start: doc.indexOf('## Card 1.3'), heading: 'Card 1.3', children: [] },
            ],
          },
          { start: doc.indexOf('# Second List'), heading: 'Second List', children: [] },
          {
            start: doc.indexOf('# Third List'),
            heading: 'Third List',
            children: [
              { start: doc.indexOf('## Card 3.1'), heading: 'Card 3.1', children: [] },
            ],
          },
        ],
      };
      assert.deepStrictEqual(mdutil.parseHeadings(doc), expected);
    });
  });
});