import { expect, inject, it } from 'vitest';
import type { RoomState } from '../shared/types.ts';
const base=inject('baseUrl');
async function client(){const res=await fetch(`${base}/api/me`);const cookie=res.headers.get('set-cookie')!.split(';')[0];return {cookie,async call(path:string,data?:unknown){const res=await fetch(`${base}${path}`,{method:data===undefined?'GET':'POST',headers:{cookie,...(data===undefined?{}:{'content-type':'application/json'})},body:data===undefined?undefined:JSON.stringify(data)});return {status:res.status,value:await res.json()};}}}
async function create(mode='solo'){const c=await client();const r=await c.call('/api/rooms',{name:'Test investigator',mode});expect(r.status).toBe(201);return {c,room:r.value as RoomState};}
const correct={who:'eli',where:'north',why:'light',when:'17:30',evidence:['F2','A4']};
const order=['sun','permission','move','arrival'];

it('restores evidence publication, chronology and identity in a later request',async()=>{
  const {c,room}=await create();let r=await c.call(`/api/rooms/${room.code}/publish`,{id:'F2'});
  r=await c.call(`/api/rooms/${room.code}/board`,{order,version:r.value.version});expect(r.status).toBe(200);
  const restored=await c.call(`/api/rooms/${room.code}`);expect(restored.value.me.id).toBe(room.me.id);expect(restored.value.order).toEqual(order);expect(restored.value.clues.find((x:{id:string})=>x.id==='F2').published).toBe(true);
  expect((await c.call('/api/me')).value.investigations.some((x:{code:string})=>x.code===room.code)).toBe(true);
});
it('does not expose the solution or the other participant’s private clues',async()=>{
  const {c,room}=await create('duo');expect(room.clues.map(x=>x.id)).toEqual(['F1','F2','F3','F4']);expect(room.solution).toBeNull();expect(JSON.stringify(room)).not.toContain('six minutes FAST');
  expect((await c.call(`/api/rooms/${room.code}/publish`,{id:'A1'})).status).toBe(403);
  const outsider=await client();expect((await outsider.call(`/api/rooms/${room.code}`)).status).toBe(403);
  const joined=await outsider.call(`/api/rooms/${room.code}/join`,{name:'Partner'});expect(joined.value.me.role).toBe('archive');expect(joined.value.clues.map((x:{id:string})=>x.id)).toEqual(['A1','A2','A3','A4']);
  await outsider.call(`/api/rooms/${room.code}/publish`,{id:'A1'});const state=await c.call(`/api/rooms/${room.code}`);expect(state.value.clues.map((x:{id:string})=>x.id)).toContain('A1');expect(state.value.clues).toHaveLength(5);
});
it('prevents outsiders from opening the event stream or changing a room',async()=>{
  const {room}=await create();const stranger=await client();
  expect((await stranger.call(`/api/rooms/${room.code}/events`)).status).toBe(403);
  expect((await stranger.call(`/api/rooms/${room.code}/board`,{order,version:0})).status).toBe(403);
  expect((await stranger.call(`/api/rooms/${room.code}/join`,{name:'Intruder'})).status).toBe(409);
});
it('allows exactly one second participant under competing join requests',async()=>{
  const {room}=await create('duo');const a=await client(),b=await client();
  const results=await Promise.all([a.call(`/api/rooms/${room.code}/join`,{name:'A'}),b.call(`/api/rooms/${room.code}/join`,{name:'B'})]);expect(results.map(x=>x.status).sort()).toEqual([200,409]);
});
it('rejects a stale chronology instead of silently overwriting it',async()=>{
  const {c,room}=await create();const results=await Promise.all([c.call(`/api/rooms/${room.code}/board`,{order,version:room.version}),c.call(`/api/rooms/${room.code}/board`,{order:[...order].reverse(),version:room.version})]);
  expect(results.map(x=>x.status).sort()).toEqual([200,409]);expect((await c.call(`/api/rooms/${room.code}`)).value.version).toBe(1);
});
it('validates mode, nickname, unique events and known evidence',async()=>{
  const {c,room}=await create();expect((await c.call('/api/rooms',{name:'',mode:'solo'})).status).toBe(400);expect((await c.call('/api/rooms',{name:'A',mode:'other'})).status).toBe(400);
  expect((await c.call(`/api/rooms/${room.code}/publish`,{id:'not-a-clue'})).status).toBe(400);
  expect((await c.call(`/api/rooms/${room.code}/board`,{order:['sun','sun','sun','sun'],version:0})).status).toBe(400);
});
it('requires citations from both published folders before assessing a theory',async()=>{
  const {c,room}=await create();const url=`/api/rooms/${room.code}`;
  expect((await c.call(`${url}/theory`,correct)).status).toBe(400);
  await c.call(`${url}/publish`,{id:'F1'});await c.call(`${url}/publish`,{id:'F2'});
  expect((await c.call(`${url}/theory`,{...correct,evidence:['F1','F2']})).status).toBe(400);
  expect((await c.call(`${url}/theory`,{...correct,evidence:['F1','F1']})).status).toBe(400);
});
it('preserves wrong attempts, checks corrected time, and reveals the conclusion only after success',async()=>{
  const {c,room}=await create();const url=`/api/rooms/${room.code}`;await c.call(`${url}/publish`,{id:'F2'});let r=await c.call(`${url}/publish`,{id:'A4'});await c.call(`${url}/board`,{order,version:r.value.version});
  r=await c.call(`${url}/theory`,{...correct,when:'17:36'});expect(r.value.status).toBe('open');expect(r.value.solution).toBeNull();expect(r.value.attempts).toBe(1);expect(r.value.lastFeedback).toContain('camera');
  r=await c.call(`${url}/theory`,correct);expect(r.value.status).toBe('solved');expect(r.value.solution).toHaveLength(4);expect(r.value.attempts).toBe(2);
  expect((await c.call(`${url}/board`,{order,version:r.value.version})).status).toBe(409);
});
it('delivers a real SSE invalidation when another participant shares evidence',async()=>{
  const {c,room}=await create('duo');const partner=await client();await partner.call(`/api/rooms/${room.code}/join`,{name:'Partner'});
  const control=new AbortController();const timer=setTimeout(()=>control.abort(),4000);
  try {const res=await fetch(`${base}/api/rooms/${room.code}/events`,{headers:{cookie:c.cookie},signal:control.signal});expect(res.status).toBe(200);const reader=res.body!.getReader();await reader.read();
    const started=Date.now();await partner.call(`/api/rooms/${room.code}/publish`,{id:'A2'});const event=await reader.read();expect(new TextDecoder().decode(event.value)).toContain('event: update');expect(Date.now()-started).toBeLessThan(1000);await reader.cancel();
  }finally{clearTimeout(timer);control.abort()}
});
it('blocks cross-origin mutations and malformed request bodies',async()=>{
  const c=await client();let res=await fetch(`${base}/api/rooms`,{method:'POST',headers:{cookie:c.cookie,'content-type':'application/json',origin:'https://other.example'},body:JSON.stringify({name:'A',mode:'solo'})});expect(res.status).toBe(403);
  res=await fetch(`${base}/api/rooms`,{method:'POST',headers:{cookie:c.cookie,'content-type':'application/json'},body:'{broken'});expect(res.status).toBe(400);
  res=await fetch(`${base}/api/rooms`,{method:'POST',headers:{cookie:c.cookie,'content-type':'text/plain'},body:'{}'});expect(res.status).toBe(415);
});
it('returns a useful 404 for a nonexistent case and keeps README server-rendered',async()=>{
  const c=await client();expect((await c.call('/api/rooms/ffffffffffff')).status).toBe(404);
  const res=await fetch(`${base}/readme/`);expect(await res.text()).toContain('<h1>');
});
