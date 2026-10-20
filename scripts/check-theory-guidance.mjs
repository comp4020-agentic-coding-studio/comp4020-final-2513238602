import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';

const base=(process.env.APP_URL??'http://localhost:8082').replace(/\/$/,'');
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL??'msedge',headless:true});
const checks=[],errors=[],axeReports=[];
const answers={
  'Who moved the sculpture?':'mara',
  'Where did it go?':'studio',
  'Why was it moved?':'repair',
  'When did it actually leave the gallery?':'17:34',
};
const watch=page=>page.on('pageerror',error=>errors.push(error.message));
const clue=(page,id)=>page.locator('.clue-button').filter({has:page.locator('.clue-tag',{hasText:id})});
const theoryDialog=page=>page.getByRole('dialog',{name:'Make your case',exact:true});
async function create(page,name,duo=false){
  await page.goto(base);await page.getByRole('button',{name:'Open the case'}).click();
  await page.getByLabel('What should we call you?').fill(name);
  if(duo)await page.getByRole('radio',{name:/Bring a partner/}).check();
  await page.getByRole('button',{name:'Begin investigation'}).click();
  await page.locator('.evidence-document').waitFor();return new URL(page.url()).pathname;
}
async function publish(page,id){
  await clue(page,id).click();
  const response=page.waitForResponse(result=>result.url().endsWith('/publish')&&result.request().method()==='POST');
  await page.getByRole('button',{name:'Add to shared desk',exact:true}).click();
  assert.equal((await response).status(),200);await page.locator('.published-label').waitFor();
}
async function openTheory(page){
  await page.getByRole('button',{name:'Make your case',exact:true}).click();
  const dialog=theoryDialog(page);await dialog.waitFor();return dialog;
}
async function fillAnswers(dialog){for(const [label,value] of Object.entries(answers))await dialog.getByLabel(label,{exact:true}).selectOption(value)}
async function preservedDraft(dialog){
  for(const [label,value] of Object.entries(answers))assert.equal(await dialog.getByLabel(label,{exact:true}).inputValue(),value);
  assert.equal(await dialog.getByRole('checkbox',{name:/F1/}).isChecked(),true);
}
async function savedRoom(context,path){
  const response=await context.request.get(`${base}/api/rooms/${path.split('/').pop()}`);
  assert.equal(response.status(),200);return response.json();
}
function countAttempts(page){
  let count=0;
  page.on('request',request=>{if(request.method()==='POST'&&new URL(request.url()).pathname.endsWith('/theory'))count++});
  return ()=>count;
}
async function incomplete(dialog){
  const submit=dialog.getByRole('button',{name:'Submit explanation',exact:true});
  assert.equal(await submit.isEnabled(),true,'An incomplete explanation must explain what is missing when submitted');
  await submit.click();
  const error=dialog.getByRole('alert');await error.waitFor();
  assert.match(await error.innerText(),/archive/i);
  return error;
}
async function inspectMissingState(page,error,width){
  await error.scrollIntoViewIfNeeded();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  const violations=result.violations.map(item=>({id:item.id,impact:item.impact,targets:item.nodes.map(node=>node.target)}));
  axeReports.push({label:`Incomplete explanation ${width}`,violations});
  assert.deepEqual(violations,[],`Incomplete explanation at ${width}px must pass axe A/AA`);
  // A fixed modal over a long desk must be captured at the real viewport; a
  // full-page screenshot stitches unrelated background outside its backdrop.
  await page.evaluate(()=>{if(document.activeElement instanceof HTMLElement)document.activeElement.blur()});
  await theoryDialog(page).getByRole('button',{name:'Submit explanation',exact:true}).scrollIntoViewIfNeeded();
  await page.screenshot({path:`evidence/theory-guidance-${width}.png`,fullPage:false});
  checks.push(`The one-field-clue explanation at ${width}px exposes its missing archive evidence, has no horizontal overflow and passes axe A/AA`);
}
async function submitAndVerify(page,dialog,context,path,count){
  const responsePromise=page.waitForResponse(response=>response.url().endsWith('/theory')&&response.request().method()==='POST');
  await dialog.getByRole('button',{name:'Submit explanation',exact:true}).click();
  const response=await responsePromise;assert.equal(response.status(),200);
  const result=await response.json();assert.equal(result.attempts,1);assert.equal(result.status,'open');assert.ok(result.lastFeedback);
  await dialog.locator('.theory-feedback').waitFor();
  assert.equal(await dialog.locator('.theory-feedback').innerText(),result.lastFeedback);
  const persisted=await savedRoom(context,path);assert.equal(persisted.attempts,1);assert.equal(persisted.lastFeedback,result.lastFeedback);
  assert.equal(count(),1,'Only the complete citation request should reach the server');
}

mkdirSync('evidence',{recursive:true});
try {
  for(const viewport of [{width:1920,height:1080},{width:390,height:844}]){
    const context=await browser.newContext({viewport,reducedMotion:'reduce'});
    const page=await context.newPage();watch(page);const attempts=countAttempts(page);
    const path=await create(page,'Citation reviewer');await publish(page,'F1');
    await page.locator('.folder-tabs').getByRole('button',{name:/Shared desk/}).click();
    assert.equal(await page.locator('.clue-button').count(),1);
    let dialog=await openTheory(page);await fillAnswers(dialog);
    await dialog.getByRole('checkbox',{name:/F1/}).check();
    assert.equal(await dialog.getByRole('checkbox').count(),1);
    await dialog.getByRole('group',{name:/^Field evidence Selected$/}).waitFor();
    await dialog.getByRole('group',{name:/^Archive evidence Still needed$/}).waitFor();
    const error=await incomplete(dialog);
    assert.equal(attempts(),0);assert.equal((await savedRoom(context,path)).attempts,0);
    await inspectMissingState(page,error,viewport.width);

    await dialog.getByRole('button',{name:'Read an archive clue',exact:true}).click();
    await dialog.waitFor({state:'detached'});
    await page.waitForFunction(()=>document.activeElement?.id==='document');
    assert.equal(await page.locator('.folder-tabs').getByRole('button',{name:'Your folder',exact:true}).getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('.clue-button').count(),8);
    const archiveId=await page.locator('.evidence-id').innerText();assert.match(archiveId,/^A[1-4]$/);
    await publish(page,archiveId);
    await page.getByRole('button',{name:'Return to explanation',exact:true}).click();
    dialog=theoryDialog(page);await dialog.waitFor();await preservedDraft(dialog);
    await dialog.getByRole('checkbox',{name:new RegExp(archiveId)}).check();
    await submitAndVerify(page,dialog,context,path,attempts);
    checks.push(`Solo at ${viewport.width}px exits the shared-only filter, focuses an archive document and returns with all four answers and F1 retained; only the supported attempt is saved`);
    await context.close();
  }

  const field=await browser.newContext({viewport:{width:1920,height:1080},reducedMotion:'reduce'});
  const archive=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const fieldPage=await field.newPage(),archivePage=await archive.newPage();watch(fieldPage);watch(archivePage);
  const attempts=countAttempts(fieldPage);
  const path=await create(fieldPage,'Field reviewer',true);await publish(fieldPage,'F1');
  let dialog=await openTheory(fieldPage);await fillAnswers(dialog);await dialog.getByRole('checkbox',{name:/F1/}).check();
  await incomplete(dialog);assert.equal(attempts(),0);
  const invite=dialog.getByRole('button',{name:'Invite your partner',exact:true});await invite.waitFor();
  await invite.click();
  const invitation=fieldPage.getByRole('dialog',{name:'The story has two sides.',exact:true});await invitation.waitFor();
  assert.equal(await invitation.getByLabel('Invitation link',{exact:true}).inputValue(),`${base}${path}`);
  await invitation.getByRole('button',{name:'Close dialog',exact:true}).click();
  dialog=await openTheory(fieldPage);await preservedDraft(dialog);
  const sameDialog=await dialog.elementHandle();
  let navigations=0;
  fieldPage.on('framenavigated',frame=>{if(frame===fieldPage.mainFrame())navigations++});
  await archivePage.goto(`${base}${path}`);
  await archivePage.getByLabel('What should we call you?').fill('Archive reviewer');
  await archivePage.getByRole('button',{name:'Join investigation',exact:true}).click();await archivePage.locator('.evidence-document').waitFor();
  await dialog.getByText(/ask your partner to share an archive clue/i).waitFor();
  assert.equal(await dialog.getByRole('button',{name:'Invite your partner',exact:true}).count(),0);
  assert.equal(await dialog.getByRole('checkbox',{name:/A1/}).count(),0);
  assert.equal((await savedRoom(field,path)).clues.some(item=>item.id==='A1'),false);
  checks.push('An unfilled cooperative folder offers the real invitation; after a partner joins, the open draft explains that the partner must share and keeps private evidence unavailable');

  await publish(archivePage,'A1');
  const shared=dialog.getByRole('checkbox',{name:/A1/});await shared.waitFor();
  assert.equal(await sameDialog.evaluate(element=>element.isConnected&&element.open),true);
  assert.equal(navigations,0);await preservedDraft(dialog);
  await shared.check();await submitAndVerify(fieldPage,dialog,field,path,attempts);
  checks.push('A partner publication appears through the live connection in the same open explanation dialog without navigation or lost draft; selecting it permits one saved attempt with server feedback');

  await dialog.getByRole('button',{name:'Back to evidence',exact:true}).click();
  await fieldPage.getByRole('button',{name:'Return to explanation',exact:true}).waitFor();
  // Complete through the other real identity over HTTP while this browser is
  // reviewing evidence. This checks its live response, not puzzle discovery.
  const state=await savedRoom(archive,path);
  const endpoint=`${base}/api/rooms/${path.split('/').pop()}`;
  const ordered=await archive.request.post(`${endpoint}/board`,{data:{version:state.version,order:['sun','permission','move','arrival']}});
  assert.equal(ordered.status(),200);
  const solved=await archive.request.post(`${endpoint}/theory`,{data:{who:'eli',where:'north',why:'light',when:'17:30',evidence:['F1','A1']}});
  assert.equal(solved.status(),200);assert.equal((await solved.json()).status,'solved');
  await fieldPage.getByRole('heading',{name:'Found, not stolen.',exact:true}).waitFor();
  assert.equal(await fieldPage.getByRole('button',{name:'Return to explanation',exact:true}).count(),0);
  assert.equal(await fieldPage.getByRole('button',{name:'Submit explanation',exact:true}).count(),0);
  assert.equal(navigations,0);
  checks.push('If the partner resolves the case during evidence review, the live solved state removes the obsolete return-to-explanation action');
  await field.close();await archive.close();assert.deepEqual(errors,[]);
} finally {
  writeFileSync('evidence/theory-guidance-results.json',JSON.stringify({checkedAt:new Date().toISOString(),base,checks,errors,axeReports},null,2));
  await browser.close();
}
console.log(checks.join('\n'));
