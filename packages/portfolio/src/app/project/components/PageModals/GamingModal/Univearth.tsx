'use client';

import { useLang } from '@i18n/client';
import HexButton from '@project/components/HexButton/HexButton';
import Spinner from '@project/components/Spinner';
import UnivearthSvg from '@project/components/Svg/UnivearthSvg';
import useWindowSize from '@project/hooks/useWindowSize';
import cn from 'classnames';
import { FC, useEffect, useRef, useState } from 'react';

export type UnivearthProps = {
  /** Optional CSS class for the container */
  className?: string;
  /** Milliseconds before showing the fallback spinner */
  loaderDelayMs?: number;
};

const SPINNER_HIDE_AFTER_LOAD_MS = 500;
const IFRAME_SHOW_AFTER_LOAD_MS = 1000;

const Univearth: FC<UnivearthProps> = ({ className, loaderDelayMs = 180 }) => {
  const { deviceType } = useWindowSize();
  const { dict, lang } = useLang();

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

  return (
    <div className="pointer-events-none relative h-full w-full">
      <div
        className={cn('pointer-events-none relative h-full w-full', className)}
      >
        <iframe
          src={
            lang === 'es'
              ? 'https://www.youtube.com/embed/6L0vg49os5g?list=PLma5G-s8ZIuVMfYoz-ltEFancyW1kzPNz'
              : 'https://www.youtube.com/embed/L2WMuPQEEVw?list=PLma5G-s8ZIuVMfYoz-ltEFancyW1kzPNz'
          }
          title="Univearth - Game Lore Cinematic"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          style={{
            visibility: loaded ? 'visible' : 'hidden',
            opacity: iframeVisible ? 1 : 0,
            transition: 'opacity 300ms ease',
          }}
          loading="lazy"
          onLoad={onReady}
          onError={onReady}
          className={cn(
            'no-custom-cursor outline-global-modal-content-border pointer-events-auto absolute top-1/2 left-1/2 aspect-video -translate-1/2 rounded-[5px] outline-2',
            !iframeVisible && 'pointer-events-none',
            deviceType === 'web' && 'h-[60%]',
            deviceType !== 'web' && 'h-[calc(min(40dvh,40vw))]',
            deviceType === 'mobile' && '!top-1/2'
          )}
        />

        {showLoader && (
          <Spinner
            hasOverlay
            className="absolute top-[40%] left-1/2 -translate-1/2"
          />
        )}
      </div>
      <HexButton
        id="univearth-web"
        title={dict.pages.gaming.visitWeb}
        label={dict.pages.gaming.visitWeb}
        icon={UnivearthSvg}
        sizeFactor={1.5}
        iconScale="50%"
        labelSizeFactor={0.6}
        labelElevation={lang === 'es' ? 0.2 : 0.1}
        href="https://uvegame.com"
        toggleable={false}
        showLabelOnToggled={true}
        className={cn(
          'pointer-events-auto !absolute',
          deviceType === 'web' && 'top-1/2 left-[5%]',
          deviceType !== 'web' && '-bottom-[2.5%] left-1/2'
        )}
      />
    </div>
  );
};

export default Univearth;
