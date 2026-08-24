import { color as palette } from '@/design/tokens';

export type IconProps = {
  /** Rendered square size in px. */
  size?: number;
  /** Stroke colour. Line art is never filled, except hearts, dots and blush. */
  color?: string;
  /** Override the pen width, in real px. */
  penWidth?: number;
};

/**
 * The whole icon set is drawn with one pen of a fixed real-world width — the
 * same way the reference illustrations are. Because the artwork is authored in
 * a 24×24 grid and then scaled, the SVG `strokeWidth` has to be divided back
 * out, or a 48px icon would come out at double the weight of a 20px one.
 *
 * Large drawings get a slightly finer pen: at size the same weight reads heavy.
 */
export function resolve({ size = 24, color = palette.ink, penWidth }: IconProps) {
  const pen = penWidth ?? (size >= 40 ? 1.6 : 1.8);
  return { size, color, strokeWidth: (pen * 24) / size };
}

/** Shared props for every <Svg> root: coordinates authored in a 24×24 grid. */
export const SVG_BASE = { viewBox: '0 0 24 24', fill: 'none' } as const;

export const STROKE_BASE = {
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;
