import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { createHash, randomBytes } from 'node:crypto';
import { mkdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { marked } from 'marked';
import { clues, events, startingOrder, assess, solution } from './case.ts';
import type { Mode, Role, Theory } from '../shared/types.ts';
import { createAfterHours } from './after-hours.ts';

const dataDir = resolve(process.env.DATA_DIR ?? 'data');
mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(resolve(dataDir, 'lost-found.sqlite'));
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
  CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, created TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS rooms (code TEXT PRIMARY KEY, mode TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'open', version INTEGER NOT NULL DEFAULT 0, ordering TEXT NOT NULL, created TEXT NOT NULL, updated TEXT NOT NULL, feedback TEXT);
  CREATE TABLE IF NOT EXISTS members (id TEXT PRIMARY KEY, room TEXT NOT NULL REFERENCES rooms(code), session TEXT NOT NULL REFERENCES sessions(id), name TEXT NOT NULL, role TEXT NOT NULL, UNIQUE(room,session), UNIQUE(room,role));
  CREATE TABLE IF NOT EXISTS publications (room TEXT NOT NULL REFERENCES rooms(code), clue TEXT NOT NULL, member TEXT NOT NULL REFERENCES members(id), PRIMARY KEY(room,clue));
  CREATE TABLE IF NOT EXISTS reads (member TEXT NOT NULL REFERENCES members(id), clue TEXT NOT NULL, PRIMARY KEY(member,clue));
  CREATE TABLE IF NOT EXISTS activity (id INTEGER PRIMARY KEY AUTOINCREMENT, room TEXT NOT NULL REFERENCES rooms(code), member TEXT NOT NULL REFERENCES members(id), action TEXT NOT NULL, detail TEXT NOT NULL, at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, room TEXT NOT NULL REFERENCES rooms(code), member TEXT NOT NULL REFERENCES members(id), body TEXT NOT NULL, correct INTEGER NOT NULL, at TEXT NOT NULL);
  PRAGMA user_version=1;`);
type Row = Record<string, string | number | null>;
const one = (sql: string, ...args: (string | number)[]) => db.prepare(sql).get(...args) as Row | undefined;
const all = (sql: string, ...args: (string | number)[]) => db.prepare(sql).all(...args) as Row[];
const run = (sql: string, ...args: (string | number | null)[]) => db.prepare(sql).run(...args);
const now = () => new Date().toISOString();
const id = () => randomBytes(12).toString('hex');
class HttpError extends Error { status: number; constructor(status: number, message: string) { super(message); this.status = status; } }
const fail = (status: number, message: string): never => { throw new HttpError(status, message); };
let pendingActivity: number[] | null = null;
function transaction<T>(fn: () => T): T {
  db.exec('BEGIN IMMEDIATE');pendingActivity=[];
  let value:T;let committed:number[];
  try { value=fn();db.exec('COMMIT');committed=pendingActivity; }
  catch(e) { db.exec('ROLLBACK');throw e; }
  finally { pendingActivity=null; }
  // Emit only committed facts. A failed transaction must never look like a save.
  for(const eventId of committed){
    const event=one('SELECT a.id AS eventId,a.at,a.room,a.member,m.role,a.action,a.detail,r.version FROM activity a JOIN members m ON m.id=a.member JOIN rooms r ON r.code=a.room WHERE a.id=?',eventId);
    console.log(JSON.stringify({outcome:'committed',...event}));
  }
  return value;
}
function json(res: ServerResponse, status: number, value: unknown) { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)); }
function session(req: IncomingMessage, res: ServerResponse): string {
  const value = req.headers.cookie?.match(/(?:^|;\s*)lf_session=([a-f0-9]{64})(?:;|$)/)?.[1];
  if (value) { const hash = createHash('sha256').update(value).digest('hex'); if (one('SELECT id FROM sessions WHERE id=?', hash)) return hash; }
  const token = randomBytes(32).toString('hex');
  const hash = createHash('sha256').update(token).digest('hex');
  run('INSERT INTO sessions VALUES (?,?)', hash, now());
  res.setHeader('Set-Cookie', `lf_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
  return hash;
}
async function body(req: IncomingMessage): Promise<Record<string, unknown>> {
  if (!req.headers['content-type']?.startsWith('application/json')) fail(415, 'Send JSON for this action.');
  let source = ''; for await (const chunk of req) { source += chunk; if (Buffer.byteLength(source) > 16384) fail(413, 'This request is too large.'); }
  let parsed; try { parsed = JSON.parse(source); } catch { fail(400, 'The request could not be read.'); }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) fail(400, 'Expected an object.');
  return parsed as Record<string, unknown>;
}
function nameFrom(value: unknown) { if (typeof value !== 'string' || !value.trim() || value.trim().length > 24) fail(400, 'Use a name between 1 and 24 characters.'); return (value as string).trim(); }
function getRoom(code: string) { return one('SELECT * FROM rooms WHERE code=?', code) ?? fail(404, 'This investigation was not found. Check the invitation link.'); }
function member(code: string, sid: string) { getRoom(code); return one('SELECT * FROM members WHERE room=? AND session=?', code, sid) ?? fail(403, 'Join this investigation before opening its evidence.'); }
function investigationPage(sid: string, cursor: string | null) {
  let boundary: [string, string] | undefined;
  if (cursor !== null) {
    let decoded: unknown;
    try {
      if (cursor.length > 160 || !/^[A-Za-z0-9_-]+$/.test(cursor)) throw new Error();
      decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
    } catch { fail(400, 'This saved-file page is invalid. Reload your case files.'); }
    if (!Array.isArray(decoded) || decoded.length !== 2 || typeof decoded[0] !== 'string' || typeof decoded[1] !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(decoded[0]) || !Number.isFinite(Date.parse(decoded[0])) || !/^[a-f0-9]{12}$/.test(decoded[1])) fail(400, 'This saved-file page is invalid. Reload your case files.');
    boundary = decoded as [string, string];
  }
  // Updates by a partner must not move an unread page across the cursor boundary.
  const rows = all(`SELECT r.code,r.mode,r.status,r.case_id AS caseId,r.created AS createdAt,r.updated AS updatedAt,m.role FROM rooms r JOIN members m ON m.room=r.code WHERE m.session=?${boundary ? ' AND (r.created < ? OR (r.created = ? AND r.code < ?))' : ''} ORDER BY r.created DESC,r.code DESC LIMIT 5`,sid,...(boundary ? [boundary[0],boundary[0],boundary[1]] : []));
  const investigations = rows.slice(0,4);
  const last = investigations.at(-1);
  const nextCursor = rows.length > investigations.length && last ? Buffer.from(JSON.stringify([last.createdAt,last.code])).toString('base64url') : null;
  return { investigations, nextCursor };
}
function log(code: string, mid: string, action: string, detail: string) {
  const result=run('INSERT INTO activity(room,member,action,detail,at) VALUES (?,?,?,?,?)', code, mid, action, detail, now());
  pendingActivity?.push(Number(result.lastInsertRowid));
}
const streams = new Map<string, Set<ServerResponse>>();
const game = createAfterHours(db,{fail,id,now,log});
function broadcast(code: string) { for (const res of streams.get(code) ?? []) res.write(`event: update\ndata: ${JSON.stringify({ version: getRoom(code).version })}\n\n`); }
function roomState(code: string, sid: string) {
  const room = getRoom(code); const me = member(code, sid);
  const published = new Set(all('SELECT clue FROM publications WHERE room=?', code).map(x => x.clue));
  const read = new Set(all('SELECT clue FROM reads WHERE member=?', String(me.id)).map(x => x.clue));
  return { code, mode: room.mode, status: room.status, version: room.version, createdAt: room.created, updatedAt: room.updated,
    me: { id: me.id, name: me.name, role: me.role }, members: all('SELECT id,name,role FROM members WHERE room=? ORDER BY rowid', code),
    clues: clues.filter(c => me.role === 'solo' || c.role === me.role || published.has(c.id)).map(c => ({ ...c, published: published.has(c.id), read: read.has(c.id) })),
    publishedCount: published.size, order: JSON.parse(String(room.ordering)), events,
    activity: all('SELECT a.id,a.member AS memberId,m.name,m.role,a.action,a.detail,a.at FROM activity a JOIN members m ON m.id=a.member WHERE a.room=? ORDER BY a.id DESC LIMIT 40', code),
    attempts: one('SELECT COUNT(*) AS count FROM attempts WHERE room=?', code)!.count,
    lastFeedback: room.feedback, solution: room.status === 'solved' ? solution : null };
}
const MIME: Record<string,string> = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.webp':'image/webp', '.png':'image/png', '.woff2':'font/woff2', '.ico':'image/x-icon' };
function staticFile(req: IncomingMessage, res: ServerResponse, path: string) {
  const ext=extname(path),compressible=ext==='.js'||ext==='.css';
  const acceptsGzip=(req.headers['accept-encoding']??'').toLowerCase().split(',').some(part=>{
    const [encoding,...parameters]=part.trim().split(';');
    const quality=parameters.find(p=>p.trim().startsWith('q='));
    return encoding==='gzip'&&(!quality||Number(quality.trim().slice(2))>0);
  });
  const compressed=compressible&&acceptsGzip&&existsSync(`${path}.gz`);
  const bytes=readFileSync(compressed?`${path}.gz`:path);
  res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream', 'Cache-Control': path.includes(`${sep}assets${sep}`) ? 'public, max-age=31536000, immutable' : 'no-cache', 'Content-Length':bytes.length, ...(compressible?{'Vary':'Accept-Encoding'}:{}), ...(compressed?{'Content-Encoding':'gzip'}:{}) });
  res.end(bytes);
}
const escape = (s: string) => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const server = createServer(async (req,res) => {
  const trace:{requestId:string;operation:string;room?:string;member?:string;role?:string}={requestId:id(),operation:'request'};
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','same-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  try {
    const url = new URL(req.url ?? '/', 'http://localhost'); const path = url.pathname; const method = req.method ?? 'GET';
    if (method !== 'GET' && method !== 'HEAD') {
      const origin = req.headers.origin;
      if (req.headers['sec-fetch-site'] === 'cross-site' || (origin && new URL(origin).host !== req.headers.host)) fail(403, 'This action must come from this website.');
    }
    if (path === '/health') return json(res, 200, { ok: true });
    if (path === '/readme/' || path === '/readme') {
      const html = marked.parse(readFileSync('README.md','utf8')) as string;
      res.writeHead(200, { 'Content-Type':'text/html; charset=utf-8' });
      return res.end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>What good means | Lost &amp; Found</title><link rel="stylesheet" href="/readme.css"></head><body><header><a href="/">Lost &amp; Found</a><span>THE PROJECT FILE</span></header><main>${html}</main><footer><a href="/">Open an investigation →</a></footer></body></html>`);
    }
    if (path.startsWith('/api/')) {
      const sid = session(req,res);
      if (path === '/api/me' && method === 'GET') return json(res,200,investigationPage(sid,url.searchParams.get('cursor')));
      if(path==='/api/games'&&method==='POST'){
        const data=await body(req),name=nameFrom(data.name);
        if(Number(one('SELECT COUNT(*) AS count FROM members WHERE session=?',sid)!.count)>=60)fail(429,'You have reached the investigation limit for this browser.');
        const code=randomBytes(6).toString('hex');transaction(()=>game.create(code,sid,name));return json(res,201,game.state(code,sid));
      }
      const gm=path.match(/^\/api\/games\/([a-f0-9]{12})(?:\/(join|events|inspect|publish|claim|hint|assign|note|board|close))?$/);
      if(gm){
        const [,code,action]=gm;trace.room=code;trace.operation=action??'snapshot';
        if(action==='join'&&method==='POST'){const data=await body(req),name=nameFrom(data.name);const changed=transaction(()=>game.join(code,sid,name));if(changed)broadcast(code);return json(res,200,game.state(code,sid));}
        const me=game.member(code,sid);trace.member=String(me.id);trace.role=String(me.role);
        if(!action&&method==='GET')return json(res,200,game.state(code,sid));
        if(action==='events'&&method==='GET'){
          const clients=streams.get(code)??new Set<ServerResponse>();if(clients.size>=12)fail(429,'Too many open tabs for this investigation.');
          res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});
          clients.add(res);streams.set(code,clients);res.write('event: update\ndata: {}\n\n');
          const heartbeat=setInterval(()=>res.write(': keepalive\n\n'),20000);
          res.on('close',()=>{clearInterval(heartbeat);clients.delete(res);if(!clients.size)streams.delete(code)});return;
        }
        if(method!=='POST')fail(405,'This action needs a POST request.');
        const data=await body(req);const changed=transaction(()=>game.mutate(code,sid,action??'',data));if(changed)broadcast(code);return json(res,200,game.state(code,sid));
      }
      if (path === '/api/rooms' && method === 'POST') {
        const data = await body(req); const name = nameFrom(data.name); if (data.mode !== 'solo' && data.mode !== 'duo') fail(400,'Choose solo or duo.');
        if (Number(one('SELECT COUNT(*) AS count FROM members WHERE session=?',sid)!.count) >= 60) fail(429,'You have reached the investigation limit for this browser.');
        const code = randomBytes(6).toString('hex'); const mid = id(); const mode = data.mode as Mode; const role: Role = mode === 'solo' ? 'solo' : 'field';
        transaction(() => { const at=now(); run('INSERT INTO rooms(code,mode,ordering,created,updated) VALUES (?,?,?,?,?)',code,mode,JSON.stringify(startingOrder),at,at); run('INSERT INTO members VALUES (?,?,?,?,?)',mid,code,sid,name,role); log(code,mid,'opened',mode === 'solo' ? 'Opened a solo investigation.' : 'Opened a two-person investigation.'); });
        return json(res,201,roomState(code,sid));
      }
      const match = path.match(/^\/api\/rooms\/([a-f0-9]{12})(?:\/(join|events|read|publish|board|theory))?$/);
      if (!match) fail(404,'This endpoint was not found.');
      const [,code,action] = match!;
      if(getRoom(code).case_id!=='blue-hour')fail(404,'Open this investigation through its After Hours invitation.');
      trace.room=code;trace.operation=action??'snapshot';
      if (action === 'join' && method === 'POST') {
        const data=await body(req); const name=nameFrom(data.name);
        transaction(() => { const room=getRoom(code); if (one('SELECT id FROM members WHERE room=? AND session=?',code,sid)) return;
          if (room.mode !== 'duo' || Number(one('SELECT COUNT(*) AS count FROM members WHERE room=?',code)!.count) >= 2) fail(409,'This investigation has no open seat. Start your own case from the home page.');
          const mid=id(); run('INSERT INTO members VALUES (?,?,?,?,?)',mid,code,sid,name,'archive'); log(code,mid,'joined','Joined with the archive folder.'); run('UPDATE rooms SET updated=?,version=version+1 WHERE code=?',now(),code);
        }); broadcast(code); return json(res,200,roomState(code,sid));
      }
      const me=member(code,sid);
      trace.member=String(me.id);trace.role=String(me.role);
      if (!action && method === 'GET') return json(res,200,roomState(code,sid));
      if (action === 'events' && method === 'GET') {
        const clients=streams.get(code) ?? new Set<ServerResponse>();
        if (clients.size >= 12) fail(429,'Too many open tabs for this investigation.');
        res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});
        clients.add(res); streams.set(code,clients); res.write('event: update\ndata: {}\n\n');
        const heartbeat=setInterval(() => res.write(': keepalive\n\n'),20000);
        res.on('close',() => { clearInterval(heartbeat); clients.delete(res); if (!clients.size) streams.delete(code); }); return;
      }
      if (method !== 'POST') fail(405,'This action needs a POST request.');
      const data=await body(req);
      const changed=transaction(() => {
        const room=getRoom(code); const mid=String(me.id);
        if (room.status === 'solved' && action !== 'read') fail(409,'This case is closed. Its record is preserved; start a new investigation to play again.');
        if (action === 'read' || action === 'publish') {
          const clue=clues.find(c => c.id === data.id); if (!clue) fail(400,'Unknown evidence.');
          const published=one('SELECT clue FROM publications WHERE room=? AND clue=?',code,clue!.id);
          if (me.role !== 'solo' && clue!.role !== me.role && !published) fail(403,'That evidence belongs to the other folder.');
          run('INSERT OR IGNORE INTO reads VALUES (?,?)',mid,clue!.id);
          if (action === 'read' || published) return false;
          run('INSERT INTO publications VALUES (?,?,?)',code,clue!.id,mid); log(code,mid,'published',`${clue!.id}: ${clue!.title}`);
        } else if (action === 'board') {
          if (data.version !== room.version) fail(409,'Your partner updated the desk. Your move was not saved.');
          if (!Array.isArray(data.order) || data.order.length !== 4 || new Set(data.order).size !== 4 || data.order.some(x => !events.some(e => e.id === x))) fail(400,'The timeline must contain each event exactly once.');
          const ordering=data.order as string[];
          run('UPDATE rooms SET ordering=? WHERE code=?',JSON.stringify(ordering),code); log(code,mid,'arranged',`Chronology: ${ordering.map(id=>events.find(e=>e.id===id)!.title).join(' → ')}.`);
        } else if (action === 'theory') {
          if (!['eli','mara','jules'].includes(String(data.who)) || !['north','studio','loading'].includes(String(data.where)) || !['light','repair','collection'].includes(String(data.why)) || !['17:30','17:34','17:36'].includes(String(data.when))) fail(400,'Complete all four parts of your explanation.');
          if (!Array.isArray(data.evidence) || data.evidence.length < 2 || data.evidence.length > 8 || new Set(data.evidence).size !== data.evidence.length || data.evidence.some(x => typeof x !== 'string')) fail(400,'Cite at least two different pieces of evidence.');
          const citations=data.evidence as string[];
          if (citations.some(c => !one('SELECT clue FROM publications WHERE room=? AND clue=?',code,c))) fail(400,'Publish your supporting evidence before citing it.');
          if (!citations.some(c => c.startsWith('F')) || !citations.some(c => c.startsWith('A'))) fail(400,'Cite evidence from both the field and archive folders.');
          const theory={who:data.who,where:data.where,why:data.why,when:data.when,evidence:citations} as Theory;
          const result=assess(theory,JSON.parse(String(room.ordering)));
          run('INSERT INTO attempts(room,member,body,correct,at) VALUES (?,?,?,?,?)',code,mid,JSON.stringify(theory),result.correct?1:0,now());
          run('UPDATE rooms SET status=?,feedback=? WHERE code=?',result.correct?'solved':'open',result.feedback,code);
          log(code,mid,result.correct?'solved':'hypothesis',result.correct?'Resolved The Blue Hour with evidence.':`Tested a hypothesis. ${result.feedback}`);
        } else fail(404,'Unknown action.');
        run('UPDATE rooms SET updated=?,version=version+1 WHERE code=?',now(),code);
        return true;
      });
      if (changed) broadcast(code);
      return json(res,200,roomState(code,sid));
    }
    if (method !== 'GET' && method !== 'HEAD') fail(405,'Method not supported.');
    const root=resolve('dist'); let relative: string; try { relative=decodeURIComponent(path); } catch { fail(400,'Invalid URL.'); }
    const file=resolve(root,`.${relative!}`);
    if (file !== root && !file.startsWith(root+sep)) fail(404,'Not found.');
    if (existsSync(file) && statSync(file).isFile()) return staticFile(req,res,file);
    if (path === '/' || path === '/after-hours' || /^\/(?:case|play)\/[a-f0-9]{12}\/?$/.test(path)) {
      if (!existsSync(resolve(root,'index.html'))) fail(503,'Run pnpm build before starting the app.');
      return staticFile(req,res,resolve(root,'index.html'));
    }
    res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'}); res.end('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not found | Lost &amp; Found</title><link rel="stylesheet" href="/readme.css"><main><h1>This file is missing.</h1><p>The page could not be found.</p><a href="/">Return to the case files</a></main></html>');
  } catch(e) {
    if(res.headersSent){res.end();return}
    const status=e instanceof HttpError?e.status:500;
    console.error(JSON.stringify({at:now(),...trace,outcome:'rejected',status,action:status===500?'server_error':'request_rejected'}));
    json(res,status,{error:status===500?'Something went wrong. Please reload to check your saved investigation before retrying.':escape((e as Error).message),requestId:trace.requestId});
  }
});
server.listen(Number(process.env.PORT ?? 8080),process.env.HOST ?? '0.0.0.0',() => console.log(JSON.stringify({action:'listening',port:Number(process.env.PORT ?? 8080)})));
function shutdown() { for (const clients of streams.values()) for (const res of clients) res.end(); server.close(() => { db.close(); process.exit(0); }); setTimeout(() => process.exit(0),3000).unref(); }
process.on('SIGINT',shutdown); process.on('SIGTERM',shutdown);
