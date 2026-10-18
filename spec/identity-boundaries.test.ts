import { expect, inject, it } from 'vitest';
import type { RoomState } from '../shared/types.ts';

const base = inject('baseUrl');
const order = ['sun', 'permission', 'move', 'arrival'];

function requester(cookie: string) {
  return async function call<T = RoomState>(path: string, data?: unknown) {
    const response = await fetch(`${base}${path}`, {
      method: data === undefined ? 'GET' : 'POST',
      signal: AbortSignal.timeout(5000),
      headers: { cookie, ...(data === undefined ? {} : { 'content-type': 'application/json' }) },
      body: data === undefined ? undefined : JSON.stringify(data),
    });
    return { status: response.status, value: await response.json() as T };
  };
}

async function client() {
  const response = await fetch(`${base}/api/me`);
  expect(response.status).toBe(200);
  const setCookie = response.headers.get('set-cookie');
  if (!setCookie) throw new Error('A fresh browser must receive a session cookie.');
  return { call: requester(setCookie.split(';')[0]) };
}

it('keeps shared actions attributable when two members use the same nickname', async () => {
  const field = await client();
  const archive = await client();
  const opened = await field.call('/api/rooms', { name: 'Same investigator', mode: 'duo' });
  expect(opened.status).toBe(201);
  const path = `/api/rooms/${opened.value.code}`;
  const joined = await archive.call(`${path}/join`, { name: 'Same investigator' });
  expect(joined.status).toBe(200);
  expect(joined.value.me.id).not.toBe(opened.value.me.id);

  const first = await field.call(`${path}/board`, { order, version: joined.value.version });
  expect(first.status).toBe(200);
  const second = await archive.call(`${path}/board`, {
    order: [...order].reverse(), version: first.value.version,
  });
  expect(second.status).toBe(200);

  const restored = await field.call(path);
  expect(restored.status).toBe(200);
  expect(restored.value.activity.filter(event => event.action === 'arranged').map(event => ({
    name: event.name, memberId: event.memberId, role: event.role,
  }))).toEqual([
    { name: 'Same investigator', memberId: joined.value.me.id, role: 'archive' },
    { name: 'Same investigator', memberId: opened.value.me.id, role: 'field' },
  ]);
});

it('publishes once across concurrent requests and leaves later repeats unchanged', async () => {
  const field = await client();
  const archive = await client();
  const opened = await field.call('/api/rooms', { name: 'Publisher', mode: 'duo' });
  expect(opened.status).toBe(201);
  const path = `/api/rooms/${opened.value.code}`;
  const joined = await archive.call(`${path}/join`, { name: 'Arranger' });
  expect(joined.status).toBe(200);

  const publications = await Promise.all([
    field.call(`${path}/publish`, { id: 'F2' }),
    field.call(`${path}/publish`, { id: 'F2' }),
  ]);
  expect(publications.map(result => result.status)).toEqual([200, 200]);
  const published = await archive.call(path);
  expect(published.status).toBe(200);
  expect(published.value.version).toBe(joined.value.version + 1);
  expect(published.value.publishedCount).toBe(1);
  expect(published.value.activity).toHaveLength(joined.value.activity.length + 1);
  expect(published.value.activity.filter(event => event.action === 'published')).toHaveLength(1);
  expect(publications.map(result => result.value.version)).toEqual([
    published.value.version, published.value.version,
  ]);

  // Keep the timestamp comparison meaningful even on a very fast local server.
  await new Promise(resolve => setTimeout(resolve, 10));
  const repeats = await Promise.all([
    field.call(`${path}/publish`, { id: 'F2' }),
    field.call(`${path}/publish`, { id: 'F2' }),
  ]);
  for (const repeat of repeats) {
    expect(repeat.status).toBe(200);
    expect(repeat.value.version).toBe(published.value.version);
    expect(repeat.value.updatedAt).toBe(published.value.updatedAt);
    expect(repeat.value.activity).toEqual(published.value.activity);
  }
  const arranged = await archive.call(`${path}/board`, {
    order, version: published.value.version,
  });
  expect(arranged.status).toBe(200);
  expect(arranged.value.version).toBe(published.value.version + 1);
  expect(arranged.value.order).toEqual(order);
});

it('does not let a fabricated session cookie impersonate an existing member', async () => {
  const owner = await client();
  const opened = await owner.call('/api/rooms', { name: 'Cookie owner', mode: 'solo' });
  expect(opened.status).toBe(201);
  const path = `/api/rooms/${opened.value.code}`;
  const forged = requester(`lf_session=${'0'.repeat(64)}`);

  expect((await forged(path)).status).toBe(403);
  expect((await forged(`${path}/events`)).status).toBe(403);
  expect((await forged(`${path}/publish`, {
    id: 'F2', memberId: opened.value.me.id, role: 'solo',
  })).status).toBe(403);
  expect((await forged(`${path}/board`, {
    order, version: opened.value.version, memberId: opened.value.me.id, role: 'solo',
  })).status).toBe(403);
  expect((await forged(`${path}/join`, { name: 'Cookie owner' })).status).toBe(409);

  const restored = await owner.call(path);
  expect(restored.status).toBe(200);
  expect(restored.value.me).toEqual(opened.value.me);
  expect(restored.value.version).toBe(opened.value.version);
  expect(restored.value.order).toEqual(opened.value.order);
  expect(restored.value.activity).toEqual(opened.value.activity);
});

it('resolves each room membership separately when one session has different roles', async () => {
  const first = await client();
  const second = await client();
  const openedFirst = await first.call('/api/rooms', { name: 'First investigator', mode: 'duo' });
  const openedSecond = await second.call('/api/rooms', { name: 'Second investigator', mode: 'duo' });
  expect(openedFirst.status).toBe(201);
  expect(openedSecond.status).toBe(201);
  const firstPath = `/api/rooms/${openedFirst.value.code}`;
  const secondPath = `/api/rooms/${openedSecond.value.code}`;
  expect((await first.call(secondPath)).status).toBe(403);
  expect((await second.call(firstPath)).status).toBe(403);
  expect((await second.call(`${firstPath}/join`, { name: 'Second investigator' })).status).toBe(200);
  expect((await first.call(`${secondPath}/join`, { name: 'First investigator' })).status).toBe(200);

  const asField = await first.call(firstPath);
  const asArchive = await first.call(secondPath);
  expect(asField.status).toBe(200);
  expect(asArchive.status).toBe(200);
  expect(asField.value.me.role).toBe('field');
  expect(asArchive.value.me.role).toBe('archive');
  expect(asField.value.me.id).not.toBe(asArchive.value.me.id);
  expect(asField.value.clues.map(clue => clue.id)).toEqual(['F1', 'F2', 'F3', 'F4']);
  expect(asArchive.value.clues.map(clue => clue.id)).toEqual(['A1', 'A2', 'A3', 'A4']);
  for (const action of ['read', 'publish']) {
    expect((await first.call(`${firstPath}/${action}`, { id: 'A1' })).status).toBe(403);
    expect((await first.call(`${secondPath}/${action}`, { id: 'F1' })).status).toBe(403);
  }

  const fieldPublication = await first.call(`${firstPath}/publish`, { id: 'F1' });
  const archivePublication = await first.call(`${secondPath}/publish`, { id: 'A1' });
  expect(fieldPublication.status).toBe(200);
  expect(archivePublication.status).toBe(200);
  expect(fieldPublication.value.activity[0]).toMatchObject({
    memberId: asField.value.me.id, role: 'field', action: 'published',
  });
  expect(archivePublication.value.activity[0]).toMatchObject({
    memberId: asArchive.value.me.id, role: 'archive', action: 'published',
  });
  const firstRooms = await first.call<{ investigations: { code: string; role: string }[] }>('/api/me');
  expect(firstRooms.value.investigations).toEqual(expect.arrayContaining([
    expect.objectContaining({ code: openedFirst.value.code, role: 'field' }),
    expect.objectContaining({ code: openedSecond.value.code, role: 'archive' }),
  ]));
});
