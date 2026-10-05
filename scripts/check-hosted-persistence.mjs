import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const base='https://comp4020-final-2513238602.fly.dev';
const file='evidence/hosted-persistence.json'; // Ignored by Git and Docker; contains a test session cookie.
const mode=process.argv[2];
async function request(path,cookie,data){
  const response=await fetch(`${base}${path}`,{
    method:data===undefined?'GET':'POST',
    headers:{...(cookie?{cookie}:{}),...(data===undefined?{}:{'content-type':'application/json'})},
    body:data===undefined?undefined:JSON.stringify(data),signal:AbortSignal.timeout(60000)
  });
  assert.ok(response.ok,`${path}: HTTP ${response.status}`);
  return {response,state:await response.json()};
}
if(mode==='seed'){
  const {response}=await request('/api/me');
  const cookie=response.headers.get('set-cookie')?.split(';')[0];
  assert.ok(cookie,'Session cookie issued');
  const {state:room}=await request('/api/rooms',cookie,{name:'Deployment verification',mode:'solo'});
  const {state}=await request(`/api/rooms/${room.code}/publish`,cookie,{id:'F1'});
  assert.ok(state.clues.find(c=>c.id==='F1')?.published);
  mkdirSync('evidence',{recursive:true});
  writeFileSync(file,JSON.stringify({cookie,code:room.code,createdAt:new Date().toISOString()}));
  console.log('Saved one hosted verification investigation and published evidence. Session kept in ignored local file.');
}else if(mode==='verify'){
  const {cookie,code}=JSON.parse(readFileSync(file,'utf8'));
  const {state}=await request(`/api/rooms/${code}`,cookie);
  assert.equal(state.me.name,'Deployment verification');
  assert.ok(state.clues.find(c=>c.id==='F1')?.published);
  console.log('PASS: hosted identity and published evidence survived.');
}else throw Error('Use seed before deployment/restart; verify afterwards.');
