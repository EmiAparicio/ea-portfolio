'use client';

import { useLang } from '@i18n/client';
import type { LocaleBase } from '@i18n/utils/constants';
import HexButton, {
  GloballyPositionedHexButton,
} from '@project/components/HexButton/HexButton';
import {
  GlobalOptPositionType,
  UseGlobal,
} from '@project/components/HexGridBackground/components/GlobalPosition';
import { useLangRouter } from '@project/hooks/useLangRouter';
import { useLoader } from '@project/hooks/useLoader';
import {
  readAndClearIntentAsync,
  safeGetSessionItem,
  safeRemoveSessionItem,
  safeSetSessionItem,
} from '@project/utils/session';
import cn from 'classnames';
import { FC, useEffect, useMemo, useRef } from 'react';

const LANG_SWITCH_KEY = 'langSwitch:pending';

/**
 * Props for the language toggle component.
 */
export type LangToggleProps = {
  /**
   * Additional CSS classes for styling.
   */
  className?: string;
  /**
   * Factor to scale the size of the button.
   */
  sizeFactor?: number;
  /**
   * Factor to scale the size of the label.
   */
  labelSizeFactor?: number;
};

/**
 * A custom hook to manage the state and logic for the language toggle.
 * It handles the language switching, loader state, and ensures a smooth transition.
 *
 * @returns An object containing the current language, the next language, and the click handler.
 */
function useLangToggleState() {
  const { lang } = useLang();
  const next = useMemo<LocaleBase>(() => (lang === 'es' ? 'en' : 'es'), [lang]);

  const { switchLang, prefetchSwitchLang } = useLangRouter();
  const { show, hide } = useLoader();

  const switchingRef = useRef(false);
  const startAtRef = useRef<number | null>(null);
  const minMsRef = useRef(2000);
  const timerRef = useRef<number | null>(null);
  const safetyRef = useRef<number | null>(null);
  const prevLangRef = useRef(lang);

  useEffect(() => {
    prefetchSwitchLang(next, null);
  }, [next, prefetchSwitchLang]);

  useEffect(() => {
    if (!switchingRef.current) {
      prevLangRef.current = lang;
      return;
    }

    if (lang !== prevLangRef.current) {
      try {
        const pending = safeGetSessionItem(LANG_SWITCH_KEY);
        if (pending && pending === lang) {
          safeRemoveSessionItem(LANG_SWITCH_KEY);
        }
      } catch {
        /* empty */
      }

      const minMs = minMsRef.current ?? 2000;
      const startedAt = startAtRef.current ?? Date.now();
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, minMs - elapsed);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (safetyRef.current) {
        clearTimeout(safetyRef.current);
        safetyRef.current = null;
      }

      const id = window.setTimeout(() => {
        hide();
        switchingRef.current = false;
        startAtRef.current = null;
        if (timerRef.current === id) timerRef.current = null;
      }, remaining);
      timerRef.current = id;
    }
  }, [lang, hide]);

  useEffect(() => {
    const minMs = minMsRef.current ?? 2000;
    return () => {
      const startedAt = startAtRef.current;
      const wasSwitching = switchingRef.current;

      if (safetyRef.current) {
        clearTimeout(safetyRef.current);
        safetyRef.current = null;
      }
      if (!wasSwitching) return;

      const elapsed = startedAt ? Date.now() - startedAt : 0;
      const remaining = Math.max(0, minMs - elapsed);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      if (remaining === 0) {
        hide();
      } else {
        const id = window.setTimeout(() => {
          hide();
          if (timerRef.current === id) timerRef.current = null;
        }, remaining);
        timerRef.current = id;
      }
    };
  }, [hide]);

  function abortSwitch() {
    switchingRef.current = false;
    startAtRef.current = null;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (safetyRef.current) {
      clearTimeout(safetyRef.current);
      safetyRef.current = null;
    }

    const pending = safeGetSessionItem(LANG_SWITCH_KEY);
    if (pending) safeRemoveSessionItem(LANG_SWITCH_KEY);

    hide();
  }

  const onClick = () => {
    if (typeof window === 'undefined') return;
    if (switchingRef.current) return;

    switchingRef.current = true;
    startAtRef.current = Date.now();
    show();

    safeSetSessionItem(LANG_SWITCH_KEY, next);

    if (safetyRef.current) {
      clearTimeout(safetyRef.current);
      safetyRef.current = null;
    }
    safetyRef.current = window.setTimeout(() => {
      abortSwitch();
    }, 10000);

    readAndClearIntentAsync()
      .then((intent) => {
        setTimeout(() => {
          try {
            switchLang(next, { intentSubpath: intent, setCookie: true });
          } catch {
            abortSwitch();
          }
        }, 0);
      })
      .catch(() => {
        setTimeout(() => {
          try {
            switchLang(next, { intentSubpath: null, setCookie: true });
          } catch {
            abortSwitch();
          }
        }, 0);
      });
  };

  return {
    lang,
    next,
    onClick,
  };
}

/**
 * A button component that toggles between different languages.
 * It can be rendered either normally or in a globally-positioned context.
 *
 * @param props - The component props.
 * @returns A JSX element representing the language toggle button.
 */
const LangToggleButton = ({
  className,
  sizeFactor = 0.8,
  labelSizeFactor = 0.45,
  useGlobal,
  globalPosition,
}: LangToggleProps & UseGlobal & GlobalOptPositionType) => {
  const { lang, next, onClick } = useLangToggleState();

  const commonProps = {
    label: lang.toUpperCase(),
    title: (next as string).toUpperCase(),
    size: 'small' as const,
    sizeFactor,
    labelSizeFactor,
    className: cn('pointer-events-auto', className),
    onClick,
    borderType: 'both' as const,
    hiddenBorders: false,
  };

  if (useGlobal) {
    return (
      <GloballyPositionedHexButton
        {...commonProps}
        globalPosition={globalPosition!}
        labelClassname="font-russo"
        className="absolute z-60"
      />
    );
  }

  return <HexButton {...commonProps} labelClassname="font-russo" />;
};

/**
 * The standard language toggle component.
 *
 * @param props - The component props.
 * @returns A standard language toggle button.
 */
export const LangToggle: FC<LangToggleProps> = (props) => {
  return <LangToggleButton {...props} useGlobal={false} />;
};

/**
 * A globally-positioned language toggle component.
 *
 * @param props - The component props.
 * @returns A globally-positioned language toggle button.
 */
export const GloballyPositionedLangToggle = ({
  globalPosition = 'langToggle',
  className,
  sizeFactor,
  labelSizeFactor,
}: LangToggleProps & GlobalOptPositionType) => {
  return (
    <LangToggleButton
      useGlobal
      globalPosition={globalPosition}
      className={className}
      sizeFactor={sizeFactor}
      labelSizeFactor={labelSizeFactor}
    />
  );
};

export default LangToggle;
