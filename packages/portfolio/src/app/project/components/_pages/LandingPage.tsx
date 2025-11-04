'use client';

import { useLang } from '@i18n/client';
import { hexRadiusAtom } from '@project/atoms/hexGridAtoms';
import BackgroundedElement from '@project/components/BackgroundedElement';
import Text from '@project/components/Text/Text';
import { useGlobalPositions } from '@project/hooks/hexgrid/useGlobalPositions';
import { useQrToCenter } from '@project/hooks/hexgrid/useQrToCenter';
import { useAtomValue } from '@project/lib/jotai';
import cn from 'classnames';
import { useTheme } from 'next-themes';
import useWindowSize from '../../hooks/useWindowSize';

export default function LandingPage() {
  const { dict } = useLang();
  const { resolvedTheme } = useTheme();
  const { deviceType } = useWindowSize();
  const R = useAtomValue(hexRadiusAtom);
  const qrToCenter = useQrToCenter();
  const globalPositions = useGlobalPositions();

  if (!qrToCenter) return null;

  const mainTextPosition = qrToCenter(globalPositions.landingText);

  return (
    <BackgroundedElement
      as="article"
      className="absolute -translate-1/2 px-[0%] py-[0%] text-center"
      style={{
        top: mainTextPosition.top,
        left: mainTextPosition.left,
        width: deviceType === 'mobile' ? `${R * 14}px` : `${R * 20}px`,
      }}
    >
      <Text
        variant="text"
        size={deviceType === 'mobile' ? 'body' : 'title'}
        scale={deviceType === 'mobile' ? 0.9 : 0.7}
        boldColorOnly
        className={cn(
          resolvedTheme === 'light' && 'tracking-[-0.015rem]',
          deviceType !== 'mobile' && '!leading-[1.1]',
          deviceType === 'mobile' && '!leading-[1.1]'
        )}
        weightDelta={resolvedTheme === 'light' ? 300 : 100}
      >
        {dict.pages.landing.text}
      </Text>
    </BackgroundedElement>
  );
}
