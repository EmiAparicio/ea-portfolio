'use client';

import { MIN_FONT_PX, useAutoFitFont } from '@project/hooks/useAutoFitFont';
import {
  makeSampleCycleMs,
  useGlitchRandoms,
  usePrefersReducedMotion,
  usePulse,
  useRNG,
  useTimings,
} from '@project/hooks/useGlitchCore';
import { usePerformance } from '@project/providers/PerformanceProvider';
import '@project/styles/glitch-core.css';
import { CSSVarName } from '@project/types/css';
import cn from 'classnames';
import type { CSSProperties, HTMLAttributes, JSX } from 'react';
import { useId, useMemo, useRef } from 'react';
import './glitch-label.css';

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
  | '--gl-phase'
  | '--gl-rate'
  | '--gl-ampmul'
  | '--gl-shimmymul'
  | '--gl-shimmy'
  | '--gl-text-shadow';
/**
 * Style object type that includes standard CSS properties and partial custom glitch variables.
 */
type GlitchVarsStyle = CSSProperties & Partial<Record<GlitchCSSVars, string>>;

/**
 * Props for the GlitchLabel component.
 *
 * @property title - The text content of the label. Supports <br/> and \n for line breaks.
 * @property maxSize - The maximum size (width or height, depending on `limitBy`) in pixels that the text must fit within.
 * @property limitBy - Defines whether to constrain the font size by 'width' or 'height'. Defaults to 'width'.
 * @property mainColorVar - CSS variable name for the main text color.
 * @property aColorVar - CSS variable name for the primary glitch color layer.
 * @property bColorVar - CSS variable name for the secondary glitch color layer.
 * @property shadowColorVar - CSS variable name for the text shadow/glow color.
 * @property intervalMs - The base interval in milliseconds between glitch pulses.
 * @property speed - Multiplier for the glitch animation speed.
 * @property respectReducedMotion - If true, respects `prefers-reduced-motion` to disable animations.
 * @property avoidFlash - If true, keeps the text hidden initially until the font size is measured.
 * @property allowGrow - If true, allows the font size to increase from `MIN_FONT_PX` up to the calculated max size.
 * @property className - Optional class names for the wrapper.
 * @property style - Optional inline styles merged into the wrapper.
 */
export type GlitchLabelProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  'title' | 'className' | 'style'
> & {
  title: string;
  maxSize: number;
  limitBy?: 'width' | 'height';
  mainColorVar?: CSSVarName;
  aColorVar?: CSSVarName;
  bColorVar?: CSSVarName;
  shadowColorVar?: CSSVarName;
  intervalMs?: number;
  speed?: number;
  respectReducedMotion?: boolean;
  avoidFlash?: boolean;
  allowGrow?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * Hook to process the raw title string, handling <br> and newline characters
 * to produce an array of nodes (strings and <br> JSX elements) for rendering,
 * and a simple string for data attributes.
 *
 * @param {string} raw - The raw title string which may contain <br> tags or newlines.
 * @returns {{nodes: (string | JSX.Element)[], data: string}} Object containing formatted nodes and data string.
 */
function useFormattedTitle(raw: string) {
  const BR_RE = /<br\s*\/?>|<\/br>/gi;

  const nodes = useMemo(() => {
    const out: (string | JSX.Element)[] = [];
    const parts = raw.split(BR_RE);
    parts.forEach((p, i) => {
      const segs = p.split('\n');
      segs.forEach((s, j) => {
        out.push(s);
        if (j < segs.length - 1) out.push(<br key={`br-nl-${i}-${j}`} />);
      });
      if (i < parts.length - 1) out.push(<br key={`br-${i}`} />);
    });
    return out;
  }, [raw]);

  const data = useMemo(() => raw.replace(BR_RE, '\n'), [raw]);

  return { nodes, data };
}

/**
 * A responsive text label component with a glitch effect.
 * It automatically adjusts font size to fit within a maximum width or height.
 *
 * @param {GlitchLabelProps} props - The properties for the GlitchLabel.
 * @returns {JSX.Element} The rendered glitching label element.
 */
export default function GlitchLabel({
  title,
  maxSize,
  limitBy = 'width',
  mainColorVar = '--glitch-main',
  aColorVar = '--glitch-a',
  bColorVar = '--glitch-b',
  shadowColorVar,
  intervalMs = 2000,
  speed = 1,
  respectReducedMotion = true,
  avoidFlash = true,
  allowGrow = true,
  className,
  style,
  ...rest
}: GlitchLabelProps) {
  const id = useId();
  const wrapRef = useRef<HTMLSpanElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);

  const { enableAnimations } = usePerformance('glitches');
  const prefersReducedMotion = usePrefersReducedMotion(respectReducedMotion);
  const isReduced = !enableAnimations || prefersReducedMotion;
  const rng = useRNG(`${title}|${maxSize}|${id}`);
  const { phase, rate, ampmul, shimmymul } = useGlitchRandoms(rng);

  const { nodes: formattedTitle, data: dataTitle } = useFormattedTitle(title);

  const { fontPx, measuredOnce, ampPx, flashHidden } = useAutoFitFont({
    title,
    maxWidth: maxSize,
    allowGrow,
    basePx: MIN_FONT_PX,
    avoidFlash,
    wrapRef,
    textRef,
  });

  const { isActive, effectiveDurMs } = useTimings(intervalMs, speed, isReduced);
  const sampleCycleMs = useMemo(
    () => makeSampleCycleMs(rng, intervalMs, 0.3),
    [rng, intervalMs]
  );
  const animatePulse = usePulse(isActive, effectiveDurMs, sampleCycleMs, rng);

  const shimmy = 5;
  const shadowR = useMemo(() => {
    if (!shadowColorVar) return 0;
    const base = (limitBy === 'height' ? maxSize : fontPx) || MIN_FONT_PX;
    return Math.max(0.25, +(base * 0.04).toFixed(2));
  }, [shadowColorVar, fontPx, limitBy, maxSize]);

  const effectiveFontPx =
    limitBy === 'height' ? maxSize : fontPx || MIN_FONT_PX;

  const effectiveAmpPx =
    limitBy === 'height'
      ? +Math.max(
          1,
          (ampPx || 1) * (effectiveFontPx / Math.max(1, fontPx || 1))
        ).toFixed(2)
      : ampPx;

  const styleVars: GlitchVarsStyle = {
    ...style,
    color: `var(${mainColorVar})`,
    fontSize: `${effectiveFontPx}px`,
    ...(limitBy === 'width'
      ? {
          width: `${maxSize}px`,
          maxWidth: `${maxSize}px`,
        }
      : {
          height: `${maxSize}px`,
          lineHeight: `${maxSize}px`,
        }),
    opacity:
      flashHidden && !measuredOnce ? (0 as unknown as undefined) : undefined,
    '--gl-dur': `${effectiveDurMs}ms`,
    '--gl-amp': `${effectiveAmpPx}px`,
    '--gl-state': 'running',
    '--gl-color-main': `var(${mainColorVar})`,
    '--gl-color-a': `var(${aColorVar})`,
    '--gl-color-b': `var(${bColorVar})`,
    '--gl-shimmy': `${shimmy}`,
    '--gl-phase': `${phase}`,
    '--gl-rate': `${rate}`,
    '--gl-ampmul': `${ampmul}`,
    '--gl-shimmymul': `${shimmymul}`,
    '--gl-text-shadow': shadowColorVar
      ? `drop-shadow(0 0 ${+((shadowR as number) * 0.8).toFixed(2)}px var(${shadowColorVar})) drop-shadow(0 0 ${+((shadowR as number) * 0.8).toFixed(2)}px var(${shadowColorVar}))`
      : 'none',
  };

  return (
    <span
      ref={wrapRef}
      data-title={dataTitle}
      data-animate={animatePulse ? '1' : '0'}
      className={cn(
        'glitch-label',
        'relative flex justify-center overflow-visible text-center whitespace-nowrap select-none',
        '[contain:layout_style]',
        className
      )}
      style={styleVars}
      aria-label={title}
      {...rest}
    >
      <span
        ref={textRef}
        className="glitch-text text-center leading-[100%]"
        data-text={title}
      >
        {formattedTitle}
      </span>
      <span className="glitch-full a text-center leading-[100%]" aria-hidden>
        {formattedTitle}
      </span>
      <span className="glitch-full b text-center leading-[100%]" aria-hidden>
        {formattedTitle}
      </span>
    </span>
  );
}
