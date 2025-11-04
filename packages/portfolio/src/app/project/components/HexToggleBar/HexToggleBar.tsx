'use client';

import { hexRadiusAtom } from '@project/atoms/hexGridAtoms';
import { carouselActiveIdxAtom } from '@project/atoms/sectionsAtoms';
import HexButton, {
  type HexButtonProps,
  type HexOrientation,
} from '@project/components/HexButton/HexButton';
import HexChildrenCarousel from '@project/components/HexToggleBar/components/HexChildrenCarousel';
import { useQrToCenter } from '@project/hooks/hexgrid/useQrToCenter';
import { Axial } from '@project/types/hexgrid';
import cn from 'classnames';
import { PrimitiveAtom, useAtom, useAtomValue } from '@project/lib/jotai';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Type for an item in the HexToggleBar.
 */
export type HexToggleItem = Omit<
  HexButtonProps,
  'size' | 'borderType' | 'position' | 'toggled' | 'onToggle' | 'orientation'
> & {
  /**
   * Unique ID for the item.
   */
  id?: string | number;
  /**
   * Indicates if the button toggles a modal.
   */
  togglesModal?: boolean;
  /**
   * Child items to be displayed in a carousel when this item is active.
   */
  children?: HexToggleItem[];
};

/**
 * Props for the HexToggleBar component.
 */
export type HexToggleBarProps = {
  /**
   * The list of items to display as buttons.
   */
  items: HexToggleItem[];
  /**
   * The axial position of the bar's anchor point on the grid.
   */
  position: Axial;
  /**
   * The orientation of the hexagons.
   */
  orientation?: HexOrientation;
  /**
   * A size factor for the buttons.
   */
  sizeFactor?: number;
  /**
   * Additional CSS classes.
   */
  className?: string;
  /**
   * The maximum number of children to show in the carousel. Defaults to 3.
   */
  childrenMaxShown?: number;
  /**
   * A size factor for the children buttons.
   */
  childrenSizeFactor?: number;
  /**
   * A Jotai atom to manage the active carousel item ID.
   */
  centerAtom: PrimitiveAtom<string | null>;
};

/**
 * A component that renders a horizontal bar of hexagonal buttons.
 * When a button is toggled, it can reveal a carousel of child buttons.
 * The bar's position is synchronized with the hexagonal grid.
 *
 * @param props - The component props.
 * @returns A JSX element representing the hexagonal toggle bar.
 */
export default function HexToggleBar({
  items,
  position,
  orientation = 'flat',
  sizeFactor,
  className,
  childrenMaxShown = 3,
  childrenSizeFactor,
  centerAtom,
}: HexToggleBarProps) {
  const R = useAtomValue(hexRadiusAtom) ?? 32;
  const [carouselPickId, setCarouselPickId] = useAtom(centerAtom);
  const carouselActiveIdx = useAtomValue(carouselActiveIdxAtom);

  const qrToCenter = useQrToCenter();
  const hasMapper = !!qrToCenter;

  const anchor = useMemo(
    () => (qrToCenter ? qrToCenter(position) : { left: 0, top: 0 }),
    [qrToCenter, position]
  );
  const step1 = useMemo(
    () =>
      qrToCenter
        ? qrToCenter({ q: position.q + 2, r: position.r })
        : { left: 2 * R, top: 0 },
    [qrToCenter, position, R]
  );
  const stepLeft = step1.left - anchor.left;
  const stepTop = step1.top - anchor.top;

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const centers = useMemo(() => {
    const n = items.length;
    if (n === 0) return [] as Array<{ left: number; top: number }>;
    const mid = (n - 1) / 2;
    return items.map((_, i) => {
      const t = i - mid;
      return { left: t * stepLeft, top: t * stepTop };
    });
  }, [items.length, stepLeft, stepTop]);

  const handleToggle = useCallback(
    (index: number, next: boolean) => {
      setActiveIndex(() => {
        const newIndex = next ? index : null;
        return newIndex;
      });
    },

    [items]
  );

  const activeItem = activeIndex == null ? null : (items[activeIndex] ?? null);
  const activeChildren = activeItem?.children?.length
    ? activeItem.children
    : null;

  useEffect(() => {
    if (carouselPickId == null) return;

    const idx = items.findIndex((it) => String(it.id) === carouselPickId);
    if (idx === -1 || activeIndex === idx) return;

    setActiveIndex(idx);
  }, [carouselPickId, items, activeIndex]);

  return (
    <Fragment>
      <div
        className={cn('absolute -translate-1/2', className)}
        style={{
          left: anchor.left,
          top: anchor.top,
          pointerEvents: hasMapper ? 'auto' : 'none',
          opacity: hasMapper ? 1 : 0,
        }}
      >
        <div className="relative isolate">
          {items.map((item, i) => {
            const { children, toggleable: toggleableProp, ...btnProps } = item;
            const isToggleable =
              typeof toggleableProp === 'boolean'
                ? toggleableProp
                : (children?.length ?? 0) > 0;

            return (
              <HexButton
                key={item.id ?? i}
                size="small"
                borderType="outer"
                orientation={orientation}
                sizeFactor={sizeFactor}
                toggleable={isToggleable}
                toggled={isToggleable && activeIndex === i}
                position={{ left: centers[i].left, top: centers[i].top }}
                className="pointer-events-auto z-10"
                {...btnProps}
                onToggle={(next) => {
                  handleToggle(i, next);
                  setCarouselPickId(next ? String(item.id) : null);
                }}
                onClick={(ev) => {
                  if (!isToggleable) {
                    setActiveIndex(i);
                    setCarouselPickId(null);
                  }
                  if (btnProps.onClick) btnProps.onClick(ev);
                }}
              />
            );
          })}
        </div>
      </div>

      {activeItem && activeChildren && activeChildren.length > 0 && (
        <HexChildrenCarousel
          items={activeChildren}
          parentQr={position}
          sizeFactor={childrenSizeFactor ?? sizeFactor}
          maxShownChildren={childrenMaxShown}
          initialIndex={
            carouselActiveIdx < activeChildren.length ? carouselActiveIdx : 0
          }
        />
      )}
    </Fragment>
  );
}
