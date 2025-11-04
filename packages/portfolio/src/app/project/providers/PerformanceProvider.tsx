'use client';

import { performanceStateAtom } from '@project/atoms/performanceAtoms';
import {
  PerformanceProfile,
  PerformanceReasons,
  usePerformanceProfile,
  UsePerformanceProfileOptions,
} from '@project/hooks/usePerformanceProfile';
import { useAtom } from 'jotai';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/**
 * Defines the sequential priority for enabling performance-intensive features.
 * Features are enabled one by one in this specific order, based on performance monitoring.
 * The string key is used directly in the `usePerformance('key')` hook.
 */
export const FEATURE_PRIORITY = [
  'glitches',
  'client-scenes',
  'hx-bg-cursor-reveal',
  'hx-bg-click-ripple',
  'hx-bg-perimeter-light',
  'hx-bg-spotlight',
  'hx-bg-drag-sparks',
  'hx-bg-light',
  'tech-cursor',
  'glass-screen',
] as const;

export type FeatureKey = (typeof FEATURE_PRIORITY)[number];

export type PerformanceSnapshot = {
  lowPerformance: boolean;
  reasons: PerformanceReasons;
  fps: number | null;
  profile: PerformanceProfile;
  enableAnimations: boolean;
  enabledFeatures: FeatureKey[];
};

type Ctx = {
  enableAnimations: boolean;
  enabledFeatures: FeatureKey[];
  isFeatureEnabled: (key: FeatureKey) => boolean;
};

const PerformanceContext = createContext<Ctx | undefined>(undefined);

const profileOptions: UsePerformanceProfileOptions = {
  minFps: 25,
  graceMs: 2500,
  minFpsSamples: 15,
  hysteresisFps: 5,
};

const TARGET_FPS = 25;

const DEACTIVATION_DELAY_MS = 500;
const ACTIVATION_DELAY_MS = 8000;

type PendingAction = {
  type: 'activate' | 'deactivate';
  feature: FeatureKey;
};

/**
 * Provides a performance context to its children.
 * This provider measures the application's FPS and progressively enables features
 * from a priority list (`FEATURE_PRIORITY`) if the performance remains above a target threshold.
 * Components can then use the `usePerformance` hook with a specific feature key
 * to conditionally render performance-intensive features.
 * @param props The component props.
 * @param props.children The child components to be wrapped by the provider.
 */
export function PerformanceProvider({ children }: { children: ReactNode }) {
  const perf = usePerformanceProfile(profileOptions);
  const [performanceState, setPerformanceState] = useAtom(performanceStateAtom);
  const { enabledFeatures, timestamp } = performanceState;
  const [isInitialized, setIsInitialized] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingActionRef = useRef<PendingAction | null>(null);

  useEffect(() => {
    const now = Date.now();
    const ageInMs = now - timestamp;
    const ONE_HOUR_MS = 3600 * 1000;

    if (ageInMs >= ONE_HOUR_MS && enabledFeatures.length > 0) {
      setPerformanceState({ enabledFeatures: [], timestamp: 0 });
      setIsInitialized(true);
    } else {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized || perf.fps === null) return;

    const clearPendingAction = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      pendingActionRef.current = null;
    };

    const scheduleAction = (action: PendingAction, delay: number) => {
      pendingActionRef.current = action;
      timerRef.current = setTimeout(() => {
        if (action.type === 'activate') {
          setPerformanceState({
            enabledFeatures: [
              ...enabledFeatures,
              action.feature,
            ] as FeatureKey[],
            timestamp: Date.now(),
          });
        } else {
          setPerformanceState({
            enabledFeatures: enabledFeatures.filter(
              (f) => f !== action.feature
            ),
            timestamp: Date.now(),
          });
        }
        clearPendingAction();
      }, delay);
    };

    const isStable = perf.fps >= TARGET_FPS;
    const lastEnabledFeature = enabledFeatures[enabledFeatures.length - 1];
    const nextFeatureToEnable = FEATURE_PRIORITY[enabledFeatures.length];

    let targetAction: PendingAction | null = null;

    if (isStable) {
      if (nextFeatureToEnable) {
        targetAction = { type: 'activate', feature: nextFeatureToEnable };
      }
    } else {
      if (lastEnabledFeature) {
        targetAction = { type: 'deactivate', feature: lastEnabledFeature };
      }
    }

    if (
      pendingActionRef.current?.type === targetAction?.type &&
      pendingActionRef.current?.feature === targetAction?.feature
    ) {
      return;
    }

    clearPendingAction();

    if (targetAction) {
      const delay =
        targetAction.type === 'activate'
          ? ACTIVATION_DELAY_MS
          : DEACTIVATION_DELAY_MS;
      scheduleAction(targetAction, delay);
    }
  }, [isInitialized, perf.fps, enabledFeatures, setPerformanceState]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const value = useMemo<Ctx>(() => {
    const isFeatureEnabled = (key: FeatureKey) => {
      return enabledFeatures.includes(key);
    };
    return {
      enableAnimations: perf.enableAnimations && enabledFeatures.length > 0,
      enabledFeatures: enabledFeatures as FeatureKey[],
      isFeatureEnabled,
    };
  }, [enabledFeatures, perf.enableAnimations]);

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}

/**
 * A hook to access the performance context.
 * It provides information about currently enabled features and whether animations are globally enabled.
 * @param featureKey An optional key from the `FEATURE_PRIORITY` list.
 * If provided, the hook returns a tailored `enableAnimations` flag specific to that feature's status.
 * @returns The performance context, including `enableAnimations`, `enabledFeatures`, and `isFeatureEnabled`.
 * @throws If used outside of a `PerformanceProvider`.
 */
export function usePerformance(featureKey?: FeatureKey) {
  const ctx = useContext(PerformanceContext);
  if (!ctx)
    throw new Error('usePerformance must be used within a PerformanceProvider');
  if (featureKey == null) return ctx;

  const isEnabled = ctx.isFeatureEnabled(featureKey);
  return {
    ...ctx,
    enableAnimations: false, //ctx.enableAnimations && isEnabled,
  } as const;
}
