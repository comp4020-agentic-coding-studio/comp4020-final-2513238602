import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, ArrowUpRight, ArrowLeft, ArrowUp, ArrowDown, Check, CheckCircle, Users, User, Copy, X, FileText, ClockCounterClockwise, Eye, PaperPlaneTilt, MagnifyingGlass, BookOpen, SpinnerGap } from '@phosphor-icons/react';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/libre-caslon-display/400.css';
import '@fontsource/ibm-plex-mono/400.css';
import './style.css';
import type { Clue, Investigation, Mode, RoomState, Theory } from '../shared/types.ts';

class ApiError extends Error { status: number; constructor(status: number, message: string) { super(message); this.status=status; } }
async function api<T>(path: string, data?: unknown): Promise<T> {
  const res=await fetch(path,{method:data===undefined?'GET':'POST',headers:data===undefined?{}:{'Content-Type':'application/json'},body:data===undefined?undefined:JSON.stringify(data)});
  const value=await res.json(); if(!res.ok) throw new ApiError(res.status,value.error ?? 'Please try again.'); return value as T;
}
const roleName=(role:string)=>role==='solo'?'Both folders':role==='field'?'Field investigator':'Archive investigator';
const time=(value:string)=>new Intl.DateTimeFormat('en-AU',{hour:'2-digit',minute:'2-digit'}).format(new Date(value));

function Brand(){return <a className="brand" href="/" aria-label="Lost and Found home"><span className="brand-mark" aria-hidden="true">&amp;</span><span>lost<span className="brand-join"> &amp; </span>found<span className="brand-caption">THE SMALL MYSTERY CLUB</span></span></a>}
function Header(){return <header className="site-header"><Brand/><nav aria-label="Main navigation"><a href="/#case">The case</a><a href="/#how">How to play</a><a href="/readme/">Project notes <ArrowUpRight size={14}/></a></nav></header>}
function Footer(){return <footer className="site-footer"><span>Made for curious people, together.</span><a href="/readme/">What good means here <ArrowUpRight size={14}/></a><span>A fictional case. A shared discovery.</span></footer>}

function Modal({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}){
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const el=ref.current;el?.showModal();return()=>el?.close()},[]);
  return <dialog ref={ref} className="modal" aria-labelledby="modal-title" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose()}}><div className="modal-inner"><button className="icon-button modal-close" aria-label="Close dialog" onClick={onClose}><X size={22}/></button><h2 id="modal-title">{title}</h2>{children}</div></dialog>
}

function StartForm({code,onClose}:{code?:string;onClose:()=>void}){
  const [mode,setMode]=useState<Mode>('solo');const [name,setName]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  async function submit(e:React.FormEvent){e.preventDefault();setError('');setBusy(true);try{const room=await api<RoomState>(code?`/api/rooms/${code}/join`:'/api/rooms',{mode,name});location.assign(`/case/${room.code}`)}catch(e){setError((e as Error).message);setBusy(false)}}
  return <form onSubmit={submit} className="start-form"><p>{code?'Your partner has the field folder. Your archive records may explain what they found.':'Choose how to investigate. Everything you discover is saved as you go.'}</p>
    <label htmlFor="investigator-name">What should we call you?</label><input id="investigator-name" name="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name or a nickname" maxLength={24} autoComplete="nickname" required autoFocus/>
    {!code&&<fieldset className="mode-options"><legend>Investigation mode</legend><label className={mode==='solo'?'chosen':''}><input type="radio" name="mode" value="solo" checked={mode==='solo'} onChange={()=>setMode('solo')}/><User size={22}/><span><strong>Go solo</strong><small>Both folders. Your own pace.</small></span></label><label className={mode==='duo'?'chosen':''}><input type="radio" name="mode" value="duo" checked={mode==='duo'} onChange={()=>setMode('duo')}/><Users size={22}/><span><strong>Bring a partner</strong><small>Different clues. One shared desk.</small></span></label></fieldset>}
    <p className="privacy-note">No account needed. This browser remembers you for 30 days. Clearing its cookies loses access to your saved investigations.</p>
    {error&&<p className="error" role="alert">{error}</p>}<button className="button primary wide" disabled={busy||!name.trim()}>{busy?<><SpinnerGap className="spin" size={20}/> Opening…</>:<>{code?'Join investigation':'Begin investigation'}<ArrowRight size={20}/></>}</button><button type="button" className="text-button wide" onClick={onClose}>Go back</button>
  </form>
}

function Home(){
  const [start,setStart]=useState(false);const [saved,setSaved]=useState<Investigation[]>([]);
  useEffect(()=>{api<{investigations:Investigation[]}>('/api/me').then(x=>setSaved(x.investigations)).catch(()=>{})},[]);
  return <><a className="skip" href="#main">Skip to content</a><Header/><main id="main">
    <section className="hero shell"><div className="hero-copy"><p className="eyebrow"><span className="tiny-rule"/> A SHORT COOPERATIVE MYSTERY</p><h1>Something’s<br/>missing.</h1><p className="hero-description">An empty plinth. Eight pieces of evidence.<br className="desktop-break"/> One story to put back together.</p><div className="hero-actions"><button className="button primary" onClick={()=>setStart(true)}>Open the case <ArrowUpRight size={21}/></button><a className="text-link" href="#how">How it works <ArrowRight size={17}/></a></div></div>
    <div className="hero-art"><div className="photo-sheet"><img src="/images/gallery.webp" alt="An empty plinth in a quiet gallery, with blue light falling on the wall." width="1536" height="1024" fetchPriority="high"/><div className="photo-caption"><span>GALLERY 2</span><span>17:40 / BEFORE OPENING</span></div></div><div className="case-tab"><span>CASE FILE</span><strong>001</strong></div><div className="art-note"><span className="note-arrow">↳</span> Everything is here.<br/>Except the obvious.</div></div></section>
    <section className="case-intro shell" id="case"><div className="case-number" aria-hidden="true">01</div><div className="case-heading"><p className="label">THE OPEN FILE</p><h2>The Blue Hour</h2><p>An exhibition is about to open. Its centrepiece has vanished. <br/>A camera, a clock and a signed note tell different stories. Or do they?</p></div><dl className="case-facts"><div><dt>PLAYERS</dt><dd>1 or 2</dd></div><div><dt>PLAY TIME</dt><dd>About 5 min</dd></div><div><dt>YOUR TASK</dt><dd>Follow the evidence</dd></div></dl></section>
    {saved.length>0&&<section className="saved-section shell" aria-labelledby="saved-heading"><h2 id="saved-heading">Your open files</h2><div className="saved-list">{saved.slice(0,4).map(r=><a className="saved-case" href={`/case/${r.code}`} key={r.code}><span className="saved-icon">{r.status==='solved'?<CheckCircle size={24}/>:<ClockCounterClockwise size={24}/>}</span><span><strong>The Blue Hour</strong><small>{r.mode==='solo'?'Solo':'Together'} · {r.status==='solved'?'Case closed':'In progress'} · {new Date(r.updatedAt).toLocaleDateString('en-AU')}</small></span><span className="resume-label">{r.status==='solved'?'Revisit':'Continue'}</span><ArrowRight size={19}/></a>)}</div></section>}
    <section className="how-section shell" id="how"><div><span className="label">A LITTLE CURIOSITY GOES A LONG WAY</span><h2>Two perspectives.<br/>One discovery.</h2><p>Play at the same table, or talk over a call.<br/>Your partner might have the detail you’re missing.</p></div><ol className="how-list"><li><BookOpen size={25}/><div><h3>Open your folder</h3><p>Read the records. In a pair, each person starts with a different half of the evidence.</p></div></li><li><PaperPlaneTilt size={25}/><div><h3>Put your clues together</h3><p>Share what matters and rebuild the sequence of events on your investigation desk.</p></div></li><li><MagnifyingGlass size={25}/><div><h3>Make your case</h3><p>Explain what happened, cite your evidence, and see whether the story holds up.</p></div></li></ol></section>
  </main><Footer/>{start&&<Modal title="Open your investigation" onClose={()=>setStart(false)}><StartForm onClose={()=>setStart(false)}/></Modal>}</>
}

function RoutePlan(){return <div className="route-plan" role="img" aria-label="Gallery 2 connects north to the North Store, south to the conservation studio, and west to the loading bay."><div className="map-north">N ↑</div><div className="map-store"><span>NORTH STORE</span><small>Controlled light / rack C</small></div><div className="map-connector"/><div className="map-gallery">GALLERY 2</div><div className="map-route-note">North corridor</div><div className="map-other"><span>← Loading bay</span><span>↓ Conservation studio</span></div></div>}

function EvidenceDocument({clue,onPublish,busy,solved}:{clue:Clue;onPublish:()=>void;busy:boolean;solved:boolean}){
  return <article className="evidence-document" key={clue.id} aria-labelledby="document-title"><div className="document-meta"><span>{clue.kind}</span><span className="evidence-id">{clue.id}</span></div><p className="document-label">{clue.label}</p><h2 id="document-title">{clue.title}</h2>
    {clue.image&&<img className="document-photo" src={clue.image} alt="The empty gallery plinth. No broken glass or disturbed fittings are visible." width="1536" height="1024"/>}
    {clue.id==='F4'&&<RoutePlan/>}
    <div className="document-body">{clue.body.map((p,i)=><p key={i}>{p}</p>)}</div>
    {clue.rows&&<table className="record-table"><caption className="sr-only">{clue.title}</caption><thead><tr>{(clue.id==='F2'?['Time','Card','Activity']:['Direction','Destination','Detail']).map(x=><th scope="col" key={x}>{x}</th>)}</tr></thead><tbody>{clue.rows.map((r,i)=><tr key={i}>{r.map((x,j)=><td key={j}>{x}</td>)}</tr>)}</tbody></table>}
    {clue.detail&&<p className="document-footnote">{clue.detail}</p>}
    <div className="document-action">{clue.published?<span className="published-label"><CheckCircle size={20}/> On the shared desk</span>:<button className="button primary" disabled={busy||solved} onClick={onPublish}><PaperPlaneTilt size={18}/> Add to shared desk</button>}<span>{clue.published?'Available to cite in your explanation.':'Make this evidence available to your investigation.'}</span></div>
  </article>
}

function TheoryForm({room,onSubmit,busy}:{room:RoomState;onSubmit:(data:Theory)=>Promise<void>;busy:boolean}){
  const [theory,setTheory]=useState<Theory>({who:'',where:'',why:'',when:'',evidence:[]});
  const published=room.clues.filter(c=>c.published);
  const ready=theory.who&&theory.where&&theory.why&&theory.when&&theory.evidence.some(x=>x.startsWith('F'))&&theory.evidence.some(x=>x.startsWith('A'));
  return <form className="theory-form" onSubmit={e=>{e.preventDefault();void onSubmit(theory)}}><p>Explain where Blue Hour went. Support your account with evidence from both folders.</p>
    <label htmlFor="who">Who moved the sculpture?</label><select id="who" value={theory.who} onChange={e=>setTheory({...theory,who:e.target.value})} required><option value="">Choose a person</option><option value="eli">Eli Ward, technician</option><option value="mara">Mara Singh, registrar</option><option value="jules">Jules Hart, courier</option></select>
    <label htmlFor="where">Where did it go?</label><select id="where" value={theory.where} onChange={e=>setTheory({...theory,where:e.target.value})} required><option value="">Choose a destination</option><option value="studio">Conservation studio</option><option value="north">North Store, rack C</option><option value="loading">Loading bay</option></select>
    <label htmlFor="why">Why was it moved?</label><select id="why" value={theory.why} onChange={e=>setTheory({...theory,why:e.target.value})} required><option value="">Choose a reason</option><option value="collection">A courier was collecting it</option><option value="repair">It needed a damage repair</option><option value="light">To protect it from direct sunlight</option></select>
    <label htmlFor="when">When did it actually leave the gallery?</label><select id="when" value={theory.when} onChange={e=>setTheory({...theory,when:e.target.value})} required><option value="">Choose the corrected time</option><option value="17:30">17:30</option><option value="17:34">17:34</option><option value="17:36">17:36</option></select>
    <fieldset className="citation-list"><legend>Cite your evidence</legend><p>At least one field clue and one archive clue. Add clues to the shared desk to use them here.</p>{published.length===0&&<div className="empty-inline">Your desk is empty. Read and share a clue first.</div>}{published.map(c=><label key={c.id}><input type="checkbox" checked={theory.evidence.includes(c.id)} onChange={e=>setTheory({...theory,evidence:e.target.checked?[...theory.evidence,c.id]:theory.evidence.filter(x=>x!==c.id)})}/><span className="mono">{c.id}</span><span>{c.title}</span></label>)}</fieldset>
    {room.lastFeedback&&<p className="theory-feedback" role="status">{room.lastFeedback}</p>}<button className="button primary wide" disabled={busy||!ready}>{busy?'Checking…':'Submit explanation'}<ArrowRight size={20}/></button>
  </form>
}

function Desk({code}:{code:string}){
  const [room,setRoom]=useState<RoomState|null>(null);const [selected,setSelected]=useState('');const [error,setError]=useState('');const [join,setJoin]=useState(false);const [busy,setBusy]=useState(false);const [modal,setModal]=useState<'theory'|'record'|'invite'|null>(null);const [connected,setConnected]=useState(false);const [notice,setNotice]=useState('');const [copied,setCopied]=useState(false);
  const latestVersion=useRef(-1);const [folder,setFolder]=useState<'all'|'shared'>('all');
  function accept(next:RoomState){if(next.version<latestVersion.current)return;latestVersion.current=next.version;setRoom(next);setSelected(previous=>previous&&next.clues.some(c=>c.id===previous)?previous:next.clues[0]?.id??'');}
  async function refresh(){const next=await api<RoomState>(`/api/rooms/${code}`);accept(next)}
  useEffect(()=>{let live=true;api<RoomState>(`/api/rooms/${code}`).then(next=>{if(live)accept(next)}).catch(e=>{if(live){if(e.status===403)setJoin(true);else setError(e.message)}});return()=>{live=false}},[code]);
  const memberId=room?.me.id;
  useEffect(()=>{
    if(!memberId)return;
    let alive=true;let stream:EventSource|undefined;
    const sync=()=>{void api<RoomState>(`/api/rooms/${code}`).then(next=>{if(alive)accept(next)}).catch(()=>{if(alive)setConnected(false)})};
    const connect=()=>{
      stream?.close();
      stream=new EventSource(`/api/rooms/${code}/events`);
      stream.onopen=()=>{if(alive){setConnected(true);sync()}};
      stream.onerror=()=>{if(alive)setConnected(false)};
      stream.addEventListener('update',sync);
    };
    const offline=()=>{stream?.close();setConnected(false)};
    // A brief network outage can leave a nominally open stream missing an update.
    // Explicitly reopen and fetch a snapshot when the browser reports recovery.
    const online=()=>{connect();sync()};
    const visible=()=>{if(document.visibilityState==='visible'&&navigator.onLine)sync()};
    connect();window.addEventListener('offline',offline);window.addEventListener('online',online);document.addEventListener('visibilitychange',visible);
    return()=>{alive=false;stream?.close();window.removeEventListener('offline',offline);window.removeEventListener('online',online);document.removeEventListener('visibilitychange',visible)};
  },[code,memberId]);
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),4500);return()=>clearTimeout(timer)},[notice]);
  async function mutate(action:string,data:unknown){setError('');setBusy(true);try{const next=await api<RoomState>(`/api/rooms/${code}/${action}`,data);accept(next);setNotice(action==='publish'?'Evidence added. Saved to your investigation.':action==='board'?'Chronology saved.':action==='theory'?next.lastFeedback??'Explanation saved.':'');if(next.status==='solved')setModal(null);return next}catch(e){setError((e as Error).message);if(e instanceof ApiError&&e.status===409)await refresh().catch(()=>{});return null}finally{setBusy(false)}}
  async function openClue(c:Clue){setSelected(c.id);if(!c.read){try{accept(await api<RoomState>(`/api/rooms/${code}/read`,{id:c.id}))}catch{/* Reading the already loaded document remains possible. */}}}
  async function move(index:number,direction:number){if(!room)return;const order=[...room.order];[order[index],order[index+direction]]=[order[index+direction],order[index]];await mutate('board',{order,version:room.version})}
  if(!room)return <><Header/><main className="shell loading-page">{join?<><p className="label">AN INVITATION TO INVESTIGATE</p><h1>Your other half<br/>of the story.</h1><div className="join-panel"><StartForm code={code} onClose={()=>location.assign('/')}/></div></>:error?<><h1>This file won’t open.</h1><p role="alert">{error}</p><a href="/" className="button primary">Return to the case files <ArrowLeft size={18}/></a></>:<p role="status"><SpinnerGap size={24} className="spin"/> Opening the case file…</p>}</main></>;
  const clue=room.clues.find(c=>c.id===selected)??room.clues[0];const visible=room.clues.filter(c=>folder==='all'||c.published);const solved=room.status==='solved';
  return <><a className="skip" href="#investigation">Skip to investigation</a><header className="desk-header"><Brand/><div className="desk-case-name"><span className="label">CASE 001</span><strong>The Blue Hour</strong></div><div className="desk-header-actions"><a href="/readme/" className="notes-link">Project notes</a><button className="text-button" onClick={()=>setModal('record')}><ClockCounterClockwise size={19}/><span>Case record</span></button><a href="/" className="icon-button" aria-label="Return to case files"><X size={21}/></a></div></header>
    <main id="investigation" className="desk-main">{room.status!=='solved'&&<h1 className="sr-only">The Blue Hour investigation</h1>}<div className="investigation-bar"><div className="investigator"><span className="initial">{room.me.name.charAt(0).toUpperCase()}</span><div><strong>{room.me.name}</strong><span>{roleName(room.me.role)}</span></div></div><div className="connection" role="status"><span className={connected?'status-dot':'status-dot offline'}/>{connected?'Connected':'Reconnecting…'}<span className="saved-time">Saved {time(room.updatedAt)}</span></div>{room.mode==='duo'?<button className="button secondary small" onClick={()=>setModal('invite')}><Users size={17}/>{room.members.length===1?'Invite your partner':`With ${room.members.find(m=>m.id!==room.me.id)?.name}`}</button>:<span className="solo-label"><User size={17}/> Solo investigation</span>}</div>
    {error&&<div className="desk-error" role="alert">{error}<button className="icon-button" onClick={()=>setError('')} aria-label="Dismiss error"><X size={18}/></button></div>}
    {solved&&<section className="solved-banner" aria-labelledby="solved-title"><CheckCircle size={40}/><div><span className="label">MYSTERY RESOLVED</span><h1 id="solved-title">Found, not stolen.</h1><p>The two sides of the story finally agree.</p></div><button className="button secondary" onClick={()=>setModal('record')}>Read the whole story <ArrowRight size={18}/></button></section>}
    <nav className="mobile-desk-nav" aria-label="Investigation sections"><a href="#evidence-folder">Evidence</a><a href="#document">Read clue</a><a href="#timeline">Chronology</a></nav>
    <div className="desk-grid"><aside className="evidence-folder" id="evidence-folder"><div className="folder-top"><span className="label">YOUR EVIDENCE</span><span className="mono">{room.clues.length} / 8</span></div><div className="folder-tabs" aria-label="Evidence filter"><button aria-pressed={folder==='all'} onClick={()=>setFolder('all')}>Your folder</button><button aria-pressed={folder==='shared'} onClick={()=>setFolder('shared')}>Shared desk <span>{room.publishedCount}</span></button></div>
    <div className="clue-list">{visible.map(c=><button className={`clue-button ${c.id===selected?'active':''}`} onClick={()=>void openClue(c)} key={c.id} aria-pressed={c.id===selected}><span className="clue-tag">{c.id}</span><span><strong>{c.title}</strong><small>{c.kind}</small></span>{c.published?<Check size={17} aria-label="Shared"/>:c.read?<Eye size={17} aria-label="Read"/>:<span className="unread-label">NEW</span>}</button>)}{visible.length===0&&<p className="folder-empty">Read a clue, then add it to the shared desk. Your evidence will appear here.</p>}</div>
    {room.mode==='duo'&&room.clues.length<8&&<div className="partner-note"><Users size={23}/><p>Your partner has the other folder. Their evidence appears here when they share it.</p></div>}<div className="case-reminder"><span className="label">THE QUESTION</span><p>Who moved Blue Hour,<br/>where did it go,<br/>and why?</p><span>No timer. Take a closer look.</span></div></aside>
    <section className="document-area" id="document" aria-label="Selected evidence">{clue&&<EvidenceDocument clue={clue} busy={busy} solved={solved} onPublish={()=>void mutate('publish',{id:clue.id})}/>}</section>
    <aside className="timeline-panel" id="timeline"><div className="timeline-heading"><span className="label">THE SHARED CHRONOLOGY</span><h2>What happened first?</h2><p>Arrange these events from earliest to latest. Check the clocks before you decide.</p></div><ol className="timeline-list">{room.order.map((eventId,index)=>{const event=room.events.find(e=>e.id===eventId)!;return <li key={eventId}><span className="timeline-index">{String(index+1).padStart(2,'0')}</span><div><strong>{event.title}</strong><p>{event.description}</p></div><div className="sort-buttons"><button className="sort-button" aria-label={`Move ${event.title} earlier`} disabled={index===0||busy||solved} onClick={()=>void move(index,-1)}><ArrowUp size={15}/></button><button className="sort-button" aria-label={`Move ${event.title} later`} disabled={index===room.order.length-1||busy||solved} onClick={()=>void move(index,1)}><ArrowDown size={15}/></button></div></li>})}</ol><div className="theory-prompt"><MagnifyingGlass size={27}/><h3>Does your story hold up?</h3><p>Use clues from both folders to explain the missing sculpture.</p><button className="button primary wide" onClick={()=>setModal(solved?'record':'theory')}>{solved?'Revisit the conclusion':'Make your case'}<ArrowRight size={18}/></button>{room.attempts>0&&<span className="attempt-count">{room.attempts} explanation{room.attempts!==1?'s':''} in your case record</span>}</div></aside></div>
    </main><div className={`toast ${notice?'visible':''}`} role="status" aria-live="polite">{notice&&<><CheckCircle size={20}/><span>{notice}</span></>}</div>
    {modal==='theory'&&<Modal title="Make your case" onClose={()=>setModal(null)}>{error&&<p className="error" role="alert">{error}</p>}<TheoryForm room={room} busy={busy} onSubmit={async data=>{await mutate('theory',data)}}/></Modal>}
    {modal==='record'&&<Modal title={solved?'The whole story':'Your case record'} onClose={()=>setModal(null)}>{solved&&<div className="resolution"><span className="resolved-stamp">CASE CLOSED</span>{room.solution?.map((p,i)=><p key={i}>{p}</p>)}</div>}<p className="record-intro">Your investigation, saved as it unfolded. {room.attempts} explanation{room.attempts!==1?'s':''} submitted.</p><ol className="activity-list">{room.activity.map(a=><li key={a.id}><time dateTime={a.at}>{time(a.at)}</time><div><strong>{a.name}</strong><p>{a.detail}</p></div></li>)}</ol></Modal>}
    {modal==='invite'&&<Modal title="The story has two sides." onClose={()=>setModal(null)}><p className="invite-intro">Send this link to one partner. They will receive the archive folder. Talk at the same table or over a call.</p><label htmlFor="invite-link">Invitation link</label><div className="invite-field"><input id="invite-link" readOnly value={`${location.origin}/case/${code}`} onFocus={e=>e.target.select()}/><button className="icon-button" aria-label="Copy invitation link" onClick={async()=>{try{await navigator.clipboard.writeText(`${location.origin}/case/${code}`);setCopied(true)}catch{setCopied(false);setError('Select and copy the invitation link manually.')}}}><Copy size={22}/></button></div><p className="privacy-note" role="status">{copied?'Link copied.':'Anyone with this link can claim the second seat. Share it with your partner only.'}</p>{location.hostname==='localhost'||location.hostname==='127.0.0.1'?<p className="local-note">Local preview: use a separate browser profile on this computer. This address is not accessible from another device.</p>:null}<div className="invite-members">{room.members.map(m=><p key={m.id}><Check size={18}/><strong>{m.name}</strong><span>{roleName(m.role)}</span></p>)}</div></Modal>}
  </>
}

function App(){const match=location.pathname.match(/^\/case\/([a-f0-9]{12})\/?$/);return match?<Desk code={match[1]}/>:<Home/>}
createRoot(document.getElementById('root')!).render(<App/>);
