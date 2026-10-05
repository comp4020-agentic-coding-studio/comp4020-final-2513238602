import { it, expect } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function unusedPort(){const s=createServer();await new Promise<void>(r=>s.listen(0,'127.0.0.1',r));const port=(s.address() as {port:number}).port;await new Promise<void>(r=>s.close(()=>r()));return port;}
async function stop(child:ChildProcess){if(child.exitCode!==null)return;const exited=new Promise<void>(r=>child.once('exit',()=>r()));child.kill();await exited;}
it('retains a real investigation when a new server process reopens the same SQLite file',async()=>{
  const directory=mkdtempSync(join(tmpdir(),'lost-found-restart-'));const port=await unusedPort();const base=`http://127.0.0.1:${port}`;let child:ChildProcess|undefined;
  async function start(){child=spawn(process.execPath,['server/index.ts'],{env:{...process.env,PORT:String(port),HOST:'127.0.0.1',DATA_DIR:directory},stdio:'ignore',windowsHide:true});for(let i=0;i<100;i++){try{if((await fetch(`${base}/health`)).ok)return}catch{}await wait(50)}throw Error('Restart test server failed to start');}
  try{await start();const initial=await fetch(`${base}/api/me`);const cookie=initial.headers.get('set-cookie')!.split(';')[0];const headers={cookie,'content-type':'application/json'};const created=await fetch(`${base}/api/rooms`,{method:'POST',headers,body:JSON.stringify({name:'Return visitor',mode:'solo'})});const room=await created.json();expect(created.status).toBe(201);
    await fetch(`${base}/api/rooms/${room.code}/publish`,{method:'POST',headers,body:JSON.stringify({id:'F1'})});await stop(child!);await start();
    const restored=await fetch(`${base}/api/rooms/${room.code}`,{headers});expect(restored.status).toBe(200);const state=await restored.json();expect(state.me.name).toBe('Return visitor');expect(state.clues[0].published).toBe(true);
  }finally{if(child)await stop(child);rmSync(directory,{recursive:true,force:true});}
},15000);
