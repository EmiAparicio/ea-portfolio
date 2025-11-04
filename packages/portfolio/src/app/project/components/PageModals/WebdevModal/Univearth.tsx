/* eslint-disable @next/next/no-img-element */
'use client';

import { useLang } from '@i18n/client';
import HexButton from '@project/components/HexButton/HexButton';
import Spinner from '@project/components/Spinner';
import UnivearthSvg from '@project/components/Svg/UnivearthSvg';
import useWindowSize from '@project/hooks/useWindowSize';
import { DeviceType } from '@project/types/window';
import cn from 'classnames';
import { useTheme } from 'next-themes';
import { FC, useEffect, useRef, useState } from 'react';

export type UnivearthProps = {
  /** Optional CSS class for the container */
  className?: string;
  /** Milliseconds before showing the fallback spinner */
  loaderDelayMs?: number;
};

const IMAGES: Record<DeviceType, Record<string, string>> = {
  web: {
    dark: '/images/UvE-Dark-Web.webp',
    light: '/images/UvE-Light-Web.webp',
  },
  medium: {
    dark: '/images/UvE-Dark-Medium.webp',
    light: '/images/UvE-Light-Medium.webp',
  },
  mobile: {
    dark: '/images/UvE-Dark-Mobile.webp',
    light: '/images/UvE-Light-Mobile.webp',
  },
};

const SPINNER_HIDE_AFTER_LOAD_MS = 500;
const IFRAME_SHOW_AFTER_LOAD_MS = 1000;

const Univearth: FC<UnivearthProps> = ({ className, loaderDelayMs = 180 }) => {
  const { deviceType } = useWindowSize();
  const { resolvedTheme } = useTheme();
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
        <img
          src={IMAGES[deviceType][resolvedTheme ?? 'dark']}
          title="Univearth"
          alt="Univearth"
          style={{
            visibility: loaded ? 'visible' : 'hidden',
            opacity: iframeVisible ? 1 : 0,
            transition: 'opacity 300ms ease',
          }}
          loading="lazy"
          onLoad={onReady}
          onError={onReady}
          className={cn(
            'no-custom-cursor outline-global-modal-content-border pointer-events-none absolute left-1/2 -translate-1/2 rounded-[5px] outline-2',
            deviceType === 'web' && 'top-[42%] w-[75%]',
            deviceType === 'medium' && 'top-[45%] w-[calc(min(45dvh,55vw))]',
            deviceType === 'mobile' && 'top-1/2 w-[90%]'
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
        title={dict.pages.webdev.visitWeb}
        label={dict.pages.webdev.visitWeb}
        icon={UnivearthSvg}
        sizeFactor={1.5}
        iconScale="50%"
        labelSizeFactor={0.6}
        labelElevation={lang === 'es' ? 0.2 : 0.1}
        href="/uvegame"
        toggleable={false}
        showLabelOnToggled={true}
        className={cn(
          'pointer-events-auto !absolute',
          deviceType === 'web' && 'top-1/2 left-[5%]',
          deviceType === 'medium' && 'top-1/2 left-[2.5%] translate-x-1/2',
          deviceType === 'mobile' && '-bottom-[2.5%] left-1/2'
        )}
      />
    </div>
  );
};

export default Univearth;
