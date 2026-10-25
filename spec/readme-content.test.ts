import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { marked } from 'marked';
import { expect, inject, it } from 'vitest';

it('serves the full README argument and source links without requiring JavaScript', async () => {
  const response = await fetch(new URL('/readme/', inject('baseUrl')));
  expect(response.status).toBe(200);
  const actual = new JSDOM(await response.text()).window.document.querySelector('main');
  const expected = new JSDOM(await marked.parse(readFileSync('README.md', 'utf8'))).window.document.body;
  expect(actual, 'Project notes need the entire argument, not just its headings').not.toBeNull();
  const text = (element: Element) => element.textContent?.replace(/\s+/g, ' ').trim();
  expect(text(actual!)).toBe(text(expected));
  const links = (element: Element) => Array.from(element.querySelectorAll('a')).map(a => [a.textContent, a.getAttribute('href')]);
  expect(links(actual!)).toEqual(links(expected));
  // Equal Markdown output can still contain broken /readme/docs/... links.
  // Follow same-origin destinations as a reader would, rather than merely
  // comparing href strings with the source that introduced the mistake.
  for (const anchor of actual!.querySelectorAll('a[href]')) {
    const href = anchor.getAttribute('href')!;
    if (href.startsWith('#')) continue;
    const destination = new URL(href, new URL('/readme/', inject('baseUrl')));
    if (destination.origin === new URL(inject('baseUrl')).origin) {
      const linked = await fetch(destination);
      expect(linked.ok, `README link must open: ${destination.pathname}`).toBe(true);
    }
  }
});
