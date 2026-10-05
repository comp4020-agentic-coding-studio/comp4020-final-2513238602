import type { Clue, Theory } from '../shared/types.ts';

export const clues: Omit<Clue, 'read' | 'published'>[] = [
  { id: 'F1', role: 'field', title: 'An empty place', kind: 'Scene photograph', label: 'GALLERY 2 / 17:40', summary: 'The plinth is empty. Nothing around it has been disturbed.', image: '/images/gallery.webp', body: ['At 17:40, the Blue Hour sculpture is missing from its plinth in Gallery 2. A clean circular mark remains on the surface.', 'There are no glass fragments, no damaged fittings and no signs of forced entry. The gallery is still closed to visitors.'], detail: 'Illustration of a fictional scene. All relevant observations are transcribed above.' },
  { id: 'F2', role: 'field', title: 'Who opened the door?', kind: 'Access record', label: 'GALLERY 2 / STAFF READER', summary: 'A staff card opens the gallery at 17:30.', body: ['The staff reader uses the building clock, which was checked today. These are the final three recorded entries.'], rows: [['17:10', 'JH', 'EXIT / loading bay'], ['17:26', 'MS', 'ENTRY / office'], ['17:30', 'EW', 'ENTRY / Gallery 2']], detail: 'Staff key: EW = Eli Ward, duty technician; MS = Mara Singh, registrar; JH = Jules Hart, courier. Access does not record what a person carries.' },
  { id: 'F3', role: 'field', title: 'Six minutes later?', kind: 'Camera observation', label: 'CORRIDOR CAMERA / DISPLAY 17:36', summary: 'Someone leaves the gallery carrying a padded case.', body: ['The corridor camera shows a staff member leaving Gallery 2. The person wears a technician’s jacket and carries a round, padded transport case.', 'The timestamp burned into the image reads 17:36. The person turns toward the north corridor. No one follows.'], detail: 'The observation records the camera display, not an independently verified time.' },
  { id: 'F4', role: 'field', title: 'The north corridor', kind: 'Building plan', label: 'WEST WING / ROUTES', summary: 'Receiving codes correspond to three very different places.', body: ['From Gallery 2, the north corridor leads directly to the North Store. Rack C is reserved for light-sensitive works.', 'The conservation studio is across the south courtyard. The loading bay is west of the lift. The lift is out of service today.'], rows: [['N-3', 'North Store', 'Rack C / north corridor'], ['S-2', 'Conservation studio', 'South courtyard'], ['W-1', 'Loading bay', 'West of the lift']] },
  { id: 'A1', role: 'archive', title: 'A clock out of step', kind: 'Service slip', label: 'MAINTENANCE / 16:50', summary: 'The corridor camera clock has not been corrected.', body: ['Corridor camera clock is six minutes FAST relative to building time. The displayed timestamp must be reduced by six minutes.', 'The door reader and receiving-desk clock are accurate. Camera correction is booked for tomorrow.'], detail: 'Signed: N. Bell, facilities technician. A fast clock displays a later time than the real time.' },
  { id: 'A2', role: 'archive', title: 'Too much afternoon light', kind: 'Condition report', label: 'BLUE HOUR / 17:20', summary: 'Direct sunlight reaches a light-sensitive work.', body: ['17:20. A failed blind has allowed direct sunlight onto Blue Hour, a blue glass sculpture with a light-sensitive pigment coating.', 'The surface is intact. Move out of direct sun as a precaution; repair is not required. Use controlled-light storage.'], detail: 'Object code BH-04. Report filed before the exhibition opens.' },
  { id: 'A3', role: 'archive', title: 'The signed instruction', kind: 'Relocation note', label: 'REGISTRAR / 17:26', summary: 'The duty technician has permission to relocate BH-04.', body: ['To the duty technician: please relocate BH-04 in its padded circular case before opening. Follow the controlled-light storage procedure.', 'This is a precautionary move, not a repair or courier collection. Leave the plinth in place. I will update the exhibition label.'], detail: 'Signed at 17:26 by Mara Singh, registrar. The technician is listed in the field folder’s staff access record.' },
  { id: 'A4', role: 'archive', title: 'Received, intact', kind: 'Receiving receipt', label: 'RECEIVING DESK N-3 / 17:34', summary: 'An object arrives at a desk identified only by its location code.', body: ['17:34. Object BH-04 received at location N-3, rack C, in a padded circular case.', 'Condition on arrival: intact. Transfer reference: the registrar’s 17:26 instruction. The building plan lists receiving locations by code.'], detail: 'Receipt clock matches the building clock. Receiving signature: O. Reed.' },
];

export const events = [
  { id: 'sun', title: 'Sunlight reaches the work', description: 'A condition report is filed.' },
  { id: 'permission', title: 'The move is authorised', description: 'The registrar signs an instruction.' },
  { id: 'move', title: 'The work leaves Gallery 2', description: 'A padded case enters the corridor.' },
  { id: 'arrival', title: 'The work reaches storage', description: 'The receiving desk signs it in.' },
];
export const startingOrder = ['move', 'sun', 'arrival', 'permission'];
export const solution = [
  'At 17:20, a failed blind exposed Blue Hour to direct sunlight. The work was intact, but its pigment needed protection.',
  'At 17:26, Mara Singh authorised Eli Ward to move it. His EW card opened Gallery 2 at 17:30.',
  'The camera’s 17:36 is really 17:30: its clock was six minutes fast. The padded case travelled along the north corridor.',
  'At 17:34, the North Store received BH-04 intact on rack C. It was a precautionary relocation, not a theft.',
];
export function assess(theory: Theory, order: string[]): { correct: boolean; feedback: string } {
  if (theory.who !== 'eli') return { correct: false, feedback: 'Check who carried the case, not who authorised the move. Match the staff initials to the signed instruction.' };
  if (theory.where !== 'north') return { correct: false, feedback: 'Follow the direction in the camera observation, then compare the route with the receiving receipt.' };
  if (theory.why !== 'light') return { correct: false, feedback: 'The condition report separates damage from a precaution. What needed to be prevented?' };
  if (theory.when !== '17:30') return { correct: false, feedback: 'The camera display and building clock disagree. Use the service slip to correct the camera timestamp.' };
  if (order.join(',') !== 'sun,permission,move,arrival') return { correct: false, feedback: 'Your explanation fits, but the chronology does not. A clock that is six minutes fast shows 17:36 at what real time?' };
  return { correct: true, feedback: 'Case closed. You have accounted for the person, the route, the reason and the six missing minutes.' };
}
