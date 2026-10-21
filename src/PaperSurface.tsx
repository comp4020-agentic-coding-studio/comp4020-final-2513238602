import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import './paper-motion.css';

type PaperSurfaceProps = {
  children: ReactNode;
  className?: string;
};

// The moving layer wraps the existing paper, leaving its printed angle intact.
export function PaperSurface({ children, className = '' }: PaperSurfaceProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;

    const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const reset = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      surface.style.removeProperty('--paper-tilt-x');
      surface.style.removeProperty('--paper-tilt-y');
      delete surface.dataset.tilting;
    };
    const update = () => {
      frame = 0;
      if (!precisePointer.matches || reducedMotion.matches) return reset();
      const bounds = surface.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return reset();
      const x = Math.max(-1, Math.min(1, (pointerX - bounds.left) / bounds.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (pointerY - bounds.top) / bounds.height * 2 - 1));
      surface.style.setProperty('--paper-tilt-x', `${(-y * 1.6).toFixed(2)}deg`);
      surface.style.setProperty('--paper-tilt-y', `${(x * 2.2).toFixed(2)}deg`);
      surface.dataset.tilting = '';
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !precisePointer.matches || reducedMotion.matches) return reset();
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const hide = () => { if (document.hidden) reset(); };

    surface.addEventListener('pointermove', move, { passive: true });
    surface.addEventListener('pointerleave', reset);
    surface.addEventListener('pointercancel', reset);
    precisePointer.addEventListener('change', reset);
    reducedMotion.addEventListener('change', reset);
    window.addEventListener('blur', reset);
    document.addEventListener('visibilitychange', hide);
    return () => {
      reset();
      surface.removeEventListener('pointermove', move);
      surface.removeEventListener('pointerleave', reset);
      surface.removeEventListener('pointercancel', reset);
      precisePointer.removeEventListener('change', reset);
      reducedMotion.removeEventListener('change', reset);
      window.removeEventListener('blur', reset);
      document.removeEventListener('visibilitychange', hide);
    };
  }, []);

  return <div ref={surfaceRef} className={`paper-surface${className ? ` ${className}` : ''}`} data-paper-surface>
    <div className="paper-surface__sheet">{children}</div>
  </div>;
}

// Animate the existing document only when its identity changes, never on a save
// or a partner's update. Text stays opaque and focus stays on the same DOM node.
export function useDocumentReveal<T extends HTMLElement>(ref: RefObject<T | null>, clueId: string | null | undefined) {
  const previousId = useRef(clueId);

  useEffect(() => {
    const oldId = previousId.current;
    previousId.current = clueId;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animation: Animation | undefined;
    const cancel = () => { animation?.cancel(); animation = undefined; };
    const preferenceChanged = () => { if (reducedMotion.matches) cancel(); };
    const hide = () => { if (document.hidden) cancel(); };

    const documentElement = ref.current;
    if (oldId && clueId && oldId !== clueId && documentElement && !reducedMotion.matches && !document.hidden && typeof documentElement.animate === 'function') {
      const baseTransform = window.getComputedStyle(documentElement).transform;
      const restTransform = baseTransform === 'none' ? '' : ` ${baseTransform}`;
      animation = documentElement.animate([
        { transform: `perspective(1200px) translateX(3px) rotateY(-1.1deg)${restTransform}`, transformOrigin: '0% 50%' },
        { transform: `perspective(1200px) translateX(1px) rotateY(-0.25deg)${restTransform}`, transformOrigin: '0% 50%', offset: 0.65 },
        { transform: baseTransform, transformOrigin: '0% 50%' },
      ], { duration: 240, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' });
    }

    reducedMotion.addEventListener('change', preferenceChanged);
    document.addEventListener('visibilitychange', hide);
    return () => {
      cancel();
      reducedMotion.removeEventListener('change', preferenceChanged);
      document.removeEventListener('visibilitychange', hide);
    };
  }, [clueId, ref]);
}
