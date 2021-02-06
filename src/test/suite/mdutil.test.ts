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

### sub-heading that should be ignored

## Card 1.3

more
text

# Second List

# Third List

## [Card 3.1 has a link](http://example.com/foo/bar)

foo bar baz`;
      const expected = {
        start: 0,
        end: doc.length,
        index: 0,
        heading: '',
        children: [
          {
            start: 0,
            end: doc.indexOf('# Second List'),
            index: 0,
            heading: 'First List',
            children: [
              { start: doc.indexOf('## Card 1.1'), end: doc.indexOf('## Card 1.2'), index: 0, heading: 'Card 1.1', children: [] },
              { start: doc.indexOf('## Card 1.2'), end: doc.indexOf('## Card 1.3'), index: 1, heading: 'Card 1.2', children: [] },
              { start: doc.indexOf('## Card 1.3'), end: doc.indexOf('# Second List'), index: 2, heading: 'Card 1.3', children: [] },
            ],
          },
          { start: doc.indexOf('# Second List'), end: doc.indexOf('# Third List'), index: 1, heading: 'Second List', children: [] },
          {
            start: doc.indexOf('# Third List'),
            end: doc.length,
            index: 2,
            heading: 'Third List',
            children: [
              { start: doc.indexOf('## [Card 3.1'), end: doc.length, index: 0, heading: 'Card 3.1 has a link', link: 'http://example.com/foo/bar', children: [] },
            ],
          },
        ],
      };
      assert.deepStrictEqual(mdutil.parseHeadings(doc), expected);
    });
  });
});
