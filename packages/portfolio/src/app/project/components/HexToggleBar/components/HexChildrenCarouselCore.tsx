'use client';

import BackgroundedElement from '@project/components/BackgroundedElement';
import HexButton from '@project/components/HexButton/HexButton';
import Carousel, {
  type CarouselProps,
} from '@project/components/HexToggleBar/components/Carousel';
import type { HexToggleItem } from '@project/components/HexToggleBar/HexToggleBar';
import cn from 'classnames';
import React from 'react';

/**
 * Props for the HexChildrenCarouselCore component.
 */
export type HexChildrenCarouselCoreProps = {
  /**
   * The list of items to be displayed in the carousel.
   */
  items: HexToggleItem[];
  /**
   * The orientation of the carousel.
   */
  orientation?: CarouselProps['orientation'];
  /**
   * The maximum number of children to show at once. Defaults to 3.
   */
  maxShownChildren?: number;
  /**
   * A scaling factor for the size of the buttons.
   */
  sizeFactor?: number;
  /**
   * The initial index of the active item in the carousel. Defaults to 0.
   */
  initialIndex?: number;
  /**
   * If true, applies a blurred effect to the curtains.
   */
  blurredCurtains?: boolean;
  /**
   * Additional CSS classes for the container.
   */
  className?: string;
  /**
   * Additional inline styles for the container.
   */
  style?: React.CSSProperties;
};

/**
 * A core component for rendering a carousel of hexagonal buttons.
 * It handles the logic for a single button versus a multi-button carousel.
 * The carousel is wrapped in a `BackgroundedElement` for a hexagonal perimeter effect.
 *
 * @param props - The component props.
 * @returns A JSX element representing the carousel or a single button.
 */
export default function HexChildrenCarouselCore({
  items,
  orientation = 'flat',
  maxShownChildren = 3,
  sizeFactor = 1,
  blurredCurtains = false,
  initialIndex = 0,
  className,
  style,
}: HexChildrenCarouselCoreProps) {
  return (
    <BackgroundedElement
      as="div"
      type="perimeter"
      className={cn(
        'absolute -translate-1/2 has-[>div:focus]:[&>button]:outline',
        className
      )}
      style={style}
    >
      {items.length > 1 ? (
        <Carousel
          items={items}
          orientation={orientation}
          maxShownChildren={maxShownChildren}
          sizeFactor={sizeFactor}
          blurredCurtains={blurredCurtains}
          initialIndex={initialIndex}
          className="relative"
        />
      ) : (
        <HexButton
          size="small"
          borderType="outer"
          sizeFactor={sizeFactor}
          toggleable={items[0].toggleable}
          toggled={false}
          onToggle={() => {}}
          onClick={(e) => {
            items[0].onClick?.(e);
          }}
          className={cn('pointer-events-auto absolute', items[0].className)}
          style={{ ...items[0].style }}
          {...items[0]}
        />
      )}
    </BackgroundedElement>
  );
}
