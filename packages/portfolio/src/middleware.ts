import { LocaleBase, SUPPORTED_BASES } from '@i18n/utils/constants';
import { setLangCookieOnResponse } from '@i18n/utils/cookies';
import { negotiateFromRequest } from '@i18n/utils/negotiation';
import { normalizeBase } from '@i18n/utils/normalize';
import { NextResponse, type NextRequest } from 'next/server';

const KNOWN_SUBPATHS = new Set(['webdev', 'gaming', 'bioengineering']);

function cleanPath(pathname: string) {
  const s = pathname.replace(/\/+/g, '/');
  return s !== '/' ? s.replace(/\/$/, '') : '/';
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const path = cleanPath(pathname);

  if (path === '/uvegame/obm' || path.startsWith('/uvegame/obm/')) {
    if (/\.[\w]+$/.test(pathname)) {
      return NextResponse.next();
    }
    const url = req.nextUrl.clone();
    url.pathname = '/uvegame/obm/index.html';
    return NextResponse.rewrite(url);
  }

  if (path.startsWith('/uvegame/obm')) {
    const url = req.nextUrl.clone();
    url.pathname = '/uvegame/obm';
    return NextResponse.redirect(url);
  }

  if (path.startsWith('/uvegame')) {
    if (/\.[\w]+$/.test(pathname)) {
      return NextResponse.next();
    }
    const url = req.nextUrl.clone();
    url.pathname = '/uvegame/index.html';
    return NextResponse.rewrite(url);
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    /\.[\w]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const segs = path.split('/').filter(Boolean);
  const first: LocaleBase | undefined = segs[0] as LocaleBase | undefined;

  if (!first || !SUPPORTED_BASES.has(first)) {
    const lang = negotiateFromRequest(req);
    const url = req.nextUrl.clone();
    url.pathname = `/${lang}${path === '/' ? '' : path}`;
    url.search = search;
    const res = NextResponse.redirect(url);
    setLangCookieOnResponse(res, lang);
    return res;
  }

  const res = NextResponse.next();
  const cookieLang = req.cookies.get('NEXT_LOCALE')?.value ?? null;
  if (cookieLang !== first) {
    setLangCookieOnResponse(res, normalizeBase(first));
  }

  const hasSubpath = segs.length > 1;
  if (hasSubpath && !KNOWN_SUBPATHS.has(segs[1])) {
    const home = req.nextUrl.clone();
    home.pathname = `/${first}`;
    home.search = '';
    return NextResponse.redirect(home);
  }

  return res;
}

export const config = {
  matcher: ['/:path*'],
};
