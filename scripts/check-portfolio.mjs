import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve, sep } from 'node:path';
import { marked } from 'marked';

// This final-specific check supplements the course's per-crit evidence check.
// Presence and working references are mechanical; authenticity and quality are not.
const required = new Map([
  ['README.md', [400, 600]], ['PROCESS.md', [900, 1100]],
  ['research-note.md', [600, 800]], ['CLAUDE.md', null],
  ['reflections/crit-8.md', [150, 300]], ['reflections/crit-9.md', [150, 300]],
  ['reflections/crit-10.md', [150, 300]], ['PRODUCT.md', null],
  ['DESIGN.md', null], ['docs/case-design.md', null],
]);
const root = process.cwd();
const errors = [], advice = [];
const commits = new Set();
for (const [file, range] of required) {
  if (!existsSync(file)) { errors.push(`Missing ${file}`); continue; }
  const source = readFileSync(file, 'utf8').trim();
  if (!source) { errors.push(`Empty ${file}`); continue; }
  if (/TEMPLATE:|Student prompt:|\[INSERT YOUR/i.test(source)) errors.push(`Unfilled scaffold in ${file}`);
  const words = source.split(/\s+/).length;
  if (range) {
    console.log(`${file}: ${words} words (including headings and links)`);
    if (words < range[0] || words > range[1]) advice.push(`${file}: guidance is ${range.join('–')} words; review scope, not an automatic grade penalty.`);
  }
  marked.walkTokens(marked.lexer(source), token => {
    if (token.type !== 'link' && token.type !== 'image') return;
    const href = token.href;
    if (!href.startsWith('#') && !/^[a-z][a-z\d+.-]*:/i.test(href)) {
      let target;
      try { target = resolve(dirname(resolve(root, file)), decodeURIComponent(href.split(/[?#]/)[0])); }
      catch { errors.push(`Invalid local link in ${file}`); return; }
      if (target !== root && !target.startsWith(root + sep)) errors.push(`Local link leaves the repository in ${file}`);
      else if (!existsSync(target)) errors.push(`Broken local link in ${file}: ${href}`);
    }
    if (token.type === 'link' && /^`?[a-f0-9]{7,40}(?:\.\.\.[a-f0-9]{7,40})?`?$/.test(token.text)) {
      for (const sha of token.text.replaceAll('`', '').split('...')) commits.add(sha);
    }
  });
}
for (const sha of commits) {
  try { execFileSync('git', ['cat-file', '-e', `${sha}^{commit}`], { stdio: 'ignore' }); }
  catch { errors.push(`Cited commit does not resolve: ${sha}`); }
}
for (const notice of advice) console.log(`ADVICE: ${notice}`);
for (const error of errors) console.error(`FAIL: ${error}`);
console.log('EVIDENCE LIMIT: these checks do not certify source reading, classroom participation or human playtests; the dated claim-review record states the scope of student review.');
if (errors.length) process.exitCode = 1;
else console.log(`PASS: all three reflections and final documents present; local links and ${commits.size} cited commits resolve.`);
