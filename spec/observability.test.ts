import { it, expect } from 'vitest';
import { serverFixture, wait } from './server-fixture.ts';

it('attributes only committed actions and distinguishes denial without exposing credentials',async()=>{
  const server=await serverFixture();
  try {
    await server.start();const field=await server.client(),archive=await server.client(),stranger=await server.client();
    const opened=await field.call('/api/rooms',{name:'Private nickname F',mode:'duo'});const room=opened.value;const path=`/api/rooms/${room.code}`;
    const joined=await archive.call(`${path}/join`,{name:'Private nickname A'});const other=joined.value.me;
    await field.call(`${path}/publish`,{id:'F2'});const published=await archive.call(`${path}/publish`,{id:'A4'});
    const results=await Promise.all([field.call(`${path}/board`,{version:published.value.version,order:['sun','permission','move','arrival']}),archive.call(`${path}/board`,{version:published.value.version,order:['arrival','move','permission','sun']})]);
    expect(results.map(x=>x.status).sort()).toEqual([200,409]);
    expect((await archive.call(`${path}/publish`,{id:'F1'})).status).toBe(403);
    expect((await stranger.call(path)).status).toBe(403);
    const current=(await field.call(path)).value;
    await field.call(`${path}/board`,{version:current.version,order:['sun','permission','move','arrival']});
    const theory={who:'eli',where:'north',why:'light',when:'17:30',evidence:['F2','A4']};
    await archive.call(`${path}/theory`,{...theory,when:'17:36'});await field.call(`${path}/theory`,theory);
    for(let i=0;i<50&&!server.events().some(e=>e.action==='solved');i++)await wait(20);
    const events=server.events().filter(e=>e.room===room.code);
    const saved=events.filter(e=>e.outcome==='committed');
    expect(saved.map(e=>e.action)).toEqual(['opened','joined','published','published','arranged','arranged','hypothesis','solved']);
    expect(saved.filter(e=>e.action==='published').map(e=>[e.member,e.role])).toEqual([[room.me.id,'field'],[other.id,'archive']]);
    expect(saved.filter(e=>e.action==='arranged').at(-1).detail).toContain('→');
    expect(saved.every(e=>Number.isInteger(e.eventId)&&Number.isInteger(e.version)&&e.at)).toBe(true);
    const persisted=(await field.call(path)).value.activity;
    expect(saved.map(e=>e.eventId).sort()).toEqual(persisted.map((e:{id:number})=>e.id).sort());
    const denied=events.filter(e=>e.outcome==='rejected');expect(denied.map(e=>e.status).sort()).toEqual([403,403,409]);
    expect(denied.find(e=>e.operation==='publish').member).toBe(other.id);
    for(const sensitive of [field.cookie,archive.cookie,stranger.cookie,'Private nickname','FLY_API_TOKEN','six minutes FAST'])expect(server.output().includes(sensitive)).toBe(false);
  } finally {await server.close()}
},15000);
