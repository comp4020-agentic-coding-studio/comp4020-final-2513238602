import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { serverFixture } from './server-fixture.ts';
import { objects, duties } from '../shared/after-hours.ts';
import { rules, chronology } from '../server/after-hours-case.ts';
let service:Awaited<ReturnType<typeof serverFixture>>;
beforeAll(async()=>{service=await serverFixture();await service.start()});
afterAll(async()=>{await service?.close()});
async function team(count=2){
  const people=await Promise.all(Array.from({length:count},()=>service.client()));
  let state=(await people[0].call('/api/games',{name:'Scene'})).value;const path=`/api/games/${state.code}`;
  for(let i=1;i<count;i++)state=(await people[i].call(`${path}/join`,{name:`Player ${i+1}`})).value;
  return {people,path,state};
}
async function shareAct(t:Awaited<ReturnType<typeof team>>,act:number){
  let state=(await t.people[0].call(t.path)).value;
  const roster=await Promise.all(t.people.map(p=>p.call(t.path)));
  for(const object of objects.filter(o=>(o.place==='monitor'?2:o.place==='store'?3:1)<=act)){
    const owner=roster.findIndex(r=>r.value.me.id===state.assignments[object.duty]);
    expect((await t.people[owner].call(`${t.path}/inspect`,{id:object.id})).status).toBe(200);
    const result=await t.people[owner].call(`${t.path}/publish`,{id:object.id});expect(result.status).toBe(200);state=result.value;
  }
  return state;
}
describe('After Hours over real HTTP',()=>{
  it('keeps undiscovered and other-duty evidence private, gates rooms, and makes inspection/publication idempotent',async()=>{
    const t=await team();const a=t.people[0],b=t.people[1];let r=await a.call(t.path);
    expect(r.value.clues).toEqual([]);expect(JSON.stringify(r.value)).not.toContain('78%');expect(r.value.solution).toBeNull();
    expect((await a.call(`${t.path}/inspect`,{id:'G2'})).status).toBe(403);
    expect((await a.call(`${t.path}/inspect`,{id:'M1'})).status).toBe(403);
    expect((await a.call(`${t.path}/publish`,{id:'G1'})).status).toBe(400);
    r=await a.call(`${t.path}/inspect`,{id:'G1'});expect(r.value.clues[0].id).toBe('G1');
    expect((await b.call(t.path)).value.clues).toEqual([]);
    expect((await a.call(`${t.path}/inspect`,{id:'G1'})).value.version).toBe(r.value.version);
    r=await a.call(`${t.path}/publish`,{id:'G1'});expect((await b.call(t.path)).value.clues[0].id).toBe('G1');
    expect((await b.call(`${t.path}/publish`,{id:'G1'})).value.version).toBe(r.value.version);
    const outsider=await service.client();expect((await outsider.call(t.path)).status).toBe(403);expect((await outsider.call(`${t.path}/events`)).status).toBe(403);
    expect((await a.call(t.path.replace('/games/','/rooms/'))).status).toBe(404);
  });
  it('admits four unique browser identities under competing joins and preserves two-player coverage',async()=>{
    const t=await team();let state=(await t.people[0].call(t.path)).value;
    expect(new Set(Object.values(state.assignments)).size).toBe(2);expect(Object.keys(state.assignments).sort()).toEqual([...duties].sort());
    const extra=await Promise.all([service.client(),service.client(),service.client()]);
    const joined=await Promise.all(extra.map((p,i)=>p.call(`${t.path}/join`,{name:`Extra ${i}`})));
    expect(joined.map(r=>r.status).sort()).toEqual([200,200,409]);state=(await t.people[0].call(t.path)).value;
    expect(state.members).toHaveLength(4);expect(new Set(Object.values(state.assignments)).size).toBe(4);
  });
  it('rejects answer guessing without supporting published facts, accepts alternative reasoning and preserves hints',async()=>{
    const t=await team();await shareAct(t,1);
    let r=await t.people[0].call(`${t.path}/claim`,{id:'cargo',answer:'empty',evidence:['G2','G4']});
    expect(r.value.act).toBe(1);expect(r.value.questions[0].accepted).toBeNull();expect(r.value.feedback).toContain('stronger');
    expect((await t.people[0].call(`${t.path}/claim`,{id:'time',answer:'1800',evidence:['G1','G2']})).status).toBe(400);
    r=await t.people[1].call(`${t.path}/hint`,{id:'cargo'});expect(r.value.questions[0].hintLevel).toBe(1);
    r=await t.people[0].call(`${t.path}/claim`,{id:'cargo',answer:'empty',evidence:['G1','W2']});expect(r.value.questions[0].accepted).not.toBeNull();
    expect((await t.people[0].call(`${t.path}/claim`,{id:'cargo',answer:'empty',evidence:['G1','W2']})).value.version).toBe(r.value.version);
  });
  it('hands a duty and its private discoveries to a teammate without stale overwrites',async()=>{
    const t=await team(3);let r=await t.people[2].call(`${t.path}/inspect`,{id:'G3'});
    const owner=(await t.people[0].call(t.path)).value.me.id;
    const data={duty:'workshop',member:owner,version:r.value.version};
    r=await t.people[0].call(`${t.path}/assign`,data);expect(r.status).toBe(200);expect(r.value.clues.some((c:{id:string})=>c.id==='G3')).toBe(true);
    expect((await t.people[2].call(t.path)).value.clues).toEqual([]);
    expect((await t.people[2].call(`${t.path}/assign`,data)).status).toBe(409);
    expect((await t.people[2].call(`${t.path}/publish`,{id:'G3'})).status).toBe(403);
  });
  it('solves all three acts with two players, preserves restart state and closes only with a supported chronology',async()=>{
    const t=await team();let state=t.state;
    for(let act=1;act<=3;act++){
      await shareAct(t,act);
      for(const rule of rules.filter(r=>r.act===act)){
        const r=await t.people[act%2].call(`${t.path}/claim`,{id:rule.id,answer:rule.answer,evidence:rule.supports[0]});expect(r.status).toBe(200);state=r.value;
      }
    }
    expect(state.questions.filter((q:{accepted:unknown})=>q.accepted)).toHaveLength(7);
    expect((await t.people[0].call(`${t.path}/close`,{version:state.version})).status).toBe(400);
    state=(await t.people[1].call(`${t.path}/note`,{id:'M1',text:'The camera clock was ahead; the receipt agrees.'})).value;
    const before=state;
    await service.stop();await service.start();state=(await t.people[0].call(t.path)).value;
    expect(state.seed).toBe(before.seed);expect(state.notes).toEqual(before.notes);expect(state.questions).toEqual(before.questions);
    const race=await Promise.all(t.people.map(p=>p.call(`${t.path}/board`,{order:chronology.map(e=>e.id),version:state.version})));
    expect(race.map(r=>r.status).sort()).toEqual([200,409]);state=(await t.people[0].call(t.path)).value;
    state=(await t.people[0].call(`${t.path}/close`,{version:state.version})).value;expect(state.status).toBe('solved');expect(state.solution).toHaveLength(4);
    await service.stop();await service.start();expect((await t.people[1].call(t.path)).value.status).toBe('solved');
    expect((await t.people[0].call(`${t.path}/inspect`,{id:'G1'})).status).toBe(409);
    const history=(await t.people[0].call('/api/me')).value.investigations;expect(history.some((r:{caseId:string})=>r.caseId==='after-hours-v1')).toBe(true);
  });
});
