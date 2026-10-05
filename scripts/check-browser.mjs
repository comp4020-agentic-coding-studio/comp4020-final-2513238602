import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
const base=process.env.APP_URL??'http://localhost:8082';
mkdirSync('evidence',{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const checks=[];const errors=[];const axeReports=[];
function watch(page){page.on('pageerror',e=>errors.push(e.message))}
async function checkLayout(page,label){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${label}: horizontal overflow`);checks.push(`${label}: no horizontal overflow`)}
async function axe(page,label){const r=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();axeReports.push({label,violations:r.violations});assert.deepEqual(r.violations.map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)})),[],`${label}: accessibility violations`);checks.push(`${label}: axe WCAG A/AA scan passed`)}
async function create(page,name,duo=false){await page.goto(base);await page.getByRole('button',{name:'Open the case'}).click();await page.getByLabel('What should we call you?').fill(name);if(duo)await page.getByRole('radio',{name:/Bring a partner/}).check();await page.getByRole('button',{name:'Begin investigation'}).click();await page.locator('.evidence-document').waitFor();return new URL(page.url()).pathname;}
async function publish(page,id){await page.locator('.clue-button').filter({has:page.locator('.clue-tag',{hasText:id})}).click();const response=page.waitForResponse(r=>r.url().endsWith('/publish')&&r.request().method()==='POST');await page.getByRole('button',{name:'Add to shared desk'}).click();assert.equal((await response).status(),200);await page.locator('.published-label').waitFor()}
async function earlier(page,title){const response=page.waitForResponse(r=>r.url().endsWith('/board')&&r.request().method()==='POST');await page.getByRole('button',{name:`Move ${title} earlier`,exact:true}).click();assert.equal((await response).status(),200)}
try{
  for(const viewport of [{width:1920,height:1080},{width:390,height:844}]){
    const context=await browser.newContext({viewport,reducedMotion:'reduce'});const page=await context.newPage();watch(page);
    await page.goto(base);await page.locator('h1').waitFor();await page.evaluate(()=>document.fonts.ready);await checkLayout(page,`Home ${viewport.width}`);await axe(page,`Home ${viewport.width}`);
    await page.screenshot({path:`evidence/home-${viewport.width}.png`,fullPage:true});
    await page.getByRole('button',{name:'Open the case'}).focus();await page.keyboard.press('Enter');await page.getByRole('dialog').waitFor();await axe(page,`Start dialog ${viewport.width}`);await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);checks.push(`Keyboard open and Escape close ${viewport.width}`);
    const path=await create(page,'Taylor');await checkLayout(page,`Desk ${viewport.width}`);await axe(page,`Desk ${viewport.width}`);await page.screenshot({path:`evidence/desk-${viewport.width}.png`,fullPage:true});
    for(const id of ['F1','F2','F3','F4','A1','A2','A3','A4']){
      await page.locator('.clue-button').filter({has:page.locator('.clue-tag',{hasText:id})}).click();await checkLayout(page,`Evidence ${id} ${viewport.width}`);
    }
    await publish(page,'F2');await publish(page,'A4');await page.reload();await page.locator('.evidence-document').waitFor();assert.equal(await page.locator('.folder-tabs').innerText().then(t=>t.includes('2')),true);checks.push(`Saved evidence restored ${viewport.width}`);
    await earlier(page,'Sunlight reaches the work');await earlier(page,'The move is authorised');await earlier(page,'The move is authorised');
    await page.getByRole('button',{name:'Make your case',exact:true}).click();await page.getByLabel('Who moved the sculpture?').selectOption('eli');await page.getByLabel('Where did it go?').selectOption('north');await page.getByLabel('Why was it moved?').selectOption('light');await page.getByLabel('When did it actually leave the gallery?').selectOption('17:36');await page.getByRole('checkbox',{name:/F2/}).check();await page.getByRole('checkbox',{name:/A4/}).check();await axe(page,`Theory dialog ${viewport.width}`);await page.getByRole('button',{name:'Submit explanation'}).click();await page.locator('.theory-feedback').waitFor();assert.match(await page.locator('.theory-feedback').innerText(),/camera/);
    await page.getByLabel('When did it actually leave the gallery?').selectOption('17:30');await page.getByRole('button',{name:'Submit explanation'}).click();await page.getByRole('heading',{name:'Found, not stolen.'}).waitFor();await checkLayout(page,`Solved ${viewport.width}`);await page.screenshot({path:`evidence/solved-${viewport.width}.png`,fullPage:true});await page.reload();await page.getByRole('heading',{name:'Found, not stolen.'}).waitFor();checks.push(`Complete playthrough with wrong and correct explanation ${viewport.width}`);
    await page.getByRole('button',{name:'Read the whole story'}).click();assert.match(await page.locator('.resolution').innerText(),/six minutes fast/);await axe(page,`Resolution ${viewport.width}`);await page.keyboard.press('Escape');
    await page.goto(`${base}/readme/`);await checkLayout(page,`README ${viewport.width}`);await axe(page,`README ${viewport.width}`);assert.match(await page.locator('h1').innerText(),/Lost & Found/);
    await context.close();
  }
  const a=await browser.newContext({viewport:{width:1920,height:1080}});const b=await browser.newContext({viewport:{width:390,height:844}});const pa=await a.newPage(),pb=await b.newPage();watch(pa);watch(pb);
  const path=await create(pa,'Avery',true);assert.equal(await pa.locator('.clue-button').count(),4);await pb.goto(`${base}${path}`);await pb.getByLabel('What should we call you?').fill('Morgan');await pb.getByRole('button',{name:'Join investigation'}).click();await pb.locator('.evidence-document').waitFor();assert.equal(await pb.locator('.clue-button').count(),4);assert.equal(await pa.locator('.clue-tag').filter({hasText:'A2'}).count(),0);
  const start=Date.now();await publish(pb,'A2');await pa.locator('.clue-button').filter({has:pa.locator('.clue-tag',{hasText:'A2'})}).waitFor();const elapsed=Date.now()-start;checks.push(`Partner publication visible without reload (${elapsed}ms including UI clicks)`);
  const code=path.split('/').pop();await pa.route(`**/api/rooms/${code}/publish`,route=>route.abort());await pa.locator('.clue-button').filter({has:pa.locator('.clue-tag',{hasText:'F2'})}).click();await pa.getByRole('button',{name:'Add to shared desk'}).click();await pa.locator('.desk-error').waitFor();assert.equal(await pa.locator('.published-label').count(),0);checks.push('Failed save does not show a success state');await pa.unroute(`**/api/rooms/${code}/publish`);
  await a.setOffline(true);await publish(pb,'A4');await a.setOffline(false);await pa.locator('.clue-button').filter({has:pa.locator('.clue-tag',{hasText:'A4'})}).waitFor({timeout:15000});checks.push('SSE reconnect retrieves missed evidence');
  await pa.setViewportSize({width:390,height:844});await checkLayout(pa,'Resize during duo investigation');await pa.setViewportSize({width:1920,height:1080});await checkLayout(pa,'Resize back during duo investigation');
  await a.close();await b.close();assert.deepEqual(errors,[],'Browser JavaScript errors');checks.push('No browser JavaScript errors');
}finally{writeFileSync('evidence/browser-results.json',JSON.stringify({checkedAt:new Date().toISOString(),browser:'Microsoft Edge / Chromium',base,checks,errors,axeReports},null,2));await browser.close();}
console.log(checks.join('\n'));
