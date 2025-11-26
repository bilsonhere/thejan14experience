type CursorOptions = {
  disabled?: boolean;
};

/**
 * Creates a lightweight custom cursor honoring reduced-motion settings.
 * Returns a teardown function for clean unmounts.
 */
export function initCustomCursor({ disabled }: CursorOptions = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined' || disabled) {
    document.body.classList.remove('custom-cursor-enabled');
    return () => undefined;
  }

  const cursorRing = document.createElement('div');
  cursorRing.className = 'cursor-ring';
  const cursorDot = document.createElement('div');
  cursorDot.className = 'cursor-dot';

  document.body.append(cursorRing, cursorDot);
  document.body.classList.add('custom-cursor-enabled');

  let raf = 0;
  const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const current = { ...target };

  const handlePointerMove = (event: PointerEvent) => {
    target.x = event.clientX;
    target.y = event.clientY;
    cursorDot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
  };

  const animate = () => {
    current.x += (target.x - current.x) * 0.15;
    current.y += (target.y - current.y) * 0.15;
    cursorRing.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
    raf = window.requestAnimationFrame(animate);
  };

  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  raf = window.requestAnimationFrame(animate);

  return () => {
    window.cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', handlePointerMove);
    cursorRing.remove();
    cursorDot.remove();
    document.body.classList.remove('custom-cursor-enabled');
  };
}

