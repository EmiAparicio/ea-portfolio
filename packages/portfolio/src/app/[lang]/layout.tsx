import '@app/globals.css';
import { LangProvider } from '@i18n/client';
import { LocaleBase } from '@i18n/utils/constants';
import { normalizeBase } from '@i18n/utils/normalize';
import GlobalModal from '@project/components/GlobalModal';
import HexGridReadyBoundary from '@project/components/HexGridBackground/components/HexGridReadyBoundary';
import HexGridBackground from '@project/components/HexGridBackground/HexGridBackground';
import LandingTitle from '@project/components/LandingTitle';
import { GloballyPositionedLangToggle } from '@project/components/LangToggle';
import { MenuPanel } from '@project/components/MenuPanel';
import { SessionStorageGuards } from '@project/components/SessionStorageGuards';
import TechCursor from '@project/components/TechCursor';
import { GloballyPositionedThemeToggle } from '@project/components/ThemeToggle';
import CopyToastHost from '@project/components/Toast/CopyToastHost';
import ToastProvider from '@project/components/Toast/ToastProvider';
import { AppProviders } from '@project/providers';
import { readThemeCookieServer } from '@project/utils/server';
import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import ClientScenes from './ClientScenes';
import { PageParams } from './page';
import PortfolioUIGuard from './PortfolioUIGuard';

const titles: Record<LocaleBase, string> = {
  en: 'Emiliano Aparicio | Engineer & Frontend Developer',
  es: 'Emiliano Aparicio | Ingeniero y Desarrollador Frontend',
};
const descriptions: Record<LocaleBase, string> = {
  en: "Emiliano Aparicio's portfolio: web development with React, game design, bioengineering and prompt engineering.",
  es: 'Portfolio de Emiliano Aparicio: desarrollo web con React, diseño de juegos, bioingeniería y prompt engineering.',
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/**
 * Resolves the language from route parameters, which might be a promise.
 * This is a helper to handle Next.js's generateMetadata and component props patterns.
 * @param p The props object containing the `params`.
 * @returns A promise that resolves to the normalized language code (`'en'` or `'es'`).
 */
async function resolveLangFromProps(p: PageParams): Promise<LocaleBase> {
  const raw = (await p.params).lang;
  return normalizeBase(raw);
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

/**
 * Generates dynamic page metadata based on the current language.
 * This function is used by Next.js to set the `<title>`, `<meta>` tags, etc.
 * in the document's `<head>`.
 * @param props The props containing the route parameters.
 * @returns A promise that resolves to the `Metadata` object for the page.
 */
export async function generateMetadata(props: PageParams): Promise<Metadata> {
  const lang = await resolveLangFromProps(props);

  return {
    title: titles[lang],
    description: descriptions[lang],
    manifest: '/manifest.webmanifest',
    icons: {
      icon: [{ url: '/favicons/favicon.ico' }],
      apple: [{ url: '/favicons/apple-icon.png' }],
    },
    alternates: {
      canonical: `/${lang}`,
      languages: { en: '/en', es: '/es' },
    },
    openGraph: {
      title: titles[lang],
      description: descriptions[lang],
      url: `${siteUrl}/${lang}`,
      siteName: 'Emiliano Aparicio Portfolio',
      locale: lang === 'en' ? 'en_US' : 'es_ES',
      type: 'website',
    },
    other: {
      'apple-mobile-web-app-title': 'EA-Portfolio',
      'color-scheme': 'dark light',
    },
  };
}

type LayoutProps = { children: React.ReactNode } & PageParams;

/**
 * The root layout for language-specific routes (e.g., `/en/...`, `/es/...`).
 * It sets up all global providers, server-side data fetching (like theme),
 * and renders the core structure of the application, including global UI elements.
 * @param props The layout props, containing the page content (`children`) and route `params`.
 */
export default async function LangLayout(props: LayoutProps) {
  const p = await props.params;

  const lang = normalizeBase(p.lang) as LocaleBase;

  if (lang !== 'en' && lang !== 'es') notFound();

  const initialTheme = await readThemeCookieServer();

  return (
    <div>
      <SessionStorageGuards />
      <AppProviders defaultTheme={initialTheme}>
        <main className="relative min-h-dvh overflow-hidden">
          <ToastProvider>
            <CopyToastHost />
            <PortfolioUIGuard>
              <HexGridBackground debug={false} />
            </PortfolioUIGuard>
            <LangProvider initialLang={lang}>
              {props.children}
              <PortfolioUIGuard>
                <HexGridReadyBoundary fallback={null}>
                  <ClientScenes />
                  <LandingTitle />
                  <MenuPanel />
                  <TechCursor />
                  <GloballyPositionedThemeToggle />
                  <GloballyPositionedLangToggle />
                  <GlobalModal />
                </HexGridReadyBoundary>
              </PortfolioUIGuard>
              <PortfolioUIGuard inverse>
                <GlobalModal />
              </PortfolioUIGuard>
            </LangProvider>
          </ToastProvider>
        </main>
      </AppProviders>
    </div>
  );
}
