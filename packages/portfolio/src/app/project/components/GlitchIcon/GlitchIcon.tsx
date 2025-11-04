'use client';

import {
  makeSampleCycleMs,
  useGlitchRandoms,
  useIsoLayoutEffect,
  usePrefersReducedMotion,
  usePulse,
  useResizeObserverRaf,
  useRNG,
  useTimings,
} from '@project/hooks/useGlitchCore';
import { usePerformance } from '@project/providers/PerformanceProvider';
import { CSSVarName } from '@project/types/css';
import cn from 'classnames';
import type { ComponentType, CSSProperties, HTMLAttributes } from 'react';
import { useCallback, useId, useMemo, useRef, useState } from 'react';
import './glitch-icon.css';

/**
 * Union of custom CSS variable names used for controlling the glitch effect.
 */
type GlitchCSSVars =
  | '--gl-dur'
  | '--gl-amp'
  | '--gl-state'
  | '--gl-color-main'
  | '--gl-color-a'
  | '--gl-color-b'
  | '--gl-shimmy'
  | '--gl-phase'
  | '--gl-rate'
  | '--gl-ampmul'
  | '--gl-shimmymul';
/**
 * Style object type that includes standard CSS properties and partial custom glitch variables.
 */
type GlitchVarsStyle = CSSProperties & Partial<Record<GlitchCSSVars, string>>;

/**
 * Type for a React component that can be used as an icon, accepting size, color, and title props.
 */
export type ReactIconComponent = ComponentType<{
  size?: string | number;
  color?: string;
  title?: string;
}>;

/**
 * Props for the GlitchIcon component.
 */
export type GlitchIconProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  'title' | 'className' | 'style'
> & {
  /** The icon component (SVG React component) to be displayed. */
  icon: ReactIconComponent;
  /** The size of the icon (e.g., '24px', '1.5rem'). */
  size: string;
  /** Optional accessible label for the icon. */
  title?: string;
  /** CSS variable name for the main icon color. */
  mainColorVar?: CSSVarName;
  /** CSS variable name for the layer A glitch color. */
  aColorVar?: CSSVarName;
  /** CSS variable name for the layer B glitch color. */
  bColorVar?: CSSVarName;
  /** Interval in milliseconds between glitch pulses. */
  intervalMs?: number;
  /** Approximate active duration of the glitch pulse relative to the interval [0..1]. */
  speed?: number;
  /** If true, respects `prefers-reduced-motion` to tone down animations. */
  respectReducedMotion?: boolean;
  /** Additional class names for the wrapper. */
  className?: string;
  /** Additional inline styles. */
  style?: CSSProperties;
};

const GLITCH_LAYERS = [
  { type: 'layer', name: 'a' },
  { type: 'layer', name: 'b' },
  { type: 'full', name: 'a' },
  { type: 'full', name: 'b' },
] as const;

/**
 * A component that displays an icon with a glitch animation effect.
 * The glitch amplitude scales based on the rendered size of the icon.
 *
 * @param {GlitchIconProps} props - The properties for the GlitchIcon.
 * @returns {JSX.Element} The rendered glitching icon element.
 */
export default function GlitchIcon({
  icon: Icon,
  size,
  title,
  mainColorVar = '--glitch-main',
  aColorVar = '--glitch-a',
  bColorVar = '--glitch-b',
  intervalMs = 2000,
  speed = 0.5,
  respectReducedMotion = true,
  className,
  style,
  ...rest
}: GlitchIconProps) {
  const id = useId();
  const wrapRef = useRef<HTMLSpanElement | null>(null);

  const { enableAnimations } = usePerformance('glitches');
  const prefersReducedMotion = usePrefersReducedMotion(respectReducedMotion);
  const isReduced = !enableAnimations || prefersReducedMotion;
  const rng = useRNG(`${title || ''}|${size}|icon|${id}`);
  const { phase, rate, ampmul, shimmymul } = useGlitchRandoms(rng);

  const { isActive, effectiveDurMs } = useTimings(intervalMs, speed, isReduced);
  const sampleCycleMs = useMemo(
    () => makeSampleCycleMs(rng, intervalMs, 0.3),
    [rng, intervalMs]
  );
  const animatePulse = usePulse(isActive, effectiveDurMs, sampleCycleMs, rng);

  const [ampPx, setAmpPx] = useState(0.8);
  const recomputeAmp = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const basis = Math.max(1, Math.min(r.width, r.height));
    let raw = +(basis * 0.05).toFixed(2);
    raw = Math.max(raw, 10);
    if (isReduced) raw = +(raw * 0.4).toFixed(2);
    setAmpPx(Math.max(0.5, raw));
  }, [isReduced]);

  useIsoLayoutEffect(() => {
    recomputeAmp();
  }, [size, recomputeAmp]);

  useResizeObserverRaf(wrapRef, () => recomputeAmp());

  const styleVars = useMemo<GlitchVarsStyle>(
    () => ({
      ...style,
      width: size,
      height: size,
      '--gl-dur': `${effectiveDurMs}ms`,
      '--gl-amp': `${ampPx}px`,
      '--gl-state': 'running',
      '--gl-color-main': `var(${mainColorVar})`,
      '--gl-color-a': `var(${aColorVar})`,
      '--gl-color-b': `var(${bColorVar})`,
      '--gl-shimmy': '3.5',
      '--gl-phase': `${phase}`,
      '--gl-rate': `${rate}`,
      '--gl-ampmul': `${ampmul}`,
      '--gl-shimmymul': `${shimmymul}`,
    }),
    [
      style,
      size,
      effectiveDurMs,
      ampPx,
      mainColorVar,
      aColorVar,
      bColorVar,
      phase,
      rate,
      ampmul,
      shimmymul,
    ]
  );

  const ariaProps = title
    ? { role: 'img', 'aria-label': title }
    : { 'aria-hidden': true as const };

  return (
    <span
      ref={wrapRef}
      {...ariaProps}
      data-animate={animatePulse ? '1' : '0'}
      className={cn(
        'glitch-icon',
        'relative inline-block overflow-visible select-none',
        '[contain:layout_style]',
        className
      )}
      style={styleVars}
      {...rest}
    >
      <span className="gi-base" aria-hidden>
        <Icon size="100%" color="var(--gl-color-main)" />
      </span>
      {GLITCH_LAYERS.map(({ type, name }) => (
        <span
          key={`${type}-${name}`}
          className={`gi-${type} ${name}`}
          aria-hidden
        >
          <Icon size="100%" color={`var(--gl-color-${name})`} />
        </span>
      ))}
    </span>
  );
}
