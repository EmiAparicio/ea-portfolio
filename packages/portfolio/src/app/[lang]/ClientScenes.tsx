'use client';

import { useLang } from '@i18n/client';
import EngPage from '@project/components/_pages/EngPage';
import GamingPage from '@project/components/_pages/GamingPage';
import LandingPage from '@project/components/_pages/LandingPage';
import WebdevPage from '@project/components/_pages/WebdevPage';
import { useUrlChange } from '@project/hooks/useUrlChange';
import { usePerformance } from '@project/providers/PerformanceProvider';
import { AnimatePresence, Easing, MotionConfig, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

const SCENES = {
  landing: LandingPage,
  webdev: WebdevPage,
  gaming: GamingPage,
  eng: EngPage,
  seedlings: () => null,
} as const;

type SceneKey = keyof typeof SCENES;

/**
 * Normalizes a path string by replacing multiple slashes with a single one
 * and removing any trailing slash. Returns '/' for an empty or root path.
 * @param p The path string to normalize.
 * @returns The normalized path string.
 */
function norm(p: string) {
  return p.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
}

/**
 * Strips the language segment (/es or /en) from the beginning of a path string.
 * @param p The path string, which may or may not have a language prefix.
 * @returns The path string without the language prefix.
 */
function stripLang(p: string) {
  const m = p.match(/^\/(es|en)(?=\/|$)/);
  if (!m) return p;
  return p.slice(m[0].length) || '/';
}

/**
 * Resolves a scene key from a given URL pathname.
 * It normalizes the path, strips the language prefix, and maps the
 * resulting path to a predefined scene key.
 * @param pathname The raw pathname from the URL.
 * @returns The corresponding scene key. Defaults to 'landing'.
 */
function resolveScene(pathname: string): SceneKey {
  const p = norm(pathname);
  const rest = stripLang(p);
  if (rest === '/' || rest === '') return 'landing';
  if (rest.startsWith('/webdev')) return 'webdev';
  if (rest.startsWith('/gaming')) return 'gaming';
  if (rest.startsWith('/bioengineering')) return 'eng';
  if (rest.startsWith('/seedlings')) return 'seedlings';
  return 'landing';
}

const baseEnterExit = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as Easing },
};

/**
 * Manages the rendering and animated transitions of different "scenes" (pages)
 * based on the current URL pathname. It uses framer-motion for fade-in/out
 * animations between scenes, which can be disabled based on performance settings.
 */
export default function ClientScenes() {
  const { lang } = useLang();
  const { current } = useUrlChange();
  const { enableAnimations } = usePerformance('client-scenes');

  const targetKey = useMemo<SceneKey>(
    () => resolveScene(current.pathname),
    [current.pathname]
  );

  const [visibleKey, setVisibleKey] = useState<SceneKey>(targetKey);

  useEffect(() => {
    if (targetKey === visibleKey) return;
    if (!enableAnimations) {
      setVisibleKey(targetKey);
      return;
    }
    setVisibleKey(targetKey);
  }, [targetKey, visibleKey, enableAnimations]);

  const SceneComp = SCENES[visibleKey];

  useEffect(() => {
    document.body.dataset.clientScene = visibleKey;
    document.body.dataset.clientLang = lang;
    return () => {
      delete document.body.dataset.clientScene;
      delete document.body.dataset.clientLang;
    };
  }, [visibleKey, lang]);

  const enterExit = enableAnimations
    ? baseEnterExit
    : {
        initial: false as const,
        animate: undefined,
        exit: undefined,
        transition: undefined,
      };

  return (
    <div
      id="client-scene-layer"
      className="pointer-events-none fixed inset-0 z-[70]"
      aria-live="polite"
      aria-atomic
    >
      <MotionConfig reducedMotion={enableAnimations ? 'never' : 'always'}>
        <AnimatePresence mode="sync" initial={false}>
          <motion.section
            key={visibleKey}
            initial={enterExit.initial}
            animate={enterExit.animate}
            exit={enterExit.exit}
            transition={enterExit.transition}
            className="h-full w-full will-change-[opacity,transform]"
          >
            <SceneComp />
          </motion.section>
        </AnimatePresence>
      </MotionConfig>
    </div>
  );
}
