import { once } from 'node:events';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { evidence as partyEvidence, rules as partyRules } from '../server/after-hours-case.ts';
import { duties, dutyNames } from '../shared/after-hours.ts';

const roomPattern = /^[a-f0-9]{12}$/;
const memberPattern = /^[a-f0-9]{24}$/;
const roles = new Set(['field', 'archive', 'solo', 'workshop', 'routes']);
const operations = new Set(['request', 'snapshot', 'join', 'events', 'read', 'publish', 'board', 'theory', 'inspect', 'claim', 'hint', 'assign', 'note', 'close']);

// These are server-authored public activity descriptions, never request text.
// Fail closed when the server adds a description: do not print arbitrary detail.
const details = {
  opened: new Set(['Opened a solo investigation.', 'Opened a two-person investigation.']),
  joined: new Set(['Joined with the archive folder.']),
  published: new Set([
    'F1: An empty place', 'F2: Who opened the door?', 'F3: Six minutes later?', 'F4: The north corridor',
    'A1: A clock out of step', 'A2: Too much afternoon light', 'A3: The signed instruction', 'A4: Received, intact',
  ]),
  hypothesis: new Set([
    'Tested a hypothesis. Check who carried the case, not who authorised the move. Match the staff initials to the signed instruction.',
    'Tested a hypothesis. Follow the direction in the camera observation, then compare the route with the receiving receipt.',
    'Tested a hypothesis. The condition report separates damage from a precaution. What needed to be prevented?',
    'Tested a hypothesis. The camera display and building clock disagree. Use the service slip to correct the camera timestamp.',
    'Tested a hypothesis. Your explanation fits, but the chronology does not. A clock that is six minutes fast shows 17:36 at what real time?',
  ]),
  solved: new Set(['Resolved The Blue Hour with evidence.']),
};
const chronology = new Set([
  'Sunlight reaches the work', 'The move is authorised', 'The work leaves Gallery 2', 'The work reaches storage',
]);
details.opened.add('Opened After Hours. Scene and object duties are ready; invite a partner for records and routes.');
for (const duty of duties.slice(1)) details.joined.add(`Joined as ${dutyNames[duty]}. ${duty==='archive'?'Also covering routes until a fourth investigator joins.':'The corresponding duty has been transferred to this seat.'}`);
for (const [id,clue] of Object.entries(partyEvidence)) details.published.add(`${id}: ${clue.title}`);
details.solved.add('Resolved After Hours with seven supported deductions and a corrected chronology.');
details.arranged=new Set(['Updated the shared chronology.']);
details.deduced=new Set(partyRules.map(q=>`${q.title} ${q.explanation}`));
details.hint=new Set(partyRules.flatMap(q=>[1,2,3].map(level=>`Revealed hint ${level} of 3 for “${q.title}”.`)));
details.noted=new Set(Object.keys(partyEvidence).map(id=>`Added a discussion note to ${id}.`));
details.handover=new Set(duties.flatMap(d=>[1,2,3,4].map(seat=>`Transferred ${dutyNames[d]} to investigator ${seat}. Previously discovered evidence follows the duty.`)));
for(const q of partyRules)for(const feedback of ['This explanation conflicts with the records. Compare the facts behind your selected evidence, or reveal a hint.','The conclusion needs stronger support. Cite the records that establish both the observation and its interpretation.']) details.hypothesis.add(`${q.title} ${feedback}`);
const savedActions = new Set([...Object.keys(details), 'arranged']);
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
export const MAX_RECORD_CHARS = 65536;
const MAX_NESTING = 256;

function savedDetail(action, detail) {
  if (typeof detail === 'string') {
    if (details[action]?.has(detail)) return detail;
    if (action === 'arranged' && detail.startsWith('Chronology: ') && detail.endsWith('.')) {
      const order = detail.slice('Chronology: '.length, -1).split(' → ');
      if (order.length === 4 && new Set(order).size === 4 && order.every(title => chronology.has(title))) {
        return `Chronology: ${order.join(' → ')}.`;
      }
    }
  }
  return 'Saved detail omitted (unrecognised).';
}

/**
 * Format one complete application JSON object or Fly JSON envelope with a
 * JSON-string `message`. Unknown/malformed records are never echoed. No I/O.
 * @param {string} line
 * @param {{room?: string}} [options]
 * @returns {string | null}
 */
export function formatLogLine(line, { room } = {}) {
  if (typeof line !== 'string' || line.length > MAX_RECORD_CHARS) return null;
  const filter = typeof room === 'string' ? room.toLowerCase() : room;
  if (filter !== undefined && (typeof filter !== 'string' || !roomPattern.test(filter))) return null;
  let event;
  try {
    event = JSON.parse(line);
    if (isRecord(event) && typeof event.message === 'string' && event.outcome === undefined) {
      event = JSON.parse(event.message);
    }
  } catch { return null; }
  if (!isRecord(event) || !['committed', 'rejected'].includes(event.outcome)) return null;
  if (typeof event.at !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(event.at)) return null;
  const time = new Date(event.at);
  if (!Number.isFinite(time.getTime()) || time.toISOString() !== event.at) return null;
  if (event.room !== undefined && (typeof event.room !== 'string' || !roomPattern.test(event.room))) return null;
  if (filter !== undefined && event.room !== filter) return null;
  if (event.member !== undefined && (typeof event.member !== 'string' || !memberPattern.test(event.member))) return null;
  if (event.role !== undefined && !roles.has(event.role)) return null;

  const actor = `room=${event.room ?? 'unknown'} | role=${event.role ?? 'unknown'} | member=${event.member ?? 'unknown'}`;
  if (event.outcome === 'committed') {
    if (!event.room || !event.member || !event.role || !savedActions.has(event.action)) return null;
    if (!Number.isSafeInteger(event.eventId) || event.eventId < 1 || !Number.isSafeInteger(event.version) || event.version < 0) return null;
    // A COMMIT is recorded before the HTTP response; its delivery is not logged.
    return `${event.at} | ${actor} | COMMITTED | action=${event.action} | detail=${savedDetail(event.action, event.detail)}`;
  }
  if (!Number.isInteger(event.status) || event.status < 400 || event.status > 599) return null;
  if (event.action !== (event.status === 500 ? 'server_error' : 'request_rejected') || !operations.has(event.operation)) return null;
  const detail = event.status === 409 ? 'Conflict; request rejected.' : 'Request rejected.';
  return `${event.at} | ${actor} | REJECTED | HTTP ${event.status} | action=${event.operation} | detail=${detail}`;
}

/**
 * Read JSONL and Fly's consecutive, pretty-printed JSON objects from decoded
 * UTF-8 chunks. Keep at most MAX_RECORD_CHARS UTF-16 code units per record.
 * Oversized records and arrays are skipped as whole containers: their nested
 * objects must never become top-level activity. Truncated records are ignored.
 * Mismatched brackets or excessive nesting discard the remaining stream because
 * its object boundaries can no longer be trusted. The stack is also bounded.
 * @param {Iterable<string> | AsyncIterable<string>} chunks
 * @param {{room?: string}} [options]
 * @returns {AsyncGenerator<string>}
 */
export async function* formatLogStream(chunks, options = {}) {
  const containers = [];
  let record = '', inString = false, escaped = false, dropping = false, skipLine = false, invalid = false;
  for await (const chunk of chunks) {
    if (invalid) continue;
    for (const character of chunk) {
      if (containers.length === 0) {
        if (skipLine) { if (character === '\n') skipLine = false; continue; }
        if (/\s/.test(character)) continue;
        if (character !== '{' && character !== '[') { skipLine = true; continue; }
        containers.push(character);
        dropping = character === '[';
        record = dropping ? '' : character;
        continue;
      }
      if (!dropping) {
        if (record.length + character.length > MAX_RECORD_CHARS) { dropping = true; record = ''; }
        else record += character;
      }
      if (inString) {
        if (escaped) escaped = false;
        else if (character === '\\') escaped = true;
        else if (character === '"') inString = false;
      } else if (character === '"') inString = true;
      else if (character === '{' || character === '[') {
        if (containers.length === MAX_NESTING) { invalid = true; record = ''; containers.length = 0; break; }
        containers.push(character);
      }
      else if (character === '}' || character === ']') {
        if (containers.pop() !== (character === '}' ? '{' : '[')) { invalid = true; record = ''; containers.length = 0; break; }
        if (containers.length === 0) {
          if (!dropping) {
            const formatted = formatLogLine(record, options);
            if (formatted !== null) yield formatted;
          }
          record = '';
          dropping = false;
        }
      }
    }
  }
}

const usage = 'Usage: node scripts/format-room-logs.mjs [--room <12-hex-room>]\nReads application JSONL or multiline Fly JSON message envelopes from stdin.\n';

async function main(args) {
  if (args.length === 1 && (args[0] === '--help' || args[0] === '-h')) {
    process.stdout.write(usage);
    return;
  }
  let room;
  if (args.length) {
    if (args.length !== 2 || args[0] !== '--room' || !/^[a-f0-9]{12}$/i.test(args[1])) {
      process.stderr.write(usage);
      process.exitCode = 2;
      return;
    }
    room = args[1].toLowerCase();
  }
  process.stdin.setEncoding('utf8');
  for await (const formatted of formatLogStream(process.stdin, { room })) {
    if (!process.stdout.write(`${formatted}\n`)) await once(process.stdout, 'drain');
  }
}

// Importing the pure formatter must not consume stdin or start the CLI.
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).catch(() => {
    process.stderr.write('Unable to read log input.\n');
    process.exitCode = 1;
  });
}
