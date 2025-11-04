'use client';

import { hexRadiusAtom } from '@project/atoms/hexGridAtoms';
import type { ReactIconComponent } from '@project/components/GlitchIcon/GlitchIcon';
import GlitchIcon from '@project/components/GlitchIcon/GlitchIcon';
import GlitchLabel from '@project/components/GlitchLabel/GlitchLabel';
import GlobalPosition, {
  GlobalPositionType,
} from '@project/components/HexGridBackground/components/GlobalPosition';
import { useHexDimensions } from '@project/hooks/hexgrid/useHexDimensions';
import { useHexPolygon } from '@project/hooks/hexgrid/useHexPolygon';
import { useHexRevealSpotlight } from '@project/hooks/hexgrid/useHexRevealSpotlight';
import { useHasMouse } from '@project/hooks/useHasMouse';
import { useHexSounds } from '@project/hooks/useHexSounds';
import { usePrefersReducedMotion } from '@project/hooks/usePrefersReducedMotion';
import useWindowSize from '@project/hooks/useWindowSize';
import { useAtomValue } from '@project/lib/jotai';
import { PixelPos } from '@project/types/buttons-panel';
import { CSSVarName } from '@project/types/css';
import { toCssPx } from '@project/utils/hexgrid/math';
import cn from 'classnames';
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  FC,
  HTMLAttributeAnchorTarget,
  RefObject,
} from 'react';
import {
  forwardRef,
  memo,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import './hex-button.css';

/**
 * Defines the color palette variables for the button's visual style.
 */
export type Palette = { main: CSSVarName; a: CSSVarName; b: CSSVarName };

const DEFAULT_PALETTE: Palette = {
  main: '--hx-button-glitch-main',
  a: '--hx-button-glitch-a',
  b: '--hx-button-glitch-b',
} as const;

export const HIDDEN_BORDERS_OPACITY = 0.2;

const BOTTOM_LABEL_ELEVATION = 0.12;
const TOP_LABEL_ELEVATION = 0.06;

export type HexOrientation = 'flat' | 'pointy';
export type HexSize = 'small' | 'big';
export type LabelPosition = 'top' | 'bottom';

export type CSSVars = CSSProperties &
  Record<`--${string}`, string | number | undefined>;

/**
 * Props for the HexButton component.
 */
export type HexButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'title' | 'children' | 'onToggle'
> & {
  /** The title text used for accessibility and tooltip. */
  title: string;
  /** Optional icon component to display inside the hexagon. */
  icon?: ReactIconComponent;
  /** Scale factor for the icon size (e.g., '100%'). */
  iconScale?: string;
  /** Predefined size ('small' or 'big') for the hexagon. */
  size?: HexSize;
  /** Multiplier for the base hex radius. */
  sizeFactor?: number;
  /** Multiplier for the label font size relative to hex size. */
  labelSizeFactor?: number;
  /** Vertical elevation factor for the label position. */
  labelElevation?: number;
  /** Orientation of the hexagon ('flat' or 'pointy'). */
  orientation?: HexOrientation;
  /** If true, the button can be toggled on/off. */
  toggleable?: boolean;
  /** Current toggled state. */
  toggled?: boolean;
  /** Callback fired when the button is toggled. */
  onToggle?: (next: boolean) => void;
  /** If true, applies main styling/animation effects. */
  isMain?: boolean;
  /** Explicit pixel position for the button (overrides layout). */
  position?: PixelPos;
  /** Explicit aria-label (defaults to title). */
  'aria-label'?: string;
  /** Muting option for button sounds. */
  soundMuted?: 'all' | 'hover' | 'action';
  /** If true, audio will be muted when user prefers reduced motion. */
  respectReducedMotionForAudio?: boolean;
  /** The text to display as a glitch label. */
  label?: string;
  /** Position of the label relative to the icon. */
  labelPosition?: LabelPosition;
  /** Custom class name for the label wrapper. */
  labelClassname?: string;
  /** Type of border to show ('inner', 'outer', or 'both'). */
  borderType?: 'inner' | 'outer' | 'both';
  /** URL to navigate to when clicked. */
  href?: string;
  /** Target attribute for the link (e.g., '_blank'). */
  target?: HTMLAttributeAnchorTarget;
  /** Rel attribute for the link (e.g., 'noreferrer noopener'). */
  rel?: string;
  /** If true, the linked resource should be downloaded. */
  download?: boolean;
  /** If true, the label is only shown on hover, focus, or press. */
  showLabelOnInteract?: boolean;
  /** If true, the label is shown when the button is toggled on. */
  showLabelOnToggled?: boolean;
  /** If true, borders are mostly transparent when idle. */
  hiddenBorders?: boolean;
  /** Custom CSS variables/styles to apply to the button element. */
  buttonStyle?: CSSVars;
};

const GLITCH_INTERVAL_MS = 10000 as const;

/**
 * A stylized hexagonal button component featuring a glitch effect on the icon and label.
 * It handles positioning, toggling state, audio feedback, and responsiveness.
 *
 * @param {HexButtonProps} props - The properties for the HexButton.
 * @param {React.ForwardedRef<HTMLButtonElement>} ref - Forwarded ref for the underlying button element.
 * @returns {JSX.Element} The rendered hexagonal button wrapper.
 */
const HexButtonBase = (
  {
    title,
    icon: Icon,
    iconScale = '100%',
    size = 'small',
    sizeFactor,
    labelSizeFactor = 1,
    labelElevation,
    orientation = 'flat',
    toggleable = false,
    toggled = false,
    onToggle,
    isMain = false,
    disabled,
    onClick,
    onPointerEnter,
    onPointerDown,
    onFocus,
    className,
    position,
    style,
    'aria-label': ariaLabelProp,
    soundMuted,
    respectReducedMotionForAudio = true,
    label,
    labelPosition = 'bottom',
    labelClassname,
    borderType = 'inner',
    href,
    target = '_blank',
    rel = 'noreferrer noopener',
    showLabelOnInteract = false,
    showLabelOnToggled = false,
    hiddenBorders = true,
    buttonStyle,
    ...rest
  }: HexButtonProps,
  ref: React.ForwardedRef<HTMLButtonElement>
) => {
  const { deviceType } = useWindowSize();
  const isDisabled = !!disabled;
  const baseRadius = useAtomValue(hexRadiusAtom) ?? 32;
  const { width, height, rScaled } = useHexDimensions(
    baseRadius,
    orientation,
    size,
    sizeFactor
  );

  const { pointsStr, clipPath: cssClipPath } = useHexPolygon(orientation);

  const hasMouse = useHasMouse();
  const ariaLabel = ariaLabelProp ?? title;

  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldMute =
    respectReducedMotionForAudio && prefersReducedMotion ? 'all' : soundMuted;

  const btnRef = useRef<HTMLButtonElement | null>(null);
  const setRefs = useCallback(
    (node: HTMLButtonElement | null) => {
      btnRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as RefObject<HTMLButtonElement | null>).current = node;
      }
    },
    [ref]
  );

  const { play, maybePlayHover, notifyPointerDown } = useHexSounds({
    disabled: isDisabled,
    shouldMute,
  });

  const [isHovered, setHovered] = useState(false);
  const [isFocused, setFocused] = useState(false);
  const [isPressed, setPressed] = useState(false);

  const wrapperStyle: React.CSSProperties = {
    position:
      position?.left !== undefined || position?.top !== undefined
        ? 'absolute'
        : 'relative',
    ...(position?.left !== undefined && { left: toCssPx(position.left) }),
    ...(position?.top !== undefined && { top: toCssPx(position.top) }),
    width: `${width}px`,
    height: `${height}px`,
  };

  const computedButtonStyle: CSSVars = {
    width: '100%',
    height: '100%',
    position: 'relative',
    clipPath: cssClipPath,
    ['--hx-R' as CSSVarName]: `${rScaled}px`,
  };

  const dataState = toggleable ? (toggled ? 'on' : 'off') : 'off';
  const isOn = dataState === 'on';

  const baseShowLabel =
    !!label && (toggleable ? !isOn || showLabelOnToggled : true);
  const interactState = isHovered || isFocused || isPressed;
  const showLabel = showLabelOnInteract
    ? (baseShowLabel && interactState) || (showLabelOnToggled && isOn)
    : baseShowLabel;

  const glitchInterval = isDisabled || isOn || isMain ? 0 : GLITCH_INTERVAL_MS;

  const labelMaxWidth = Math.floor(width * labelSizeFactor);
  const iconShiftPx = showLabel ? Math.round(height * 0.1) : 0;

  const rawId = useId();
  const revealId = useMemo(
    () => `hexbtn-${rawId.replace(/[^a-zA-Z0-9-_:]/g, '')}`,
    [rawId]
  );

  useHexRevealSpotlight({
    id: revealId,
    enabled: toggleable && isOn && !isDisabled,
    size,
    nodeRef: btnRef,
    deps: [deviceType, width, height],
  });

  const openHref: (e: React.MouseEvent<HTMLButtonElement>) => void = () => {
    if (!href) return;
    if (isDisabled) return;
    const features = rel
      .split(' ')
      .filter((t) => t === 'noopener' || t === 'noreferrer')
      .join(',');
    if (target === '_self') {
      window.location.assign(href);
      return;
    }
    window.open(href, target, features || 'noopener,noreferrer');
  };

  const bordersOpacity = hiddenBorders
    ? interactState || (showLabelOnToggled && isOn)
      ? 1
      : HIDDEN_BORDERS_OPACITY
    : 1;

  (computedButtonStyle as CSSVars)['--hx-borders-opacity'] = bordersOpacity;

  return (
    <span style={style} className={cn(className)}>
      <span
        className={cn(
          'relative inline-flex -translate-1/2 flex-col items-center',
          isDisabled && 'opacity-55'
        )}
        data-disabled={isDisabled ? 'true' : 'false'}
        style={wrapperStyle}
      >
        <button
          {...rest}
          ref={setRefs}
          type="button"
          aria-label={ariaLabel}
          aria-pressed={toggleable ? isOn : undefined}
          data-orientation={orientation}
          data-size={size}
          data-state={dataState}
          data-has-mouse={hasMouse ? 'true' : 'false'}
          disabled={isDisabled}
          onClick={(e) => {
            onClick?.(e);
            if (e.defaultPrevented || isDisabled) return;
            const sfx = toggleable ? (isOn ? 'off' : 'on') : 'click';
            void play(sfx);
            if (href) {
              e.preventDefault();
              requestAnimationFrame(() => btnRef.current?.blur());
            }
            if (href && !toggleable) {
              e.preventDefault();
              openHref(e);
              return;
            }
            if (toggleable) {
              requestAnimationFrame(() => onToggle?.(!isOn));
            }
          }}
          onAuxClick={(e) => {
            if (!href || isDisabled) return;
            if (e.button === 1) {
              e.preventDefault();
              window.open(href, '_blank', 'noopener,noreferrer');
            }
          }}
          onPointerEnter={(e) => {
            onPointerEnter?.(e);
            setHovered(true);
            maybePlayHover(hasMouse);
          }}
          onPointerLeave={(e) => {
            (rest as ButtonHTMLAttributes<HTMLButtonElement>).onPointerLeave?.(
              e
            );
            setHovered(false);
            setPressed(false);
          }}
          onPointerDown={(e) => {
            onPointerDown?.(e);
            setPressed(true);
            notifyPointerDown();
          }}
          onPointerUp={(e) => {
            (rest as ButtonHTMLAttributes<HTMLButtonElement>).onPointerUp?.(e);
            setPressed(false);
          }}
          onFocus={(e) => {
            onFocus?.(e);
            setFocused(true);
          }}
          onBlur={(e) => {
            (rest as ButtonHTMLAttributes<HTMLButtonElement>).onBlur?.(e);
            setFocused(false);
          }}
          className={cn(
            'hex-btn',
            'relative isolate inline-flex items-center justify-center border-0 bg-transparent p-0 outline-none select-none',
            isDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
            'transition-[transform,filter,opacity] duration-[var(--hx-transition-ms)] ease-[var(--hx-transition-ease)]',
            'disabled:cursor-not-allowed'
          )}
          title={isDisabled ? undefined : title}
          style={{ ...computedButtonStyle, ...buttonStyle }}
        >
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-300 ease-in-out"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden={true}
            focusable={false}
            style={{ opacity: 'var(--hx-borders-opacity)' }}
          >
            {(size !== 'small' || borderType !== 'inner') && (
              <polygon
                className="hx-border-outer hx-border"
                points={pointsStr}
                fill="transparent"
                stroke="var(--hx-stroke-outer-color)"
                strokeWidth="var(--hx-stroke-outer)"
                vectorEffect="non-scaling-stroke"
                shapeRendering="geometricPrecision"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}
            {(size !== 'small' || borderType !== 'outer') && (
              <g className="hx-inner hx-border">
                <polygon
                  points={pointsStr}
                  fill="transparent"
                  stroke="var(--hx-stroke-inner-color)"
                  strokeWidth="var(--hx-stroke-inner)"
                  vectorEffect="non-scaling-stroke"
                  shapeRendering="geometricPrecision"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </g>
            )}
          </svg>

          <span className="relative z-[1] inline-flex h-full w-full items-center justify-center">
            {Icon && (
              <span
                className={cn(
                  'hx-icon inline-flex items-center justify-center',
                  isMain && !isOn && !isDisabled ? 'hx-anim' : undefined
                )}
                aria-hidden={true}
                style={
                  {
                    ['--hx-icon-shift' as CSSVarName]: label
                      ? labelPosition === 'bottom'
                        ? `-${iconShiftPx}px`
                        : `${iconShiftPx}px`
                      : '0px',
                  } as React.CSSProperties
                }
              >
                <GlitchIcon
                  icon={Icon}
                  size={iconScale}
                  mainColorVar={DEFAULT_PALETTE.main}
                  aColorVar={DEFAULT_PALETTE.a}
                  bColorVar={DEFAULT_PALETTE.b}
                  intervalMs={glitchInterval}
                />
              </span>
            )}
          </span>
        </button>

        {label && (
          <div
            className={cn(
              'pointer-events-none absolute inset-0 overflow-visible',
              labelClassname
            )}
          >
            {Icon ? (
              labelPosition === 'top' ? (
                <div
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    top: Math.round(
                      height * (labelElevation ?? TOP_LABEL_ELEVATION)
                    ),
                  }}
                >
                  <div
                    className="hx-label hx-label-top"
                    data-visible={showLabel ? 'true' : 'false'}
                    aria-hidden={showLabel ? undefined : true}
                  >
                    <GlitchLabel
                      title={label}
                      maxSize={labelMaxWidth}
                      mainColorVar={DEFAULT_PALETTE.main}
                      aColorVar={DEFAULT_PALETTE.a}
                      bColorVar={DEFAULT_PALETTE.b}
                      intervalMs={
                        !showLabel || isDisabled ? 0 : GLITCH_INTERVAL_MS
                      }
                      speed={1}
                      shadowColorVar="--hx-button-glitch-label-shadow"
                      className={size === 'small' ? 'font-bold' : ''}
                    />
                  </div>
                </div>
              ) : (
                <div
                  className="absolute left-1/2 -translate-x-1/2 translate-y-1/2"
                  style={{
                    bottom: Math.round(
                      height * (labelElevation ?? BOTTOM_LABEL_ELEVATION)
                    ),
                  }}
                >
                  <div
                    className="hx-label hx-label-bottom"
                    data-visible={showLabel ? 'true' : 'false'}
                    aria-hidden={showLabel ? undefined : true}
                  >
                    <GlitchLabel
                      title={label}
                      maxSize={labelMaxWidth}
                      mainColorVar={DEFAULT_PALETTE.main}
                      aColorVar={DEFAULT_PALETTE.a}
                      bColorVar={DEFAULT_PALETTE.b}
                      intervalMs={
                        !showLabel || isDisabled ? 0 : GLITCH_INTERVAL_MS
                      }
                      speed={1}
                      shadowColorVar="--hx-button-glitch-label-shadow"
                      className={size === 'small' ? 'font-bold' : ''}
                    />
                  </div>
                </div>
              )
            ) : (
              <div className="absolute inset-0">
                <div
                  className="hx-label flex h-full items-center justify-center"
                  data-visible={showLabel ? 'true' : 'false'}
                  aria-hidden={showLabel ? undefined : true}
                >
                  <GlitchLabel
                    title={label}
                    maxSize={Math.floor(height * labelSizeFactor)}
                    limitBy="height"
                    mainColorVar={DEFAULT_PALETTE.main}
                    aColorVar={DEFAULT_PALETTE.a}
                    bColorVar={DEFAULT_PALETTE.b}
                    intervalMs={
                      !showLabel || isDisabled ? 0 : GLITCH_INTERVAL_MS
                    }
                    speed={1}
                    shadowColorVar="--hx-button-glitch-label-shadow"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </span>
    </span>
  );
};

HexButtonBase.displayName = 'HexButton';

const HexButton = memo(
  forwardRef<HTMLButtonElement, HexButtonProps>(HexButtonBase)
);
export default HexButton;

/**
 * Props for a HexButton component that is globally positioned using the hex grid coordinates.
 * Inherits all HexButtonProps and adds GlobalPositionType (for the `globalPosition` prop).
 */
type GloballyPositionedHexButtonProps = HexButtonProps & GlobalPositionType;

/**
 * A wrapper component that automatically resolves an Axial coordinate or position key
 * and passes the resulting pixel position to the HexButton.
 *
 * @param {GloballyPositionedHexButtonProps} props - The properties for the button and global positioning.
 * @returns {JSX.Element} The HexButton wrapped in GlobalPosition.
 */
export const GloballyPositionedHexButton: FC<
  GloballyPositionedHexButtonProps
> = ({ globalPosition, ...hexProps }) => {
  return (
    <GlobalPosition globalPosition={globalPosition}>
      <HexButton {...hexProps} />
    </GlobalPosition>
  );
};
