'use client';

import { useLang } from '@i18n/client';
import { hexRadiusAtom } from '@project/atoms/hexGridAtoms';
import {
  globalModalContentAtom,
  globalModalOpenAtom,
} from '@project/atoms/modalAtoms';
import GlassScreen from '@project/components/GlassScreen';
import HexButton from '@project/components/HexButton/HexButton';
import LangToggle from '@project/components/LangToggle';
import Text from '@project/components/Text/Text';
import { ThemeToggle } from '@project/components/ThemeToggle';
import useWindowSize from '@project/hooks/useWindowSize';
import { useAtomValue, useSetAtom } from '@project/lib/jotai';
import { getObjectValueByPath } from '@project/utils/parser';
import cn from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useState } from 'react';
import { FaInfo } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

/**
 * Props for the GlobalModal component.
 */
export type GlobalModalProps = {
  /**
   * Custom z-index for the overlay. Defaults to 9999.
   */
  zIndex?: number;
  /**
   * Background opacity for the scrim [0..1]. Defaults to 0.85.
   */
  backdropOpacity?: number;
  /**
   * Close when clicking the backdrop. Defaults to true.
   */
  closeOnBackdrop?: boolean;
  /**
   * Show close button. Defaults to true.
   */
  closeButton?: boolean;
  /**
   * ARIA label for close button. Defaults to 'Close modal'.
   */
  closeLabel?: string;
  /**
   * ARIA label for info button. Defaults to 'Modal info'.
   */
  infoLabel?: string;
};

/**
 * A global modal component that displays content based on the application's state.
 * It includes an animated glass screen effect, a backdrop, and controls for
 * closing the modal and displaying additional information.
 *
 * @param props - The component props.
 * @returns A JSX element representing the global modal.
 */
export default function GlobalModal(props: GlobalModalProps) {
  const {
    zIndex = 9999,
    backdropOpacity = 0.9,
    closeOnBackdrop = true,
    closeButton = true,
    closeLabel = 'Close modal',
    infoLabel = 'Modal info',
  } = props;

  const { deviceType } = useWindowSize();
  const { resolvedTheme } = useTheme();
  const { dict } = useLang();
  const R = useAtomValue(hexRadiusAtom);
  const open = useAtomValue(globalModalOpenAtom);
  const content = useAtomValue(globalModalContentAtom);
  const setOpen = useSetAtom(globalModalOpenAtom);
  const setContent = useSetAtom(globalModalContentAtom);

  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (infoOpen) {
          setInfoOpen(false);
        } else {
          setOpen(false);
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, infoOpen, setOpen]);

  const handleClose = useCallback(() => {
    if (infoOpen) {
      setInfoOpen(false);
      return;
    }
    setOpen(false);
  }, [infoOpen, setOpen]);

  const handleInfo = useCallback(() => {
    if (!content?.info) return;
    setInfoOpen((v) => !v);
  }, [content]);

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => {
        setInfoOpen(false);
        setContent(null);
      }}
    >
      {open && content && (
        <motion.div
          key="global-modal"
          aria-modal
          role="dialog"
          className="fixed inset-0 grid h-[100dvh] w-[100vw] place-items-center"
          style={{ zIndex }}
          exit={{ opacity: 0 }}
          transition={{ when: 'afterChildren' }}
        >
          <motion.div
            className="pointer-events-auto absolute inset-0 h-full w-full"
            style={{
              backgroundColor: 'var(--global-modal-overlay)',
              opacity: backdropOpacity,
            }}
            onClick={closeOnBackdrop ? handleClose : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: backdropOpacity }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <div className="pointer-events-none relative h-full w-full">
            <GlassScreen
              containerClassName="z-50 absolute top-1/2 left-1/2 -translate-1/2"
              containerStyle={{
                width:
                  deviceType === 'mobile'
                    ? '100%'
                    : `calc(min(${R * 40}px,90%))`,
                height:
                  deviceType === 'mobile'
                    ? '100%'
                    : `calc(min(${R * 22}px,90%))`,
              }}
              screenClassName="h-full w-full"
              radiusRem={deviceType === 'mobile' ? 0 : undefined}
            >
              {closeButton && (
                <button
                  type="button"
                  aria-label={closeLabel}
                  onClick={handleClose}
                  className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-black/5 hover:cursor-pointer hover:bg-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
                >
                  <IoMdClose size={20} color="var(--global-modal-close)" />
                </button>
              )}
              {!!content.info && (
                <HexButton
                  title="Info"
                  icon={FaInfo}
                  iconScale="55%"
                  size={'small' as const}
                  sizeFactor={0.8}
                  borderType={'both' as const}
                  hiddenBorders={false}
                  aria-label={infoLabel}
                  onClick={handleInfo}
                  className={cn(
                    'pointer-events-auto absolute',
                    deviceType === 'web' && 'right-[1%] bottom-[2%]',
                    deviceType === 'medium' &&
                      'top-[2.5%] left-[2.5%] translate-1/2',
                    deviceType === 'mobile' && 'top-[2rem] left-[2rem]'
                  )}
                />
              )}
              {deviceType === 'web' ? (
                <div className="absolute top-1/2 left-[1rem] flex h-[95%] -translate-y-1/2 flex-col justify-between opacity-85">
                  <ThemeToggle sizeFactor={0.7} className="translate-1/2" />
                  <LangToggle sizeFactor={0.7} className="translate-1/2" />
                </div>
              ) : (
                <div className="absolute bottom-[1rem] left-1/2 flex w-[95%] -translate-x-1/2 justify-between opacity-85">
                  <ThemeToggle sizeFactor={0.7} className="translate-1/2" />
                  <LangToggle sizeFactor={0.7} className="translate-1/2" />
                </div>
              )}
              {content.child}
            </GlassScreen>
          </div>

          <AnimatePresence>
            {infoOpen && content.info && (
              <motion.div
                key="global-modal-info"
                aria-modal
                role="dialog"
                className="fixed inset-0 grid h-[100dvh] w-[100vw] place-items-center"
                style={{ zIndex: zIndex + 1 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ when: 'afterChildren' }}
              >
                <motion.div
                  className="pointer-events-auto absolute inset-0 h-full w-full"
                  style={{
                    backgroundColor: 'var(--global-modal-overlay)',
                    opacity: backdropOpacity,
                  }}
                  onClick={closeOnBackdrop ? handleInfo : undefined}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: backdropOpacity }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
                <div className="pointer-events-none relative h-full w-full">
                  <GlassScreen
                    childrenMountDelayMs={0}
                    showHexagons={false}
                    containerClassName="z-50 h-full w-full absolute"
                    screenClassName={cn(
                      'top-1/2 left-1/2 -translate-1/2 overflow-hidden',
                      deviceType === 'mobile' ? 'p-[5%]' : 'p-[2%]'
                    )}
                    screenStyle={{
                      maxWidth:
                        deviceType === 'mobile' ? `100%` : `${R * 20}px`,
                      width: deviceType === 'mobile' ? '100%' : '60%',
                    }}
                    radiusRem={deviceType === 'mobile' ? 0 : undefined}
                    glassOpacity={resolvedTheme === 'light' ? 0.5 : undefined}
                  >
                    <button
                      type="button"
                      aria-label={closeLabel}
                      onClick={handleInfo}
                      className={cn(
                        'absolute -top-4 -right-4 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-black/5 hover:cursor-pointer hover:bg-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]'
                      )}
                    >
                      <IoMdClose size={20} color="var(--global-modal-close)" />
                    </button>
                    <div className="flex max-h-[calc(90dvh-2.5rem)] w-full items-center p-5">
                      <Text
                        variant="text"
                        size={deviceType === 'mobile' ? 'small' : 'body'}
                        scale={deviceType === 'mobile' ? 0.85 : 1}
                        weightDelta={resolvedTheme === 'light' ? 100 : -100}
                      >
                        {getObjectValueByPath(dict, content.info)}
                      </Text>
                    </div>
                  </GlassScreen>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
