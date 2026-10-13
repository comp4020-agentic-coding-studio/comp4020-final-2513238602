import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';

export const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));
export async function serverFixture(){
  const probe=createServer();await new Promise<void>(r=>probe.listen(0,'127.0.0.1',r));
  const port=(probe.address() as {port:number}).port;await new Promise<void>(r=>probe.close(()=>r()));
  const directory=mkdtempSync(join(tmpdir(),'lost-found-test-'));const base=`http://127.0.0.1:${port}`;
  let child:ChildProcess|undefined;let output='';
  async function start(){
    child=spawn(process.execPath,['server/index.ts'],{env:{...process.env,PORT:String(port),HOST:'127.0.0.1',DATA_DIR:directory,NODE_ENV:'test'},stdio:['ignore','pipe','pipe'],windowsHide:true});
    child.stdout!.on('data',chunk=>{output+=chunk});child.stderr!.on('data',chunk=>{output+=chunk});
    for(let i=0;i<100;i++){try{if((await fetch(`${base}/health`)).ok)return}catch{}await wait(50)}
    throw Error('Isolated server did not start');
  }
  async function stop(){if(!child||child.exitCode!==null)return;const exited=new Promise<void>(r=>child!.once('exit',()=>r()));child.kill();await exited}
  async function close(){await stop();const target=resolve(directory);if(dirname(target)!==resolve(tmpdir())||!basename(target).startsWith('lost-found-test-'))throw Error('Unsafe test cleanup target');rmSync(target,{recursive:true,force:true})}
  async function client(){const initial=await fetch(`${base}/api/me`);const cookie=initial.headers.get('set-cookie')!.split(';')[0];return {cookie,async call(path:string,data?:unknown){const response=await fetch(`${base}${path}`,{method:data===undefined?'GET':'POST',headers:{cookie,...(data===undefined?{}:{'content-type':'application/json'})},body:data===undefined?undefined:JSON.stringify(data)});return {status:response.status,value:await response.json()}}}}
  return {base,start,stop,close,client,output:()=>output,events:()=>output.split(/\r?\n/).filter(line=>line.startsWith('{')).map(line=>JSON.parse(line))};
}
