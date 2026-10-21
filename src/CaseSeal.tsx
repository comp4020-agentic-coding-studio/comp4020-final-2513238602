import { useEffect, useId, useRef, useState } from 'react';
import './case-seal.css';

// Two independently drawn guilloche lines give the stamp its engraved paper feel.
function rosette(radius: number, phase: number) {
  return Array.from({ length: 241 }, (_, index) => {
    const angle = index / 240 * Math.PI * 2;
    const distance = radius + Math.cos(angle * 12 + phase) * 3;
    const x = 60 + Math.cos(angle) * distance;
    const y = 60 + Math.sin(angle) * distance;
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ') + ' Z';
}

const outerRosette = rosette(31, 0);
const innerRosette = rosette(28, Math.PI);
const stampDuration = 350;

export function CaseSeal({ celebrate }: { celebrate: boolean }) {
  const id = useId();
  const celebrated = useRef(celebrate);
  const [stamping, setStamping] = useState(celebrate);

  useEffect(() => {
    if (celebrate && !celebrated.current) {
      celebrated.current = true;
      setStamping(true);
    }
  }, [celebrate]);

  useEffect(() => {
    if (!stamping) return;
    if (document.hidden) {
      setStamping(false);
      return;
    }
    const stopWhenHidden = () => {
      if (document.hidden) setStamping(false);
    };
    document.addEventListener('visibilitychange', stopWhenHidden);
    // Clear the transient state even when reduced motion suppresses animationend.
    const timer = window.setTimeout(() => setStamping(false), stampDuration);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', stopWhenHidden);
    };
  }, [stamping]);

  return <span className="case-seal" data-stamping={stamping || undefined} aria-hidden="true">
    <svg viewBox="0 0 120 120" focusable="false">
      <defs>
        <path id={`${id}-upper`} d="M14 60 A46 46 0 0 1 106 60" />
        <path id={`${id}-lower`} d="M14 60 A46 46 0 0 0 106 60" />
      </defs>
      <g className="case-seal-engraving">
        <circle cx="60" cy="60" r="55" />
        <circle cx="60" cy="60" r="52.5" />
        <circle cx="60" cy="60" r="39" />
        <circle cx="60" cy="60" r="37" />
        <path className="case-seal-rosette" d={outerRosette} />
        <path className="case-seal-rosette" d={innerRosette} />
        <circle cx="60" cy="60" r="21.5" />
        <path d="M10.5 60 14 56.5 17.5 60 14 63.5 Z M102.5 60 106 56.5 109.5 60 106 63.5 Z" />
      </g>
      <g className="case-seal-ring-text">
        <text><textPath href={`#${id}-upper`} startOffset="50%">THE SMALL MYSTERY CLUB</textPath></text>
        <text dy="5.5"><textPath href={`#${id}-lower`} startOffset="50%">FILE 001 · THE BLUE HOUR</textPath></text>
      </g>
    </svg>
    <span className="case-seal-caption"><span>CASE</span><span>CLOSED</span></span>
  </span>;
}
