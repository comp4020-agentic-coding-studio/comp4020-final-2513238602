import { chromium, expect } from 'playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';

const base=(process.env.APP_URL??'http://127.0.0.1:8086').replace(/\/$/,'');
const output=process.env.AFTER_HOURS_OUTPUT??'data/after-hours-browser';
mkdirSync(output,{recursive:true});
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL??'msedge',headless:true});
const checks=[],errors=[],axeReports=[];
const watch=p=>p.on('pageerror',e=>errors.push(e.message));
async function layout(page,label){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${label} overflow`);checks.push(`${label}: no overflow`);}
async function axe(page,label){const r=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();axeReports.push({label,violations:r.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))});assert.deepEqual(axeReports.at(-1).violations,[],label);}
async function workspace(page,name){await page.getByRole('button',{name:new RegExp(name)}).click();}
async function select(page,id){await workspace(page,'01 / Explore rooms');const room=id[0]==='G'?'The exhibition':id[0]==='W'?'The workshop':id[0]==='M'?'The watch room':'The north store';await page.getByRole('navigation',{name:'Investigation rooms'}).getByRole('button',{name:new RegExp(room)}).click();await page.locator(`[data-object="${id}"]`).click();await expect(page.locator('.ah-inspector')).toHaveAttribute('data-selected',id);}
async function inspectShare(page,id){await select(page,id);const inspect=page.locator('.ah-inspector .button.primary');await inspect.click();await expect(page.getByRole('button',{name:'Share this evidence'})).toBeVisible();const response=page.waitForResponse(r=>r.url().endsWith('/publish')&&r.request().method()==='POST');await page.getByRole('button',{name:'Share this evidence'}).click();assert.equal((await response).status(),200);await expect(page.locator('.ah-shared')).toBeVisible();}
async function claim(page,id,answer,evidence){await workspace(page,'02 / Reason together');const titles={cargo:'What left first?',courier:'Who made the first trip?',time:'When did the lantern move?',route:'Which route was possible?',technician:'Who moved the lantern?',destination:'Where did it finish?',reason:'Why was it moved?'};await page.getByRole('navigation',{name:'Open deductions'}).getByRole('button',{name:new RegExp(titles[id].replaceAll('?','\\?'))}).click();await page.getByLabel('Your explanation',{exact:true}).selectOption(answer);for(const c of evidence)await page.locator('.ah-cite').getByRole('checkbox',{name:new RegExp(`^${c} `)}).check();await page.getByRole('button',{name:'Test deduction'}).click();await expect(page.locator(`[data-question="${id}"]`)).toHaveClass(/is-supported/);}
try {
  const a=await browser.newContext({viewport:{width:1920,height:1080}}),b=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const pa=await a.newPage(),pb=await b.newPage();watch(pa);watch(pb);
  await pa.goto(`${base}/after-hours`);await pa.getByLabel('Your investigator name').fill('Avery');await pa.getByRole('button',{name:/^Start After Hours/}).click();await expect(pa.locator('.ah-chapter h1')).toBeVisible();
  const path=new URL(pa.url()).pathname;await pb.goto(`${base}${path}`);await pb.getByLabel('Your investigator name').fill('Morgan');await pb.getByRole('button',{name:/^Join After Hours/}).click();await expect(pb.locator('.ah-chapter h1')).toBeVisible();await expect(pa.getByRole('button',{name:'Team & invite · 2/4'})).toBeVisible();
  await expect(pa.locator('[data-scene-ready="true"]')).toBeVisible();await pa.screenshot({path:`${output}/gallery-1920.png`,fullPage:true});await pb.screenshot({path:`${output}/gallery-390.png`,fullPage:true});
  await layout(pa,'Desktop exploration');await layout(pb,'Phone exploration');await axe(pa,'Desktop exploration');await axe(pb,'Phone exploration');
  await inspectShare(pa,'G3');await expect(pb.locator('.ah-shared-strip')).toContainText('The underside says RX-17');checks.push('A 3D scene renders; an object inspection becomes shared evidence in the independent phone browser');
  await inspectShare(pb,'W2');await inspectShare(pa,'W3');await inspectShare(pb,'G2');
  await claim(pa,'cargo','empty',['G3','W2']);await claim(pb,'courier','jules',['G2','W3']);await expect(pa.locator('.ah-chapter h1')).toContainText('The clocks disagree');checks.push('Both players supply complementary evidence; two supported deductions unlock act two in both browsers');
  await layout(pb,'Phone reasoning');await axe(pb,'Phone reasoning');await pa.reload();await expect(pa.locator('.ah-chapter h1')).toContainText('The clocks disagree');
  await pa.getByRole('button',{name:'Use object list only'}).click();await expect(pa.locator('.ah-scene-fallback')).toBeVisible();await select(pa,'M1');await pa.locator('.ah-inspector .button.primary').click();await expect(pa.getByRole('button',{name:'Share this evidence'})).toBeVisible();checks.push('Saved act progress survives reload; investigation works with the 3D canvas disabled');
  assert.deepEqual(errors,[],'Browser JavaScript errors');await a.close();await b.close();
} finally {writeFileSync(`${output}/results.json`,JSON.stringify({checkedAt:new Date().toISOString(),base,checks,errors,axeReports},null,2));await browser.close();}
console.log(checks.join('\n'));
