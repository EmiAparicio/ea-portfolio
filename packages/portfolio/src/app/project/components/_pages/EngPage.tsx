'use client';

import { useLang } from '@i18n/client';
import { hexRadiusAtom } from '@project/atoms/hexGridAtoms';
import { globalModalItemsAtom } from '@project/atoms/modalAtoms';
import { activeKeyAtom } from '@project/atoms/sectionsAtoms';
import BackgroundedElement from '@project/components/BackgroundedElement';
import HexToggleBar, {
  HexToggleItem,
} from '@project/components/HexToggleBar/HexToggleBar';
import Resume from '@project/components/PageModals/EngModal/Resume';
import PaperSvg from '@project/components/Svg/PaperSvg';
import ResearchSvg from '@project/components/Svg/ResearchSvg';
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
import { FaFileDownload } from 'react-icons/fa';

const ACTIVE_CONTENT = ['landing'];
type ActiveContent = (typeof ACTIVE_CONTENT)[number];

export default function EngPageClient() {
  const { dict, lang } = useLang();
  const { resolvedTheme } = useTheme();
  const { deviceType } = useWindowSize();
  const R = useAtomValue(hexRadiusAtom);
  const setModalItems = useSetAtom(globalModalItemsAtom);
  const qrToCenter = useQrToCenter();
  const globalPositions = useGlobalPositions();
  const { show } = useGlobalModal();
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
          text: dict.pages.eng.text,
          position: qrToCenter
            ? qrToCenter(globalPositions.engLandingText)
            : null,
          textScale: deviceType === 'mobile' ? R * 0.029 : R * 0.025,
          textSize: 'body',
          className:
            deviceType === 'mobile'
              ? '!-translate-y-[60%]'
              : '!-translate-y-[67%]',
          textClassName: cn(
            resolvedTheme === 'light' &&
              deviceType !== 'mobile' &&
              'tracking-[-0.015rem]',
            deviceType !== 'mobile' && '!leading-[1.1]',
            deviceType === 'mobile' && '!leading-[1.2] tracking-[-0.015rem]'
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
      dict.pages.eng.text,
      qrToCenter,
      globalPositions.engLandingText,
      R,
      resolvedTheme,
      deviceType,
    ]
  );

  const items: HexToggleItem[] = [
    {
      id: 'cv-download',
      title: dict.pages.eng.resume,
      label: dict.pages.eng.resume,
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
      },
    },
    {
      id: 'research',
      title: dict.pages.eng.researchButton,
      label: dict.pages.eng.researchButton,
      icon: ResearchSvg,
      sizeFactor: 1.2,
      iconScale: '40%',
      labelSizeFactor: lang === 'es' ? 1 : 0.8,
      labelElevation: 0.2,
      toggleable: true,
      soundMuted: 'hover',
      showLabelOnToggled: true,
      children: [
        {
          id: '1010162018',
          title: `${dict.pages.eng.coauthor}`,
          label: `${dict.pages.eng.coauthor}<br/>2018`,
          sizeFactor: 1,
          icon: PaperSvg,
          iconScale: '50%',
          labelSizeFactor: lang === 'es' ? 0.8 : 0.9,
          href: 'https://doi.org/10.1016/j.commatsci.2018.02.019',
          soundMuted: 'hover',
          hiddenBorders: false,
          showLabelOnToggled: true,
        },
        {
          id: '38007',
          title: `${dict.pages.eng.coauthor}`,
          label: `${dict.pages.eng.coauthor}<br/>2018`,
          sizeFactor: 1,
          icon: PaperSvg,
          iconScale: '50%',
          labelSizeFactor: lang === 'es' ? 0.8 : 0.9,
          href: 'https://ui.adsabs.harvard.edu/abs/2018APS..MARP38007B/abstract',
          soundMuted: 'hover',
          hiddenBorders: false,
          showLabelOnToggled: true,
        },
        {
          id: '101088',
          title: `${dict.pages.eng.author}`,
          label: `${dict.pages.eng.author}<br/>2020`,
          sizeFactor: 1,
          icon: PaperSvg,
          iconScale: '50%',
          labelSizeFactor: lang === 'es' ? 0.57 : 0.6,
          href: 'https://doi.org/10.1088/1361-6528/abc036',
          soundMuted: 'hover',
          hiddenBorders: false,
          showLabelOnToggled: true,
        },
        {
          id: '101016',
          title: `${dict.pages.eng.author}`,
          label: `${dict.pages.eng.author}<br/>2020`,
          sizeFactor: 1,
          icon: PaperSvg,
          iconScale: '50%',
          labelSizeFactor: lang === 'es' ? 0.57 : 0.6,
          href: 'https://doi.org/10.1016/j.commatsci.2020.109942',
          soundMuted: 'hover',
          hiddenBorders: false,
          showLabelOnToggled: true,
        },
        {
          id: '6218',
          title: `${dict.pages.eng.coauthor}`,
          label: `${dict.pages.eng.coauthor}<br/>2021`,
          sizeFactor: 1,
          icon: PaperSvg,
          iconScale: '50%',
          labelSizeFactor: lang === 'es' ? 0.8 : 0.9,
          href: 'http://venus.ceride.gov.ar/ojs/index.php/mc/article/view/6218',
          soundMuted: 'hover',
          hiddenBorders: false,
          showLabelOnToggled: true,
        },
        {
          id: '101039',
          title: `${dict.pages.eng.coauthor}`,
          label: `${dict.pages.eng.coauthor}<br/>2022`,
          sizeFactor: 1,
          icon: PaperSvg,
          iconScale: '50%',
          labelSizeFactor: lang === 'es' ? 0.8 : 0.9,
          href: 'https://doi.org/10.1039/D2CP00038E',
          soundMuted: 'hover',
          hiddenBorders: false,
          showLabelOnToggled: true,
        },
        {
          id: '103390',
          title: `${dict.pages.eng.coauthor}`,
          label: `${dict.pages.eng.coauthor}<br/>2023`,
          sizeFactor: 1,
          icon: PaperSvg,
          iconScale: '50%',
          labelSizeFactor: lang === 'es' ? 0.8 : 0.9,
          href: 'https://doi.org/10.3390/nano13081429',
          soundMuted: 'hover',
          hiddenBorders: false,
          showLabelOnToggled: true,
        },
        {
          id: '101016',
          title: `${dict.pages.eng.coauthor}`,
          label: `${dict.pages.eng.coauthor}<br/>2024`,
          sizeFactor: 1,
          icon: PaperSvg,
          iconScale: '50%',
          labelSizeFactor: lang === 'es' ? 0.8 : 0.9,
          href: 'https://doi.org/10.1016/j.eml.2024.102190',
          soundMuted: 'hover',
          hiddenBorders: false,
          showLabelOnToggled: true,
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
        position={globalPositions.engButtons}
        orientation="flat"
        sizeFactor={1}
        childrenMaxShown={{ web: 5, medium: 3, mobile: 1 }[deviceType]}
        childrenSizeFactor={1}
        centerAtom={activeKeyAtom}
      />
    </>
  );
}
