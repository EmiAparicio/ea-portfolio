'use client';

import { hexRadiusAtom } from '@project/atoms/hexGridAtoms';
import type { HexButtonProps } from '@project/components/HexButton/HexButton';
import { CrossLink } from '@project/components/Svg/LinksSvg/CrossLink';
import { ThreeSmallLink } from '@project/components/Svg/LinksSvg/ThreeSmallLink';
import { TwoSmallLink } from '@project/components/Svg/LinksSvg/TwoSmallLink';
import { useQrToCenter } from '@project/hooks/hexgrid/useQrToCenter';
import { useImmediateRouter } from '@project/hooks/useImmediateRouter';
import { usePlaceTree } from '@project/hooks/usePlaceTree';
import { useRouteSync } from '@project/hooks/useRouteSync';
import { useAtomValue } from '@project/lib/jotai';
import type {
  ButtonNode,
  HexScheme,
  PanelRoot,
} from '@project/types/buttons-panel';
import { Axial } from '@project/types/hexgrid';
import { rotationFor } from '@project/utils/buttons-panel';
import { useParams } from 'next/navigation';
import {
  JSX,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
} from 'react';

const LINK_SCALE = 1.3;
const BRANCH_TWO_SCALE = 4;
const BRANCH_THREE_SCALE = 4;
const LINK_CLASS = 'absolute pointer-events-none text-link-svg opacity-20';

/**
 * Type extending ButtonNode with an optional URL.
 */
type UrlNode<P extends HexButtonProps> = ButtonNode<P> & { url?: string };

/**
 * Props for the HexButtonsPanel component.
 */
export interface HexButtonsPanelProps<
  P extends HexButtonProps = HexButtonProps,
> {
  /**
   * The hexagonal grid scheme to use.
   */
  scheme?: HexScheme;
  /**
   * The root node of the button panel tree.
   */
  root: PanelRoot<P>;
  /**
   * The axial coordinates of the root button's origin.
   */
  rootOrigin: Axial;
}

const LANG_SWITCH_KEY = 'langSwitch:pending';

/**
 * A component that renders a dynamic, animated panel of hexagonal buttons.
 * The panel's structure and visibility are managed by a tree data structure,
 * and its state is synchronized with the URL and session storage.
 *
 * @param props - The component props.
 * @returns A JSX element containing the hexagonal buttons and their connecting links.
 */
export function HexButtonsPanel<P extends HexButtonProps = HexButtonProps>({
  scheme = 'flat',
  root,
  rootOrigin,
}: HexButtonsPanelProps<P>) {
  const params = useParams<{ lang?: string }>();
  const { navigateImmediate } = useImmediateRouter();

  const radius = useAtomValue(hexRadiusAtom);
  const qrToCenter = useQrToCenter();

  const lang = useMemo(() => {
    const raw = params?.lang;
    if (!raw) return '';
    return Array.isArray(raw) ? (raw[0] ?? '') : raw;
  }, [params]);

  const normalizeSubpath = useCallback(
    (sub: string) => (sub.startsWith('/') ? sub : `/${sub}`),
    []
  );
  const buildPath = useCallback(
    (subpath: string | null) => {
      if (!lang) return subpath ? normalizeSubpath(subpath) : '/';
      return subpath ? `/${lang}${normalizeSubpath(subpath)}` : `/${lang}`;
    },
    [lang, normalizeSubpath]
  );

  const menuId = root.id;

  const panelKey = useMemo(() => {
    const custom = (root as PanelRoot<P>).storageKey;
    if (typeof custom === 'string' && custom.trim()) return custom.trim();
    return `qr:${rootOrigin.q},${rootOrigin.r}`;
  }, [root, rootOrigin]);

  const storageKey = useMemo(() => `hexPanel:${panelKey}:v1`, [panelKey]);
  const intentKey = useMemo(() => `hexPanel:${panelKey}:intent`, [panelKey]);

  const legacyStorageKey = useMemo(() => `hexPanel:${menuId}:v1`, [menuId]);

  const legacyIntentKeys = useMemo(
    () => [`hexPanel:${menuId}:intent`, 'hexPanel:root:intent'],
    [menuId]
  );

  const [toggles, setToggles] = useState<Record<string, boolean>>({});
  const [pendingRouteId, setPendingRouteId] = useState<string | null>(null);
  const [closingRouteId, setClosingRouteId] = useState<string | null>(null);
  const [navTo, setNavTo] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);

  const placeTree = usePlaceTree<P>({
    scheme,
    root,
    origin: rootOrigin,
    toggles,
    qrToCenter,
  });

  const { parentMap, childrenByParent } = useMemo(() => {
    const pMap: Record<string, string | undefined> = {};
    const cMap: Record<string, string[]> = {};
    for (const n of placeTree.nodes) {
      if (n.parentId) {
        pMap[n.id] = n.parentId;
        if (!cMap[n.parentId]) cMap[n.parentId] = [];
        cMap[n.parentId].push(n.id);
      } else {
        pMap[n.id] = undefined;
      }
      if (!cMap[n.id]) cMap[n.id] = [];
    }
    pMap[menuId] = pMap[menuId] ?? undefined;
    cMap[menuId] = cMap[menuId] ?? [];
    return { parentMap: pMap, childrenByParent: cMap };
  }, [placeTree.nodes, menuId]);

  const ancestorsOf = useCallback(
    (id: string): string[] => {
      const res: string[] = [];
      let cur = parentMap[id];
      while (cur) {
        res.push(cur);
        cur = parentMap[cur];
      }
      return res;
    },
    [parentMap]
  );

  const routeMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const n of placeTree.nodes) {
      const nodeUrl = (n.node as UrlNode<P>).url;
      if (typeof nodeUrl === 'string' && nodeUrl.trim().length)
        map[n.id] = nodeUrl;
    }
    return map;
  }, [placeTree.nodes]);

  const routeIds = useMemo(() => Object.keys(routeMap), [routeMap]);
  const routeIdSet = useMemo(() => new Set(routeIds), [routeIds]);

  const pathToId = useMemo<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    for (const [id, sub] of Object.entries(routeMap)) {
      m[buildPath(sub)] = id;
    }
    return m;
  }, [routeMap, buildPath]);

  const rootPath = useMemo(() => buildPath(null), [buildPath]);

  const { currentPath, atRoot, currentRouteId } = useRouteSync({
    rootPath,
    pathToId,
  });

  const didRestoreRef = useRef(false);

  const readLangSwitchTarget = () => {
    try {
      return sessionStorage.getItem(LANG_SWITCH_KEY) || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    try {
      const pending = sessionStorage.getItem(LANG_SWITCH_KEY);
      if (pending && pending === lang) {
        sessionStorage.removeItem(LANG_SWITCH_KEY);
      }
    } catch {
      /* empty */
    }
  }, [lang]);

  useLayoutEffect(() => {
    if (didRestoreRef.current) return;
    didRestoreRef.current = true;

    try {
      let raw = sessionStorage.getItem(storageKey);

      if (!raw) {
        const legacy = sessionStorage.getItem(legacyStorageKey);
        if (legacy) {
          sessionStorage.setItem(storageKey, legacy);
          raw = legacy;
        }
      }

      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, boolean>;
        setToggles((prev) => {
          const next = { ...prev };
          let changed = false;

          const persistableIdSet = new Set<string>();
          for (const n of placeTree.nodes) {
            if (!routeIdSet.has(n.id)) persistableIdSet.add(n.id);
          }

          for (const [id, val] of Object.entries(parsed)) {
            if (persistableIdSet.has(id) && next[id] !== val) {
              next[id] = val;
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      }
    } catch {
      /* empty */
    } finally {
      setRestored(true);
    }
  }, [storageKey, legacyStorageKey, placeTree.nodes, routeIdSet.size]);

  useEffect(() => {
    if (!restored) return;
    try {
      const out: Record<string, boolean> = {};
      for (const n of placeTree.nodes) {
        if (routeIdSet.has(n.id)) continue;
        const v = toggles[n.id];
        if (typeof v !== 'undefined') out[n.id] = v;
      }
      sessionStorage.setItem(storageKey, JSON.stringify(out));
    } catch {
      /* empty */
    }
  }, [restored, toggles, placeTree.nodes, routeIdSet, storageKey]);

  useEffect(() => {
    if (!restored) return;

    const pendingLang = readLangSwitchTarget();
    if (pendingLang && pendingLang !== lang) return;

    const selected = pendingRouteId ?? currentRouteId;
    if (!selected) return;
    if (closingRouteId && selected === closingRouteId) return;

    setToggles((prev) => {
      let changed = false;
      const next = { ...prev };
      if (!next[menuId]) {
        next[menuId] = true;
        changed = true;
      }
      for (const pid of ancestorsOf(selected)) {
        if (!next[pid]) {
          next[pid] = true;
          changed = true;
        }
      }
      if (!next[selected]) {
        next[selected] = true;
        changed = true;
      }
      for (const rid of routeIds) {
        if (rid !== selected && next[rid]) {
          next[rid] = false;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [
    restored,
    pendingRouteId,
    currentRouteId,
    closingRouteId,
    ancestorsOf,
    menuId,
    routeIds,
    lang,
  ]);

  const setToggle = useCallback(
    (id: string, next: boolean) => {
      setToggles((prev) => {
        const nextMap: Record<string, boolean> = { ...prev, [id]: next };
        if (!next) {
          const queue: string[] = [...(childrenByParent[id] ?? [])];
          const descendants = new Set<string>(queue);
          while (queue.length) {
            const cid = queue.pop() as string;
            for (const gc of childrenByParent[cid] ?? []) {
              if (!descendants.has(gc)) {
                descendants.add(gc);
                queue.push(gc);
              }
            }
          }
          for (const did of descendants) if (nextMap[did]) nextMap[did] = false;

          const selected = (pendingRouteId ?? currentRouteId) || null;
          if (selected && descendants.has(selected)) {
            setClosingRouteId(selected);
            setPendingRouteId(null);
            sessionStorage.removeItem(intentKey);
            setNavTo(rootPath);
          }
        }
        return nextMap;
      });
    },
    [childrenByParent, pendingRouteId, currentRouteId, rootPath, intentKey]
  );

  useEffect(() => {
    if (!pendingRouteId) return;
    const target = buildPath(routeMap[pendingRouteId]);
    if (currentPath === target) {
      setPendingRouteId(null);
      sessionStorage.removeItem(intentKey);
    }
  }, [pendingRouteId, currentPath, buildPath, routeMap, intentKey]);

  useEffect(() => {
    const pendingLang = readLangSwitchTarget();
    if (pendingLang && pendingLang !== lang) return;

    const selected = pendingRouteId ?? currentRouteId;
    const isSeedlings = currentPath.endsWith('/seedlings');

    if (!selected && !atRoot && !isSeedlings) {
      setNavTo(rootPath);
      sessionStorage.removeItem(intentKey);
    }
  }, [pendingRouteId, currentRouteId, atRoot, rootPath, intentKey, lang]);

  useEffect(() => {
    if (navTo) {
      navigateImmediate(navTo, { scroll: false });
      setNavTo(null);
    }
  }, [navTo, navigateImmediate]);

  useEffect(() => {
    if (closingRouteId && atRoot) {
      setClosingRouteId(null);
    }
  }, [closingRouteId, atRoot]);

  useEffect(() => {
    try {
      const pendingLang = readLangSwitchTarget();
      if (pendingLang && pendingLang !== lang) return;

      let raw = sessionStorage.getItem(intentKey);

      if (!raw) {
        for (const k of legacyIntentKeys) {
          const v = sessionStorage.getItem(k);
          if (v) {
            raw = v;
            sessionStorage.setItem(intentKey, v);
          }
        }
        for (const k of legacyIntentKeys) sessionStorage.removeItem(k);
      }

      if (!raw) return;
      const subpath = raw as string;
      const target = buildPath(subpath);
      if (currentPath !== target) setNavTo(target);
    } catch {
      /* empty */
    }
  }, [intentKey, currentPath, buildPath, legacyIntentKeys, lang]);

  const buttons = useMemo(() => {
    const selectedRouteId = pendingRouteId ?? currentRouteId;

    return placeTree.nodes
      .map((n) => {
        if (!n.visible && n.parentId) return null;
        const As = n.node.as as ComponentType<P>;
        const userProps = (n.node.props || {}) as P;
        const hasKids = Boolean(n.node.children?.length);
        const nodeUrl = (n.node as UrlNode<P>).url;
        const isRoute = typeof nodeUrl === 'string' && routeIdSet.has(n.id);
        const isMenu = n.id === menuId;
        const needsToggle = hasKids || Boolean(userProps.toggleable);

        const computedToggled = isRoute
          ? selectedRouteId === n.id && closingRouteId !== n.id
          : needsToggle
            ? (toggles[n.id] ?? Boolean(userProps.toggled))
            : (userProps.toggled as boolean | undefined);

        const onToggle = ((next: boolean) => {
          userProps.onToggle?.(next);

          const pendingLang = readLangSwitchTarget();
          const switchingToOtherLang = Boolean(
            pendingLang && pendingLang !== lang
          );

          if (isMenu) {
            if (!next) {
              const selected = selectedRouteId;
              if (selected) setClosingRouteId(selected);
              setPendingRouteId(null);
              setToggles((prev) => {
                const cleared: Record<string, boolean> = {};
                for (const k of Object.keys(prev)) cleared[k] = false;
                return cleared;
              });
              sessionStorage.removeItem(intentKey);
              if (!switchingToOtherLang) setNavTo(rootPath);
            } else {
              setToggle(n.id, true);
            }
            return;
          }

          if (isRoute) {
            if (next) {
              setClosingRouteId(null);
              setPendingRouteId(n.id);
              setToggles((prev) => {
                const map: Record<string, boolean> = {
                  ...prev,
                  [menuId]: true,
                  [n.id]: true,
                };
                for (const pid of ancestorsOf(n.id)) map[pid] = true;
                for (const rid of routeIds) if (rid !== n.id) map[rid] = false;
                return map;
              });

              if (!switchingToOtherLang) {
                if (nodeUrl) sessionStorage.setItem(intentKey, nodeUrl);
                const href = buildPath(nodeUrl!);
                navigateImmediate(href, { scroll: false });
              }
            } else {
              setClosingRouteId(n.id);
              setPendingRouteId(null);
              setToggle(n.id, false);
              sessionStorage.removeItem(intentKey);
              if (!switchingToOtherLang) setNavTo(rootPath);
            }
            return;
          }

          if (needsToggle) setToggle(n.id, next);
        }) as P['onToggle'];

        const merged: P = {
          ...userProps,
          toggleable: needsToggle,
          toggled: computedToggled as P['toggled'],
          onToggle,
          position: { left: n.px.left, top: n.px.top },
          isMain: !n.parentId as P['isMain'],
          title: (userProps.title || n.node.id) as P['title'],
          'aria-label': (userProps['aria-label'] ||
            userProps.title ||
            n.node.id) as P['aria-label'],
          href: isRoute ? buildPath(nodeUrl!) : userProps.href,
        };
        return <As key={n.id} {...merged} />;
      })
      .filter((el): el is JSX.Element => Boolean(el));
  }, [
    placeTree.nodes,
    toggles,
    routeIdSet,
    currentRouteId,
    pendingRouteId,
    closingRouteId,
    menuId,
    rootPath,
    setToggle,
    ancestorsOf,
    routeIds,
    intentKey,
    navigateImmediate,
    buildPath,
    lang,
  ]);

  const links = useMemo(() => {
    if (!radius || !qrToCenter) return null;
    const size = radius * LINK_SCALE;
    return placeTree.edges
      .map(({ from, to, dir }) => {
        if (!from.visible || !to.visible) return null;
        const midLeft = (from.px.left + to.px.left) / 2;
        const midTop = (from.px.top + to.px.top) / 2;
        const rot = rotationFor(scheme, dir);
        const style: CSSProperties = {
          left: midLeft,
          top: midTop,
          transform: `translate(-50%, -50%) rotate(${rot}deg)`,
          width: size,
          height: 'auto',
        };
        return (
          <CrossLink
            key={`${from.id}->${to.id}`}
            className={LINK_CLASS}
            style={style}
          />
        );
      })
      .filter((el): el is JSX.Element => Boolean(el));
  }, [radius, qrToCenter, placeTree.edges, scheme]);

  const branchSvgs = useMemo(() => {
    if (!radius) return null;
    return placeTree.branches
      .map((b, i) => {
        if (!b.visible) return null;
        const rot = rotationFor(scheme, b.dir);
        const size =
          (b.kind === 'two' ? BRANCH_TWO_SCALE : BRANCH_THREE_SCALE) * radius;
        const style: CSSProperties = {
          left: b.px.left,
          top: b.px.top,
          transform: `translate(-50%, -50%) rotate(${rot}deg)`,
          width: size,
          height: 'auto',
        };
        const key = `${b.kind}-${b.qr.q},${b.qr.r}-${i}`;
        return b.kind === 'two' ? (
          <TwoSmallLink key={key} className={LINK_CLASS} style={style} />
        ) : (
          <ThreeSmallLink key={key} className={LINK_CLASS} style={style} />
        );
      })
      .filter((el): el is JSX.Element => Boolean(el));
  }, [radius, placeTree.branches, scheme]);

  return (
    <>
      {links}
      {branchSvgs}
      {buttons}
    </>
  );
}
