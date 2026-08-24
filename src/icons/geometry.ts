/**
 * Parametric path builders for shapes that are painful to hand-author and
 * impossible to keep symmetric by eye.
 */

const rad = (deg: number) => (deg * Math.PI) / 180;

function polar(cx: number, cy: number, r: number, deg: number) {
  const a = rad(deg - 90); // 0° = 12 o'clock
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
}

const fmt = (n: number) => Number(n.toFixed(2));

/**
 * A gear outline. Corners are left sharp and softened by `strokeLinejoin:
 * round`, which is exactly how a rounded-pen drawing behaves.
 */
export function gearPath({
  teeth = 8,
  rTip = 9.6,
  rRoot = 7.3,
  cx = 12,
  cy = 12,
  /** Half-width of a tooth, in degrees. */
  tipHalf = 12,
  /** How far the flank leans, in degrees. */
  flank = 5,
} = {}) {
  const step = 360 / teeth;
  const pts: (readonly [number, number])[] = [];

  for (let i = 0; i < teeth; i++) {
    const t = i * step;
    pts.push(polar(cx, cy, rTip, t - tipHalf));
    pts.push(polar(cx, cy, rTip, t + tipHalf));
    pts.push(polar(cx, cy, rRoot, t + tipHalf + flank));
    pts.push(polar(cx, cy, rRoot, t + step - tipHalf - flank));
  }

  return (
    pts
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${fmt(x)} ${fmt(y)}`)
      .join('') + 'Z'
  );
}

/**
 * An SVG arc along a circle, used for the sleep ring on the summary card.
 * Returns a path that can be stroked with a round cap.
 */
export function arcPath(cx: number, cy: number, r: number, fromDeg: number, toDeg: number) {
  const sweep = Math.abs(toDeg - fromDeg) % 360;
  // A full circle can't be expressed as a single arc — stop just short.
  const end = sweep >= 359.9 ? fromDeg + 359.9 : toDeg;
  const [x0, y0] = polar(cx, cy, r, fromDeg);
  const [x1, y1] = polar(cx, cy, r, end);
  const large = Math.abs(end - fromDeg) > 180 ? 1 : 0;
  const dir = end > fromDeg ? 1 : 0;
  return `M${fmt(x0)} ${fmt(y0)}A${r} ${r} 0 ${large} ${dir} ${fmt(x1)} ${fmt(y1)}`;
}

/** Circumference, for stroke-dash driven ring animation. */
export const circumference = (r: number) => 2 * Math.PI * r;
