export type Role = 'field' | 'archive' | 'solo';
export type Mode = 'solo' | 'duo';
export type Clue = { id: string; role: 'field' | 'archive'; title: string; kind: string; label: string; summary: string; body: string[]; detail?: string; rows?: string[][]; image?: string; published: boolean; read: boolean };
export type Theory = { who: string; where: string; why: string; evidence: string[] };
export type Activity = { id: number; name: string; action: string; detail: string; at: string };
export type RoomState = { code: string; mode: Mode; version: number; status: 'open' | 'solved'; createdAt: string; updatedAt: string; me: { id: string; name: string; role: Role }; members: { id: string; name: string; role: Role }[]; clues: Clue[]; publishedCount: number; order: string[]; events: { id: string; title: string; description: string }[]; activity: Activity[]; attempts: number; lastFeedback: string | null; solution: string[] | null };
export type Investigation = { code: string; mode: Mode; status: 'open' | 'solved'; updatedAt: string; role: Role };
