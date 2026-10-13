import { it, expect } from 'vitest';
import { serverFixture } from './server-fixture.ts';

it('restores both identities, shared reasoning and a solved case across real server restarts',async()=>{
  const server=await serverFixture();
  try {
    await server.start();const field=await server.client(),archive=await server.client();
    const opened=await field.call('/api/rooms',{name:'Return field',mode:'duo'});const room=opened.value;const path=`/api/rooms/${room.code}`;
    const joined=await archive.call(`${path}/join`,{name:'Return archive'});
    await field.call(`${path}/publish`,{id:'F2'});const published=await archive.call(`${path}/publish`,{id:'A4'});
    const order=['sun','permission','move','arrival'];await field.call(`${path}/board`,{order,version:published.value.version});
    const theory={who:'eli',where:'north',why:'light',when:'17:30',evidence:['F2','A4']};
    await archive.call(`${path}/theory`,{...theory,when:'17:36'});
    await server.stop();await server.start();
    for(const [client,id] of [[field,room.me.id],[archive,joined.value.me.id]] as const){
      const {status,value}=await client.call(path);expect(status).toBe(200);expect(value.me.id).toBe(id);
      expect(value.publishedCount).toBe(2);expect(value.order).toEqual(order);expect(value.attempts).toBe(1);expect(value.lastFeedback).toContain('camera');expect(value.solution).toBeNull();
      expect((await client.call('/api/me')).value.investigations.some((r:{code:string})=>r.code===room.code)).toBe(true);
    }
    const solved=await field.call(`${path}/theory`,theory);expect(solved.value.status).toBe('solved');
    await server.stop();await server.start();
    for(const client of [field,archive]){
      const restored=await client.call(path);expect(restored.value.status).toBe('solved');expect(restored.value.attempts).toBe(2);expect(restored.value.solution).toHaveLength(4);
      expect(restored.value.activity.map((e:{id:number})=>e.id)).toEqual(solved.value.activity.map((e:{id:number})=>e.id));
      expect((await client.call(`${path}/publish`,{id:client===field?'F1':'A1'})).status).toBe(409);
    }
  } finally {await server.close()}
},15000);
