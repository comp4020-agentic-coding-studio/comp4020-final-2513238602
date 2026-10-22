import { chromium, expect } from "playwright/test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
const base = (process.env.APP_URL ?? "http://127.0.0.1:8086").replace(
  /\/$/,
  "",
);
const output = process.env.AFTER_HOURS_OUTPUT ?? "data/after-hours-recovery";
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL ?? "msedge",
  headless: true,
});
const checks = [],
  errors = [];
let passed = false;
let failure = null;
try {
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    reducedMotion: "reduce",
  });
  await context.addInitScript(() => {
    window.__draws = 0;
    for (const name of [
      "drawElements",
      "drawArrays",
      "drawElementsInstanced",
      "drawArraysInstanced",
    ]) {
      const original = WebGL2RenderingContext.prototype[name];
      if (original)
        WebGL2RenderingContext.prototype[name] = function (...args) {
          window.__draws++;
          return original.apply(this, args);
        };
    }
  });
  const p = await context.newPage();
  p.on("pageerror", (e) => errors.push(e.message));
  let created,
    creates = 0;
  await p.route("**/api/games", async (route) => {
    creates++;
    const response = await route.fetch();
    assert.equal(response.status(), 201);
    created = await response.json();
    await route.abort("failed");
  });
  await p.goto(`${base}/after-hours`);
  await p.getByLabel("Your investigator name").fill("Recovery");
  await p.getByRole("button", { name: /^Start After Hours/ }).click();
  await expect(p.getByRole("alert")).toContainText("may already be saved");
  await p.getByLabel("Your investigator name").press("Enter");
  assert.equal(creates, 1);
  await p.unroute("**/api/games");
  await p.getByRole("link", { name: "View existing investigations" }).click();
  await p.locator(`.saved-case[href="/play/${created.code}"]`).click();
  await expect(p.locator(".ah-chapter")).toBeVisible();
  checks.push(
    "A committed creation with a lost response creates one room and returns through the saved case file",
  );
  const phone = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const q = await phone.newPage();
  q.on("pageerror", (e) => errors.push(e.message));
  let joins = 0;
  await q.route(`**/api/games/${created.code}/join`, async (route) => {
    joins++;
    const response = await route.fetch();
    assert.equal(response.status(), 200);
    await route.abort("failed");
  });
  await q.goto(`${base}/play/${created.code}`);
  await q.getByLabel("Your investigator name").fill("Partner");
  await q.getByRole("button", { name: /^Join After Hours/ }).click();
  await expect(
    q.getByRole("button", { name: /^Check my saved seat/ }),
  ).toBeVisible();
  await q.getByRole("button", { name: /^Check my saved seat/ }).click();
  await expect(q.locator(".ah-chapter")).toBeVisible();
  assert.equal(joins, 1);
  checks.push(
    "A lost join reply recovers the saved seat with a read, without a second join",
  );
  await expect(q.locator('[data-scene-ready="true"]')).toBeVisible();
  assert.equal(
    await q
      .locator(".ah-scene canvas")
      .evaluate((c) => getComputedStyle(c).touchAction),
    "pan-y",
  );
  checks.push(
    "A touch phone can scroll over the 3D scene; labelled buttons provide rotation",
  );
  await expect(p.locator('[data-scene-ready="true"]')).toBeVisible();
  await p.locator('[data-object="G3"]').click();
  let held, arrive;
  const arrived = new Promise((resolve) => (arrive = resolve));
  await p.route(`**/api/games/${created.code}/inspect`, (route) => {
    held = route;
    arrive();
  });
  await p.getByRole("button", { name: /Turn the spare case over/ }).click();
  await arrived;
  await expect(
    p.getByRole("button", { name: "Share this evidence" }),
  ).toHaveCount(0);
  await expect(p.locator(".ah-status")).toContainText("Saving…");
  await held.continue();
  await p.unroute(`**/api/games/${created.code}/inspect`);
  await expect(
    p.getByRole("button", { name: "Share this evidence" }),
  ).toBeVisible();
  await p.waitForTimeout(350);
  const idle = await p.evaluate(() => window.__draws);
  assert.ok(idle > 0);
  await p.waitForTimeout(350);
  assert.equal(
    await p.evaluate(() => window.__draws),
    idle,
    "A settled reduced-motion room must not keep drawing",
  );
  checks.push(
    "An unforwarded inspection shows no discovery; reduced-motion 3D stops drawing after confirmed state settles",
  );
  let publications = 0;
  await p.route(`**/api/games/${created.code}/publish`, async (route) => {
    publications++;
    const response = await route.fetch();
    assert.equal(response.status(), 200);
    await route.abort("failed");
  });
  await p.getByRole("button", { name: "Share this evidence" }).click();
  await expect(p.locator(".ah-error")).toContainText(
    "Latest saved state loaded",
  );
  await expect(p.locator(".ah-shared")).toBeVisible();
  assert.equal(publications, 1);
  await expect(q.locator(".ah-shared-strip")).toContainText(
    "Two cases, one pattern",
  );
  await p.unroute(`**/api/games/${created.code}/publish`);
  checks.push(
    "A lost publication acknowledgement reconciles the committed record without an automatic repeat",
  );
  await p.locator(".ah-scene canvas").evaluate((c) => {
    const gl = c.getContext("webgl2");
    const ext = gl.getExtension("WEBGL_lose_context");
    if (!ext) throw Error("Context loss extension unavailable");
    ext.loseContext();
  });
  await expect(p.locator(".ah-scene-fallback")).toContainText("unavailable");
  await p.locator('[data-object="G1"]').focus();
  await p.keyboard.press("Enter");
  await p.getByRole("button", { name: /Measure the mount/ }).focus();
  await p.keyboard.press("Enter");
  await expect(
    p.getByRole("button", { name: "Share this evidence" }),
  ).toBeVisible();
  await p.getByRole("button", { name: "Share this evidence" }).click();
  await expect(q.locator(".ah-shared-strip")).toContainText("A mount too wide");
  checks.push(
    "Real WebGL context loss leaves a keyboard-playable object view that can still save and share evidence",
  );
  assert.deepEqual(errors, []);
  await context.close();
  await phone.close();
  passed = true;
} catch (error) {
  failure = error instanceof Error ? error.message : String(error);
  throw error;
} finally {
  writeFileSync(
    `${output}/results.json`,
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        passed,
        failure,
        base,
        checks,
        errors,
      },
      null,
      2,
    ),
  );
  await browser.close();
}
console.log(checks.join("\n"));
