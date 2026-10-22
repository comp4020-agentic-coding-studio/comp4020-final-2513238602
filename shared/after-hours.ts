// Public presentation metadata only. Evidence and answer rules stay on the server.
export const duties = ['field', 'archive', 'workshop', 'routes'] as const;
export type Duty = (typeof duties)[number];
export type Place = 'gallery' | 'workshop' | 'monitor' | 'store';
export const dutyNames: Record<Duty, string> = {
  field: 'Scene investigator',
  archive: 'Archivist',
  workshop: 'Object examiner',
  routes: 'Route analyst',
};
export const places: { id: Place; title: string; subtitle: string; act: number }[] = [
  {
    id: 'gallery',
    title: 'The exhibition',
    subtitle: 'An empty plinth. A very convincing first impression.',
    act: 1,
  },
  {
    id: 'workshop',
    title: 'The workshop',
    subtitle: 'Look underneath. Measure twice. Question the label.',
    act: 1,
  },
  {
    id: 'monitor',
    title: 'The watch room',
    subtitle: 'A clock can be precise and still tell the wrong story.',
    act: 2,
  },
  { id: 'store', title: 'The north store', subtitle: 'Follow the object, not the rumour.', act: 3 },
];
export type SceneObject = {
  id: string;
  place: Place;
  label: string;
  duty: Duty;
  verb: string;
  shape:
    | 'plinth'
    | 'record'
    | 'crate'
    | 'map'
    | 'track'
    | 'cart'
    | 'camera'
    | 'clock'
    | 'sensor'
    | 'shelf';
  x: number;
  z: number;
};
export const objects: SceneObject[] = [
  {
    id: 'G1',
    place: 'gallery',
    label: 'Empty display plinth',
    duty: 'field',
    verb: 'Measure the mount',
    shape: 'plinth',
    x: -1.5,
    z: -0.7,
  },
  {
    id: 'G2',
    place: 'gallery',
    label: 'Reception notebook',
    duty: 'archive',
    verb: 'Read the visitor entry',
    shape: 'record',
    x: 1.5,
    z: -1.4,
  },
  {
    id: 'G3',
    place: 'gallery',
    label: 'Spare blue transport case',
    duty: 'workshop',
    verb: 'Turn the spare case over',
    shape: 'crate',
    x: 1.9,
    z: 1.3,
  },
  {
    id: 'G4',
    place: 'gallery',
    label: 'Floor impressions',
    duty: 'routes',
    verb: 'Trace the wheel marks',
    shape: 'track',
    x: -0.2,
    z: 1.6,
  },
  {
    id: 'W1',
    place: 'workshop',
    label: 'Padded transport trolley',
    duty: 'workshop',
    verb: 'Measure the trolley',
    shape: 'cart',
    x: -1.6,
    z: 0.7,
  },
  {
    id: 'W2',
    place: 'workshop',
    label: 'Packing register',
    duty: 'archive',
    verb: 'Open the packing register',
    shape: 'record',
    x: 0.5,
    z: -1.6,
  },
  {
    id: 'W3',
    place: 'workshop',
    label: 'Dispatch clipboard',
    duty: 'field',
    verb: 'Read the signed docket',
    shape: 'record',
    x: 2,
    z: 0.5,
  },
  {
    id: 'W4',
    place: 'workshop',
    label: 'Maintenance plan',
    duty: 'routes',
    verb: 'Unfold the clearance plan',
    shape: 'map',
    x: -1.5,
    z: -1.4,
  },
  {
    id: 'M1',
    place: 'monitor',
    label: 'Corridor recording',
    duty: 'field',
    verb: 'Review the later recording',
    shape: 'camera',
    x: -1.5,
    z: -1,
  },
  {
    id: 'M2',
    place: 'monitor',
    label: 'Clock service card',
    duty: 'archive',
    verb: 'Compare the clock records',
    shape: 'clock',
    x: 1.5,
    z: -1.4,
  },
  {
    id: 'M3',
    place: 'monitor',
    label: 'Environmental recorder',
    duty: 'workshop',
    verb: 'Read the alarm strip',
    shape: 'sensor',
    x: 1.7,
    z: 1,
  },
  {
    id: 'M4',
    place: 'monitor',
    label: 'Doorway survey',
    duty: 'routes',
    verb: 'Compare the exits',
    shape: 'map',
    x: -1.5,
    z: 1.3,
  },
  {
    id: 'S1',
    place: 'store',
    label: 'Covered object on rack C',
    duty: 'field',
    verb: 'Lift the protective cover',
    shape: 'shelf',
    x: -1.6,
    z: -1.2,
  },
  {
    id: 'S2',
    place: 'store',
    label: 'Relocation instruction',
    duty: 'archive',
    verb: 'Read the authorisation',
    shape: 'record',
    x: 1.6,
    z: -1.4,
  },
  {
    id: 'S3',
    place: 'store',
    label: 'Technician seal kit',
    duty: 'workshop',
    verb: 'Match the seal impressions',
    shape: 'crate',
    x: 1.7,
    z: 1.3,
  },
  {
    id: 'S4',
    place: 'store',
    label: 'Store allocation board',
    duty: 'routes',
    verb: 'Decode the location reference',
    shape: 'map',
    x: -1.5,
    z: 1.3,
  },
];
export type Evidence = {
  id: string;
  title: string;
  duty: Duty;
  body: string[];
  discoveredBy: string;
  sharedBy?: string;
};
export type Question = {
  id: string;
  act: number;
  title: string;
  prompt: string;
  options: { id: string; label: string }[];
  accepted: null | { answer: string; evidence: string[]; by: string };
  hintLevel: number;
  hint: string | null;
};
export type GameMember = { id: string; name: string; seat: Duty };
export type GameActivity = {
  id: number;
  memberId: string;
  name: string;
  seat: Duty;
  action: string;
  detail: string;
  at: string;
};
export type GameState = {
  code: string;
  caseId: 'after-hours-v1';
  seed: number;
  version: number;
  status: 'open' | 'solved';
  act: number;
  createdAt: string;
  updatedAt: string;
  me: GameMember;
  members: GameMember[];
  assignments: Partial<Record<Duty, string>>;
  clues: Evidence[];
  questions: Question[];
  notes: { id: number; memberId: string; name: string; clue: string; text: string }[];
  activity: GameActivity[];
  attempts: number;
  feedback: string | null;
  contributions: { memberId: string; discoveries: number; shared: number; deductions: number }[];
  order: string[];
  events: { id: string; title: string }[];
  solution: string[] | null;
};
