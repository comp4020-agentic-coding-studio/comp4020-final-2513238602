import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import type { RoomState } from '../shared/types.ts';

type Snapshot = {
  code: string;
  published: Set<string>;
  order: string;
  activity: number | undefined;
  status: RoomState['status'];
  positions: Map<string, number>;
  width: number;
};

// Only accepted server snapshots enter this hook. Animation never decides whether
// a write succeeded, changes the selected clue, or remounts an open form.
export function useDeskMotion(root: RefObject<HTMLElement | null>, room: RoomState | null) {
  const previous = useRef<Snapshot | null>(null);
  const animations = useRef(new Set<Animation>());
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cancel = () => {
      animations.current.forEach(animation => animation.cancel());
      animations.current.clear();
    };
    const changed = () => { if (preference.matches || document.hidden) cancel(); };
    preference.addEventListener('change', changed);
    document.addEventListener('visibilitychange', changed);
    return () => {
      cancel();
      preference.removeEventListener('change', changed);
      document.removeEventListener('visibilitychange', changed);
    };
  }, []);

  useLayoutEffect(() => {
    const desk = root.current;
    if (!desk || !room) return;
    const before = previous.current;
    const list = desk.querySelector<HTMLOListElement>('.timeline-list');
    const rows = Array.from(desk.querySelectorAll<HTMLElement>('[data-event-id]'));
    // offsetTop ignores an in-flight transform and scrolling. The list is the
    // positioned ancestor, so new content above it cannot create a false move.
    const positions = new Map(rows.map(row => [row.dataset.eventId!, row.offsetTop]));
    const order = room.order.join('|');
    const published = new Set(room.clues.filter(clue => clue.published).map(clue => clue.id));
    const activity = room.activity[0]?.id;
    previous.current = {code: room.code, published, order, activity, status: room.status, positions, width: list?.clientWidth ?? 0};
    if (!before || before.code !== room.code) {
      if (celebrate) setCelebrate(false);
      return;
    }
    if (before.status === 'open' && room.status === 'solved') setCelebrate(true);
    if (document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cancelElement = (element: HTMLElement) => {
      animations.current.forEach(animation => {
        if ((animation.effect as KeyframeEffect | null)?.target === element) animation.cancel();
      });
    };
    const play = (element: HTMLElement, frames: Keyframe[], duration: number) => {
      if (typeof element.animate !== 'function') return;
      // Replace our own feedback on this element if a second real action arrives.
      cancelElement(element);
      const animation = element.animate(frames, {duration, easing: 'cubic-bezier(.2,.7,.3,1)'});
      animations.current.add(animation);
      void animation.finished.then(() => animations.current.delete(animation), () => animations.current.delete(animation));
    };
    for (const id of published) {
      if (before.published.has(id)) continue;
      for (const element of desk.querySelectorAll<HTMLElement>(`[data-clue-id="${id}"]`)) {
        play(element, [
          {backgroundColor: '#ead3c5'},
          {backgroundColor: getComputedStyle(element).backgroundColor},
        ], 650);
      }
    }
    if (activity !== undefined && activity !== before.activity) {
      const update = desk.querySelector<HTMLElement>('.shared-update');
      if (update) play(update, [{opacity: .65}, {opacity: 1}], 320);
    }
    if (before.order !== order && before.width === list?.clientWidth) {
      for (const row of rows) {
        const oldTop = before.positions.get(row.dataset.eventId!);
        const newTop = positions.get(row.dataset.eventId!)!;
        // A second confirmed move can arrive before the first settles. Include
        // its current visual offset before play() cancels that earlier motion.
        const transform = getComputedStyle(row).transform;
        const inFlight = transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m42;
        const distance = oldTop === undefined ? 0 : oldTop + inFlight - newTop;
        if (Math.abs(distance) > .5) {
          play(row, [{transform: `translateY(${distance}px)`}, {transform: 'none'}], 220);
        } else cancelElement(row); // A reversal may already be at its new target.
      }
    }
  });

  // Keep geometry current when a font or responsive layout changes without a
  // room update. A resize must not be interpreted as somebody sorting the desk.
  useEffect(() => {
    const list = root.current?.querySelector<HTMLOListElement>('.timeline-list');
    if (!list) return;
    const observer = new ResizeObserver(() => {
      const snapshot = previous.current;
      if (!snapshot) return;
      snapshot.width = list.clientWidth;
      snapshot.positions = new Map(Array.from(list.querySelectorAll<HTMLElement>('[data-event-id]')).map(row => [row.dataset.eventId!, row.offsetTop]));
    });
    observer.observe(list);
    return () => observer.disconnect();
  }, [root, room?.code]);

  return celebrate;
}
