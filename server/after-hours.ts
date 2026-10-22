import type { DatabaseSync } from 'node:sqlite';
import { randomInt } from 'node:crypto';
import { duties, objects, places, dutyNames } from '../shared/after-hours.ts';
import type { Duty, GameState, GameMember, Question } from '../shared/after-hours.ts';
import { evidence, rules, assessClaim, chronology, initialOrder, ending } from './after-hours-case.ts';

type Progress = {
  revision: 1; seed: number; assignments: Partial<Record<Duty,string>>;
  discoveries: Record<string,string>; shared: Record<string,string>;
  accepted: Record<string,NonNullable<Question['accepted']>>; hints: Record<string,number>;
  notes: { id: number; memberId: string; name: string; clue: string; text: string }[];
};
type Row = Record<string,string|number|null>;
type Helpers = { fail: (status:number,message:string)=>never; id:()=>string; now:()=>string; log:(code:string,mid:string,action:string,detail:string)=>void };
export function createAfterHours(db:DatabaseSync, {fail,id,now,log}:Helpers) {
  const one=(sql:string,...args:(string|number)[])=>db.prepare(sql).get(...args) as Row|undefined;
  const all=(sql:string,...args:(string|number)[])=>db.prepare(sql).all(...args) as Row[];
  const run=(sql:string,...args:(string|number|null)[])=>db.prepare(sql).run(...args);
  const columns=all('PRAGMA table_info(rooms)').map(r=>r.name);
  if(!columns.includes('case_id')) db.exec("ALTER TABLE rooms ADD COLUMN case_id TEXT NOT NULL DEFAULT 'blue-hour'");
  if(!columns.includes('game')) db.exec('ALTER TABLE rooms ADD COLUMN game TEXT');
  db.exec('PRAGMA user_version=2');
  const room=(code:string)=>{const r=one('SELECT * FROM rooms WHERE code=?',code);if(!r||r.case_id!=='after-hours-v1')return fail(404,'This After Hours investigation was not found.');return r;};
  const member=(code:string,sid:string)=>{room(code);return one('SELECT * FROM members WHERE room=? AND session=?',code,sid)??fail(403,'Join this investigation to begin.');};
  const progress=(r:Row)=>JSON.parse(String(r.game)) as Progress;
  const act=(p:Progress)=>rules.filter(r=>r.act===1).every(r=>p.accepted[r.id])?(rules.filter(r=>r.act===2).every(r=>p.accepted[r.id])?3:2):1;
  const members=(code:string)=>all('SELECT id,name,role AS seat FROM members WHERE room=? ORDER BY rowid',code) as unknown as GameMember[];
  function state(code:string,sid:string):GameState {
    const r=room(code), me=member(code,sid), p=progress(r), stage=act(p);
    return {
      code,caseId:'after-hours-v1',seed:p.seed,version:Number(r.version),status:r.status as GameState['status'],act:stage,createdAt:String(r.created),updatedAt:String(r.updated),
      me:{id:String(me.id),name:String(me.name),seat:me.role as Duty},members:members(code),assignments:p.assignments,
      clues:objects.filter(o=>p.discoveries[o.id]&&(p.shared[o.id]||p.assignments[o.duty]===me.id)).map(o=>({id:o.id,duty:o.duty,...evidence[o.id],discoveredBy:p.discoveries[o.id],sharedBy:p.shared[o.id]})),
      questions:rules.filter(q=>q.act<=stage).map(q=>({id:q.id,act:q.act,title:q.title,prompt:q.prompt,options:q.options,accepted:p.accepted[q.id]??null,hintLevel:p.hints[q.id]??0,hint:p.hints[q.id]?q.hints[p.hints[q.id]-1]:null})),
      notes:p.notes,order:JSON.parse(String(r.ordering)),events:chronology,attempts:Number(one('SELECT COUNT(*) AS n FROM attempts WHERE room=?',code)!.n),feedback:r.feedback as string|null,
      activity:all('SELECT a.id,a.member AS memberId,m.name,m.role AS seat,a.action,a.detail,a.at FROM activity a JOIN members m ON m.id=a.member WHERE a.room=? ORDER BY a.id DESC LIMIT 80',code) as unknown as GameState['activity'],
      contributions:members(code).map(m=>({memberId:m.id,discoveries:Object.values(p.discoveries).filter(id=>id===m.id).length,shared:Object.values(p.shared).filter(id=>id===m.id).length,deductions:Object.values(p.accepted).filter(a=>a.by===m.id).length})),
      solution:r.status==='solved'?ending:null,
    };
  }
  function create(code:string,sid:string,name:string) {
    const mid=id(),at=now();
    const p:Progress={revision:1,seed:randomInt(1,2147483647),assignments:{field:mid,workshop:mid},discoveries:{},shared:{},accepted:{},hints:{},notes:[]};
    run('INSERT INTO rooms(code,mode,ordering,created,updated,case_id,game) VALUES (?,?,?,?,?,?,?)',code,'party',JSON.stringify(initialOrder),at,at,'after-hours-v1',JSON.stringify(p));
    run('INSERT INTO members VALUES (?,?,?,?,?)',mid,code,sid,name,'field');log(code,mid,'opened','Opened After Hours. Scene and object duties are ready; invite a partner for records and routes.');
  }
  function join(code:string,sid:string,name:string) {
    const r=room(code);if(one('SELECT id FROM members WHERE room=? AND session=?',code,sid))return false;
    if(r.status==='solved')fail(409,'This case is closed. Ask a participant to show you the case record, or start a new investigation.');
    const roster=members(code);if(roster.length>=4)fail(409,'All four seats are taken. Open a new investigation from the case files.');
    const seat=duties[roster.length],mid=id(),p=progress(r);
    run('INSERT INTO members VALUES (?,?,?,?,?)',mid,code,sid,name,seat);
    p.assignments[seat]=mid;if(seat==='archive')p.assignments.routes=mid;
    run('UPDATE rooms SET game=?,updated=?,version=version+1 WHERE code=?',JSON.stringify(p),now(),code);
    log(code,mid,'joined',`Joined as ${dutyNames[seat]}. ${seat==='archive'?'Also covering routes until a fourth investigator joins.':'The corresponding duty has been transferred to this seat.'}`);return true;
  }
  function mutate(code:string,sid:string,action:string,data:Record<string,unknown>) {
    const r=room(code),me=member(code,sid),mid=String(me.id),p=progress(r);const stage=act(p);
    if(r.status==='solved')fail(409,'This investigation is closed. Its evidence and conclusions are preserved.');
    const key=typeof data.id==='string'?data.id:'';
    if(action==='inspect'||action==='publish') {
      const object=objects.find(o=>o.id===key);if(!object)fail(400,'Choose a known object.');
      if(action==='publish'&&p.shared[key])return false;
      if(places.find(place=>place.id===object!.place)!.act>stage)fail(403,'Resolve the current act to open this room.');
      if(p.assignments[object!.duty]!==mid)fail(403,`This object needs the ${dutyNames[object!.duty]} duty. Ask that teammate, or arrange a duty handover.`);
      if(action==='inspect') {if(p.discoveries[key])return false;p.discoveries[key]=mid;}
      else {if(!p.discoveries[key])fail(400,'Inspect the object before sharing its evidence.');p.shared[key]=mid;log(code,mid,'published',`${key}: ${evidence[key].title}`);}
    } else if(action==='claim') {
      const rule=rules.find(q=>q.id===key);if(!rule||rule.act>stage)fail(400,'This question is not open yet.');
      if(p.accepted[key])return false;
      if(!rule!.options.some(o=>o.id===data.answer))fail(400,'Choose an explanation.');
      const citations=data.evidence;
      if(!Array.isArray(citations)||citations.length<2||citations.length>6||new Set(citations).size!==citations.length||citations.some(c=>typeof c!=='string'||!p.shared[c]))fail(400,'Cite two to six different clues already on the shared desk.');
      const result=assessClaim(rule!,String(data.answer),citations as string[]);
      run('INSERT INTO attempts(room,member,body,correct,at) VALUES (?,?,?,?,?)',code,mid,JSON.stringify({question:key,answer:data.answer,evidence:citations}),result.correct?1:0,now());
      if(result.correct)p.accepted[key]={answer:String(data.answer),evidence:citations as string[],by:mid};
      run('UPDATE rooms SET feedback=? WHERE code=?',result.feedback,code);
      log(code,mid,result.correct?'deduced':'hypothesis',`${rule!.title} ${result.feedback}`);
    } else if(action==='hint') {
      const rule=rules.find(q=>q.id===key);if(!rule||rule.act>stage)fail(400,'This question is not open yet.');
      if(p.accepted[key]||(p.hints[key]??0)>=3)return false;
      p.hints[key]=(p.hints[key]??0)+1;log(code,mid,'hint',`Revealed hint ${p.hints[key]} of 3 for “${rule!.title}”.`);
    } else if(action==='assign') {
      if(data.version!==r.version)fail(409,'The investigation changed. Review the current duties before transferring one.');
      if(!duties.includes(data.duty as Duty)||typeof data.member!=='string'||!members(code).some(m=>m.id===data.member))fail(400,'Choose a duty and an investigator in this room.');
      if(p.assignments[data.duty as Duty]===data.member)return false;
      p.assignments[data.duty as Duty]=data.member as string;
      log(code,mid,'handover',`Transferred ${dutyNames[data.duty as Duty]} to investigator ${members(code).findIndex(m=>m.id===data.member)+1}. Previously discovered evidence follows the duty.`);
    } else if(action==='note') {
      if(!p.shared[key])fail(400,'Select shared evidence before adding a question.');
      if(typeof data.text!=='string'||!data.text.trim()||data.text.trim().length>160)fail(400,'Write a question of 1–160 characters.');
      if(p.notes.length>=60)fail(409,'This case already has 60 notes. Use your existing questions to guide the discussion.');
      p.notes.push({id:p.notes.length+1,memberId:mid,name:String(me.name),clue:key,text:(data.text as string).trim()});log(code,mid,'noted',`Added a discussion note to ${key}.`);
    } else if(action==='board') {
      if(data.version!==r.version)fail(409,'A teammate updated the case. Your chronology move was not saved.');
      if(!Array.isArray(data.order)||data.order.length!==chronology.length||new Set(data.order).size!==chronology.length||data.order.some(x=>!chronology.some(e=>e.id===x)))fail(400,'Keep each event exactly once in the chronology.');
      run('UPDATE rooms SET ordering=? WHERE code=?',JSON.stringify(data.order),code);log(code,mid,'arranged','Updated the shared chronology.');
    } else if(action==='close') {
      if(data.version!==r.version)fail(409,'The investigation changed. Review the current record before closing.');
      if(!rules.every(q=>p.accepted[q.id]))fail(400,'Support all seven deductions before closing the investigation.');
      if(JSON.stringify(chronology.map(e=>e.id))!==String(r.ordering))fail(400,'The chronology still conflicts with the records. Compare the clock service, collection, alarm, instruction, movement and receipt.');
      run("UPDATE rooms SET status='solved',feedback=? WHERE code=?",'Case closed. Two journeys, one misunderstanding.',code);log(code,mid,'solved','Resolved After Hours with seven supported deductions and a corrected chronology.');
    } else fail(404,'Unknown investigation action.');
    run('UPDATE rooms SET game=?,version=version+1,updated=? WHERE code=?',JSON.stringify(p),now(),code);return true;
  }
  return {state,create,join,mutate,member};
}
