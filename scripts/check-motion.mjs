import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const base = (process.env.APP_URL ?? 'http://localhost:8082').replace(/\/$/, '');
const output = process.env.MOTION_OUTPUT_DIR ?? 'data/motion';
const scope = process.env.MOTION_SCOPE ?? 'full';
const checks = [], screenshots = [], errors = [];
const targets = '[data-paper-surface], .evidence-document, .clue-button[data-clue-id], .published-label, .shared-update, .timeline-list li[data-event-id], .case-seal';
const answers = { who: 'mara', where: 'studio', why: 'repair', when: '17:34' };
let browser;

// Observe both WAAPI and CSS without replacing their timing or the real stream.
// Short effects may finish before a Playwright assertion reaches getAnimations().
function instrument() {
  window.__motion = [];
  window.__streams = [];
  function identify(element) {
    if (!(element instanceof Element)) return null;
    for (const [kind, selector] of [
      ['seal', '.case-seal'], ['label', '.published-label'],
      ['clue', '.clue-button[data-clue-id]'], ['order', '.timeline-list li[data-event-id]'],
      ['shared', '.shared-update'], ['document', '.evidence-document'],
      ['paper', '[data-paper-surface]'],
    ]) {
      const owner = element.closest(selector);
      if (owner) return { kind, id: owner.dataset.clueId ?? owner.dataset.eventId ?? '' };
    }
    return null;
  }
  const animate = Element.prototype.animate;
  Element.prototype.animate = function (...args) {
    const animation = animate.apply(this, args);
    const target = identify(this);
    if (target) window.__motion.push({ ...target, source: 'waapi' });
    if (target?.kind === 'order' && typeof window.__holdOrderAt === 'number') {
      animation.pause();
      animation.currentTime = Number(animation.effect.getTiming().duration) * window.__holdOrderAt;
    }
    return animation;
  };
  document.addEventListener('animationstart', event => {
    const target = identify(event.target);
    if (target) window.__motion.push({ ...target, source: 'css' });
  }, true);
  const NativeEventSource = window.EventSource;
  window.EventSource = class extends NativeEventSource {
    constructor(...args) { super(...args); window.__streams.push(this); }
  };
}

const clue = (page, id) => page.locator(`.clue-button[data-clue-id="${id}"]`);
const dialog = page => page.getByRole('dialog', { name: 'Make your case', exact: true });
const order = page => page.locator('.timeline-list li').evaluateAll(items => items.map(item => item.dataset.eventId));
const mark = page => page.evaluate(() => window.__motion.length);
const since = (page, index) => page.evaluate(index => window.__motion.slice(index), index);
const kinds = (events, ...wanted) => events.filter(event => wanted.includes(event.kind));
const frame = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
async function settled(page) {
  await frame(page);
  await page.waitForFunction(selector => [...document.querySelectorAll(selector)].every(element =>
    element.getAnimations({ subtree: true }).every(animation => animation.playState !== 'running' && animation.playState !== 'pending')
  ), targets, { timeout: 4000 });
}
async function assertMotion(page, start, kind, reduced, id) {
  if (!reduced) await page.waitForFunction(({ start, kind, id }) =>
    window.__motion.slice(start).some(event => event.kind === kind && (id === undefined || event.id === id)),
  { start, kind, id });
  await settled(page);
  const events = kinds(await since(page, start), kind).filter(event => id === undefined || event.id === id);
  if (reduced) assert.equal(events.length, 0, `Reduced motion must not start ${kind} decoration`);
  else assert.ok(events.length > 0, `Expected confirmed ${kind} decoration`);
}
async function sameElement(handle, selector, message) {
  assert.equal(await handle.evaluate((element, selector) => element.isConnected && element === document.querySelector(selector), selector), true, message);
}
async function connected(page) {
  await page.waitForFunction(() => document.querySelector('.connection')?.textContent.startsWith('Connected'));
  await settled(page);
}
async function create(page) {
  await page.getByRole('button', { name: 'Open the case', exact: true }).click();
  await page.getByLabel('What should we call you?').fill('Motion field');
  await page.getByRole('radio', { name: /Bring a partner/ }).check();
  await page.getByRole('button', { name: 'Begin investigation', exact: true }).click();
  await page.locator('.evidence-document').waitFor();
  return new URL(page.url()).pathname;
}
async function select(page, id) {
  await clue(page, id).click();
  await page.waitForFunction(id => document.querySelector('.evidence-id')?.textContent === id, id);
  await settled(page);
}
async function publish(page, id) {
  await select(page, id);
  const response = page.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith('/publish'));
  await page.getByRole('button', { name: 'Add to shared desk', exact: true }).click();
  assert.equal((await response).status(), 200);
  await page.locator('.published-label').waitFor();
  await settled(page);
}
async function snapshot(page, filename) {
  await settled(page);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'No horizontal overflow');
  await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); window.scrollTo(0, 0); });
  const path = join(output, filename);
  await page.screenshot({ path, fullPage: true });
  screenshots.push(path);
}
async function paper(page, staticExpected) {
  const surface = page.locator('[data-paper-surface]');
  await surface.waitFor();
  await page.evaluate(() => document.fonts.ready);
  const transforms = () => surface.evaluate(element => [element, ...element.querySelectorAll('*')].map(node => getComputedStyle(node).transform));
  const before = await transforms();
  const box = await surface.boundingBox();
  assert.ok(box);
  // Dispatch mouse pointer input even in the touch context: its media conditions
  // must keep the surface static, not merely depend on no physical mouse present.
  await surface.dispatchEvent('pointermove', { pointerType: 'mouse', clientX: box.x + box.width * .85, clientY: box.y + box.height * .15 });
  if (staticExpected) {
    await page.waitForTimeout(100);
    assert.deepEqual(await transforms(), before, 'Touch and reduced-motion paper stays static');
  } else {
    await page.waitForFunction(({ before }) => {
      const element = document.querySelector('[data-paper-surface]');
      return JSON.stringify([element, ...element.querySelectorAll('*')].map(node => getComputedStyle(node).transform)) !== JSON.stringify(before);
    }, { before });
  }
  await surface.dispatchEvent('pointerleave', { pointerType: 'mouse' });
  await settled(page);
  assert.deepEqual(await transforms(), before, 'Leaving the paper restores its resting transform');
}
async function heldWrite(page, endpoint, action, pending, confirmed) {
  let capture;
  const request = new Promise(resolve => { capture = resolve; });
  await page.route(`**${endpoint}`, route => capture(route));
  let route, timeout;
  try {
    await action();
    route = await Promise.race([request, new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error(`No ${endpoint.split('/').pop()} request`)), 5000); })]);
    clearTimeout(timeout);
    // Keep the transaction from reaching the server. Neither a mutation response
    // nor the genuine SSE refresh can legitimately confirm it in this interval.
    await page.waitForTimeout(120);
    await pending();
    const response = page.waitForResponse(response => response.request().method() === 'POST' && new URL(response.url()).pathname === endpoint);
    await route.continue(); route = undefined;
    assert.equal((await response).status(), 200);
    await confirmed();
  } finally {
    clearTimeout(timeout);
    await route?.abort().catch(() => {});
    await page.unroute(`**${endpoint}`);
  }
}
async function duplicateUpdates(page, endpoint) {
  for (let i = 0; i < 3; i++) {
    const response = page.waitForResponse(response => response.request().method() === 'GET' && new URL(response.url()).pathname === endpoint);
    assert.equal(await page.evaluate(() => {
      const stream = window.__streams.findLast(stream => stream.readyState === EventSource.OPEN);
      if (!stream) return false;
      stream.dispatchEvent(new MessageEvent('update', { data: '{}' }));
      return true;
    }), true, 'Duplicate update exercises the live stream listener');
    assert.equal((await response).status(), 200);
    await frame(page);
  }
  await settled(page);
}
async function draftPreserved(page, form, input, selected) {
  await sameElement(form, '.theory-form', 'Partner updates preserve the actual form node');
  await sameElement(input, '.theory-form #who', 'Partner updates preserve the focused select node');
  assert.equal(await input.evaluate(element => document.activeElement === element), true, 'Partner update must not move keyboard focus');
  for (const [id, value] of Object.entries(answers)) assert.equal(await dialog(page).locator(`#${id}`).inputValue(), value);
  assert.equal(await dialog(page).getByRole('checkbox', { name: /F1/ }).isChecked(), true);
  assert.equal(await page.locator('.evidence-id').innerText(), selected);
}
async function overlappingMoves(sender, receiver, progress = .25) {
  const original = await order(receiver), ids = original.slice(0, 2);
  const swapped = [...original]; [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
  const move = async expected => {
    const button = sender.locator('.timeline-list li').nth(1).getByRole('button', { name: / earlier$/ });
    assert.equal(await button.isEnabled(), true);
    const response = sender.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith('/board'));
    // The earlier position test already uses a real pointer click. Dispatch the
    // same UI action here so Playwright's stability wait cannot finish the first
    // animation before sending the second confirmed move.
    await button.dispatchEvent('click'); assert.equal((await response).status(), 200);
    for (const page of [sender, receiver]) await page.waitForFunction(expected =>
      JSON.stringify([...document.querySelectorAll('.timeline-list li')].map(item => item.dataset.eventId)) === JSON.stringify(expected), expected);
    await frame(receiver);
  };
  try {
    // Freeze the receiver at the chosen point of its first real animation. This
    // guarantees an unfinished visual offset on slow CI as well as fast laptops,
    // rather than hoping two network round trips happen inside a 220ms window.
    await receiver.evaluate(progress => { window.__holdOrderAt = progress; }, progress);
    await move(swapped);
    const before = await receiver.evaluate(ids => {
      const list = document.querySelector('.timeline-list');
      return ids.map(id => {
        const row = list.querySelector(`[data-event-id="${id}"]`);
        const transform = getComputedStyle(row).transform;
        return { id, top: row.getBoundingClientRect().top - list.getBoundingClientRect().top, offset: transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m42 };
      });
    }, ids);
    assert.ok(before.every(row => Math.abs(row.offset) > 5), 'Continuity fixture must have a real unfinished FLIP offset');
    await receiver.evaluate(() => { window.__holdOrderAt = 0; });
    await move(original);
    const after = await receiver.evaluate(ids => {
      const list = document.querySelector('.timeline-list');
      return ids.map(id => {
        const row = list.querySelector(`[data-event-id="${id}"]`);
        return row.getBoundingClientRect().top - list.getBoundingClientRect().top;
      });
    }, ids);
    for (const [index, row] of before.entries()) assert.ok(Math.abs(after[index] - row.top) <= 5,
      `A second confirmed sort must continue from ${row.id}'s visible position, not jump to the first animation's destination (${Math.abs(after[index] - row.top).toFixed(1)}px)`);
    if (progress === 0) {
      // At the first animation's start, reversing returns to the already-visible
      // position. There must be no old motion left to resume or drift from it.
      const remaining = await receiver.evaluate(ids => ids.flatMap(id =>
        [...document.querySelector(`.timeline-list li[data-event-id="${id}"]`).getAnimations()]
          .filter(animation => animation.pending || ['running', 'paused'].includes(animation.playState))
          .map(animation => ({ id, state: animation.playState }))
      ), ids);
      assert.deepEqual(remaining, [], 'A zero-distance reversal cancels the previous animation instead of leaving running or paused motion');
    }
  } finally {
    await receiver.evaluate(() => {
      delete window.__holdOrderAt;
      document.querySelectorAll('.timeline-list li').forEach(row => row.getAnimations().forEach(animation => animation.finish()));
    });
    await Promise.all([settled(sender), settled(receiver)]);
  }
}

async function runPair(reduced) {
  const contexts = [];
  const options = { reducedMotion: reduced ? 'reduce' : 'no-preference' };
  try {
    const field = await browser.newContext({ ...options, viewport: { width: 1920, height: 1080 } }); contexts.push(field);
    const archive = await browser.newContext({ ...options, viewport: reduced ? { width: 390, height: 844 } : { width: 1920, height: 1080 }, hasTouch: reduced, isMobile: reduced }); contexts.push(archive);
    for (const context of contexts) await context.addInitScript(instrument);
    const a = await field.newPage(), b = await archive.newPage();
    for (const page of [a, b]) { page.setDefaultTimeout(10000); page.on('pageerror', error => errors.push(error.message)); }
    await a.goto(base); await paper(a, reduced);
    const path = await create(a), endpoint = `/api/rooms/${path.split('/').pop()}`;
    await b.goto(base); await paper(b, reduced);
    if (reduced) await snapshot(b, 'motion-home-390-reduced.png');
    await b.goto(`${base}${path}`);
    await b.getByLabel('What should we call you?').fill('Motion archive');
    await b.getByRole('button', { name: 'Join investigation', exact: true }).click();
    await Promise.all([connected(a), connected(b)]);
    assert.equal(await a.locator('.clue-button').count(), 4);
    assert.equal(await b.locator('.clue-button').count(), 4);

    const document = await a.locator('.evidence-document').elementHandle();
    let start = await mark(a);
    await select(a, 'F2');
    await sameElement(document, '.evidence-document', 'Changing evidence keeps the outer article node');
    await assertMotion(a, start, 'document', reduced);
    await a.locator('#document').focus();
    const readingFocus = await a.locator('#document').elementHandle();
    let am = await mark(a), bm = await mark(b);
    await heldWrite(b, `${endpoint}/publish`, () => b.getByRole('button', { name: 'Add to shared desk', exact: true }).click(), async () => {
      assert.equal(await b.locator('.published-label').count(), 0);
      assert.equal(await clue(a, 'A1').count(), 0);
      assert.deepEqual(kinds(await since(a, am), 'clue', 'label', 'shared'), []);
      assert.deepEqual(kinds(await since(b, bm), 'clue', 'label', 'shared'), []);
    }, async () => { await clue(a, 'A1').waitFor(); await b.locator('.published-label').waitFor(); });
    await assertMotion(a, am, 'clue', reduced, 'A1');
    await assertMotion(a, am, 'shared', reduced);
    await assertMotion(b, bm, 'label', reduced);
    assert.equal(await a.locator('.evidence-id').innerText(), 'F2');
    await sameElement(document, '.evidence-document', 'A partner publication keeps the selected article');
    assert.equal(await readingFocus.evaluate(element => document.activeElement === element), true);
    assert.equal(kinds(await since(a, am), 'document').length, 0, 'Partner updates must not replay the page reveal');

    await publish(a, 'F1'); await clue(b, 'F1').waitFor();
    await a.getByRole('button', { name: 'Make your case', exact: true }).click();
    for (const [id, value] of Object.entries(answers)) await dialog(a).locator(`#${id}`).selectOption(value);
    await dialog(a).getByRole('checkbox', { name: /F1/ }).check();
    await dialog(a).locator('#who').focus();
    const form = await a.locator('.theory-form').elementHandle(), input = await dialog(a).locator('#who').elementHandle();
    const selected = await a.locator('.evidence-id').innerText();
    await publish(b, 'A2'); await dialog(a).getByRole('checkbox', { name: /A2/ }).waitFor();
    await draftPreserved(a, form, input, selected);

    await Promise.all([settled(a), settled(b)]);
    const original = await order(b); assert.equal(original.length, 4); assert.ok(original.every(Boolean));
    const next = [...original]; [next[0], next[1]] = [next[1], next[0]];
    const timelineNodes = await a.locator('.timeline-list li').elementHandles();
    am = await mark(a); bm = await mark(b);
    await heldWrite(b, `${endpoint}/board`, () => b.locator('.timeline-list li').nth(1).getByRole('button', { name: / earlier$/ }).click(), async () => {
      assert.deepEqual(await order(a), original); assert.deepEqual(await order(b), original);
      assert.deepEqual(kinds(await since(a, am), 'order'), []); assert.deepEqual(kinds(await since(b, bm), 'order'), []);
      await draftPreserved(a, form, input, selected);
    }, async () => {
      for (const page of [a, b]) await page.waitForFunction(next => JSON.stringify([...document.querySelectorAll('.timeline-list li')].map(item => item.dataset.eventId)) === JSON.stringify(next), next);
    });
    await assertMotion(a, am, 'order', reduced); await assertMotion(b, bm, 'order', reduced);
    for (const node of timelineNodes) assert.equal(await node.evaluate(element => element.isConnected), true, 'Reordering moves existing timeline nodes');
    await draftPreserved(a, form, input, selected);
    if (!reduced) {
      for (const progress of [.25, 0]) {
        await overlappingMoves(b, a, progress);
        await draftPreserved(a, form, input, selected);
      }
      checks.push('Overlapping confirmed sorts at 25% and 0% preserve both rows\' visible positions within 5px; zero-distance reversal leaves no active animation');
    }

    am = await mark(a); bm = await mark(b);
    await duplicateUpdates(a, endpoint); await duplicateUpdates(b, endpoint);
    const repeated = await archive.request.post(`${base}${endpoint}/publish`, { data: { id: 'A2' } }); assert.equal(repeated.status(), 200);
    await duplicateUpdates(a, endpoint); await duplicateUpdates(b, endpoint);
    assert.deepEqual(await since(a, am), [], 'Duplicate snapshots and idempotent publication do not replay decoration');
    assert.deepEqual(await since(b, bm), [], 'Duplicate snapshots and idempotent publication do not replay decoration');
    await draftPreserved(a, form, input, selected);
    await dialog(a).getByRole('button', { name: 'Back to evidence', exact: true }).click();
    start = await mark(a); await select(a, 'A1'); await select(a, 'F1');
    assert.deepEqual(kinds(await since(a, start), 'label', 'clue', 'shared'), [], 'Reading an already shared clue must not repeat its publication animation');

    if (scope === 'shared') {
      for (const page of [a, b]) {
        if (reduced) assert.deepEqual(await since(page, 0), [], 'Every new decoration stays still throughout the reduced-motion investigation');
        await page.reload(); await connected(page);
        assert.deepEqual(await since(page, 0), [], 'Reopening shared evidence does not replay its past events');
      }
      await snapshot(reduced ? b : a, reduced ? 'motion-desk-390-reduced.png' : 'motion-desk-1920.png');
      checks.push(`${reduced ? 'Reduced motion desktop + touch phone' : 'Desktop motion'}: confirmed publication/order, stable reading/focus/draft DOM, duplicate updates and quiet reopening; seal outside shared scope`);
      return;
    }

    // Solve with visible controls and the known fixture answer; this is a motion
    // regression, not evidence that a human discovered the mystery's answer.
    for (const [index, id] of ['sun', 'permission', 'move', 'arrival'].entries()) {
      while ((await order(b)).indexOf(id) > index) {
        const response = b.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith('/board'));
        await b.locator(`.timeline-list li[data-event-id="${id}"]`).getByRole('button', { name: / earlier$/ }).click();
        assert.equal((await response).status(), 200); await settled(b);
      }
    }
    await a.waitForFunction(() => [...document.querySelectorAll('.timeline-list li')].map(item => item.dataset.eventId).join(',') === 'sun,permission,move,arrival');
    await Promise.all([settled(a), settled(b)]);
    if (!reduced) await snapshot(a, 'motion-desk-1920.png');
    await a.getByRole('button', { name: 'Make your case', exact: true }).click();
    for (const [id, value] of Object.entries({ who: 'eli', where: 'north', why: 'light', when: '17:30' })) await dialog(a).locator(`#${id}`).selectOption(value);
    await dialog(a).getByRole('checkbox', { name: /F1/ }).check(); await dialog(a).getByRole('checkbox', { name: /A1/ }).check();
    am = await mark(a); bm = await mark(b);
    const solution = a.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith('/theory'));
    await dialog(a).getByRole('button', { name: 'Submit explanation', exact: true }).click(); assert.equal((await solution).status(), 200);
    for (const [page, index] of [[a, am], [b, bm]]) {
      await page.locator('.solved-banner .case-seal').waitFor(); await assertMotion(page, index, 'seal', reduced);
      if (!reduced) assert.equal(kinds(await since(page, index), 'seal').length, 1, 'The resolution stamp plays once');
      const after = await mark(page); await duplicateUpdates(page, endpoint);
      assert.deepEqual(await since(page, after), [], 'A repeated solved snapshot stays still');
      if (reduced) assert.deepEqual(await since(page, 0), [], 'Every new decoration stays still throughout the reduced-motion investigation');
      await page.reload(); await page.locator('.solved-banner .case-seal').waitFor(); await connected(page);
      assert.deepEqual(await since(page, 0), [], 'Reopening an old investigation does not replay its past events');
      const recordStart = await mark(page);
      await page.getByRole('button', { name: 'Read the whole story', exact: true }).click();
      const record = page.getByRole('dialog', { name: 'The whole story', exact: true });
      await record.locator('.resolution .case-seal').waitFor(); await settled(page);
      assert.deepEqual(kinds(await since(page, recordStart), 'seal'), [], 'The resolution record presents a static receipt seal');
      assert.equal(await record.locator('.resolution .case-seal').evaluate(element => element.getAnimations({ subtree: true }).some(animation => animation.pending || ['running', 'paused'].includes(animation.playState))), false);
      if (reduced && page === b) {
        await record.locator('.resolution .case-seal').scrollIntoViewIfNeeded();
        const path = join(output, 'motion-record-390.png');
        await page.screenshot({ path, fullPage: false }); screenshots.push(path);
      }
      await record.getByRole('button', { name: 'Close dialog', exact: true }).click();
      await record.waitFor({ state: 'detached' });
    }
    if (reduced) {
      for (const page of [a, b]) assert.deepEqual(await since(page, 0), []);
      await snapshot(b, 'motion-solved-390-reduced.png');
    }
    checks.push(`${reduced ? 'Reduced motion desktop + touch phone' : 'Desktop motion'}: confirmed publication/order, stable reading/focus/draft DOM, duplicate updates, one-time solution, quiet reopening and static closable receipt`);
  } finally { for (const context of contexts) await context.close(); }
}

mkdirSync(output, { recursive: true });
try {
  assert.ok(['full', 'shared'].includes(scope), 'MOTION_SCOPE must be full or shared');
  browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL ?? 'msedge', headless: true });
  await runPair(false);
  await runPair(true);
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
  try {
    await phone.addInitScript(instrument); const page = await phone.newPage(); page.on('pageerror', error => errors.push(error.message));
    await page.goto(base); await paper(page, true); await snapshot(page, 'motion-home-390-touch.png');
    checks.push('Touch phone keeps the home paper static even without reduced motion, with no horizontal overflow');
  } finally { await phone.close(); }
  assert.deepEqual(errors, []);
} catch (error) {
  errors.push(error instanceof Error ? error.message : String(error)); process.exitCode = 1;
} finally {
  await browser?.close();
  const result = { checkedAt: new Date().toISOString(), base, scope, passed: !process.exitCode, checks, screenshots, errors };
  writeFileSync(join(output, 'motion-results.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
}
