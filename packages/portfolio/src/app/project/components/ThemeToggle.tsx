'use client';

import HexButton, {
  GloballyPositionedHexButton,
} from '@project/components/HexButton/HexButton';
import {
  GlobalOptPositionType,
  UseGlobal,
} from '@project/components/HexGridBackground/components/GlobalPosition';
import { setThemeCookie } from '@project/utils/theme';
import cn from 'classnames';
import { useTheme } from 'next-themes';
import { FC, useEffect, useState } from 'react';
import { IoIosMoon, IoIosSunny } from 'react-icons/io';

/**
 * Props for the theme toggle component.
 */
export type ThemeToggleProps = {
  /**
   * Additional CSS classes for styling.
   */
  className?: string;
  /**
   * Factor to scale the size of the button.
   */
  sizeFactor?: number;
};

/**
 * A custom hook to manage the state and logic for the theme toggle.
 * It handles theme switching, mounted state, and provides necessary data for the component.
 *
 * @returns An object containing the current theme state and an event handler.
 */
function useThemeToggleState() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';
  const nextTheme: 'light' | 'dark' = isDark ? 'light' : 'dark';
  const label = mounted ? (isDark ? 'Light' : 'Dark') : 'Theme';

  const handleClick = () => {
    setTheme(nextTheme);
    setThemeCookie(nextTheme);
  };

  return { isDark, mounted, label, onClick: handleClick };
}

/**
 * A button component that toggles between light and dark themes.
 * It can be rendered either normally or in a globally-positioned context.
 *
 * @param props - The component props.
 * @returns A JSX element representing the theme toggle button.
 */
const ThemeToggleButton: FC<
  ThemeToggleProps & UseGlobal & GlobalOptPositionType
> = ({ className, sizeFactor = 0.8, useGlobal, globalPosition }) => {
  const { isDark, mounted, label, onClick } = useThemeToggleState();

  const commonProps = {
    title: label,
    icon: isDark ? IoIosSunny : IoIosMoon,
    iconScale: '63%',
    size: 'small' as const,
    sizeFactor,
    className: cn('pointer-events-auto', className),
    'aria-label': 'Toggle theme',
    'aria-pressed': mounted ? isDark : undefined,
    onClick,
    borderType: 'both' as const,
    hiddenBorders: false,
  };

  return useGlobal ? (
    <GloballyPositionedHexButton
      {...commonProps}
      globalPosition={globalPosition!}
    />
  ) : (
    <HexButton {...commonProps} />
  );
};

/**
 * The standard theme toggle component.
 *
 * @param props - The component props.
 * @returns A standard theme toggle button.
 */
export const ThemeToggle: FC<ThemeToggleProps> = (props) => (
  <ThemeToggleButton {...props} useGlobal={false} />
);

/**
 * A globally-positioned theme toggle component.
 *
 * @param props - The component props.
 * @returns A globally-positioned theme toggle button.
 */
export const GloballyPositionedThemeToggle: FC<
  ThemeToggleProps & GlobalOptPositionType
> = ({ globalPosition = 'themeToggle', sizeFactor }) => (
  <ThemeToggleButton
    useGlobal
    globalPosition={globalPosition}
    sizeFactor={sizeFactor}
    className="absolute z-60"
  />
);
