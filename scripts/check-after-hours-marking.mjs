// Scripted acceptance checks, not a blind or human playtest.
import { chromium, expect as baseExpect } from 'playwright/test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const expect = baseExpect.configure({ timeout: 20000 });
const base = (process.env.APP_URL ?? 'http://127.0.0.1:8086').replace(/\/$/, '');
const startedAt = new Date().toISOString();
const output = process.env.MARKING_OUTPUT ?? `data/marking-${startedAt.replaceAll(/[:.]/g, '-')}`;
const local = relative(resolve('data'), resolve(output));
assert.ok(local && !local.startsWith('..') && !local.includes(':'));
assert.equal(existsSync(`${output}/results.json`), false, 'Use a new directory; preserve earlier runs.');
mkdirSync(output, { recursive: true });
const channel = process.env.BROWSER_CHANNEL ?? 'chrome';
const browser = await chromium.launch({ channel, headless: true });
const checks = [], errors = [], screenshots = [], timings = {};
const contexts = [];
let passed = false, failure = null, releaseScene = () => {};
const slowProfile = { offline: false, latency: 150, downloadThroughput: 512 * 1024, uploadThroughput: 128 * 1024 };

async function check(label, action) {
  const at = new Date().toISOString();
  try {
    await action();
    checks.push({ label, at, passed: true });
    console.log(`PASS: ${label}`);
  } catch (error) {
    checks.push({ label, at, passed: false });
    throw error;
  }
}
async function layout(page) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'No horizontal page overflow');
}
async function capture(page, name) {
  await page.screenshot({ path: `${output}/${name}.png`, fullPage: true });
  screenshots.push(`${name}.png`);
}
async function inspect(page, id) {
  await page.getByRole('button', { name: /01 \/ Explore rooms/ }).click();
  await page.getByRole('navigation', { name: 'Investigation rooms' })
    .getByRole('button', { name: id.startsWith('W') ? /The workshop/ : /The exhibition/ }).click();
  await page.locator(`[data-object="${id}"]`).click();
  await page.locator('.ah-inspector .button.primary').click();
  await expect(page.getByRole('button', { name: 'Share this evidence' })).toBeVisible();
}
async function share(page) {
  await page.getByRole('button', { name: 'Share this evidence' }).click();
  await expect(page.locator('.ah-shared')).toBeVisible();
}
try {
  const a = await browser.newContext({ viewport: { width: 1920, height: 1080 }, reducedMotion: 'reduce' });
  const b = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  contexts.push(a, b);
  const p = await a.newPage(), q = await b.newPage();
  for (const page of [p, q]) page.on('pageerror', e => errors.push(e.message));
  const sceneGate = new Promise(resolveGate => { releaseScene = resolveGate; });
  let sceneRequested = false;
  await p.route('**/InvestigationScene-*.js', async route => {
    sceneRequested = true;
    await sceneGate;
    await route.continue();
  });
  let path, code;
  await check('README alone exposes the main-case entry; two fresh browser identities join', async () => {
    await p.goto(`${base}/readme/`);
    const entry = await p.getByRole('link', { name: 'Play After Hours', exact: true }).getAttribute('href');
    assert.equal(new URL(entry, base).pathname, '/after-hours');
    // Local CI follows the published path on its disposable server, not production.
    await p.goto(`${base}${new URL(entry, base).pathname}`);
    await p.getByLabel('Your investigator name').fill('Scripted desktop');
    await p.getByRole('button', { name: /^Start After Hours/ }).click();
    await expect(p.locator('.ah-chapter')).toBeVisible();
    path = new URL(p.url()).pathname;
    code = path.split('/').pop();
    await q.goto(`${base}${path}`);
    await q.getByLabel('Your investigator name').fill('Scripted phone');
    await q.getByRole('button', { name: /^Join After Hours/ }).click();
    await expect(q.locator('.ah-chapter')).toBeVisible();
    await expect(p.getByRole('button', { name: 'Team & invite · 2/4' })).toBeVisible();
  });
  await check('A withheld 3D module does not block inspecting and sharing through the object list', async () => {
    await expect.poll(() => sceneRequested).toBe(true);
    assert.equal(await p.locator('.ah-scene canvas').count(), 0);
    await inspect(p, 'G3');
    await share(p);
    await expect(q.locator('.ah-shared-strip')).toContainText('Two cases, one pattern');
    await capture(p, 'scene-loading-text-progress');
    releaseScene();
    await expect(p.locator('[data-scene-ready="true"]')).toBeVisible();
    await layout(p);
  });
  await check('Resize during an uncommitted inspection preserves selection and honest save feedback', async () => {
    await p.locator('[data-object="G1"]').click();
    let held, arrived;
    const received = new Promise(resolveGate => { arrived = resolveGate; });
    await p.route(`**/api/games/${code}/inspect`, route => { held = route; arrived(); });
    await p.getByRole('button', { name: /Measure the mount/ }).click();
    await received;
    try {
      for (const viewport of [{ width: 390, height: 844 }, { width: 1920, height: 1080 }]) {
        await p.setViewportSize(viewport);
        await layout(p);
        await expect(p.locator('.ah-inspector')).toHaveAttribute('data-selected', 'G1');
        await expect(p.locator('.ah-status')).toContainText('Saving…');
        await expect(p.getByRole('button', { name: 'Share this evidence' })).toHaveCount(0);
      }
    } finally { await held.continue(); }
    await p.unroute(`**/api/games/${code}/inspect`);
    await expect(p.getByRole('button', { name: 'Share this evidence' })).toBeVisible();
  });
  await p.getByRole('button', { name: /02 \/ Reason together/ }).click();
  const answer = p.getByLabel('Your explanation', { exact: true });
  const citation = id => p.locator('.ah-cite').getByRole('checkbox', { name: new RegExp(`^${id} `) });
  await answer.selectOption('empty');
  await citation('G3').check();
  await check('Desktop-to-phone resizing and a live partner publication retain the explanation, citation and focus', async () => {
    await answer.focus();
    await p.setViewportSize({ width: 390, height: 844 });
    await layout(p);
    await expect(answer).toBeFocused();
    await inspect(q, 'W2');
    const started = performance.now();
    await share(q);
    await expect(citation('W2')).toBeVisible();
    timings.normalPublicationToVisibleMs = Math.round(performance.now() - started);
    assert.ok(timings.normalPublicationToVisibleMs < 1500, 'Rendered publication should arrive in about a second on the tested connection');
    await expect(answer).toHaveValue('empty');
    await expect(citation('G3')).toBeChecked();
    await expect(answer).toBeFocused();
    await capture(p, 'phone-live-draft');
    await p.setViewportSize({ width: 1920, height: 1080 });
    await layout(p);
    await expect(answer).toHaveValue('empty');
    await expect(citation('G3')).toBeChecked();
  });
  await check('A throttled browser preserves its draft through an offline interval and catches up without reloading', async () => {
    const cdp = await a.newCDPSession(p);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', slowProfile);
    await a.setOffline(true);
    await expect(p.locator('.ah-connection')).toContainText('Reconnecting');
    await inspect(q, 'G2');
    await share(q);
    assert.equal(await citation('G2').count(), 0);
    await a.setOffline(false);
    // Reapply the profile after Playwright restores network access.
    await cdp.send('Network.emulateNetworkConditions', slowProfile);
    const started = performance.now();
    await expect(citation('G2')).toBeVisible();
    await expect(p.locator('.ah-connection')).toContainText('Connected');
    timings.throttledReconnectToVisibleMs = Math.round(performance.now() - started);
    await expect(answer).toHaveValue('empty');
    await expect(citation('G3')).toBeChecked();
    await capture(p, 'reconnected-draft');
  });
  await check('A delayed deduction remains pending while resizing, then appears once in both browsers', async () => {
    await citation('W2').check();
    let held, arrived, writes = 0;
    const received = new Promise(resolveGate => { arrived = resolveGate; });
    await p.route(`**/api/games/${code}/claim`, route => { writes++; held = route; arrived(); });
    await p.getByRole('button', { name: 'Test deduction' }).click();
    await received;
    try {
      await p.setViewportSize({ width: 390, height: 844 });
      await p.waitForTimeout(1800); // Deliberately longer than an ordinary shared update.
      await expect(p.locator('.ah-status')).toContainText('Saving…');
      await expect(p.locator('[data-question="cargo"]')).not.toHaveClass(/is-supported/);
      await expect(answer).toHaveValue('empty');
      await expect(citation('G3')).toBeChecked();
      await expect(citation('W2')).toBeChecked();
      await layout(p);
      await capture(p, 'pending-deduction-phone');
    } finally { await held.continue(); }
    await p.unroute(`**/api/games/${code}/claim`);
    await expect(p.locator('[data-question="cargo"]')).toHaveClass(/is-supported/);
    await q.getByRole('button', { name: /02 \/ Reason together/ }).click();
    await expect(q.locator('[data-question="cargo"]')).toHaveClass(/is-supported/);
    const saved = await (await a.request.get(`${base}/api/games/${code}`)).json();
    assert.equal(saved.attempts, 1);
    assert.equal(writes, 1);
    await layout(p);
    await capture(p, 'supported-deduction-phone');
  });
  assert.deepEqual(errors, []);
  passed = true;
} catch (error) {
  failure = error instanceof Error ? error.message : String(error);
  throw error;
} finally {
  releaseScene();
  const report = {
    startedAt, finishedAt: new Date().toISOString(), base, channel, browserVersion: browser.version(),
    revision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    scriptSha256: createHash('sha256').update(readFileSync(new URL(import.meta.url))).digest('hex'),
    passed, failure, checks, timings, errors, slowProfile, screenshots,
    limitations: 'Known scripted actions, isolated cookies, headless browser and emulated phone/network. No human enjoyment, real-device performance or global latency conclusion. No cookies, room code or raw trace exported.'
  };
  writeFileSync(`${output}/results.json`, JSON.stringify(report, null, 2));
  await Promise.all(contexts.map(context => context.close()));
  await browser.close();
}
