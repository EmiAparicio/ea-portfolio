'use client';

import { globalLoadingAtom } from '@project/atoms/loadingAtoms';
import { globalModalOpenAtom } from '@project/atoms/modalAtoms';
import Spinner, { SpinnerProps } from '@project/components/Spinner';
import { useAtomValue } from '@project/lib/jotai';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Props for the GlobalLoader component.
 */
export type GlobalLoaderProps = {
  /**
   * Custom z-index for the overlay. Defaults to 9999.
   */
  zIndex?: number;
  /**
   * Background opacity for the scrim [0..1]. Defaults to 0.9.
   */
  backdropOpacity?: number;
  /**
   * Extra time in milliseconds to keep the loader visible after loading ends. Defaults to 250.
   */
  lingerMs?: number;
  /**
   * Additional milliseconds to add to linger when a modal is open. Defaults to 2000.
   */
  modalBonusMs?: number;
} & Pick<SpinnerProps, 'pulses' | 'durationSec'>;

/**
 * A full-screen overlay that shows a Spinner while `globalLoadingAtom` is true,
 * and lingers briefly after it turns false to mask abrupt UI changes.
 *
 * @param props - The component props.
 * @returns A JSX element representing the global loading overlay.
 */
export default function GlobalLoader(props: GlobalLoaderProps) {
  const {
    zIndex = 9999,
    backdropOpacity = 0.9,
    pulses = 4,
    durationSec = 1.8,
    lingerMs = 250,
    modalBonusMs = 2000,
  } = props;

  const isModalOpen = useAtomValue(globalModalOpenAtom);
  const isLoading = useAtomValue(globalLoadingAtom);

  const extraMs = useMemo(
    () => lingerMs + (isModalOpen ? modalBonusMs : 0),
    [lingerMs, modalBonusMs, isModalOpen]
  );

  const [visible, setVisible] = useState<boolean>(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isLoading) {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      setVisible(true);
      return;
    }
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      hideTimerRef.current = null;
    }, extraMs);
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [isLoading, extraMs]);

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          key="global-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          aria-busy
          role="progressbar"
          className="pointer-events-auto fixed inset-0 touch-none overscroll-none select-none"
          style={{ zIndex }}
        >
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{
              backgroundColor: 'var(--global-loader-overlay)',
              opacity: backdropOpacity,
            }}
          />
          <div className="relative grid h-full w-full place-items-center">
            <Spinner
              pulses={pulses}
              durationSec={durationSec + (isModalOpen ? 1.0 : 0)}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
