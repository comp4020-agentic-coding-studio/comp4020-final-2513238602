import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const base = "https://comp4020-final-2513238602.fly.dev";
const file = "data/after-hours-persistence-fixture.json"; // Ignored: test session cookies stay local.
async function request(path, cookie, data) {
  const response = await fetch(`${base}${path}`, {
    method: data === undefined ? "GET" : "POST",
    headers: {
      ...(cookie ? { cookie } : {}),
      ...(data === undefined ? {} : { "content-type": "application/json" }),
    },
    body: data === undefined ? undefined : JSON.stringify(data),
    signal: AbortSignal.timeout(60000),
  });
  assert.ok(
    response.ok,
    `Verification request returned HTTP ${response.status}`,
  );
  return { response, state: await response.json() };
}
function persistent(state) {
  return {
    caseId: state.caseId,
    seed: state.seed,
    status: state.status,
    version: state.version,
    me: state.me,
    members: state.members,
    assignments: state.assignments,
    clues: state.clues,
    questions: state.questions,
    order: state.order,
    notes: state.notes,
    contributions: state.contributions,
  };
}
if (process.argv[2] === "seed") {
  assert.equal(
    existsSync(file),
    false,
    "A fixture already exists. Verify it; do not silently replace the original identities.",
  );
  const cookies = [];
  for (let i = 0; i < 2; i++) {
    const { response } = await request("/api/me");
    const cookie = response.headers.get("set-cookie")?.split(";")[0];
    assert.ok(cookie);
    cookies.push(cookie);
  }
  const { state: created } = await request("/api/games", cookies[0], {
    name: "Persistent scene",
  });
  const path = `/api/games/${created.code}`;
  await request(`${path}/join`, cookies[1], { name: "Persistent archive" });
  for (const [index, id] of [
    [0, "G3"],
    [1, "W2"],
  ]) {
    await request(`${path}/inspect`, cookies[index], { id });
    await request(`${path}/publish`, cookies[index], { id });
  }
  await request(`${path}/claim`, cookies[0], {
    id: "cargo",
    answer: "empty",
    evidence: ["G3", "W2"],
  });
  await request(`${path}/note`, cookies[1], {
    id: "G3",
    text: "The register confirms the collected case contained empty packaging.",
  });
  const expected = [];
  for (const cookie of cookies)
    expected.push(persistent((await request(path, cookie)).state));
  mkdirSync("data", { recursive: true });
  writeFileSync(
    file,
    JSON.stringify({
      createdAt: new Date().toISOString(),
      code: created.code,
      cookies,
      expected,
    }),
  );
  console.log(
    "Saved a two-identity hosted persistence fixture with shared facts, a supported deduction and a discussion note. Cookies remain in ignored local data.",
  );
} else if (process.argv[2] === "verify") {
  const fixture = JSON.parse(readFileSync(file, "utf8"));
  for (let i = 0; i < fixture.cookies.length; i++)
    assert.deepEqual(
      persistent(
        (await request(`/api/games/${fixture.code}`, fixture.cookies[i])).state,
      ),
      fixture.expected[i],
    );
  writeFileSync(
    "data/after-hours-persistence-results.json",
    JSON.stringify(
      {
        base,
        seededAt: fixture.createdAt,
        verifiedAt: new Date().toISOString(),
        passed: true,
        checks: [
          "Both original hosted identities restored",
          "Case version, procedural seed and duties unchanged",
          "Private/shared discoveries, supported deduction, chronology and note retained",
          "Recorded contributions retained",
        ],
        limitations:
          "Uses the original test cookies. Verifies this saved investigation across deployment, not recovery after clearing cookies.",
      },
      null,
      2,
    ),
  );
  console.log(
    "PASS: both hosted identities and their complete saved investigation survived.",
  );
} else throw Error("Use seed before a deployment, then verify afterwards.");
