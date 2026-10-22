// Scripted browser actors with known answers: this is not a human or blind playtest.
import { chromium, expect as baseExpect } from "playwright/test";
import assert from "node:assert/strict";
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, relative } from "node:path";
import { execFileSync } from "node:child_process";

const expect = baseExpect.configure({ timeout: 15000 });
const base = (process.env.APP_URL ?? "http://127.0.0.1:8086").replace(
  /\/$/,
  "",
);
const startedAt = new Date().toISOString();
const output =
  process.env.SIM_OUTPUT ??
  `data/player-simulation-${startedAt.replaceAll(/[:.]/g, "-")}`;
const localPath = relative(resolve("data"), resolve(output));
assert.ok(localPath && !localPath.startsWith("..") && !localPath.includes(":"));
assert.equal(
  existsSync(`${output}/results.json`),
  false,
  "Preserve earlier runs; choose a new output directory.",
);
mkdirSync(output, { recursive: true });
const revision = execFileSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();
const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL ?? "msedge",
  headless: true,
});
const actors = [],
  steps = [],
  network = [],
  errors = [],
  captures = [];
const started = Date.now();
let code,
  passed = false,
  failure = null,
  finalRecord;
const profiles = [
  {
    name: "Sim Avery",
    duty: "Scene investigator",
    width: 1920,
    height: 1080,
    behavior: "Desktop 3D; tests an unsupported early interpretation",
  },
  {
    name: "Sim Morgan",
    duty: "Archivist",
    width: 390,
    height: 844,
    behavior:
      "Touch phone, reduced motion; checks records and preserves a draft",
  },
  {
    name: "Sim Casey",
    duty: "Object examiner",
    width: 1366,
    height: 900,
    behavior: "Laptop; uses the keyboard and object list after inspecting 3D",
  },
  {
    name: "Sim Robin",
    duty: "Route analyst",
    width: 390,
    height: 844,
    behavior: "Touch phone; leaves during act two and returns after a handover",
  },
];
const journal = (entry) =>
  appendFileSync(`${output}/journal.jsonl`, `${JSON.stringify(entry)}\n`);
async function step(actor, label, action) {
  const entry = {
    number: steps.length + 1,
    at: new Date().toISOString(),
    actor: actor?.name ?? "Team",
    label,
    status: "running",
  };
  steps.push(entry);
  journal({ ...entry });
  const start = Date.now();
  try {
    const result = await action();
    entry.status = "passed";
    if (result !== undefined) entry.observed = result;
  } catch (e) {
    entry.status = "failed";
    entry.error = String(e.message ?? e);
    throw e;
  } finally {
    entry.durationMs = Date.now() - start;
    journal({ ...entry });
    console.log(`${entry.number}. ${entry.status}: ${entry.actor} — ${label}`);
  }
}
async function state(actor) {
  const r = await actor.context.request.get(`${base}/api/games/${code}`);
  assert.equal(r.status(), 200);
  return r.json();
}
async function tab(actor, label) {
  await actor.page.getByRole("button", { name: new RegExp(label) }).click();
}
async function select(actor, id) {
  await tab(actor, "01 / Explore rooms");
  const room = {
    G: "The exhibition",
    W: "The workshop",
    M: "The watch room",
    S: "The north store",
  }[id[0]];
  await actor.page
    .getByRole("navigation", { name: "Investigation rooms" })
    .getByRole("button", { name: new RegExp(room) })
    .click();
  await actor.page.locator(`[data-object="${id}"]`).click();
  await expect(actor.page.locator(".ah-inspector")).toHaveAttribute(
    "data-selected",
    id,
  );
}
async function screenshot(actor, name, selector) {
  const filename = `${String(captures.length + 1).padStart(2, "0")}-${name}.png`;
  if (selector)
    await actor.page
      .locator(selector)
      .screenshot({ path: `${output}/${filename}` });
  else {
    await actor.page.evaluate(() => scrollTo(0, 0));
    await actor.page.screenshot({
      path: `${output}/${filename}`,
      fullPage: false,
    });
  }
  captures.push({ actor: actor.name, filename, at: new Date().toISOString() });
}
async function inspect(actor, id) {
  await step(actor, `Inspect ${id} privately`, async () => {
    await select(actor, id);
    await actor.page.locator(".ah-inspector .button.primary").click();
    await expect(
      actor.page.getByRole("button", { name: "Share this evidence" }),
    ).toBeVisible();
    assert.ok(
      (await state(actor)).clues.some((c) => c.id === id && !c.sharedBy),
    );
  });
}
async function share(actor, id, observer) {
  await step(
    actor,
    `Publish ${id}${observer ? `; confirm ${observer.name} sees it` : ""}`,
    async () => {
      await select(actor, id);
      if (observer) await tab(observer, "01 / Explore rooms");
      const start = Date.now();
      await actor.page
        .getByRole("button", { name: "Share this evidence" })
        .click();
      await expect(actor.page.locator(".ah-shared")).toBeVisible();
      if (observer)
        await expect(
          observer.page
            .locator(".ah-shared-strip")
            .getByRole("button", { name: new RegExp(`^${id} /`) }),
        ).toBeVisible();
      return {
        publicationToObservedMs: Date.now() - start,
        includesBrowserActions: true,
      };
    },
  );
}
async function find(actor, id, observer) {
  await inspect(actor, id);
  await share(actor, id, observer);
}
const titles = {
  cargo: "What left first?",
  courier: "Who made the first trip?",
  time: "When did the lantern move?",
  route: "Which route was possible?",
  technician: "Who moved the lantern?",
  destination: "Where did it finish?",
  reason: "Why was it moved?",
};
async function question(actor, id) {
  await tab(actor, "02 / Reason together");
  await actor.page
    .getByRole("navigation", { name: "Open deductions" })
    .getByRole("button", {
      name: new RegExp(titles[id].replaceAll("?", "\\?")),
    })
    .click();
}
async function draft(actor, id, answer, citations) {
  await question(actor, id);
  await actor.page
    .getByLabel("Your explanation", { exact: true })
    .selectOption(answer);
  // The checked set shrinks after each click; indexed live locators would skip items.
  const checked = actor.page.locator(".ah-cite input:checked");
  while (await checked.count()) await checked.first().uncheck();
  for (const clue of citations)
    await actor.page
      .locator(".ah-cite")
      .getByRole("checkbox", { name: new RegExp(`^${clue} `) })
      .check();
}
async function claim(actor, id, answer, citations, supported = true) {
  await step(
    actor,
    `${supported ? "Support" : "Challenge"} ${id}: ${answer} using ${citations.join(" + ")}`,
    async () => {
      await draft(actor, id, answer, citations);
      await actor.page.getByRole("button", { name: "Test deduction" }).click();
      const article = actor.page.locator(`[data-question="${id}"]`);
      if (supported) await expect(article).toHaveClass(/is-supported/);
      else {
        await expect(article.getByRole("alert")).toBeVisible();
        await expect(article).not.toHaveClass(/is-supported/);
      }
      const s = await state(actor);
      assert.equal(!!s.questions.find((q) => q.id === id).accepted, supported);
      return {
        act: s.act,
        accepted: supported,
        feedback: s.feedback,
        attempts: s.attempts,
      };
    },
  );
}
async function note(actor, id, text, observer) {
  await step(actor, `Discuss ${id} with ${observer.name}`, async () => {
    await select(actor, id);
    await actor.page
      .getByLabel("A question or observation for your team")
      .fill(text);
    await actor.page
      .getByRole("button", { name: "Share discussion note" })
      .click();
    await select(observer, id);
    await expect(
      observer.page.locator(".ah-note p").filter({ hasText: text }),
    ).toBeVisible();
    return { scriptedNote: text };
  });
}
async function transfer(actor, target) {
  await actor.page.getByRole("button", { name: "Team & invite · 4/4" }).click();
  await actor.page.getByLabel("Route analyst", { exact: false }).selectOption({
    label: `${target.name} · seat ${actors.indexOf(target) + 1}`,
  });
  await actor.page
    .locator('[data-duty="routes"]')
    .getByRole("button", { name: "Transfer duty" })
    .click();
  await expect(target.page.locator(".ah-status")).toContainText(
    "Route analyst",
  );
  await actor.page.keyboard.press("Escape");
}
try {
  for (const profile of profiles) {
    const context = await browser.newContext({
      viewport: { width: profile.width, height: profile.height },
      isMobile: profile.width === 390,
      hasTouch: profile.width === 390,
      reducedMotion: profile.width === 390 ? "reduce" : "no-preference",
    });
    await context.tracing.start({
      screenshots: true,
      snapshots: true,
      sources: true,
    });
    const page = await context.newPage();
    const actor = { ...profile, context, page };
    actors.push(actor);
    page.on("pageerror", (e) =>
      errors.push({ actor: actor.name, message: e.message }),
    );
    page.on("response", (response) => {
      if (
        response.request().method() !== "POST" ||
        !new URL(response.url()).pathname.startsWith("/api/games")
      )
        return;
      network.push({
        at: new Date().toISOString(),
        actor: actor.name,
        operation: new URL(response.url()).pathname.replace(
          /\/games\/[a-f0-9]{12}/,
          "/games/{room}",
        ),
        status: response.status(),
      });
    });
    await step(
      actor,
      actors.length === 1
        ? "Create an independent investigation"
        : `Join as persistent seat ${actors.length}`,
      async () => {
        await page.goto(
          actors.length === 1 ? `${base}/after-hours` : `${base}/play/${code}`,
        );
        await page.getByLabel("Your investigator name").fill(actor.name);
        await page
          .getByRole("button", {
            name:
              actors.length === 1 ? /^Start After Hours/ : /^Join After Hours/,
          })
          .click();
        await expect(page.locator(".ah-chapter")).toBeVisible();
        code = new URL(page.url()).pathname.split("/").pop();
        const s = await state(actor);
        return {
          seats: s.members.length,
          assignedDuties: Object.keys(s.assignments).filter(
            (d) => s.assignments[d] === s.me.id,
          ),
        };
      },
    );
  }
  const [a, b, c, d] = actors;
  await step(
    null,
    "Four independent identities see their own duties and act-one room gates",
    async () => {
      const snapshots = await Promise.all(actors.map(state));
      assert.equal(new Set(snapshots.map((s) => s.me.id)).size, 4);
      for (const actor of actors) {
        await expect(actor.page.locator(".ah-status")).toContainText(
          actor.duty,
        );
        await expect(
          actor.page
            .getByRole("navigation", { name: "Investigation rooms" })
            .getByRole("button", { name: /The watch room/ }),
        ).toBeDisabled();
        await expect(
          actor.page
            .getByRole("navigation", { name: "Investigation rooms" })
            .getByRole("button", { name: /The north store/ }),
        ).toBeDisabled();
      }
      await expect(a.page.locator('[data-scene-ready="true"]')).toBeVisible();
      await screenshot(a, "act-one-desktop");
      await screenshot(b, "act-one-phone");
    },
  );
  await step(c, "Select the blue case through its actual 3D mesh", async () => {
    await expect(c.page.locator('[data-scene-ready="true"]')).toBeVisible();
    const canvas = c.page.locator(".ah-scene canvas"),
      box = await canvas.boundingBox();
    await canvas.click({
      position: { x: box.width * 0.525, y: box.height * 0.66 },
    });
    await expect(c.page.locator(".ah-inspector")).toHaveAttribute(
      "data-selected",
      "G3",
    );
  });
  await inspect(c, "G3");
  await step(
    a,
    "Unpublished G3 remains private to the object examiner",
    async () => {
      await select(a, "G3");
      await expect(a.page.locator(".ah-inspector .button.primary")).toHaveCount(
        0,
      );
      for (const actor of [a, b, d])
        assert.equal(
          (await state(actor)).clues.some((x) => x.id === "G3"),
          false,
        );
      return { otherIdentitiesWithoutPrivateClue: 3 };
    },
  );
  await share(c, "G3", b);
  await step(
    c,
    "Use the keyboard to inspect and share W1 without the 3D canvas",
    async () => {
      await c.page
        .getByRole("button", { name: "Use object list only" })
        .click();
      await c.page
        .getByRole("navigation", { name: "Investigation rooms" })
        .getByRole("button", { name: /The workshop/ })
        .click();
      await c.page.locator('[data-object="W1"]').focus();
      await c.page.keyboard.press("Enter");
      await c.page.getByRole("button", { name: "Measure the trolley" }).focus();
      await c.page.keyboard.press("Enter");
      await expect(
        c.page.getByRole("button", { name: "Share this evidence" }),
      ).toBeVisible();
      await c.page.getByRole("button", { name: "Share this evidence" }).focus();
      await c.page.keyboard.press("Enter");
      await expect(c.page.locator(".ah-shared")).toBeVisible();
    },
  );
  await find(a, "G1", d);
  await find(b, "G2", a);
  await find(d, "G4", c);
  await step(
    b,
    "A one-citation submission gives guidance and creates no saved attempt",
    async () => {
      await draft(b, "cargo", "empty", ["G3"]);
      const before = (await state(b)).attempts;
      const requests = network.length;
      await b.page.getByRole("button", { name: "Test deduction" }).click();
      await expect(
        b.page.locator('[data-question="cargo"]').getByRole("alert"),
      ).toContainText("two to six");
      assert.equal((await state(b)).attempts, before);
      assert.equal(
        network.slice(requests).filter((n) => n.operation.endsWith("/claim"))
          .length,
        0,
      );
      await screenshot(b, "missing-citation-guidance", ".ah-question");
    },
  );
  await claim(a, "cargo", "lantern", ["G1", "G3"], false);
  await claim(a, "cargo", "empty", ["G2", "G4"], false);
  await step(
    a,
    "Keep the unfinished explanation while a teammate supplies the missing record",
    async () => {
      await draft(a, "cargo", "empty", ["G3"]);
      await find(b, "W2");
      await expect(
        a.page.locator(".ah-cite").getByRole("checkbox", { name: /^W2 / }),
      ).toBeVisible();
      await expect(
        a.page.getByLabel("Your explanation", { exact: true }),
      ).toHaveValue("empty");
      await expect(
        a.page.locator(".ah-cite").getByRole("checkbox", { name: /^G3 / }),
      ).toBeChecked();
    },
  );
  await note(
    c,
    "G3",
    "[Scripted simulation] The spare is 26 cm. Does the register identify what the collected case held?",
    b,
  );
  await note(
    b,
    "W2",
    "[Scripted simulation] RX-17 is recorded as empty packaging; the base measurement supports this.",
    a,
  );
  await step(
    d,
    "Reveal the first optional hint for the shared cargo question",
    async () => {
      await question(d, "cargo");
      await d.page.getByRole("button", { name: "Reveal hint 1/3" }).click();
      await question(a, "cargo");
      await expect(a.page.locator(".ah-hint")).toContainText("Look underneath");
    },
  );
  await claim(c, "cargo", "empty", ["G3", "W2"]);
  await find(a, "W3", b);
  await find(d, "W4", c);
  await claim(b, "courier", "jules", ["G2", "W3"]);
  await step(null, "All four players reach act two", async () => {
    for (const actor of actors)
      await expect(actor.page.locator(".ah-chapter h1")).toContainText(
        "The clocks disagree",
      );
    await select(a, "M1");
    await screenshot(a, "act-two-desktop");
  });
  await find(a, "M1", b);
  await find(b, "M2", a);
  await claim(a, "time", "1806", ["M1", "M2"], false);
  await note(
    b,
    "M2",
    "[Scripted simulation] The camera is six minutes ahead; subtract six from the displayed recording time.",
    a,
  );
  await claim(a, "time", "1800", ["M1", "M2"]);
  await find(c, "M3", b);
  await inspect(d, "M4");
  await step(
    null,
    "An offline route analyst can be covered without losing private discoveries",
    async () => {
      await d.context.setOffline(true);
      await transfer(a, b);
      assert.ok(
        (await state(b)).clues.some((x) => x.id === "M4" && !x.sharedBy),
      );
      await share(b, "M4", c);
      await screenshot(b, "handover-phone", ".ah-inspector");
    },
  );
  await step(
    d,
    "Reconnect, receive missed evidence and explicitly reclaim the route duty",
    async () => {
      await d.context.setOffline(false);
      await expect(d.page.locator(".ah-shared-strip")).toContainText("M4 /");
      await expect(d.page.locator(".ah-status")).toContainText(
        "Shared desk contributor",
      );
      await transfer(a, d);
      assert.equal((await state(d)).assignments.routes, (await state(d)).me.id);
    },
  );
  await claim(d, "route", "north", ["W1", "M4"]);
  await step(null, "All four players reach act three", async () => {
    for (const actor of actors)
      await expect(actor.page.locator(".ah-chapter h1")).toContainText(
        "Follow the object",
      );
    await select(a, "S1");
    await screenshot(a, "act-three-desktop");
  });
  for (const [actor, id] of [
    [a, "S1"],
    [b, "S2"],
    [c, "S3"],
    [d, "S4"],
  ])
    await find(actor, id);
  await claim(c, "technician", "eli", ["S2", "S3"]);
  await claim(d, "destination", "north", ["S1", "S4"]);
  await claim(b, "reason", "protection", ["M3", "S2"]);
  await step(
    a,
    "An incorrect reconstruction cannot close an otherwise supported case",
    async () => {
      await tab(a, "02 / Reason together");
      await a.page
        .getByRole("button", { name: /Check reconstruction & close/ })
        .click();
      await expect(a.page.locator(".ah-error")).toContainText(
        "chronology still conflicts",
      );
      assert.equal((await state(a)).status, "open");
      await screenshot(a, "chronology-guidance", ".ah-error");
    },
  );
  await step(
    null,
    "Two simultaneous chronology moves produce one save and one explicit conflict",
    async () => {
      for (const actor of [a, b]) await tab(actor, "02 / Reason together");
      const held = [],
        url = `**/api/games/${code}/board`;
      for (const actor of [a, b])
        await actor.page.route(url, (route) => {
          held.push({ actor, route });
        });
      const responseA = a.page.waitForResponse(
        (r) => r.url().endsWith("/board") && r.request().method() === "POST",
      );
      const responseB = b.page.waitForResponse(
        (r) => r.url().endsWith("/board") && r.request().method() === "POST",
      );
      await Promise.all([
        a.page
          .locator(".ah-chronology li")
          .nth(1)
          .getByRole("button", { name: /earlier/ })
          .click(),
        b.page
          .locator(".ah-chronology li")
          .nth(2)
          .getByRole("button", { name: /earlier/ })
          .click(),
      ]);
      await expect.poll(() => held.length).toBe(2);
      const payloads = held.map((h) => h.route.request().postDataJSON());
      assert.equal(payloads[0].version, payloads[1].version);
      await Promise.all(held.map((h) => h.route.continue()));
      const responses = await Promise.all([responseA, responseB]);
      assert.deepEqual(responses.map((r) => r.status()).sort(), [200, 409]);
      const loser = responses[0].status() === 409 ? a : b;
      await expect(loser.page.locator(".ah-error")).toContainText(
        "Latest saved state loaded",
      );
      await screenshot(loser, "concurrent-move-feedback", ".ah-error");
      const current = await state(a);
      for (const actor of [a, b]) {
        await expect
          .poll(() =>
            actor.page
              .locator(".ah-chronology li")
              .evaluateAll((nodes) => nodes.map((n) => n.dataset.event)),
          )
          .toEqual(current.order);
        await actor.page.unroute(url);
      }
      return {
        statuses: responses.map((r) => r.status()),
        refreshedActor: loser.name,
        sameSubmittedVersion: payloads[0].version,
      };
    },
  );
  await step(
    d,
    "Reconstruct the six events with the visible ordering buttons",
    async () => {
      await tab(d, "02 / Reason together");
      const target = [
        "calibrate",
        "collect",
        "alarm",
        "authorise",
        "move",
        "receive",
      ];
      for (let i = 0; i < target.length; i++) {
        let order = await d.page
          .locator(".ah-chronology li")
          .evaluateAll((nodes) => nodes.map((n) => n.dataset.event));
        while (order.indexOf(target[i]) > i) {
          const response = d.page.waitForResponse(
            (r) =>
              r.url().endsWith("/board") && r.request().method() === "POST",
          );
          await d.page
            .locator(`[data-event="${target[i]}"]`)
            .getByRole("button", { name: /earlier/ })
            .click();
          assert.equal((await response).status(), 200);
          await expect(d.page.locator(".ah-status")).not.toContainText(
            "Saving…",
          );
          order = await d.page
            .locator(".ah-chronology li")
            .evaluateAll((nodes) => nodes.map((n) => n.dataset.event));
        }
      }
      assert.deepEqual((await state(d)).order, target);
    },
  );
  await step(
    null,
    "Close the case and confirm the same conclusion in four browsers",
    async () => {
      await d.page
        .getByRole("button", { name: /Check reconstruction & close/ })
        .click();
      for (const actor of actors) {
        await expect(actor.page.locator(".ah-closed h1")).toContainText(
          "Two journeys. One misunderstanding.",
        );
        await expect(actor.page.locator(".ah-error")).toHaveCount(0);
        await tab(actor, "03 / Case record");
        await expect(actor.page.locator(".ah-ending")).toContainText("18:00");
      }
      await screenshot(a, "conclusion-desktop");
      await screenshot(d, "conclusion-phone");
      const s = await state(a);
      const names = Object.fromEntries(s.members.map((m) => [m.id, m.name]));
      finalRecord = {
        status: s.status,
        act: s.act,
        publishedClues: s.clues.filter((c) => c.sharedBy).length,
        supportedDeductions: s.questions.filter((q) => q.accepted).length,
        savedAttempts: s.attempts,
        notes: s.notes.length,
        order: s.order,
        contributions: s.contributions.map((c) => ({
          actor: names[c.memberId],
          discoveries: c.discoveries,
          publications: c.shared,
          deductions: c.deductions,
        })),
        hints: s.questions
          .filter((q) => q.hintLevel)
          .map((q) => ({ question: q.id, level: q.hintLevel })),
      };
      assert.equal(finalRecord.publishedClues, 16);
      assert.equal(finalRecord.supportedDeductions, 7);
      assert.ok(
        finalRecord.contributions.every(
          (c) => c.publications > 0 && c.deductions > 0,
        ),
      );
      writeFileSync(
        `${output}/server-actions.json`,
        JSON.stringify(
          s.activity.map((x) => ({
            at: x.at,
            actor: x.name,
            seat: x.seat,
            action: x.action,
            detail: x.detail,
          })),
          null,
          2,
        ),
      );
      return finalRecord;
    },
  );
  await step(
    null,
    "Every original identity can reopen its closed game from the home page",
    async () => {
      for (const actor of actors) {
        await actor.page.goto(base);
        await actor.page.locator(`.saved-case[href="/play/${code}"]`).click();
        await expect(actor.page.locator(".ah-closed")).toBeVisible();
        assert.equal((await state(actor)).status, "solved");
      }
    },
  );
  assert.deepEqual(errors, []);
  passed = true;
} catch (e) {
  failure = String(e.stack ?? e);
  for (const actor of actors) {
    try {
      await screenshot(actor, `failure-seat-${actors.indexOf(actor) + 1}`);
    } catch {}
  }
  process.exitCode = 1;
} finally {
  for (const [i, actor] of actors.entries()) {
    try {
      await actor.context.tracing.stop({
        path: `${output}/private-trace-seat-${i + 1}.zip`,
      });
    } catch {}
    await actor.context.close();
  }
  await browser.close();
  const report = {
    method:
      "Scripted independent browser actors with known answers. No human participants, blind solving or enjoyment measurement.",
    base,
    revision,
    startedAt,
    finishedAt: new Date().toISOString(),
    elapsedMs: Date.now() - started,
    passed,
    failure,
    profiles,
    steps,
    network,
    errors,
    captures,
    finalRecord,
    tracePrivacy:
      "Raw browser traces contain session data and stay under ignored data/. Publish only the sanitized report, journal, server action projection and selected screenshots.",
  };
  writeFileSync(`${output}/results.json`, JSON.stringify(report, null, 2));
  console.log(`${passed ? "PASS" : "FAIL"}: ${output}/results.json`);
  if (failure) console.error(failure);
}
