'use client';

import { hexRadiusAtom } from '@project/atoms/hexGridAtoms';
import { useAtomValue } from '@project/lib/jotai';
import cn from 'classnames';
import { motion, useReducedMotion } from 'framer-motion';
import { CSSProperties, useMemo } from 'react';

/**
 * Props for the Spinner component.
 */
export type SpinnerProps = {
  /**
   * The number of hexagonal pulses to display.
   */
  pulses?: number;
  /**
   * The duration of one pulse animation cycle in seconds.
   */
  durationSec?: number;
  /**
   * Additional CSS class names for the container.
   */
  className?: string;
  /**
   * Additional inline styles for the container.
   */
  style?: CSSProperties;
  /**
   * The color of the hexagonal strokes. Can be a CSS variable or a color value.
   */
  stroke?: string;
  /**
   * If true, a semi-transparent overlay is rendered behind the spinner.
   */
  hasOverlay?: boolean;
};

/**
 * A hexagonal spinner component with a pulsing animation.
 * The animation adapts based on the user's "prefers-reduced-motion" setting.
 *
 * @param props - The component props.
 * @returns A JSX element representing the hexagonal spinner.
 */
export default function Spinner(props: SpinnerProps) {
  const {
    pulses = 4,
    durationSec = 1.8,
    className,
    style,
    stroke = 'var(--spinner-stroke)',
    hasOverlay = false,
  } = props;
  const R = useAtomValue(hexRadiusAtom);
  const reduce = useReducedMotion();
  const hexPoints = useMemo(() => {
    const mk = (r: number) => {
      const cx = 64;
      const cy = 64;
      const pts: Array<[number, number]> = [];
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
      return pts.map(([x, y]) => `${x},${y}`).join(' ');
    };
    return mk(22);
  }, []);

  const sizePx = R * 4;

  return (
    <div
      className={cn(className, 'flex items-center justify-center')}
      style={{ width: sizePx, height: sizePx, ...style }}
    >
      {hasOverlay && (
        <div
          aria-hidden
          className="bg-spinner-overlay/60 absolute top-1/2 left-1/2 h-[600%] w-[600%] -translate-1/2"
          style={{
            WebkitMaskImage:
              'radial-gradient(circle at center, white 0%, transparent 40%)',
            maskImage:
              'radial-gradient(circle at center, white 0%, transparent 40%)',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
          }}
        />
      )}
      <svg viewBox="0 0 128 128" className="block h-full w-full">
        {Array.from({ length: pulses }).map((_, i) => (
          <motion.polygon
            key={i}
            points={hexPoints}
            fill="none"
            stroke={stroke}
            strokeWidth={3}
            initial={
              reduce
                ? { opacity: 1, scale: 1 }
                : { opacity: 1, scale: 0, rotate: 0 }
            }
            animate={
              reduce
                ? { opacity: [1, 0.6, 1], scale: [1, 0.98, 1] }
                : {
                    opacity: [1, 0.5, 0],
                    scale: [0, 1.6, 2.2],
                    rotate: i % 2 ? -180 : 180,
                  }
            }
            transition={{
              duration: durationSec,
              ease: 'linear',
              repeat: Infinity,
              delay: durationSec * 0.28 * i,
            }}
            style={{
              transformBox: 'fill-box',
              originX: '50%',
              originY: '50%',
            }}
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </div>
  );
}
