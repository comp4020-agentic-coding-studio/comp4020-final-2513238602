import { chromium, expect } from "playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
const base = (process.env.APP_URL ?? "http://127.0.0.1:8086").replace(
  /\/$/,
  "",
);
const output = process.env.AFTER_HOURS_OUTPUT ?? "data/after-hours-party";
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL ?? "msedge",
  headless: true,
});
const checks = [],
  errors = [],
  scans = [];
async function scan(page, label) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  scans.push({
    label,
    violations: result.violations.map((v) => ({
      id: v.id,
      targets: v.nodes.map((n) => n.target),
    })),
  });
  assert.deepEqual(scans.at(-1).violations, []);
}
async function select(page, id) {
  await page.getByRole("button", { name: /01 \/ Explore rooms/ }).click();
  await page
    .getByRole("navigation", { name: "Investigation rooms" })
    .getByRole("button", {
      name: new RegExp(id[0] === "G" ? "The exhibition" : "The workshop"),
    })
    .click();
  await page.locator(`[data-object="${id}"]`).click();
}
async function inspect(page, id) {
  await select(page, id);
  await page.locator(".ah-inspector .button.primary").click();
  await expect(
    page.getByRole("button", { name: "Share this evidence" }),
  ).toBeVisible();
}
async function share(page) {
  await page.getByRole("button", { name: "Share this evidence" }).click();
  await expect(page.locator(".ah-shared")).toBeVisible();
}
let passed = false;
let failure = null;
try {
  const contexts = await Promise.all(
    [1920, 390, 1280, 390].map((width) =>
      browser.newContext({
        viewport: { width, height: width === 1920 ? 1080 : 844 },
        reducedMotion: "reduce",
      }),
    ),
  );
  const pages = await Promise.all(contexts.map((c) => c.newPage()));
  pages.forEach((p) => p.on("pageerror", (e) => errors.push(e.message)));
  const [a, b, c, d] = pages;
  await a.goto(`${base}/after-hours`);
  await a.getByLabel("Your investigator name").fill("Alex");
  await a.getByRole("button", { name: /^Start After Hours/ }).click();
  await expect(a.locator(".ah-chapter")).toBeVisible();
  const path = new URL(a.url()).pathname,
    code = path.split("/").pop();
  for (const [i, p] of pages.entries()) {
    if (!i) continue;
    await p.goto(`${base}${path}`);
    await p.getByLabel("Your investigator name").fill("Alex");
    await p.getByRole("button", { name: /^Join After Hours/ }).click();
    await expect(p.locator(".ah-chapter")).toBeVisible();
    if (i === 1) await inspect(b, "G4");
  }
  await expect(
    a.getByRole("button", { name: "Team & invite · 4/4" }),
  ).toBeVisible();
  await expect(b.locator(".ah-status")).not.toContainText("Route analyst");
  await select(d, "G4");
  await expect(
    d.getByRole("button", { name: "Share this evidence" }),
  ).toBeVisible();
  await share(d);
  checks.push(
    "Four independent browsers with the same nickname receive distinct seats; the fourth seat inherits a private route discovery without leaking it to the previous owner",
  );
  await inspect(a, "G1");
  await share(a);
  await inspect(c, "G3");
  await share(c);
  await a.getByRole("button", { name: /02 \/ Reason together/ }).click();
  await a.getByLabel("Your explanation", { exact: true }).selectOption("empty");
  await a.locator(".ah-cite").getByRole("checkbox", { name: /^G3 / }).check();
  await inspect(b, "W2");
  const started = Date.now();
  await share(b);
  await expect(
    a.locator(".ah-cite").getByRole("checkbox", { name: /^W2 / }),
  ).toBeVisible();
  const elapsed = Date.now() - started;
  assert.ok(elapsed < 1500, `Rendered shared evidence took ${elapsed}ms`);
  await expect(a.getByLabel("Your explanation", { exact: true })).toHaveValue(
    "empty",
  );
  await expect(
    a.locator(".ah-cite").getByRole("checkbox", { name: /^G3 / }),
  ).toBeChecked();
  await b.getByRole("button", { name: /02 \/ Reason together/ }).click();
  await b.getByRole("button", { name: "Reveal hint 1/3" }).click();
  await expect(a.locator(".ah-hint")).toContainText("Look underneath");
  await a.locator(".ah-cite").getByRole("checkbox", { name: /^W2 / }).check();
  await a.getByRole("button", { name: "Test deduction" }).click();
  await expect(a.locator('[data-question="cargo"]')).toHaveClass(
    /is-supported/,
  );
  checks.push(
    `Evidence and hints appear in a teammate's open reasoning form without clearing its draft (${elapsed}ms publication-to-visible, including UI actions)`,
  );
  await select(b, "G3");
  await b
    .getByLabel("A question or observation for your team")
    .fill("Does the register explain the spare? <b>Compare both.</b>");
  await b.getByRole("button", { name: "Share discussion note" }).click();
  await select(c, "G3");
  await expect(c.locator(".ah-note p")).toHaveText(
    "Does the register explain the spare? <b>Compare both.</b>",
  );
  assert.equal(await c.locator(".ah-note p b").count(), 0);
  await scan(c, "Shared evidence discussion");
  await contexts[3].setOffline(true);
  await a.getByRole("button", { name: "Team & invite · 4/4" }).click();
  await a
    .getByLabel("Route analyst", { exact: false })
    .selectOption({ label: "Alex · seat 2" });
  await a
    .locator('[data-duty="routes"]')
    .getByRole("button", { name: "Transfer duty" })
    .click();
  await expect(b.locator(".ah-status")).toContainText("Route analyst");
  await scan(a, "Team handover dialog");
  await a.keyboard.press("Escape");
  await inspect(b, "W4");
  await share(b);
  await contexts[3].setOffline(false);
  await expect(d.locator(".ah-shared-strip")).toContainText(
    "A fixed obstruction",
  );
  await expect(d.locator(".ah-status")).toContainText(
    "Shared desk contributor",
  );
  checks.push(
    "An offline investigator can be covered through an explicit saved duty transfer; their reconnect sees the missed evidence and current assignment",
  );
  const fifth = await browser.newContext();
  const outsider = await fifth.newPage();
  await outsider.goto(`${base}${path}`);
  await outsider.getByLabel("Your investigator name").fill("Fifth");
  await outsider.getByRole("button", { name: /^Join After Hours/ }).click();
  await expect(outsider.getByRole("alert")).toContainText(
    "All four seats are taken",
  );
  await fifth.close();
  const snapshot = await contexts[0].request.get(`${base}/api/games/${code}`);
  const state = await snapshot.json();
  assert.equal(state.contributions.length, 4);
  assert.equal(
    state.contributions.reduce((n, x) => n + x.shared, 0),
    5,
  );
  assert.ok(state.activity.every((x) => x.memberId && x.seat));
  checks.push(
    "A fifth seat is refused with guidance; persistent contributions and shared actions distinguish the four same-name investigators",
  );
  await b.reload();
  await expect(b.locator(".ah-status")).toContainText("Route analyst");
  await select(b, "G3");
  await expect(b.locator(".ah-note")).toContainText("Compare both.");
  await b.screenshot({ path: `${output}/discussion-390.png`, fullPage: false });
  await a.getByRole("button", { name: "Team & invite · 4/4" }).click();
  await a.screenshot({ path: `${output}/team-1920.png`, fullPage: false });
  assert.deepEqual(errors, []);
  await Promise.all(contexts.map((c) => c.close()));
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
        scans,
      },
      null,
      2,
    ),
  );
  await browser.close();
}
console.log(checks.join("\n"));
