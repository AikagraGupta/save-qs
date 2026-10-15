import { animate } from 'motion';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const animations = new WeakMap();
const sheetOffset = () => matchMedia('(max-width: 760px)').matches ? 12 : 0;

// Start reversals at the presentation value. Never disable controls for motion.
export function presentDialog(dialog) {
  if (reduced()) return;
  animations.get(dialog)?.stop();
  animations.set(dialog, animate(dialog,
    { opacity: [0, 1], scale: [.98, 1], y: [sheetOffset(), 0] },
    { type: 'spring', bounce: 0, duration: .3 }
  ));
}

export function dismissDialog(dialog, finish) {
  if (!dialog || reduced()) { finish(); return; }
  animations.get(dialog)?.stop();
  const animation = animate(dialog,
    { opacity: 0, scale: .98, y: sheetOffset() },
    { type: 'spring', bounce: 0, duration: .22 }
  );
  animations.set(dialog, animation);
  animation.finished.then(finish);
}
