import { chromium, expect } from "playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";

const base = (process.env.APP_URL ?? "http://127.0.0.1:8086").replace(
  /\/$/,
  "",
);
const output = process.env.AFTER_HOURS_OUTPUT ?? "data/after-hours-browser";
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL ?? "msedge",
  headless: true,
});
const checks = [],
  errors = [],
  axeReports = [];
const watch = (p) => p.on("pageerror", (e) => errors.push(e.message));
async function layout(page, label) {
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
    `${label} overflow`,
  );
  checks.push(`${label}: no overflow`);
}
async function axe(page, label) {
  const r = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  axeReports.push({
    label,
    violations: r.violations.map((v) => ({
      id: v.id,
      targets: v.nodes.map((n) => n.target),
    })),
  });
  assert.deepEqual(axeReports.at(-1).violations, [], label);
}
async function workspace(page, name) {
  await page.getByRole("button", { name: new RegExp(name) }).click();
}
async function select(page, id) {
  await workspace(page, "01 / Explore rooms");
  const room =
    id[0] === "G"
      ? "The exhibition"
      : id[0] === "W"
        ? "The workshop"
        : id[0] === "M"
          ? "The watch room"
          : "The north store";
  await page
    .getByRole("navigation", { name: "Investigation rooms" })
    .getByRole("button", { name: new RegExp(room) })
    .click();
  await page.locator(`[data-object="${id}"]`).click();
  await expect(page.locator(".ah-inspector")).toHaveAttribute(
    "data-selected",
    id,
  );
}
async function inspectShare(page, id) {
  await select(page, id);
  if (
    !(await page.getByRole("button", { name: "Share this evidence" }).count())
  ) {
    const inspect = page.locator(".ah-inspector .button.primary");
    await inspect.click();
  }
  await expect(
    page.getByRole("button", { name: "Share this evidence" }),
  ).toBeVisible();
  const response = page.waitForResponse(
    (r) => r.url().endsWith("/publish") && r.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Share this evidence" }).click();
  assert.equal((await response).status(), 200);
  await expect(page.locator(".ah-shared")).toBeVisible();
}
async function claim(page, id, answer, evidence) {
  await workspace(page, "02 / Reason together");
  const titles = {
    cargo: "What left first?",
    courier: "Who made the first trip?",
    time: "When did the lantern move?",
    route: "Which route was possible?",
    technician: "Who moved the lantern?",
    destination: "Where did it finish?",
    reason: "Why was it moved?",
  };
  await page
    .getByRole("navigation", { name: "Open deductions" })
    .getByRole("button", {
      name: new RegExp(titles[id].replaceAll("?", "\\?")),
    })
    .click();
  await page
    .getByLabel("Your explanation", { exact: true })
    .selectOption(answer);
  for (const c of evidence)
    await page
      .locator(".ah-cite")
      .getByRole("checkbox", { name: new RegExp(`^${c} `) })
      .check();
  await page.getByRole("button", { name: "Test deduction" }).click();
  await expect(page.locator(`[data-question="${id}"]`)).toHaveClass(
    /is-supported/,
  );
}
let passed = false;
let failure = null;
try {
  const a = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    }),
    b = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      reducedMotion: "reduce",
    });
  const pa = await a.newPage(),
    pb = await b.newPage();
  watch(pa);
  watch(pb);
  await pa.goto(`${base}/after-hours`);
  await pa.getByLabel("Your investigator name").fill("Avery");
  await pa.getByRole("button", { name: /^Start After Hours/ }).click();
  await expect(pa.locator(".ah-chapter h1")).toBeVisible();
  const path = new URL(pa.url()).pathname;
  await pb.goto(`${base}${path}`);
  await pb.getByLabel("Your investigator name").fill("Morgan");
  await pb.getByRole("button", { name: /^Join After Hours/ }).click();
  await expect(pb.locator(".ah-chapter h1")).toBeVisible();
  await expect(
    pa.getByRole("button", { name: "Team & invite · 2/4" }),
  ).toBeVisible();
  await expect(pa.locator('[data-scene-ready="true"]')).toBeVisible();
  await pa.screenshot({ path: `${output}/gallery-1920.png`, fullPage: true });
  await pb.screenshot({ path: `${output}/gallery-390.png`, fullPage: true });
  await layout(pa, "Desktop exploration");
  await layout(pb, "Phone exploration");
  await axe(pa, "Desktop exploration");
  await axe(pb, "Phone exploration");
  const canvas = pa.locator(".ah-scene canvas");
  const box = await canvas.boundingBox();
  await canvas.click({
    position: { x: box.width * 0.525, y: box.height * 0.66 },
  });
  await expect(pa.locator(".ah-inspector")).toHaveAttribute(
    "data-selected",
    "G3",
  );
  checks.push(
    "Clicking the actual 3D transport case selects its investigation object",
  );
  await inspectShare(pa, "G3");
  await expect(pb.locator(".ah-shared-strip")).toContainText(
    "Two cases, one pattern",
  );
  checks.push(
    "A 3D scene renders; an object inspection becomes shared evidence in the independent phone browser",
  );
  await inspectShare(pb, "W2");
  await inspectShare(pa, "W3");
  await inspectShare(pb, "G2");
  await claim(pa, "cargo", "empty", ["G3", "W2"]);
  await claim(pb, "courier", "jules", ["G2", "W3"]);
  await expect(pa.locator(".ah-chapter h1")).toContainText(
    "The clocks disagree",
  );
  checks.push(
    "Both players supply complementary evidence; two supported deductions unlock act two in both browsers",
  );
  await layout(pb, "Phone reasoning");
  await axe(pb, "Phone reasoning");
  await pa.reload();
  await expect(pa.locator(".ah-chapter h1")).toContainText(
    "The clocks disagree",
  );
  const oldCanvas = await pa.locator(".ah-scene canvas").elementHandle();
  await pa.getByRole("button", { name: "Use object list only" }).click();
  await oldCanvas.evaluate((canvas) =>
    canvas.dispatchEvent(new Event("webglcontextlost")),
  );
  await pa.waitForTimeout(700); // R3F schedules deliberate context disposal after unmount.
  await expect(pa.getByRole("button", { name: "Show 3D room" })).toBeEnabled();
  await expect(pa.locator(".ah-scene-fallback")).toBeVisible();
  await select(pa, "M1");
  await pa.locator(".ah-inspector .button.primary").click();
  await expect(
    pa.getByRole("button", { name: "Share this evidence" }),
  ).toBeVisible();
  checks.push(
    "Saved act progress survives reload; investigation works with the 3D canvas disabled",
  );
  for (const [page, id] of [
    [pa, "G1"],
    [pb, "G4"],
    [pa, "W1"],
    [pb, "W4"],
    [pa, "M1"],
    [pb, "M2"],
    [pa, "M3"],
    [pb, "M4"],
  ])
    await inspectShare(page, id);
  await pa.getByRole("button", { name: "Show 3D room" }).click();
  await expect(pa.locator('[data-scene-ready="true"]')).toBeVisible();
  checks.push(
    "A delayed context-loss event from a deliberately removed canvas cannot disable the replacement 3D view",
  );
  await select(pa, "M3");
  await pa.screenshot({ path: `${output}/monitor-1920.png`, fullPage: true });
  await claim(pa, "time", "1800", ["M1", "M2"]);
  await claim(pb, "route", "north", ["W1", "M4"]);
  await expect(pa.locator(".ah-chapter h1")).toContainText("Follow the object");
  for (const [page, id] of [
    [pa, "S1"],
    [pb, "S2"],
    [pa, "S3"],
    [pb, "S4"],
  ])
    await inspectShare(page, id);
  await pa.screenshot({ path: `${output}/store-1920.png`, fullPage: true });
  await pb.screenshot({ path: `${output}/store-390.png`, fullPage: true });
  await claim(pa, "technician", "eli", ["S2", "S3"]);
  await claim(pb, "destination", "north", ["S1", "S4"]);
  await claim(pa, "reason", "protection", ["M3", "S2"]);
  await axe(pa, "Desktop supported reasoning");
  const target = [
    "calibrate",
    "collect",
    "alarm",
    "authorise",
    "move",
    "receive",
  ];
  for (let destination = 0; destination < target.length; destination++) {
    let order = await pa
      .locator(".ah-chronology li")
      .evaluateAll((items) => items.map((x) => x.dataset.event));
    while (order.indexOf(target[destination]) > destination) {
      const response = pa.waitForResponse(
        (r) => r.url().endsWith("/board") && r.request().method() === "POST",
      );
      await pa
        .locator(`[data-event="${target[destination]}"]`)
        .getByRole("button", { name: /earlier/ })
        .click();
      assert.equal((await response).status(), 200);
      await expect(pa.locator(".ah-status")).not.toContainText("Saving…");
      order = await pa
        .locator(".ah-chronology li")
        .evaluateAll((items) => items.map((x) => x.dataset.event));
    }
  }
  await pa
    .getByRole("button", { name: /Check reconstruction & close/ })
    .click();
  await expect(pa.locator(".ah-closed h1")).toContainText(
    "Two journeys. One misunderstanding.",
  );
  await expect(pb.locator(".ah-closed h1")).toContainText(
    "Two journeys. One misunderstanding.",
  );
  await workspace(pb, "03 / Case record");
  await expect(pb.locator(".ah-ending")).toContainText("18:00");
  await layout(pb, "Phone conclusion");
  await axe(pb, "Phone conclusion");
  await pb.screenshot({ path: `${output}/conclusion-390.png`, fullPage: true });
  await pa.goto(base);
  const saved = pa.locator(`.saved-case[href="${path}"]`);
  await expect(saved).toContainText("After Hours");
  await saved.click();
  await expect(pa.locator(".ah-closed")).toBeVisible();
  checks.push(
    "Two browser identities discover all 16 records, support all seven deductions, reconstruct six events and see the same conclusion; the home page resumes the correct saved game",
  );
  assert.deepEqual(errors, [], "Browser JavaScript errors");
  await a.close();
  await b.close();
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
        axeReports,
      },
      null,
      2,
    ),
  );
  await browser.close();
}
console.log(checks.join("\n"));
