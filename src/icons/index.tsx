import React from 'react';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { IconProps, resolve, STROKE_BASE, SVG_BASE } from './types';
import { gearPath } from './geometry';

/**
 * The ねんねノート icon set.
 *
 * Every glyph is authored by hand in a 24x24 grid with one rounded pen, so the
 * set reads as a single drawing rather than a collection. Shapes are kept as
 * separate <Path> elements wherever a part might later need to animate on its
 * own.
 */

type Common = { color: string; strokeWidth: number };

const Frame = ({
  size,
  children,
  ...rest
}: { size: number; children: React.ReactNode } & Common) => (
  <Svg width={size} height={size} {...SVG_BASE}>
    <G stroke={rest.color} strokeWidth={rest.strokeWidth} {...STROKE_BASE}>
      {children}
    </G>
  </Svg>
);

/* ---------------------------------------------------------------- logging */

/** A nappy with a heart on the front. The diaper category mark. */
export function DiaperIcon(props: IconProps) {
  const { size, color, strokeWidth } = resolve(props);
  return (
    <Frame size={size} color={color} strokeWidth={strokeWidth}>
      {/* side fastening wings */}
      <Path d="M5.2 5.6H2.6a1.2 1.2 0 0 0-1.2 1.2v1a1.2 1.2 0 0 0 1.2 1.2h2.6" />
      <Path d="M18.8 5.6h2.6a1.2 1.2 0 0 1 1.2 1.2v1a1.2 1.2 0 0 1-1.2 1.2h-2.6" />
      {/* the nappy: wide waist, concave sides, broad rounded seat */}
      <Path d="M5 7.1h14c0 3.5-.6 5.8-1.6 7.4-1 1.6-1.6 3-1.9 4.2-.2.9-1 1.5-1.9 1.5h-3.2c-.9 0-1.7-.6-1.9-1.5-.3-1.2-.9-2.6-1.9-4.2C5.6 12.9 5 10.6 5 7.1Z" />
      {/* waistband */}
      <Path d="M5.2 9.2c2.7 1 11 1 13.6 0" />
      <Path
        d="M12 15.6c-.25 0-2.9-1.7-2.9-3.5a1.55 1.55 0 0 1 2.9-.9 1.55 1.55 0 0 1 2.9.9c0 1.8-2.65 3.5-2.9 3.5Z"
        fill={color}
        strokeWidth={0}
      />
    </Frame>
  );
}

/** A baby bottle with measuring ticks. The feeding category mark. */
export function BottleIcon(props: IconProps) {
  const { size, color, strokeWidth } = resolve(props);
  return (
    <Frame size={size} color={color} strokeWidth={strokeWidth}>
      <Path d="M10.9 5.1c0-1.1-.6-1.5-.6-2.4A1.7 1.7 0 0 1 12 1.2a1.7 1.7 0 0 1 1.7 1.5c0 .9-.6 1.3-.6 2.4" />
      <Path d="M10.05 5.1h3.9a1.15 1.15 0 0 1 0 2.3h-3.9a1.15 1.15 0 0 1 0-2.3Z" />
      <Path d="M9.5 7.4h5a1.8 1.8 0 0 1 1.8 1.8v11a1.8 1.8 0 0 1-1.8 1.8h-5a1.8 1.8 0 0 1-1.8-1.8v-11A1.8 1.8 0 0 1 9.5 7.4Z" />
      <Path d="M9.7 11h2.1M9.7 13.4h2.1M9.7 15.8h2.1" />
    </Frame>
  );
}

/** A sleeping cloud in a nightcap. The sleep category mark. */
export function SleepIcon(props: IconProps) {
  const { size, color, strokeWidth } = resolve(props);
  return (
    <Frame size={size} color={color} strokeWidth={strokeWidth}>
      <Path
        d="M5.6 3.9c.14.63.35.84.98.98-.63.14-.84.35-.98.98-.14-.63-.35-.84-.98-.98.63-.14.84-.35.98-.98Z"
        fill={color}
        strokeWidth={0}
      />
      <Path
        d="M4.2 8.2c.1.45.25.6.7.7-.45.1-.6.25-.7.7-.1-.45-.25-.6-.7-.7.45-.1.6-.25.7-.7Z"
        fill={color}
        strokeWidth={0}
      />
      <Path d="M13.4 9.9c2-2.5 4.6-3.6 6-2.8 1.5.8 1.3 3-.6 5.1" />
      <Circle cx="20.4" cy="13.1" r="1.2" />
      <Path d="M7.4 19.2h9.2a3.4 3.4 0 0 0 .6-6.7 5 5 0 0 0-9.5-1.2 4 4 0 0 0-.3 7.9Z" />
      <Path d="M9.9 15.1c.5-.7 1.4-.7 1.9 0" />
      <Path d="M13.2 15.1c.5-.7 1.4-.7 1.9 0" />
      <Path d="M10.9 17c.6.6 1.6.6 2.2 0" />
    </Frame>
  );
}

/** Pee. */
export function DropIcon(props: IconProps) {
  const { size, color, strokeWidth } = resolve(props);
  return (
    <Frame size={size} color={color} strokeWidth={strokeWidth}>
      <Path d="M12 3.2s6.6 7.4 6.6 11.4a6.6 6.6 0 0 1-13.2 0C5.4 10.6 12 3.2 12 3.2Z" />
    </Frame>
  );
}

/**
 * Poop, as a three-tier soft-serve swirl.
 *
 * Drawn as three stacked arcs rather than one continuous outline: a single
 * outline has to zig-zag inward at each waist, and at 17px — the size it
 * appears at on the home card — those reversals blur into an unreadable blob.
 * Separate tiers keep the silhouette legible all the way down.
 */
export function PoopIcon(props: IconProps) {
  const { size, color, strokeWidth } = resolve(props);
  return (
    <Frame size={size} color={color} strokeWidth={strokeWidth}>
      <Path d="M4.9 19.4a7.1 4.1 0 0 1 14.2 0Z" />
      <Path d="M7.4 15.5a4.6 3.6 0 0 1 9.2 0" />
      <Path d="M10 11.9a2.5 2.7 0 0 1 5 0" />
    </Frame>
  );
}

/* -------------------------------------------------------------- identity */

/** The baby's face. The app's identity mark in headers. */
export function BabyIcon(props: IconProps) {
  const { size, color, strokeWidth } = resolve(props);
  return (
    <Frame size={size} color={color} strokeWidth={strokeWidth}>
      <Path d="M5 11.9a1.7 1.7 0 0 0 0 3.4" />
      <Path d="M19 11.9a1.7 1.7 0 0 1 0 3.4" />
      <Circle cx="12" cy="12.8" r="7.2" />
      <Path d="M12.4 5.7c-.3-1.4.4-2.4 1.4-2.3.8.1 1.1.9.6 1.5" />
      <Circle cx="9.5" cy="12.3" r="0.85" fill={color} strokeWidth={0} />
      <Circle cx="14.5" cy="12.3" r="0.85" fill={color} strokeWidth={0} />
      <Path d="M10.4 15.3c.95.85 2.25.85 3.2 0" />
      <Ellipse cx="8.1" cy="14.7" rx="1.15" ry="0.75" fill={color} opacity={0.18} strokeWidth={0} />
      <Ellipse cx="15.9" cy="14.7" rx="1.15" ry="0.75" fill={color} opacity={0.18} strokeWidth={0} />
    </Frame>
  );
}

/* ------------------------------------------------------------ ornaments */

export function HeartIcon({ filled = true, ...props }: IconProps & { filled?: boolean }) {
  const { size, color, strokeWidth } = resolve(props);
  const d =
    'M12 20.6S3.4 15.3 3.4 9.7a4.7 4.7 0 0 1 8.6-2.7 4.7 4.7 0 0 1 8.6 2.7c0 5.6-8.6 10.9-8.6 10.9Z';
  return (
    <Svg width={size} height={size} {...SVG_BASE}>
      <Path
        d={d}
        fill={filled ? color : 'none'}
        stroke={filled ? 'none' : color}
        strokeWidth={strokeWidth}
        {...STROKE_BASE}
      />
    </Svg>
  );
}

/** A heart with rays. Reserved for the single commit moment (Save). */
export function SparkHeartIcon(props: IconProps) {
  const { size, color, strokeWidth } = resolve(props);
  return (
    <Frame size={size} color={color} strokeWidth={strokeWidth}>
      <Path
        d="M12 19.4s-6.2-3.9-6.2-8a3.4 3.4 0 0 1 6.2-2 3.4 3.4 0 0 1 6.2 2c0 4.1-6.2 8-6.2 8Z"
        fill={color}
        strokeWidth={0}
      />
      <Path d="M12 4.2V2.4M5.6 6.1 4.3 4.8M18.4 6.1l1.3-1.3M3.4 11.6H1.9M20.6 11.6h1.5" />
    </Frame>
  );
}

export function SparkleIcon(props: IconProps) {
  const { size, color } = resolve(props);
  return (
    <Svg width={size} height={size} {...SVG_BASE}>
      <Path
        d="M12 3.4c.6 4 1.8 5.2 5.8 5.8-4 .6-5.2 1.8-5.8 5.8-.6-4-1.8-5.2-5.8-5.8 4-.6 5.2-1.8 5.8-5.8Z"
        fill={color}
      />
    </Svg>
  );
}

/* ----------------------------------------------------------------- chrome */

export function GearIcon(props: IconProps) {
  const { size, color, strokeWidth } = resolve(props);
  return (
    <Frame size={size} color={color} strokeWidth={strokeWidth}>
      <Path d={gearPath()} />
      <Circle cx="12" cy="12" r="3.3" />
    </Frame>
  );
}

export function HomeIcon(props: IconProps) {
  const { size, color, strokeWidth } = resolve(props);
  return (
    <Frame size={size} color={color} strokeWidth={strokeWidth}>
      <Path d="M3.4 10.3 12 3.6l8.6 6.7v8.5a1.7 1.7 0 0 1-1.7 1.7H5.1a1.7 1.7 0 0 1-1.7-1.7v-8.5Z" />
      <Path d="M9.6 20.5v-5.2h4.8v5.2" />
    </Frame>
  );
}

export function ChevronRightIcon(props: IconProps) {
  const { size, color, strokeWidth } = resolve(props);
  return (
    <Frame size={size} color={color} strokeWidth={strokeWidth}>
      <Path d="M9.4 5.4 16 12l-6.6 6.6" />
    </Frame>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  const { size, color, strokeWidth } = resolve(props);
  return (
    <Frame size={size} color={color} strokeWidth={strokeWidth}>
      <Path d="M14.6 5.4 8 12l6.6 6.6" />
    </Frame>
  );
}

export function CloseIcon(props: IconProps) {
  const { size, color, strokeWidth } = resolve(props);
  return (
    <Frame size={size} color={color} strokeWidth={strokeWidth}>
      <Path d="M6.4 6.4 17.6 17.6M17.6 6.4 6.4 17.6" />
    </Frame>
  );
}

export function CheckIcon(props: IconProps) {
  const { size, color, strokeWidth } = resolve(props);
  return (
    <Frame size={size} color={color} strokeWidth={strokeWidth}>
      <Path d="M5.2 12.4 9.9 17.1 18.8 7.2" />
    </Frame>
  );
}

export function ClockIcon(props: IconProps) {
  const { size, color, strokeWidth } = resolve(props);
  return (
    <Frame size={size} color={color} strokeWidth={strokeWidth}>
      <Circle cx="12" cy="12" r="8.4" />
      <Path d="M12 6.8V12l3.4 2.1" />
    </Frame>
  );
}

export function PencilIcon(props: IconProps) {
  const { size, color, strokeWidth } = resolve(props);
  return (
    <Frame size={size} color={color} strokeWidth={strokeWidth}>
      <Path d="m4.6 19.4.7-3.6L16.1 5a1.8 1.8 0 0 1 2.6 0l.3.3a1.8 1.8 0 0 1 0 2.6L8.2 18.7l-3.6.7Z" />
      <Path d="m14.9 6.2 2.9 2.9" />
    </Frame>
  );
}

export function PlusIcon(props: IconProps) {
  const { size, color, strokeWidth } = resolve(props);
  return (
    <Frame size={size} color={color} strokeWidth={strokeWidth}>
      <Path d="M12 5.4v13.2M5.4 12h13.2" />
    </Frame>
  );
}

export function TrendIcon(props: IconProps) {
  const { size, color, strokeWidth } = resolve(props);
  return (
    <Frame size={size} color={color} strokeWidth={strokeWidth}>
      <Path d="M3.6 17.6 9 11.9l3.7 3.3 7.1-8" />
      <Path d="M15.4 7.2h4.4v4.4" />
    </Frame>
  );
}

export function GrowthIcon(props: IconProps) {
  const { size, color, strokeWidth } = resolve(props);
  return (
    <Frame size={size} color={color} strokeWidth={strokeWidth}>
      <Path d="M6.6 3.4h10.8a1.6 1.6 0 0 1 1.6 1.6v14a1.6 1.6 0 0 1-1.6 1.6H6.6A1.6 1.6 0 0 1 5 19V5a1.6 1.6 0 0 1 1.6-1.6Z" />
      <Path d="M5 7.6h3.2M5 12h4.6M5 16.4h3.2" />
    </Frame>
  );
}

export function TimerIcon(props: IconProps) {
  const { size, color, strokeWidth } = resolve(props);
  return (
    <Frame size={size} color={color} strokeWidth={strokeWidth}>
      <Circle cx="12" cy="13.4" r="7.6" />
      <Path d="M9.6 2.6h4.8M12 2.6v2.2M17.6 7 19 5.6" />
      <Path d="M12 9.6v3.8h2.8" />
    </Frame>
  );
}

export function StopIcon(props: IconProps) {
  const { size, color, strokeWidth } = resolve(props);
  return (
    <Frame size={size} color={color} strokeWidth={strokeWidth}>
      <Path
        d="M8.4 7.6h7.2a.8.8 0 0 1 .8.8v7.2a.8.8 0 0 1-.8.8H8.4a.8.8 0 0 1-.8-.8V8.4a.8.8 0 0 1 .8-.8Z"
        fill={color}
      />
    </Frame>
  );
}

export function TrashIcon(props: IconProps) {
  const { size, color, strokeWidth } = resolve(props);
  return (
    <Frame size={size} color={color} strokeWidth={strokeWidth}>
      <Path d="M4.6 6.8h14.8" />
      <Path d="M9.4 6.8V5.2a1.4 1.4 0 0 1 1.4-1.4h2.4a1.4 1.4 0 0 1 1.4 1.4v1.6" />
      <Path d="M6.6 6.8h10.8l-.9 12.1a1.5 1.5 0 0 1-1.5 1.4H9a1.5 1.5 0 0 1-1.5-1.4L6.6 6.8Z" />
      <Path d="M10.4 10.4v6M13.6 10.4v6" />
    </Frame>
  );
}

export function GlobeIcon(props: IconProps) {
  const { size, color, strokeWidth } = resolve(props);
  return (
    <Frame size={size} color={color} strokeWidth={strokeWidth}>
      <Circle cx="12" cy="12" r="8.4" />
      <Path d="M3.6 12h16.8" />
      <Path d="M12 3.6a13 13 0 0 1 0 16.8 13 13 0 0 1 0-16.8Z" />
    </Frame>
  );
}
