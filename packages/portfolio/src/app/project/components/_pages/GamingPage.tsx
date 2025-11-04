'use client';

import { useLang } from '@i18n/client';
import { hexRadiusAtom } from '@project/atoms/hexGridAtoms';
import {
  globalModalItemsAtom,
  globalModalOpenAtom,
} from '@project/atoms/modalAtoms';
import { activeKeyAtom } from '@project/atoms/sectionsAtoms';
import BackgroundedElement from '@project/components/BackgroundedElement';
import HexToggleBar, {
  HexToggleItem,
} from '@project/components/HexToggleBar/HexToggleBar';
import { PageModal } from '@project/components/PageModal';
import Univearth from '@project/components/PageModals/GamingModal/Univearth';
import OblivionSvg from '@project/components/Svg/OblivionSvg';
import UnivearthSvg from '@project/components/Svg/UnivearthSvg';
import Text, { TextSize } from '@project/components/Text/Text';
import { useGlobalPositions } from '@project/hooks/hexgrid/useGlobalPositions';
import { useQrToCenter } from '@project/hooks/hexgrid/useQrToCenter';
import { useGlobalModal } from '@project/hooks/useGlobalModal';
import useWindowSize from '@project/hooks/useWindowSize';
import { useAtomValue, useSetAtom } from '@project/lib/jotai';
import { PixelPos } from '@project/types/buttons-panel';
import cn from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useEffect, useMemo, useState } from 'react';

const ACTIVE_CONTENT = ['landing', 'oblivion'];
type ActiveContent = (typeof ACTIVE_CONTENT)[number];

export default function GamingPageClient() {
  const { dict, lang } = useLang();
  const { resolvedTheme } = useTheme();
  const { deviceType } = useWindowSize();
  const R = useAtomValue(hexRadiusAtom);
  const isModalOpen = useAtomValue(globalModalOpenAtom);
  const setModalItems = useSetAtom(globalModalItemsAtom);
  const qrToCenter = useQrToCenter();
  const globalPositions = useGlobalPositions();
  const { show, replace } = useGlobalModal();
  const modalFunction = isModalOpen ? replace : show;
  const activeCarouselId = useAtomValue(activeKeyAtom);

  const [openTab, setOpenTab] = useState<ActiveContent>('landing');

  useEffect(() => {
    if (!!activeCarouselId && ACTIVE_CONTENT.includes(activeCarouselId))
      setOpenTab(activeCarouselId);
  }, [activeCarouselId]);

  const landingContent = useMemo(
    () =>
      ({
        landing: {
          text: dict.pages.gaming.text,
          position: qrToCenter
            ? qrToCenter(globalPositions.gamingLandingText)
            : null,
          textScale: deviceType === 'mobile' ? R * 0.035 : R * 0.018,
          textSize: deviceType === 'mobile' ? 'body' : 'title',
          className: '!-translate-y-[80%]',
          textClassName: cn(
            resolvedTheme === 'light' && 'tracking-[-0.015rem]',
            deviceType !== 'mobile' && '!leading-[1.1]',
            deviceType === 'mobile' && '!leading-[1.1]'
          ),
          boldColorOnly: true,
        },
        oblivion: {
          text: dict.pages.gaming.oblivionText,
          position: qrToCenter
            ? qrToCenter(globalPositions.gamingOblivionText)
            : null,
          textScale: deviceType === 'mobile' ? R * 0.035 : R * 0.018,
          textSize: deviceType === 'mobile' ? 'body' : 'title',
          className: '!-translate-y-[80%]',
          textClassName: cn(
            resolvedTheme === 'light' && 'tracking-[-0.015rem]',
            deviceType !== 'mobile' && '!leading-[1.1]',
            deviceType === 'mobile' && '!leading-[1.1]'
          ),
          boldColorOnly: true,
        },
      }) as Record<
        ActiveContent,
        {
          text: string;
          position: PixelPos;
          textScale: number;
          textSize: TextSize;
          className?: string;
          textClassName?: string;
          boldColorOnly: boolean;
        }
      >,
    [
      dict.pages.gaming.text,
      dict.pages.gaming.oblivionText,
      qrToCenter,
      globalPositions.gamingLandingText,
      globalPositions.gamingOblivionText,
      R,
      resolvedTheme,
      deviceType,
    ]
  );

  const items: HexToggleItem[] = [
    {
      id: 'oblivion',
      title: 'oblivion-mechanics',
      label: dict.pages.gaming.obm,
      icon: OblivionSvg,
      sizeFactor: 1.2,
      iconScale: '90%',
      labelSizeFactor: 1,
      labelElevation: 0.1,
      toggleable: true,
      soundMuted: 'hover',
      showLabelOnToggled: true,
      onClick: () => {
        setOpenTab((prev) => (prev !== 'oblivion' ? 'oblivion' : 'landing'));
      },
      children: [
        {
          id: 'univearth',
          title: 'Univearth',
          label: 'Univearth',
          sizeFactor: 1,
          icon: UnivearthSvg,
          iconScale: '60%',
          labelSizeFactor: 1,
          soundMuted: 'hover',
          hiddenBorders: false,
          showLabelOnToggled: true,
          onClick: () => {
            modalFunction({
              child: (
                <PageModal>
                  <Univearth />
                </PageModal>
              ),
              info: 'pages.gaming.univearthInfo',
            });
          },
        },
      ],
    },
  ];

  useEffect(() => {
    const modalItems = items.find((it) => it.id === activeCarouselId)?.children;

    if (modalItems) setModalItems(modalItems);
  }, [lang, activeCarouselId, setModalItems]);

  if (!qrToCenter) return null;

  const content = landingContent[openTab];
  const mainTextPosition = content.position;

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={openTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          <BackgroundedElement
            as="article"
            className={cn(
              'absolute -translate-1/2 px-[0%] py-[0%] text-center',
              content.className
            )}
            style={{
              top: mainTextPosition.top,
              left: mainTextPosition.left,
              width: deviceType === 'mobile' ? `${R * 14}px` : `${R * 20}px`,
            }}
          >
            <Text
              variant="text"
              size={content.textSize}
              scale={content.textScale}
              boldColorOnly={content.boldColorOnly}
              className={content.textClassName}
              weightDelta={resolvedTheme === 'light' ? 100 : 0}
            >
              {content.text}
            </Text>
          </BackgroundedElement>
        </motion.div>
      </AnimatePresence>
      <HexToggleBar
        items={items}
        position={globalPositions.gamingButtons}
        orientation="flat"
        sizeFactor={1}
        childrenMaxShown={3}
        childrenSizeFactor={1}
        centerAtom={activeKeyAtom}
      />
    </>
  );
}
