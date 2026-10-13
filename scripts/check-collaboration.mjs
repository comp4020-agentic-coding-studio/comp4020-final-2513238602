import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';

const base=process.env.APP_URL??'http://localhost:8082';
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL??'msedge',headless:true});
const checks=[],samples=[],errors=[];
const limit=Number(process.env.REALTIME_LIMIT_MS??1000);
const poll=async(page,fn,arg)=>page.waitForFunction(fn,arg,{timeout:10000,polling:16});
const clue=(page,id)=>page.locator('.clue-button').filter({has:page.locator('.clue-tag',{hasText:id})});
async function measured(sender,receiver,action,click,observed,arg){
  let started;
  const listener=request=>{if(request.method()==='POST'&&request.url().endsWith(`/${action}`))started=performance.now()};
  sender.on('request',listener);
  try { await click();await poll(receiver,observed,arg);assert.ok(started);samples.push({action,ms:Math.round(performance.now()-started)}); }
  finally {sender.off('request',listener)}
}
try {
  const a=await browser.newContext({viewport:{width:1920,height:1080}});
  const b=await browser.newContext({viewport:{width:390,height:844}});
  const pa=await a.newPage(),pb=await b.newPage();
  for(const page of [pa,pb])page.on('pageerror',e=>errors.push(e.message));
  await pa.goto(base);await pa.getByRole('button',{name:'Open the case'}).click();
  await pa.getByLabel('What should we call you?').fill('Field tester');
  await pa.getByRole('radio',{name:/Bring a partner/}).check();
  await pa.getByRole('button',{name:'Begin investigation'}).click();await pa.locator('.evidence-document').waitFor();
  const path=new URL(pa.url()).pathname;const apiPath=`/api/rooms/${path.split('/').pop()}`;
  await pb.goto(`${base}${path}`);await pb.getByLabel('What should we call you?').fill('Archive tester');
  await pb.getByRole('button',{name:'Join investigation'}).click();await pb.locator('.evidence-document').waitFor();
  await poll(pa,()=>document.querySelector('.shared-update')?.textContent.includes('Archive tester'));
  assert.equal(await pa.locator('.clue-button').count(),4);assert.equal(await pb.locator('.clue-button').count(),4);
  checks.push('Two isolated browser identities join from the visible interface and receive different folders');
  for(const [sender,receiver,prefix] of [[pb,pa,'A'],[pa,pb,'F']]){
    for(let i=1;i<=4;i++){
      const id=`${prefix}${i}`;const selected=await receiver.locator('.evidence-id').innerText();
      await clue(sender,id).click();
      await measured(sender,receiver,'publish',()=>sender.getByRole('button',{name:'Add to shared desk'}).click(),
        id=>[...document.querySelectorAll('.clue-tag')].some(el=>el.textContent===id),id);
      assert.equal(await receiver.locator('.evidence-id').innerText(),selected);
      await poll(receiver,id=>document.querySelector('.shared-update')?.textContent.includes(id),id);
    }
  }
  checks.push('Eight cross-browser publications preserve the reader’s selected document and identify the actor');

  // Hold both real UI requests until both were made against the same version.
  const held=[];
  for(const page of [pa,pb])await page.route(`**${apiPath}/board`,route=>held.push(route));
  const responses=[pa.waitForResponse(r=>r.url().endsWith('/board')),pb.waitForResponse(r=>r.url().endsWith('/board'))];
  await Promise.all([pa.getByRole('button',{name:'Move Sunlight reaches the work earlier',exact:true}).click(),pb.getByRole('button',{name:'Move The move is authorised earlier',exact:true}).click()]);
  assert.equal(held.length,2);assert.equal(held[0].request().postDataJSON().version,held[1].request().postDataJSON().version);
  await Promise.all(held.map(route=>route.continue()));const results=await Promise.all(responses);
  assert.deepEqual(results.map(r=>r.status()).sort(),[200,409]);
  const winner=await results.find(r=>r.status()===200).json();
  const loser=results[0].status()===409?pa:pb;await loser.locator('.desk-error').waitFor();
  const titles=winner.order.map(id=>winner.events.find(event=>event.id===id).title);
  for(const page of [pa,pb]){await page.unroute(`**${apiPath}/board`);await poll(page,titles=>JSON.stringify([...document.querySelectorAll('.timeline-list strong')].map(el=>el.textContent))===JSON.stringify(titles),titles)}
  checks.push('Simultaneous UI moves produce one saved order and one visible conflict; both browsers converge');

  // Use server-provided event titles, so tests do not maintain a second case text.
  const correct=['sun','permission','move','arrival'].map(id=>winner.events.find(event=>event.id===id).title);
  for(const title of correct){
    while((await pa.locator('.timeline-list strong').allTextContents()).indexOf(title)>correct.indexOf(title)){
      const before=await pa.locator('.timeline-list strong').allTextContents();const i=before.indexOf(title);[before[i-1],before[i]]=[before[i],before[i-1]];
      await measured(pa,pb,'board',()=>pa.getByRole('button',{name:`Move ${title} earlier`,exact:true}).click(),
        titles=>JSON.stringify([...document.querySelectorAll('.timeline-list strong')].map(el=>el.textContent))===JSON.stringify(titles),before);
    }
  }
  checks.push('Timeline moves render in the other browser without reload');
  await pb.getByRole('button',{name:'Make your case',exact:true}).click();
  await pa.getByRole('button',{name:'Make your case',exact:true}).click();
  await pa.getByLabel('Who moved the sculpture?').selectOption('eli');await pa.getByLabel('Where did it go?').selectOption('north');
  await pa.getByLabel('Why was it moved?').selectOption('light');await pa.getByLabel('When did it actually leave the gallery?').selectOption('17:30');
  await pa.getByRole('checkbox',{name:/F2/}).check();await pa.getByRole('checkbox',{name:/A4/}).check();
  await measured(pa,pb,'theory',()=>pa.getByRole('button',{name:'Submit explanation'}).click(),
    ()=>!!document.querySelector('.solved-banner')&&!document.querySelector('dialog[open]'));
  checks.push('Partner completion dismisses an obsolete explanation dialog and reveals the shared conclusion');
  for(const page of [pa,pb]){await page.reload();await page.getByRole('heading',{name:'Found, not stolen.'}).waitFor();assert.equal(await page.locator('.clue-button').count(),8)}
  checks.push('Both identities recover shared evidence and solution after refresh');
  assert.deepEqual(errors,[]);assert.ok(samples.every(sample=>sample.ms<limit),`Real-time target ${limit}ms exceeded: ${JSON.stringify(samples)}`);
  checks.push(`All ${samples.length} request-to-observed-render measurements below ${limit}ms`);
} finally {
  mkdirSync('evidence',{recursive:true});writeFileSync('evidence/collaboration-results.json',JSON.stringify({checkedAt:new Date().toISOString(),base,browser:'Chromium',checks,samples,errors,limitMs:limit},null,2));await browser.close();
}
console.log(JSON.stringify({checks,samples},null,2));
