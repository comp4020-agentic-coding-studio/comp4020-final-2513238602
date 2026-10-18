import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';

const base=process.env.APP_URL??'http://localhost:8082';
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL??'msedge',headless:true});
const checks=[],errors=[];
const watch=page=>page.on('pageerror',error=>errors.push(error.message));
async function start(page,name,duo=false){
  await page.getByRole('button',{name:'Open the case'}).click();
  await page.getByLabel('What should we call you?').fill(name);
  if(duo)await page.getByRole('radio',{name:/Bring a partner/}).check();
}
async function files(context){
  const response=await context.request.get(`${base}/api/me`);
  assert.equal(response.status(),200);return (await response.json()).investigations;
}
try {
  const owner=await browser.newContext({viewport:{width:1920,height:1080}});
  const page=await owner.newPage();watch(page);
  let identityRequests=0,heldIdentity,identitySeen;
  const identityArrived=new Promise(resolve=>{identitySeen=resolve});
  await page.route('**/api/me',route=>{identityRequests++;heldIdentity=route;identitySeen()});
  let created,creates=0;
  await page.route('**/api/rooms',async route=>{
    assert.equal(route.request().method(),'POST');creates++;
    assert.ok(route.request().headers().cookie?.includes('lf_session='),'Creation must carry the confirmed browser identity');
    const response=await route.fetch();assert.equal(response.status(),201);created=await response.json();
    await route.abort('failed');
  });
  await page.goto(base,{waitUntil:'domcontentloaded'});await identityArrived;
  await start(page,'Lost confirmation',true);
  await page.getByRole('button',{name:'Begin investigation'}).click();
  await page.getByRole('button',{name:'Opening…',exact:true}).waitFor();
  assert.equal(creates,0);assert.equal(identityRequests,1);
  await heldIdentity.continue();await page.unroute('**/api/me');
  await page.getByRole('button',{name:'Create another investigation',exact:true}).waitFor();
  assert.equal(creates,1);assert.ok(created);
  assert.match(await page.locator('.start-form [role="alert"]').innerText(),/may already be saved/);
  assert.doesNotMatch(await page.locator('.start-form [role="alert"]').innerText(),/Failed to fetch|creation failed/i);
  assert.deepEqual((await files(owner)).map(room=>room.code),[created.code]);
  await page.getByLabel('What should we call you?').press('Enter');
  assert.deepEqual((await files(owner)).map(room=>room.code),[created.code]);assert.equal(creates,1);
  checks.push('Entry shares the pending identity confirmation; a committed creation with a lost reply stays one room and is never silently retried');

  await page.getByRole('link',{name:'View existing investigations'}).click();
  await page.locator(`.saved-case[href="/case/${created.code}"]`).waitFor();
  assert.equal(await page.locator('.saved-case').count(),1);
  await page.locator(`.saved-case[href="/case/${created.code}"]`).click();
  await page.locator('.evidence-document').waitFor();
  assert.equal(new URL(page.url()).pathname,`/case/${created.code}`);
  checks.push('The uncertain creation links back to refreshed case files, where the original room is recoverable');

  const partner=await browser.newContext({viewport:{width:390,height:844}});
  const joinedPage=await partner.newPage();watch(joinedPage);
  let joined,joins=0;
  await joinedPage.route(`**/api/rooms/${created.code}/join`,async route=>{
    joins++;const response=await route.fetch();assert.equal(response.status(),200);joined=await response.json();
    await route.abort('failed');
  });
  await joinedPage.goto(`${base}/case/${created.code}`);
  await joinedPage.getByLabel('What should we call you?').fill('Joined once');
  await joinedPage.getByRole('button',{name:'Join investigation',exact:true}).click();
  await joinedPage.locator('.evidence-document').waitFor();
  const recovered=await (await partner.request.get(`${base}/api/rooms/${created.code}`)).json();
  assert.equal(recovered.me.id,joined.me.id);assert.equal(recovered.members.length,2);assert.equal(joins,1);
  assert.equal(recovered.activity.filter(event=>event.action==='joined').length,1);
  assert.deepEqual((await files(partner)).map(room=>room.code),[created.code]);
  checks.push('A committed join with a lost reply retrieves the known room and preserves the same member and single archive seat');

  const blocked=await browser.newContext({viewport:{width:390,height:844}});
  const blockedPage=await blocked.newPage();watch(blockedPage);
  let blockedCreates=0;
  blockedPage.on('request',request=>{if(request.method()==='POST'&&new URL(request.url()).pathname==='/api/rooms')blockedCreates++});
  await blockedPage.route('**/api/me',route=>route.abort('failed'));
  await blockedPage.goto(base);await start(blockedPage,'No identity');
  await blockedPage.getByRole('button',{name:'Begin investigation'}).click();
  await blockedPage.getByText('Could not prepare this browser to save your investigation.',{exact:false}).waitFor();
  assert.equal(blockedCreates,0);assert.deepEqual(await files(blocked),[]);
  await blockedPage.unroute('**/api/me');
  let anotherOriginal;
  await blockedPage.route('**/api/rooms',async route=>{
    const response=await route.fetch();assert.equal(response.status(),201);anotherOriginal=await response.json();
    await route.abort('failed');
  });
  await blockedPage.getByRole('button',{name:'Begin investigation'}).click();
  await blockedPage.getByRole('button',{name:'Create another investigation',exact:true}).waitFor();
  assert.deepEqual((await files(blocked)).map(room=>room.code),[anotherOriginal.code]);assert.equal(blockedCreates,1);
  await blockedPage.unroute('**/api/rooms');
  await blockedPage.getByRole('button',{name:'Create another investigation',exact:true}).click();
  await blockedPage.locator('.evidence-document').waitFor();
  const anotherFiles=await files(blocked);
  assert.equal(anotherFiles.length,2);assert.equal(blockedCreates,2);
  assert.notEqual(new URL(blockedPage.url()).pathname,`/case/${anotherOriginal.code}`);
  checks.push('An unavailable identity check sends no creation; a second room is created only through the explicitly labelled choice');

  const secondRoomResponse=await owner.request.post(`${base}/api/rooms`,{data:{name:'Recovery host',mode:'duo'}});
  assert.equal(secondRoomResponse.status(),201);const secondRoom=await secondRoomResponse.json();
  const delayed=await browser.newContext({viewport:{width:390,height:844}});
  const delayedPage=await delayed.newPage();watch(delayedPage);
  let delayedJoins=0,delayedMember;
  await delayedPage.goto(`${base}/case/${secondRoom.code}`);
  await delayedPage.getByLabel('What should we call you?').fill('Unconfirmed seat');
  await delayedPage.route(`**/api/rooms/${secondRoom.code}/join`,async route=>{
    delayedJoins++;const response=await route.fetch();assert.equal(response.status(),200);delayedMember=(await response.json()).me.id;
    await delayedPage.route(`**/api/rooms/${secondRoom.code}`,snapshot=>snapshot.abort('failed'));
    await route.abort('failed');
  });
  await delayedPage.getByRole('button',{name:'Join investigation',exact:true}).click();
  await delayedPage.getByRole('button',{name:'Check this investigation',exact:true}).waitFor();
  assert.match(await delayedPage.locator('.start-form [role="alert"]').innerText(),/may already have joined/);
  await delayedPage.unroute(`**/api/rooms/${secondRoom.code}`);
  await delayedPage.getByRole('button',{name:'Check this investigation',exact:true}).click();
  await delayedPage.locator('.evidence-document').waitFor();
  const delayedSaved=await (await delayed.request.get(`${base}/api/rooms/${secondRoom.code}`)).json();
  assert.equal(delayedJoins,1);assert.equal(delayedSaved.me.id,delayedMember);assert.equal(delayedSaved.members.length,2);
  checks.push('When join recovery also fails, the next action checks saved membership without posting another join');
  assert.deepEqual(errors,[]);
} finally {
  mkdirSync('evidence',{recursive:true});
  writeFileSync('evidence/entry-results.json',JSON.stringify({checkedAt:new Date().toISOString(),base,checks,errors},null,2));
  await browser.close();
}
console.log(checks.join('\n'));
