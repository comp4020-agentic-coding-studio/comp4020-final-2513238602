import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { serverFixture, wait } from './server-fixture.ts';

const readerUrl = new URL('../scripts/format-room-logs.mjs', import.meta.url);
const { formatLogLine, formatLogStream, MAX_RECORD_CHARS } = await import(readerUrl.href) as {
  formatLogLine: (line: string, options?: { room?: string }) => string | null;
  formatLogStream: (chunks: Iterable<string> | AsyncIterable<string>, options?: { room?: string }) => AsyncGenerator<string>;
  MAX_RECORD_CHARS: number;
};
async function collect(chunks: Iterable<string> | AsyncIterable<string>, options?: { room?: string }) {
  const output = [];
  for await (const line of formatLogStream(chunks, options)) output.push(line);
  return output;
}
const room = 'abcdef123456';
const member = '123456abcdef123456abcdef';
const committed = {
  outcome: 'committed', eventId: 3, at: '2026-10-18T05:12:30.123Z', room, member,
  role: 'field', action: 'published', detail: 'F2: Who opened the door?', version: 2,
};
const rejected = {
  at: committed.at, requestId: 'abcdef123456abcdef123456', operation: 'board', room, member,
  role: 'archive', outcome: 'rejected', status: 409, action: 'request_rejected',
};

it('narrates captured server commits from both roles and a rejected stale move', async () => {
  const server = await serverFixture();
  try {
    await server.start();
    const field = await server.client(), archive = await server.client();
    const opened = await field.call('/api/rooms', { name: 'Private field nickname', mode: 'duo' });
    const path = `/api/rooms/${opened.value.code}`;
    const joined = await archive.call(`${path}/join`, { name: 'Private archive nickname' });
    await field.call(`${path}/publish`, { id: 'F2' });
    const published = await archive.call(`${path}/publish`, { id: 'A4' });
    const order = ['sun', 'permission', 'move', 'arrival'];
    await field.call(`${path}/board`, { version: published.value.version, order });
    expect((await archive.call(`${path}/board`, { version: published.value.version, order })).status).toBe(409);
    await archive.call(`${path}/theory`, { who: 'eli', where: 'north', why: 'light', when: '17:36', evidence: ['F2', 'A4'] });
    await field.call(`${path}/theory`, { who: 'eli', where: 'north', why: 'light', when: '17:30', evidence: ['F2', 'A4'] });
    for (let i = 0; i < 50 && !server.events().some(event => event.action === 'solved'); i++) await wait(20);
    const source = server.events().filter(event => event.room === opened.value.code);
    const output = source.map(event => formatLogLine(JSON.stringify(event)));
    const savedOutput = source.filter(event => event.outcome === 'committed').map(event => formatLogLine(JSON.stringify(event)));
    // stdout and stderr are separate pipes; assert commit order without assuming
    // their chunks arrive in the same order as the HTTP requests.
    expect(source.filter(event => event.outcome === 'committed').map(event => event.action)).toEqual(['opened', 'joined', 'published', 'published', 'arranged', 'hypothesis', 'solved']);
    expect(source.filter(event => event.outcome === 'rejected')).toHaveLength(1);
    expect(output.every(line => line !== null && !line.includes('omitted'))).toBe(true);
    expect(savedOutput[2]).toContain(`role=field | member=${opened.value.me.id} | COMMITTED | action=published | detail=F2: Who opened the door?`);
    expect(savedOutput[3]).toContain(`role=archive | member=${joined.value.me.id} | COMMITTED | action=published | detail=A4: Received, intact`);
    expect(savedOutput[4]).toContain('Chronology: Sunlight reaches the work → The move is authorised → The work leaves Gallery 2 → The work reaches storage.');
    expect(output.find(line => line?.includes('REJECTED'))).toContain('REJECTED | HTTP 409 | action=board | detail=Conflict; request rejected.');
    expect(output.join('\n')).not.toMatch(/Private|nickname|lf_session/);
    expect(savedOutput.join('\n')).not.toContain('HTTP');
  } finally { await server.close(); }
}, 15000);

it('reads raw JSON and Fly JSON message envelopes, with optional exact room filtering', () => {
  const raw = JSON.stringify(committed);
  expect(formatLogLine(JSON.stringify({ message: raw, timestamp: 'transport time', instance: 'ignored' }))).toBe(formatLogLine(raw));
  expect(formatLogLine(raw, { room })).toBe(formatLogLine(raw));
  expect(formatLogLine(raw, { room: room.toUpperCase() })).toBe(formatLogLine(raw));
  expect(formatLogLine(raw, { room: '000000000000' })).toBeNull();
  expect(formatLogLine(raw, { room: 'invalid filter' })).toBeNull();
  expect(formatLogLine(JSON.stringify({ ...committed, room: '000000000000' }))).toContain('room=000000000000');
});

it('streams the observed Fly envelope format across arbitrary chunk boundaries', async () => {
  // Fly logs --json emits consecutive four-space-indented objects, not JSONL
  // or a JSON array. This fixture mirrors its observed keys and types only.
  const fly = (event: unknown) => JSON.stringify({
    level: 'info', instance: 'ignored', message: JSON.stringify(event), region: 'ignored',
    timestamp: committed.at, meta: { nested: [{ arbitrary: 'secret { } [ ] \\ " → 中文\ntext' }] },
  }, null, 4);
  const raw = JSON.stringify(committed);
  const foreign = JSON.stringify({ ...committed, room: '000000000000' });
  const input = `${fly({ action: 'listening', port: 8080 })}\n${raw}\r\n${fly(rejected)}${fly(committed)}\n${foreign}`;
  // One UTF-16 code unit at a time includes boundaries within escape sequences
  // and JSON punctuation. The CLI itself uses Node's UTF-8 stream decoder.
  expect(await collect(input.split(''), { room })).toEqual([formatLogLine(raw), formatLogLine(JSON.stringify(rejected)), formatLogLine(raw)]);
  const result = spawnSync(process.execPath, [fileURLToPath(readerUrl), '--room', room], { input, encoding: 'utf8', windowsHide: true });
  expect(result.status).toBe(0);
  expect(result.stderr).toBe('');
  expect(result.stdout.trim().split('\n')).toEqual(await collect([input], { room }));
  expect(result.stdout).not.toMatch(/secret|ignored|中文|meta|[\x00-\x09\x0b-\x1f\x7f-\x9f]/);
});

it('bounds records and skips oversized containers without promoting nested events', async () => {
  const raw = JSON.stringify(committed);
  const sized = (size: number) => {
    const empty = JSON.stringify({ ...committed, ignored: '' });
    return JSON.stringify({ ...committed, ignored: 'x'.repeat(size - empty.length) });
  };
  const atLimit = sized(MAX_RECORD_CHARS), tooLarge = sized(MAX_RECORD_CHARS + 1);
  expect(atLimit.length).toBe(MAX_RECORD_CHARS);
  expect(tooLarge.length).toBe(MAX_RECORD_CHARS + 1);
  expect(await collect([atLimit, tooLarge, raw])).toEqual([formatLogLine(raw), formatLogLine(raw)]);
  const oversized = JSON.stringify({ secret: 'private-secret '.repeat(MAX_RECORD_CHARS), nested: committed });
  const oversizedString = JSON.stringify({ secret: 'x'.repeat(MAX_RECORD_CHARS) + '}\n{' + raw, nested: committed });
  const input = `${oversized}${oversizedString}[${raw}]\n${JSON.stringify({ payload: committed })}\n${raw}`;
  const chunks = Array.from({ length: Math.ceil(input.length / 137) }, (_, i) => input.slice(i * 137, (i + 1) * 137));
  expect(await collect(chunks)).toEqual([formatLogLine(raw)]);
  const cli = spawnSync(process.execPath, [fileURLToPath(readerUrl)], { input, encoding: 'utf8', windowsHide: true });
  expect(cli.status).toBe(0);
  expect(cli.stderr).toBe('');
  expect(cli.stdout).toBe(`${formatLogLine(raw)}\n`);
});

it('drops truncated or unclosed records through EOF without guessing a restart', async () => {
  const raw = JSON.stringify(committed);
  for (const input of ['{', '{"message":"truncated\\', `{"secret":"${'x'.repeat(MAX_RECORD_CHARS)}\n${raw}`, `{"nested":\n${raw}`, `[${raw}`, `{"payload":${raw}}`, `[${raw}]`]) {
    expect(await collect([input])).toEqual([]);
  }
  expect(await collect([`machine secret ${raw}\n${raw}`])).toEqual([formatLogLine(raw)]);
});

it('does not promote events after mismatched delimiters or excessive nesting', async () => {
  const raw = JSON.stringify(rejected);
  for (const invalid of [`[}\n${raw}\n]`, `{"nested":]\n${raw}\n}`, '['.repeat(1000) + raw + ']'.repeat(1000)]) {
    expect(await collect([invalid, '\n', raw])).toEqual([]);
    expect(await collect(invalid.split(''))).toEqual([]);
  }
});

it('ignores extra fields and never echoes private text or control sequences', () => {
  const secret = 'Private nickname; lf_session=secret-cookie; FLY_API_TOKEN=secret-token';
  const extras = { name: secret, nickname: secret, cookie: secret, token: secret, body: { text: secret }, extra: '\u001b[31mhidden\u001b[0m\nforged line' };
  const raw = JSON.stringify(committed);
  expect(formatLogLine(JSON.stringify({ ...committed, ...extras }))).toBe(formatLogLine(raw));
  const wrapped = JSON.stringify({ message: JSON.stringify({ ...rejected, ...extras }), ...extras });
  expect(formatLogLine(wrapped)).toBe(formatLogLine(JSON.stringify(rejected)));
  for (const detail of [secret, '\u001b[31mF2: Who opened the door?\u001b[0m', 'F2: Who opened the door?\r\nforged line', '\u009b31mhidden', 'visible\u202ehidden']) {
    const output = formatLogLine(JSON.stringify({ ...committed, detail }));
    expect(output).toContain('detail=Saved detail omitted (unrecognised).');
    expect(output).not.toMatch(/secret|nickname|hidden|forged|[\x00-\x1f\x7f-\x9f\u202e]/);
  }
  for (const field of ['at', 'room', 'member', 'role', 'action']) {
    expect(formatLogLine(JSON.stringify({ ...committed, [field]: '\u001b[31m' + secret }))).toBeNull();
  }
  expect(formatLogLine(JSON.stringify({ ...rejected, operation: secret }))).toBeNull();
  expect(formatLogLine(JSON.stringify({ ...rejected, detail: secret }))).not.toContain(secret);
});

it('ignores startup, malformed and unknown records and labels missing rejected identities honestly', () => {
  for (const line of ['', 'not JSON: token=secret', '{broken', 'null', '[]', '42', JSON.stringify({ action: 'listening', port: 8080 }), JSON.stringify({ message: 'machine started' }), JSON.stringify({ ...committed, action: 'read' }), JSON.stringify({ ...committed, at: '2026-02-30T05:12:30.123Z' }), JSON.stringify({ ...rejected, status: '409' })]) {
    expect(formatLogLine(line)).toBeNull();
  }
  const output = formatLogLine(JSON.stringify({ ...rejected, room: undefined, member: undefined, role: undefined, operation: 'request', status: 403 }));
  expect(output).toContain('room=unknown | role=unknown | member=unknown | REJECTED | HTTP 403');
});

it('streams CLI input without Fly and validates arguments without printing them', () => {
  const input = [JSON.stringify({ action: 'listening', port: 8080 }), JSON.stringify(committed), JSON.stringify({ message: JSON.stringify(rejected) }), JSON.stringify({ ...committed, room: '000000000000' }), 'invalid raw secret'].join('\r\n');
  const result = spawnSync(process.execPath, [fileURLToPath(readerUrl), '--room', room], { input, encoding: 'utf8', windowsHide: true });
  expect(result.status).toBe(0);
  expect(result.stderr).toBe('');
  expect(result.stdout.trim().split('\n')).toEqual([formatLogLine(JSON.stringify(committed)), formatLogLine(JSON.stringify(rejected))]);
  const all = spawnSync(process.execPath, [fileURLToPath(readerUrl)], { input, encoding: 'utf8', windowsHide: true });
  expect(all.status).toBe(0);
  expect(all.stdout.trim().split('\n')).toHaveLength(3);
  const invalid = spawnSync(process.execPath, [fileURLToPath(readerUrl), '--room', 'private-secret'], { encoding: 'utf8', windowsHide: true });
  expect(invalid.status).toBe(2);
  expect(invalid.stdout).toBe('');
  expect(invalid.stderr).toContain('Usage:');
  expect(invalid.stderr).not.toContain('private-secret');
});
