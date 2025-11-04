'use client';

import { useLang } from '@i18n/client';
import { StorybookDemo } from '@project/_demos/StorybookDemo';
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
import InvasionTours from '@project/components/PageModals/WebdevModal/InvasionTours';
import Portfolio from '@project/components/PageModals/WebdevModal/Portfolio';
import Resume from '@project/components/PageModals/WebdevModal/Resume';
import StarCards from '@project/components/PageModals/WebdevModal/StarCards';
import Univearth from '@project/components/PageModals/WebdevModal/Univearth';
import { StarcraftSvg } from '@project/components/Svg/StarcraftSvg';
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
import { BiSolidBriefcase } from 'react-icons/bi';
import { FaFileDownload, FaPlane } from 'react-icons/fa';
import { GoProjectSymlink } from 'react-icons/go';
import { SiJetpackcompose } from 'react-icons/si';

const ACTIVE_CONTENT = ['landing', 'experience'];
type ActiveContent = (typeof ACTIVE_CONTENT)[number];

export default function WebdevPageClient() {
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
          text: dict.pages.webdev.text,
          position: qrToCenter
            ? qrToCenter(globalPositions.webdevLandingText)
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
        experience: {
          text: dict.pages.webdev.experienceText,
          position: qrToCenter
            ? qrToCenter(globalPositions.webdevExperienceText)
            : null,
          textScale: deviceType === 'mobile' ? R * 0.032 : R * 0.03,
          textSize: 'body',
          className:
            deviceType === 'mobile'
              ? '!-translate-y-[60%]'
              : '!-translate-y-[67%]',
          textClassName: cn(
            resolvedTheme === 'light' && 'tracking-[-0.015rem]',
            deviceType !== 'mobile' && '!leading-[1.1]',
            deviceType === 'mobile' && '!leading-[1.2]'
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
      dict.pages.webdev.text,
      dict.pages.webdev.experienceText,
      qrToCenter,
      globalPositions.webdevLandingText,
      globalPositions.webdevExperienceText,
      R,
      resolvedTheme,
      deviceType,
    ]
  );

  const items: HexToggleItem[] = [
    {
      id: 'cv-download',
      title: dict.pages.webdev.resume,
      label: dict.pages.webdev.resume,
      icon: FaFileDownload,
      sizeFactor: 1.2,
      iconScale: '40%',
      labelSizeFactor: lang === 'es' ? 0.9 : 0.7,
      labelElevation: 0.2,
      toggleable: false,
      soundMuted: 'hover',
      showLabelOnToggled: true,
      onClick: () => {
        show({ child: <Resume /> });
        setOpenTab('landing');
      },
    },
    {
      id: 'experience',
      title: dict.pages.webdev.experienceButton,
      label: dict.pages.webdev.experienceButton,
      icon: BiSolidBriefcase,
      sizeFactor: 1.2,
      iconScale: '50%',
      labelSizeFactor: 1,
      labelElevation: 0.2,
      toggleable: true,
      soundMuted: 'hover',
      showLabelOnToggled: true,
      onClick: () => {
        setOpenTab((prev) =>
          prev !== 'experience' ? 'experience' : 'landing'
        );
      },
      children: [
        {
          id: 'portfolio',
          title: 'Portfolio Project',
          label: dict.pages.webdev.portfolioButton,
          sizeFactor: 1,
          icon: GoProjectSymlink,
          iconScale: '50%',
          labelSizeFactor: lang === 'es' ? 1 : 0.9,
          labelElevation: 0.2,
          soundMuted: 'hover',
          hiddenBorders: false,
          showLabelOnToggled: true,
          onClick: () => {
            modalFunction({
              child: (
                <PageModal>
                  <Portfolio />
                </PageModal>
              ),
            });
          },
        },
        {
          id: 'univearth',
          title: 'Univearth',
          label: 'Univearth',
          sizeFactor: 1,
          icon: UnivearthSvg,
          iconScale: '60%',
          labelSizeFactor: 1,
          labelElevation: 0.2,
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
        {
          id: 'invasion-tours',
          title: 'Invasion Tours Project',
          label: 'Invasion<br/>Tours',
          sizeFactor: 1,
          icon: FaPlane,
          iconScale: '50%',
          labelSizeFactor: 0.8,
          soundMuted: 'hover',
          hiddenBorders: false,
          showLabelOnToggled: true,
          onClick: () => {
            modalFunction({
              child: (
                <PageModal>
                  <InvasionTours />
                </PageModal>
              ),
              info: 'pages.webdev.invasionToursInfo',
            });
          },
        },
        {
          id: 'starcards',
          title: 'StarCards Project',
          label: 'StarCards',
          sizeFactor: 1,
          icon: StarcraftSvg,
          iconScale: '47%',
          labelSizeFactor: 1,
          labelElevation: 0.2,
          soundMuted: 'hover',
          hiddenBorders: false,
          showLabelOnToggled: true,
          onClick: () => {
            modalFunction({
              child: (
                <PageModal>
                  <StarCards />
                </PageModal>
              ),
              info: 'pages.webdev.starcardsInfo',
            });
          },
        },
        {
          id: 'ui-pkg',
          title: 'UI Package Demo',
          label: dict.pages.webdev.uiPkgButton,
          sizeFactor: 1,
          icon: SiJetpackcompose,
          iconScale: '47%',
          labelSizeFactor: 1.1,
          labelElevation: 0.12,
          soundMuted: 'hover',
          hiddenBorders: false,
          showLabelOnToggled: true,
          onClick: () => {
            modalFunction({
              child: (
                <PageModal>
                  <StorybookDemo />
                </PageModal>
              ),
              info: 'pages.webdev.uiPkgInfo',
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
              width: {
                web: `${R * 22}px`,
                medium: `${R * 20}px`,
                mobile: `${R * 15}px`,
              }[deviceType],
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
        position={globalPositions.webdevButtons}
        orientation="flat"
        sizeFactor={1}
        childrenMaxShown={{ web: 3, medium: 3, mobile: 1 }[deviceType]}
        childrenSizeFactor={1}
        centerAtom={activeKeyAtom}
      />
    </>
  );
}
