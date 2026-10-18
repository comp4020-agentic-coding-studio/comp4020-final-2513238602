import { expect, it } from 'vitest';
import type { Investigation, InvestigationPage, RoomState } from '../shared/types.ts';
import { serverFixture } from './server-fixture.ts';

it('lists every saved investigation after restart with stable, session-scoped pages', async () => {
  const server = await serverFixture();
  try {
    await server.start();
    const owner = await server.client();
    const outsider = await server.client();
    const created: RoomState[] = [];
    for (let i = 0; i < 13; i++) {
      const opened = await owner.call('/api/rooms', { name: `Returning ${i + 1}`, mode: 'solo' });
      expect(opened.status).toBe(201);
      created.push(opened.value as RoomState);
    }
    const oldest = created[0];
    await owner.call(`/api/rooms/${oldest.code}/read`, { id: 'F2' });
    const foreign = await outsider.call('/api/rooms', { name: 'Other browser', mode: 'solo' });
    expect(foreign.status).toBe(201);
    await server.stop();
    await server.start();

    let cursor: string | null = null;
    let firstCursor: string | null = null;
    let addedDuringPaging: string | undefined;
    const records: Investigation[] = [];
    const cursors = new Set<string>();
    do {
      const result = await owner.call(`/api/me${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`);
      expect(result.status).toBe(200);
      const page = result.value as InvestigationPage;
      expect(page.investigations.length).toBeGreaterThan(0);
      expect(page.investigations.length).toBeLessThanOrEqual(4);
      records.push(...page.investigations);
      if (records.length === 4) {
        const added = await owner.call('/api/rooms', { name: 'Opened in another tab', mode: 'solo' });
        expect(added.status).toBe(201);
        addedDuringPaging = added.value.code;
      }
      cursor = page.nextCursor;
      if (cursor) {
        expect(cursors.has(cursor)).toBe(false);
        cursors.add(cursor);
        firstCursor ??= cursor;
      }
    } while (cursor);

    const expected = [...created].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.code.localeCompare(a.code));
    expect(records.map(room => room.code)).toEqual(expected.map(room => room.code));
    expect(new Set(records.map(room => room.code)).size).toBe(13);
    expect(records.some(room => room.code === foreign.value.code)).toBe(false);
    expect((await owner.call('/api/me')).value.investigations.some((room: Investigation) => room.code === addedDuringPaging)).toBe(true);
    const restored = await owner.call(`/api/rooms/${oldest.code}`);
    expect(restored.status).toBe(200);
    expect(restored.value.me.id).toBe(oldest.me.id);
    expect(restored.value.clues.find((clue: { id: string }) => clue.id === 'F2').read).toBe(true);

    // A cursor is a page boundary, never authority to list another browser's rooms.
    const foreignPage = await outsider.call(`/api/me?cursor=${encodeURIComponent(firstCursor!)}`);
    expect(foreignPage.status).toBe(200);
    expect(foreignPage.value.investigations.every((room: Investigation) => room.code === foreign.value.code)).toBe(true);
    expect((await outsider.call(`/api/rooms/${oldest.code}`)).status).toBe(403);
  } finally {
    await server.close();
  }
}, 15000);

it('does not skip an older investigation updated by a partner between pages', async () => {
  const server = await serverFixture();
  try {
    await server.start();
    const owner = await server.client();
    const partner = await server.client();
    const opened = await owner.call('/api/rooms', { name: 'Returning partner', mode: 'duo' });
    expect(opened.status).toBe(201);
    const path = `/api/rooms/${opened.value.code}`;
    expect((await partner.call(`${path}/join`, { name: 'Still investigating' })).status).toBe(200);
    for (let i = 0; i < 5; i++) {
      expect((await owner.call('/api/rooms', { name: `Newer case ${i + 1}`, mode: 'solo' })).status).toBe(201);
    }

    const first = await owner.call('/api/me');
    expect(first.status).toBe(200);
    const records: Investigation[] = [...first.value.investigations];
    expect(records).toHaveLength(4);
    expect(records.some(room => room.code === opened.value.code)).toBe(false);
    const publication = await partner.call(`${path}/publish`, { id: 'A1' });
    expect(publication.status).toBe(200);

    let cursor = first.value.nextCursor;
    while (cursor) {
      const page = await owner.call(`/api/me?cursor=${encodeURIComponent(cursor)}`);
      expect(page.status).toBe(200);
      records.push(...page.value.investigations);
      cursor = page.value.nextCursor;
    }
    expect(records).toHaveLength(6);
    expect(new Set(records.map(room => room.code)).size).toBe(6);
    expect(records.find(room => room.code === opened.value.code)?.updatedAt).toBe(publication.value.updatedAt);
  } finally {
    await server.close();
  }
}, 15000);

it('rejects invalid saved-file cursors without losing the valid first page', async () => {
  const server = await serverFixture();
  try {
    await server.start();
    const owner = await server.client();
    const opened = await owner.call('/api/rooms', { name: 'Cursor validation', mode: 'solo' });
    expect(opened.status).toBe(201);
    const invalid = ['', 'not-json', 'x'.repeat(161), Buffer.from(JSON.stringify(['invalid date', opened.value.code])).toString('base64url')];
    for (const cursor of invalid) {
      expect((await owner.call(`/api/me?cursor=${encodeURIComponent(cursor)}`)).status).toBe(400);
    }
    const firstPage = await owner.call('/api/me');
    expect(firstPage.status).toBe(200);
    expect(firstPage.value.investigations.map((room: Investigation) => room.code)).toEqual([opened.value.code]);
    expect(firstPage.value.nextCursor).toBeNull();
  } finally {
    await server.close();
  }
}, 15000);
