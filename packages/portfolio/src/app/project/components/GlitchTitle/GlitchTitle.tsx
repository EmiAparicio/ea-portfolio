'use client';

import { hexRadiusAtom } from '@project/atoms/hexGridAtoms';
import { useAtomValue } from '@project/lib/jotai';
import { usePerformance } from '@project/providers/PerformanceProvider';
import '@project/styles/glitch-core.css';
import cn from 'classnames';
import type { CSSProperties, HTMLAttributes, ReactElement } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './glitch-title.css';

export const GT_TIME_A_MS = 220;
export const GT_TIME_B_MS = 30;
export const GT_TIME_C_MS = 400;

type Position = { top: string; left: string };

/**
 * Props for the GlitchTitle component.
 *
 * @property titles - Array of strings to cycle through. Falsy items are ignored.
 * @property position - Absolute position of the title wrapper (e.g., `{ top: "50%", left: "50%" }`).
 * @property intervalMs - Interval between cycles in milliseconds (minimum 300ms).
 * @property fontSizeFactor - Multiplier applied to the grid radius to compute font size.
 * @property respectReducedMotion - If true, respects `prefers-reduced-motion` (disables glitch but still cycles).
 * @property className - Optional class names for the wrapper.
 * @property style - Optional inline styles merged into the wrapper.
 */
export type GlitchTitleProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  'title' | 'className' | 'style'
> & {
  titles: string[];
  position?: Position;
  intervalMs?: number;
  fontSizeFactor?: number;
  respectReducedMotion?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * Cycles through an array of titles with a glitch transition effect.
 * The glitch effect is automatically disabled if the user prefers reduced motion
 * or if animations are globally disabled by the performance provider.
 *
 * @param {GlitchTitleProps} props - The properties for the GlitchTitle.
 * @returns {ReactElement | null} The rendered glitching title element.
 */
export default function GlitchTitle({
  titles,
  position,
  intervalMs = 2600,
  fontSizeFactor = 1,
  respectReducedMotion = true,
  className,
  style,
  ...rest
}: GlitchTitleProps): ReactElement | null {
  const R = useAtomValue(hexRadiusAtom);
  const { enableAnimations } = usePerformance('glitches');

  const sanitizedTitles = useMemo<string[]>(() => {
    const arr = Array.isArray(titles) ? titles.filter(Boolean).map(String) : [];
    return arr.length ? arr : [];
  }, [titles]);

  const titlesKey = useMemo(() => sanitizedTitles.join('␟'), [sanitizedTitles]);
  const count = sanitizedTitles.length;

  const [index, setIndex] = useState<number>(0);
  const [g1Active, setG1Active] = useState<boolean>(false);
  const [g2Active, setG2Active] = useState<boolean>(false);
  const [g1Dense, setG1Dense] = useState<boolean>(false);
  const [g2Dense, setG2Dense] = useState<boolean>(false);
  const [reduced, setReduced] = useState<boolean>(false);

  const [cycleBase, setCycleBase] = useState<string>('');
  const [cycleNext, setCycleNext] = useState<string>('');

  const [showCurBase, setShowCurBase] = useState<boolean>(true);
  const [showNextBase, setShowNextBase] = useState<boolean>(false);
  const [baseOut, setBaseOut] = useState<boolean>(false);
  const [baseIn, setBaseIn] = useState<boolean>(false);

  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const justResetRef = useRef<boolean>(false);

  const minInterval = Math.max(300, intervalMs | 0);
  const current = sanitizedTitles[index] ?? '';
  const next = count > 0 ? sanitizedTitles[(index + 1) % count] : '';
  const isPositioned = !!(position?.top || position?.left);
  const isReduced = useMemo(
    () => reduced || !enableAnimations,
    [reduced, enableAnimations]
  );

  const fontSize = useMemo<string>(() => {
    const px = typeof R === 'number' ? R * (fontSizeFactor || 1) : 16;
    return `${px}px`;
  }, [R, fontSizeFactor]);

  const wrapperStyle: CSSProperties = useMemo(() => {
    return {
      top: position?.top,
      left: position?.left,
      fontSize,
      '--gl-color-main': 'var(--glitch-main)',
      '--gl-color-a': 'var(--glitch-a)',
      '--gl-color-b': 'var(--glitch-b)',
      '--gl-shimmy': '5',
      '--gl-ampmul': '1',
      '--gl-shimmymul': '1',
      '--text-shadow-color': 'var(--glitch-title-shadow)',
      ...style,
    } as CSSProperties;
  }, [position?.top, position?.left, fontSize, style]);

  const clearTimers = useCallback(() => {
    for (const t of timeouts.current) clearTimeout(t);
    timeouts.current = [];
  }, []);

  const idle = useCallback(() => {
    if (count <= 1) return;

    if (justResetRef.current) {
      const t = setTimeout(() => idle(), minInterval);
      timeouts.current.push(t);
      return;
    }

    if (isReduced) {
      const t = setTimeout(() => {
        setIndex((v) => (v + 1) % count);
        idle();
      }, minInterval);
      timeouts.current.push(t);
      return;
    }

    const t0 = setTimeout(() => {
      setCycleBase(current);
      setCycleNext(next);
      setShowCurBase(true);
      setShowNextBase(false);
      setBaseOut(false);
      setBaseIn(false);
      setG1Active(true);
      setG1Dense(false);

      const t1 = setTimeout(() => {
        setG2Active(true);
        setG2Dense(false);

        const t2 = setTimeout(() => {
          setG1Dense(true);
          setG2Dense(true);
          setBaseOut(true);

          const t3 = setTimeout(() => {
            setShowCurBase(false);
            setShowNextBase(true);
            setBaseOut(false);
            setBaseIn(true);
            setIndex((v) => (v + 1) % count);

            const t4 = setTimeout(() => {
              setBaseIn(false);

              const t5 = setTimeout(() => {
                setG1Dense(false);
                setG2Dense(false);

                const t6 = setTimeout(() => {
                  setG1Active(false);

                  const t7 = setTimeout(() => {
                    setG2Active(false);
                    idle();
                  }, GT_TIME_A_MS);
                  timeouts.current.push(t7);
                }, GT_TIME_B_MS);
                timeouts.current.push(t6);
              }, 0);
              timeouts.current.push(t5);
            }, GT_TIME_C_MS);
            timeouts.current.push(t4);
          }, GT_TIME_C_MS);
          timeouts.current.push(t3);
        }, GT_TIME_B_MS);
        timeouts.current.push(t2);
      }, GT_TIME_A_MS);
      timeouts.current.push(t1);
    }, minInterval);
    timeouts.current.push(t0);
  }, [count, isReduced, minInterval, current, next]);

  useEffect(() => {
    if (!respectReducedMotion) {
      setReduced(false);
      return;
    }
    if (typeof window === 'undefined' || !window.matchMedia) {
      setReduced(false);
      return;
    }
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(!!mql.matches);
    onChange();

    if ('addEventListener' in mql) {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
    // @ts-expect-error legacy API
    mql.addListener(onChange);
    return () => {
      // @ts-expect-error legacy API
      mql.removeListener(onChange);
    };
  }, [respectReducedMotion]);

  useEffect(() => {
    clearTimers();

    justResetRef.current = true;
    setIndex(0);

    const newCurrent = sanitizedTitles[0] ?? '';
    const newNext = sanitizedTitles.length > 1 ? sanitizedTitles[1] : '';

    setG1Active(false);
    setG2Active(false);
    setG1Dense(false);
    setG2Dense(false);
    setCycleBase(newCurrent);
    setCycleNext(newNext);
    setShowCurBase(true);
    setShowNextBase(false);
    setBaseOut(false);
    setBaseIn(false);

    if (sanitizedTitles.length > 1) {
      const t = setTimeout(() => {
        justResetRef.current = false;
        idle();
      }, 0);
      timeouts.current.push(t);
    } else {
      const t = setTimeout(() => {
        justResetRef.current = false;
      }, 0);
      timeouts.current.push(t);
    }

    return clearTimers;
  }, [titlesKey, count, clearTimers]);

  useEffect(() => {
    if (justResetRef.current) return;
    clearTimers();

    setCycleBase(current);
    setCycleNext(next);
    setShowCurBase(true);
    setShowNextBase(false);
    setBaseOut(false);
    setBaseIn(false);
    setG1Active(false);
    setG2Active(false);
    setG1Dense(false);
    setG2Dense(false);

    if (count > 1) idle();

    return clearTimers;
  }, [count, minInterval, isReduced, idle, clearTimers]);

  if (count === 0) return null;

  return (
    <span
      className={cn(
        'glitch-title inline-block text-center whitespace-nowrap select-none',
        isPositioned && '-translate-x-1/2 -translate-y-1/2',
        isReduced && 'grm-pause',
        className
      )}
      style={wrapperStyle}
      {...rest}
    >
      <span className="invisible">{cycleBase}</span>

      {showCurBase && (
        <span
          className={cn('gt-base-layer', baseOut && 'gt-out')}
          aria-hidden={false}
        >
          <span className="gt-base-text" data-text={cycleBase}>
            {cycleBase}
          </span>
        </span>
      )}

      {showNextBase && (
        <span
          className={cn('gt-base-layer', baseIn && 'gt-in')}
          aria-hidden={false}
        >
          <span className="gt-base-text" data-text={cycleNext}>
            {cycleNext}
          </span>
        </span>
      )}

      <span
        className={cn(
          'gt-glitch gt-g1',
          g1Active ? (g1Dense ? 'gt-dense' : 'gt-soft') : 'gt-off'
        )}
        data-text={cycleBase}
        aria-hidden
      >
        <span className="gt-size" aria-hidden>
          {cycleBase}
        </span>
        <span className="gt-full a" data-text={cycleBase} aria-hidden />
        <span className="gt-full b" data-text={cycleBase} aria-hidden />
      </span>

      <span
        className={cn(
          'gt-glitch gt-g2',
          g2Active ? (g2Dense ? 'gt-dense' : 'gt-soft') : 'gt-off'
        )}
        data-text={cycleNext}
        aria-hidden
      >
        <span className="gt-size" aria-hidden>
          {cycleNext}
        </span>
        <span className="gt-full a" data-text={cycleNext} aria-hidden />
        <span className="gt-full b" data-text={cycleNext} aria-hidden />
      </span>
    </span>
  );
}
