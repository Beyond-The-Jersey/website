import Link from 'next/link';
import type { ReactNode } from 'react';
import { repoHref } from '@/lib/config';
import type { SearchEntry } from '@/lib/search';
import { BrandMark, CodeIcon } from './LogoMark';
import { SearchBox } from './search/SearchBox';
import s from './SiteChrome.module.css';

type HeaderProps =
  | { variant: 'landing' }
  | { variant: 'overview'; searchIndex: SearchEntry[] }
  | { variant: 'team'; crumbs: { label: string; href: string | null }[]; current: string };

const Wordmark = () => (
  <Link href="/" className={s.brand}>
    <BrandMark size={34} />
    <span className={s.wordmark}>Behind the Jersey</span>
  </Link>
);

export function SiteHeader(props: HeaderProps) {
  let middle: ReactNode = null;
  let nav: ReactNode;
  if (props.variant === 'landing') {
    nav = (
      <>
        <Link href="/soccer/premier-league/" className={s.link}>
          Sports
        </Link>
        <Link href="/#how" className={s.link}>
          How we rate
        </Link>
        <Link href="/#contribute" className={s.link}>
          Contribute
        </Link>
        <a href={repoHref()} className={s.pill}>
          <CodeIcon />
          Open data on GitHub
        </a>
      </>
    );
  } else if (props.variant === 'overview') {
    middle = (
      <div className={s.search}>
        <SearchBox index={props.searchIndex} variant="compact" placeholder="Search a club, league, sport or sponsor" />
      </div>
    );
    nav = (
      <>
        <Link href="/#how" className={s.link}>
          How we rate
        </Link>
        <a href={repoHref()} className={s.link}>
          Sources
        </a>
        <Link href="/#contribute" className={s.link}>
          Contribute
        </Link>
      </>
    );
  } else {
    middle = (
      <nav aria-label="Breadcrumb" className={s.crumbs}>
        <ol>
          <li>
            <Link href="/soccer/premier-league/" className={s.crumbLink}>
              All clubs
            </Link>
          </li>
          {props.crumbs.map((c) => (
            <li key={c.label}>
              <span aria-hidden="true">/</span>
              {c.href ? (
                <Link href={c.href} className={s.crumbLink}>
                  {c.label}
                </Link>
              ) : (
                c.label
              )}
            </li>
          ))}
          <li>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className={s.crumbCurrent}>
              {props.current}
            </span>
          </li>
        </ol>
      </nav>
    );
    nav = (
      <>
        <Link href="/#how" className={s.link}>
          How we rate
        </Link>
        <a href={repoHref()} className={s.link}>
          Sources
        </a>
      </>
    );
  }
  return (
    <header className={s.header}>
      <div className={`${s.inner} ${props.variant === 'landing' ? '' : s.withMiddle}`}>
        <Wordmark />
        {middle}
        <nav aria-label="Main" className={s.nav}>
          {nav}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter({ variant }: { variant: 'landing' | 'standard' }) {
  return (
    <footer className={s.footer}>
      <div className={`${s.footerInner} ${variant === 'landing' ? s.footerLanding : ''}`}>
        {variant === 'landing' ? (
          <>
            <span className={s.chest}>Your chest. Their ad.</span>
            <span className={s.footerLines}>
              <span>
                Deal values are reported estimates per year (SportsPro, The Athletic). Ratings are illustrative until
                the method is final.
              </span>
              <span>Club crests: football-data.org.</span>
            </span>
          </>
        ) : (
          <>
            <span>
              Shirt photos: footballkitarchive.com. Club crests: football-data.org. Both need permission before going
              public.
            </span>
            <span>Ratings shown are illustrative until the method is final.</span>
          </>
        )}
      </div>
    </footer>
  );
}

/** The 1328px content column with the page gutters. */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`${s.container} ${className ?? ''}`}>{children}</div>;
}
