import { useLang } from '@i18n/client';
import HexButton from '@project/components/HexButton/HexButton';
import Spinner from '@project/components/Spinner';
import useWindowSize from '@project/hooks/useWindowSize';
import cn from 'classnames';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { FaFileDownload } from 'react-icons/fa';

export type ResumeProps = {
  /** Optional CSS class for the container */
  className?: string;
  /** Milliseconds before showing the fallback spinner */
  loaderDelayMs?: number;
};

const SPINNER_HIDE_AFTER_LOAD_MS = 500;
const IFRAME_SHOW_AFTER_LOAD_MS = 1000;

const Resume: FC<ResumeProps> = ({ className, loaderDelayMs = 180 }) => {
  const { deviceType } = useWindowSize();
  const { lang, dict } = useLang();
  const isEsp = lang === 'es';
  const src = useMemo(
    () =>
      isEsp
        ? '/cv/EmilianoAparicio-CV-WebDev-ES.pdf'
        : '/cv/EmilianoAparicio-CV-WebDev-EN.pdf',
    [isEsp]
  );

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
  }, [src, loaderDelayMs]);

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
          title="Resume"
          src={`${src}#toolbar=1&navpanes=0&statusbar=0`}
          style={{
            visibility: loaded ? 'visible' : 'hidden',
            opacity: iframeVisible ? 1 : 0,
            transition: 'opacity 300ms ease',
          }}
          loading="lazy"
          onLoad={onReady}
          onError={onReady}
          className={cn(
            'no-custom-cursor outline-global-modal-content-border pointer-events-auto absolute left-1/2 w-[80%] -translate-1/2 rounded-[5px] outline-2',
            deviceType === 'web' && 'top-1/2 h-[80%]',
            deviceType !== 'web' && 'top-[45%] h-[70%]',
            !iframeVisible && 'pointer-events-none'
          )}
        />

        {showLoader && (
          <Spinner
            hasOverlay
            className="absolute top-[40%] left-1/2 -translate-1/2"
          />
        )}

        <noscript>
          <a href={src} className="pointer-events-auto">
            {isEsp ? 'Descargar PDF' : 'Download PDF'}
          </a>
        </noscript>
      </div>
      <HexButton
        id="cv-download"
        title={dict.pages.webdev.downloadCv}
        label={dict.pages.webdev.downloadCvLabel}
        icon={FaFileDownload}
        sizeFactor={1.5}
        iconScale="40%"
        labelSizeFactor={0.6}
        labelElevation={0.2}
        href={
          lang === 'es'
            ? '/cv/EmilianoAparicio-CV-WebDev-ES.pdf'
            : '/cv/EmilianoAparicio-CV-WebDev-EN.pdf'
        }
        download={true}
        toggleable={false}
        showLabelOnToggled={true}
        className={cn(
          deviceType === 'web' &&
            'pointer-events-auto !absolute top-1/2 left-[5%]',
          deviceType !== 'web' &&
            'pointer-events-auto !absolute bottom-0 left-1/2'
        )}
      />
    </div>
  );
};

export default Resume;
