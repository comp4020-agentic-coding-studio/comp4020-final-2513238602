import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';

const base=process.env.APP_URL??'http://localhost:8082';
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL??'msedge',headless:true});
const checks=[],errors=[];
try {
  const page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.getByRole('button',{name:'Open the case'}).click();
  await page.getByLabel('What should we call you?').fill('Recovery tester');await page.getByRole('button',{name:'Begin investigation'}).click();await page.locator('.evidence-document').waitFor();
  const code=new URL(page.url()).pathname.split('/').pop();const path=`/api/rooms/${code}`;
  const select=async id=>page.locator('.clue-button').filter({has:page.locator('.clue-tag',{hasText:id})}).click();
  const publish=()=>page.getByRole('button',{name:'Add to shared desk'});
  let held;
  await page.route(`**${path}/publish`,route=>{held=route});
  await publish().click();await page.waitForTimeout(1500);
  assert.ok(held);assert.equal(await publish().isDisabled(),true);assert.equal(await page.locator('.published-label').count(),0);assert.equal(await page.locator('.toast.visible').count(),0);
  await held.continue();await page.locator('.published-label').waitFor();await page.unroute(`**${path}/publish`);
  checks.push('A delayed request remains pending with disabled controls and no invented save confirmation');

  await select('F2');
  await page.route(`**${path}/publish`,async route=>{const committed=await route.fetch();assert.equal(committed.status(),200);await route.abort('failed')});
  await publish().click();await page.waitForFunction(()=>document.querySelector('.desk-error')?.textContent.includes('Latest saved state loaded'));
  assert.match(await page.locator('.desk-error').innerText(),/may already be saved/);await page.locator('.published-label').waitFor();assert.equal(await page.locator('.toast.visible').count(),0);
  await page.unroute(`**${path}/publish`);
  checks.push('A lost response after server commit refreshes the saved clue without claiming the write failed or automatically retrying it');

  await select('F3');held=undefined;await page.route(`**${path}/publish`,route=>{held=route});
  const started=performance.now();await publish().click();
  await page.waitForFunction(()=>document.querySelector('.desk-error')?.textContent.includes('Latest saved state loaded'),undefined,{timeout:16000});
  const elapsed=Math.round(performance.now()-started);assert.ok(elapsed<16000);assert.equal(await publish().isEnabled(),true);assert.equal(await page.locator('.published-label').count(),0);
  await held.abort().catch(()=>{});await page.unroute(`**${path}/publish`);
  checks.push(`An unanswered write times out and recovers controls (${elapsed}ms); no publication was invented`);

  await page.route(`**${path}/board`,async route=>{
    const data=route.request().postDataJSON();const response=await route.fetch({postData:JSON.stringify({...data,version:-1})});assert.equal(response.status(),409);
    await page.route(`**${path}`,route=>route.abort('failed'));await route.fulfill({response});
  });
  await page.getByRole('button',{name:'Move Sunlight reaches the work earlier',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.desk-error')?.textContent.includes('Could not refresh'));
  assert.doesNotMatch(await page.locator('.desk-error').innerText(),/Latest saved state loaded/);
  checks.push('A real stale-write rejection with a failed recovery request does not falsely claim the latest order was loaded');
  assert.deepEqual(errors,[]);
} finally {
  mkdirSync('evidence',{recursive:true});writeFileSync('evidence/resilience-results.json',JSON.stringify({checkedAt:new Date().toISOString(),base,checks,errors},null,2));await browser.close();
}
console.log(checks.join('\n'));
