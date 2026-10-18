import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { serverFixture } from '../spec/server-fixture.ts';

// Without APP_URL, own a disposable server so the browser can return after a restart.
// CI may instead use its already-running app; returning.test.ts also covers restart.
const server = process.env.APP_URL ? null : await serverFixture();
const base = process.env.APP_URL ?? server.base;
const checks = [], errors = [];
let browser;
const countLinks = (page, count) => page.waitForFunction(
  expected => document.querySelectorAll('.saved-case').length === expected,
  count,
);
async function failNextHistory(page) {
  let pending = true;
  await page.route('**/api/me*', route => {
    if (pending) { pending = false; return route.abort('failed'); }
    return route.continue();
  });
}
async function layout(page, width) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  assert.deepEqual(audit.violations.map(violation => violation.id), []);
  await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); window.scrollTo(0, 0); });
  mkdirSync('evidence', { recursive: true });
  await page.screenshot({ path: `evidence/returning-${width}.png`, fullPage: true });
  checks.push(`Saved files at ${width}px have no horizontal overflow and pass axe A/AA`);
}

try {
  await server?.start();
  browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL ?? 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  await context.request.get(`${base}/api/me`);
  let oldest;
  for (let i = 0; i < 13; i++) {
    const response = await context.request.post(`${base}/api/rooms`, { data: { name: `Return ${i + 1}`, mode: 'solo' } });
    assert.equal(response.status(), 201);
    const room = await response.json();
    if (i === 0) {
      oldest = room.code;
      const publication = await context.request.post(`${base}/api/rooms/${oldest}/publish`, { data: { id: 'F2' } });
      assert.equal(publication.status(), 200);
      await new Promise(resolve => setTimeout(resolve, 5));
    }
  }
  if (server) {
    await server.stop();
    await server.start();
    checks.push('The disposable server restarted after thirteen investigations and an early publication');
  }
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));

  // Hold the first read to distinguish loading, failure and an actually empty history.
  let captureInitial;
  const initial = new Promise(resolve => { captureInitial = resolve; });
  await page.route('**/api/me*', route => { captureInitial(route); });
  await page.goto(base);
  await page.getByText('Newest investigations first. Dates show the last saved change.').waitFor();
  await page.getByRole('status').filter({ hasText: 'Loading your saved investigations' }).waitFor();
  assert.equal(await page.getByText('No saved investigations in this browser yet.').count(), 0);
  await (await initial).abort('failed');
  await page.getByRole('alert').filter({ hasText: 'Your saved investigations could not be loaded' }).waitFor();
  assert.equal(await page.getByText('No saved investigations in this browser yet.').count(), 0);
  await page.unroute('**/api/me*');
  await page.getByRole('button', { name: 'Retry saved investigations' }).click();
  await countLinks(page, 4);
  checks.push('An initial history failure is visible and an explicit retry restores the first four links');

  await failNextHistory(page);
  await page.getByRole('button', { name: 'Show more investigations' }).click();
  await page.getByRole('alert').filter({ hasText: 'More investigations could not be loaded' }).waitFor();
  assert.equal(await page.locator('.saved-case').count(), 4);
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await countLinks(page, 8);
  await page.unroute('**/api/me*');
  checks.push('A failed later page preserves existing links and reconnecting retries that same page');

  await failNextHistory(page);
  await page.getByRole('button', { name: 'Show more investigations' }).click();
  await page.getByRole('alert').filter({ hasText: 'More investigations could not be loaded' }).waitFor();
  assert.equal(await page.locator('.saved-case').count(), 8);
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await countLinks(page, 12);
  await page.unroute('**/api/me*');
  await page.getByRole('button', { name: 'Show more investigations' }).click();
  await countLinks(page, 13);
  const links = await page.locator('.saved-case').evaluateAll(elements => elements.map(element => element.getAttribute('href')));
  assert.equal(new Set(links).size, 13);
  assert.equal(await page.getByRole('button', { name: 'Show more investigations' }).count(), 0);
  await layout(page, 1920);
  await page.locator(`.saved-case[href="/case/${oldest}"]`).click();
  await page.locator('.evidence-document').waitFor();
  await page.locator('.clue-button').filter({ has: page.locator('.clue-tag', { hasText: 'F2' }) }).click();
  await page.locator('.published-label').waitFor();
  checks.push('All thirteen investigations remain reachable from home, including the earliest saved publication');

  await page.setViewportSize({ width: 390, height: 844 });
  await failNextHistory(page);
  await page.goto(base);
  await page.getByRole('alert').filter({ hasText: 'Your saved investigations could not be loaded' }).waitFor();
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await countLinks(page, 4);
  await page.unroute('**/api/me*');
  for (const count of [8, 12, 13]) {
    const more = page.getByRole('button', { name: 'Show more investigations' });
    await more.focus();
    await page.keyboard.press('Enter');
    await countLinks(page, count);
  }
  await layout(page, 390);
  checks.push('Initial failure recovers on reconnect at phone width, and keyboard Show more reaches all files');

  const newcomer = await browser.newContext();
  const freshPage = await newcomer.newPage();
  await freshPage.goto(base);
  await freshPage.getByText('No saved investigations in this browser yet.').waitFor();
  assert.equal(await freshPage.getByRole('alert').count(), 0);
  assert.equal(await freshPage.locator('.saved-case').count(), 0);
  await newcomer.close();
  await context.close();
  checks.push('A new browser sees an explicit empty history without another identity’s investigations');
  assert.deepEqual(errors, []);
} finally {
  mkdirSync('evidence', { recursive: true });
  writeFileSync('evidence/returning-results.json', JSON.stringify({ checkedAt: new Date().toISOString(), base, restarted: !!server, checks, errors }, null, 2));
  await browser?.close();
  await server?.close();
}
console.log(JSON.stringify({ checks }, null, 2));
