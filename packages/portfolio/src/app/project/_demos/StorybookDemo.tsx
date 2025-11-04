import { useLang } from '@i18n/client';
import Spinner from '@project/components/Spinner';
import useWindowSize from '@project/hooks/useWindowSize';
import cn from 'classnames';
import { useTheme } from 'next-themes';
import { FC, useEffect, useRef, useState } from 'react';
import {
  LANG_STORAGE_KEY,
  STORYBOOK_READY_EVENT,
  THEME_CHANGE_EVENT,
} from 'shared-constants';

export type StorybookDemoProps = {
  /** Optional CSS class for the container */
  className?: string;
  /** Milliseconds before showing the fallback spinner */
  loaderDelayMs?: number;
};

const SPINNER_HIDE_AFTER_LOAD_MS = 500;
const IFRAME_SHOW_AFTER_LOAD_MS = 1000;

export const StorybookDemo: FC<StorybookDemoProps> = ({
  className,
  loaderDelayMs = 180,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { resolvedTheme } = useTheme();
  const { lang } = useLang();
  const { deviceType } = useWindowSize();
  const [isStorybookReady, setIsStorybookReady] = useState(false);

  const [loaded, setLoaded] = useState<boolean>(false);
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [iframeVisible, setIframeVisible] = useState<boolean>(false);

  const loaderTimer = useRef<number | null>(null);
  const hideSpinnerTimer = useRef<number | null>(null);
  const showIframeTimer = useRef<number | null>(null);

  useEffect(() => {
    setLoaded(false);
    setShowLoader(false);
    setIframeVisible(false);

    if (loaderTimer.current) window.clearTimeout(loaderTimer.current);
    if (hideSpinnerTimer.current) window.clearTimeout(hideSpinnerTimer.current);
    if (showIframeTimer.current) window.clearTimeout(showIframeTimer.current);

    loaderTimer.current = window.setTimeout(() => {
      setShowLoader(true);
    }, loaderDelayMs);

    return () => {
      if (loaderTimer.current) window.clearTimeout(loaderTimer.current);
      if (hideSpinnerTimer.current)
        window.clearTimeout(hideSpinnerTimer.current);
      if (showIframeTimer.current) window.clearTimeout(showIframeTimer.current);
    };
  }, [loaderDelayMs]);

  const onReady = () => {
    if (loaded) return;
    setLoaded(true);

    if (hideSpinnerTimer.current) window.clearTimeout(hideSpinnerTimer.current);
    if (showIframeTimer.current) window.clearTimeout(showIframeTimer.current);

    hideSpinnerTimer.current = window.setTimeout(() => {
      setShowLoader(false);
    }, SPINNER_HIDE_AFTER_LOAD_MS);

    showIframeTimer.current = window.setTimeout(() => {
      setIframeVisible(true);
    }, IFRAME_SHOW_AFTER_LOAD_MS);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === STORYBOOK_READY_EVENT) {
        setIsStorybookReady(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;

    if (isStorybookReady && iframe?.contentWindow && resolvedTheme && lang) {
      iframe.contentWindow.postMessage(
        { type: THEME_CHANGE_EVENT, payload: resolvedTheme },
        '*'
      );
    }
  }, [isStorybookReady, resolvedTheme]);

  useEffect(() => {
    if (typeof lang === 'string' && lang) {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    }
  }, [lang]);

  return (
    <div
      className={cn(
        'no-custom-cursor pointer-events-none absolute left-1/2 -translate-1/2 border-none',
        deviceType === 'web' && 'top-[42%] aspect-video w-[75%]',
        deviceType === 'medium' && 'top-[48%] h-[70%] w-[90%]',
        deviceType === 'mobile' && 'top-1/2 h-[80%] w-[90%]',
        className
      )}
    >
      <iframe
        ref={iframeRef}
        src="/storybook/index.html"
        title="Demo de Componente en Storybook"
        loading="lazy"
        onLoad={onReady}
        onError={onReady}
        style={{
          visibility: loaded ? 'visible' : 'hidden',
          opacity: iframeVisible ? 1 : 0,
          transition: 'opacity 300ms ease',
        }}
        className={cn(
          'text-text-token-bold pointer-events-auto h-full w-full rounded-[5px] border-2',
          !iframeVisible && 'pointer-events-none'
        )}
      />

      {showLoader && (
        <Spinner
          hasOverlay
          className="absolute top-1/2 left-1/2 -translate-1/2"
        />
      )}
    </div>
  );
};
