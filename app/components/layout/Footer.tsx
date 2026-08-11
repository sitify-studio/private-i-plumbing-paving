'use client';

import Link from 'next/link';
import { OptimizedImage, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { useMemo } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { resolvePrimaryCta } from '@/app/components/ui/made';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import {
  getBrandName,
  getBusinessTagline,
  getCopyrightText,
  getFooterDescriptionContent,
  getFooterNavLinks,
  getPageHref,
} from '@/app/lib/siteContent';
import { resolveServiceSlug } from '@/app/lib/serviceAreaSlugs';
import { tiptapToText } from '@/app/lib/seo';
import { getImageSrc } from '@/app/lib/utils';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { AnimatedHeading, EASE } from '@/components/AnimatedTitle';
import { EditorialBackdrop, SECTION, SectionTopAccent } from '@/components/EditorialSection';
import { themeSurface } from '@/lib/theme';
import { useEditorialTheme } from '@/hooks/useEditorialTheme';

function normalizeHref(href: string): string {
  const t = href.trim();
  if (t.startsWith('http') || t.startsWith('mailto:') || t.startsWith('tel:')) return t;
  return t.startsWith('/') ? t : `/${t}`;
}

const DEFAULT_COMPANY_LINKS = [
  { href: '/about-us', text: 'About Us' },
  { href: '/services', text: 'Services' },
  { href: '/contact-us', text: 'Contact' },
];

const LEGAL_FOOTER_LINKS = [
  { href: '/terms-of-service', text: 'Terms of Service', kind: 'terms' as const },
  { href: '/privacy-policy', text: 'Privacy Policy', kind: 'privacy' as const },
];

function isGalleryFooterLink(href: string, text?: string): boolean {
  const h = href.trim().toLowerCase();
  const label = (text || '').trim().toLowerCase();
  return (
    h === '/gallery' ||
    h === '#gallery' ||
    h.endsWith('/gallery') ||
    label === 'gallery'
  );
}

function hasLegalLink(
  links: { href: string; text: string }[],
  kind: 'terms' | 'privacy'
): boolean {
  return links.some((link) => {
    const href = link.href.trim().toLowerCase().replace(/\/+$/, '');
    const label = link.text.trim().toLowerCase();
    if (kind === 'terms') {
      return (
        href === '/terms-of-service' ||
        href === '/terms' ||
        href.endsWith('/terms-of-service') ||
        label.includes('terms of service') ||
        label === 'terms'
      );
    }
    return (
      href === '/privacy-policy' ||
      href === '/privacy' ||
      href.endsWith('/privacy-policy') ||
      label.includes('privacy policy') ||
      label === 'privacy'
    );
  });
}

function withLegalLinks(
  links: { href: string; text: string }[],
  hasTerms: boolean,
  hasPrivacy: boolean
): { href: string; text: string }[] {
  const next = [...links];
  for (const legal of LEGAL_FOOTER_LINKS) {
    const enabled = legal.kind === 'terms' ? hasTerms : hasPrivacy;
    if (!enabled) continue;
    if (hasLegalLink(next, legal.kind)) continue;
    next.push({ href: legal.href, text: legal.text });
  }
  return next;
}

export function Footer() {
  const { site, pages, services } = useWebBuilder();

  const businessName = getBrandName(site) || 'Ace Grading LLC';

  const theme = useEditorialTheme();
  const primaryColor = theme.primary;
  const borderTint = themeSurface(primaryColor, 0.22);

  const logoImage = useMemo(() => {
    const url = site?.theme?.logoUrl || site?.footer?.logo?.url;
    return url ? getImageSrc(url) : '';
  }, [site?.theme?.logoUrl, site?.footer?.logo?.url]);

  const logoAlt = site?.footer?.logo?.altText?.trim() || `${businessName} logo`;

  const resolvedFooterDescription = useMemo(() => {
    const fromFooter = tiptapToText(getFooterDescriptionContent(site));
    if (fromFooter) return fromFooter;
    const aboutPage = pages.find((p) => p.pageType === 'about');
    const fromAbout = tiptapToText(aboutPage?.aboutSection?.description);
    if (fromAbout) return fromAbout;
    return 'Transforming properties through professional land clearing, forestry mulching, grading, and site preparation services.';
  }, [site, pages]);

  const companyLinks = useMemo(() => {
    const columns = site?.footer?.columns ?? [];
    const companyColumn =
      columns.find((col) => /company|explore|page/i.test(col.title || '')) ||
      columns[0];

    let links: { href: string; text: string }[] = [];

    if (companyColumn?.links?.length) {
      links = companyColumn.links
        .map((link) => ({
          href: normalizeHref(link.url),
          text: link.label,
        }))
        .filter((link) => !isGalleryFooterLink(link.href, link.text));
    } else {
      const navLinks = getFooterNavLinks(pages);
      if (navLinks.length) {
        links = navLinks
          .map((link) => ({ href: link.href, text: link.label }))
          .filter((link) => !isGalleryFooterLink(link.href, link.text));
      } else {
        links = [...DEFAULT_COMPANY_LINKS];
      }
    }

    // Always expose legal pages once — skip if CMS already added them
    return withLegalLinks(links, true, true);
  }, [site?.footer?.columns, pages]);

  const footerServices = useMemo(() => {
    const columns = site?.footer?.columns ?? [];
    const servicesColumn = columns.find((col) => /service/i.test(col.title || ''));

    if (servicesColumn?.links?.length) {
      return servicesColumn.links.slice(0, 5).map((link) => ({
        name: link.label,
        href: normalizeHref(link.url),
      }));
    }

    return services
      .filter((service) => service.status === 'published')
      .slice(0, 5)
      .map((service) => ({
        name: service.name,
        href: `/service/${resolveServiceSlug(service)}`,
      }));
  }, [site?.footer?.columns, services]);

  const contactHref = useMemo(() => {
    const homePage = pages.find((p) => p.pageType === 'home');
    const primary = resolvePrimaryCta(homePage ?? null, site, pages);
    if (primary?.href) return primary.href;
    const contactPage = pages.find((p) => p.pageType === 'contact');
    return contactPage ? getPageHref(contactPage) : '/contact-us';
  }, [pages, site]);

  const copyrightContent = site?.footer?.copyright;
  const copyrightPlain = useMemo(() => getCopyrightText(site), [site]);

  const copyrightLine = useMemo(() => {
    if (copyrightPlain && !/^©\d{4}$/.test(copyrightPlain.trim())) {
      return { useCmsCopyright: true, text: copyrightPlain, showBuilderLink: false };
    }
    const year = new Date().getFullYear();
    const compactName = businessName.replace(/\s+/g, '');
    return {
      useCmsCopyright: false,
      text: `${year} ©${compactName}. All Rights Reserved. Build by`,
      showBuilderLink: true,
    };
  }, [copyrightPlain, businessName]);

  const footerTagline =
    getBusinessTagline(site) || 'Land clearing · Grading · Site preparation';

  const business = site?.business;
  const address = business?.address;

  const { ref: footerRef, isVisible: loaded } = useScrollAnimation<HTMLElement>({
    threshold: 0.08,
  });

  const fadeUp = (delay = '0s') => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.7s ${EASE}, transform 0.7s ${EASE}`,
    transitionDelay: delay,
  });

  return (
    <footer
      ref={footerRef}
      id="contact"
      className={`${SECTION.wrap} border-t`}
      style={{ borderColor: borderTint }}
    >
      <EditorialBackdrop primaryColor={primaryColor} />
      <SectionTopAccent primaryColor={primaryColor} />

      <div className={`${SECTION.container} relative`}>
        <div className={SECTION.header}>
          <div className="min-w-0 lg:col-span-8">
            <p
              className={SECTION.label}
              style={{
                fontFamily: 'var(--wb-body-font, sans-serif)',
                color: primaryColor,
                ...fadeUp(),
              }}
            >
              <span
                className={SECTION.labelBar}
                style={{ backgroundColor: primaryColor }}
              />
              Get In Touch
            </p>
            <AnimatedHeading
              title={businessName}
              loaded={loaded}
              baseDelay={0.2}
              lightSweep
            />
          </div>
          {logoImage ? (
            <div className="hidden items-end justify-end lg:col-span-4 lg:flex">
              <OptimizedImage
                src={logoImage}
                alt={logoAlt}
                width={280}
                height={100}
                sizes={IMAGE_SIZES.logo}
                className="h-24 w-auto object-contain md:h-28"
                style={fadeUp('0.3s')}
              />
            </div>
          ) : null}
        </div>

        <div className={`${SECTION.content} grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10`}>
          <div className="min-w-0 lg:col-span-4" style={fadeUp('0.2s')}>
            {logoImage ? (
              <OptimizedImage
                src={logoImage}
                alt={logoAlt}
                width={240}
                height={86}
                sizes={IMAGE_SIZES.logo}
                className="h-20 w-auto object-contain lg:hidden"
              />
            ) : null}
            <p
              className={`mt-4 max-w-sm leading-relaxed lg:mt-0 ${SECTION.body}`}
              style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
            >
              {resolvedFooterDescription}
            </p>
            <Link
              href={contactHref}
              className="mt-6 inline-block rounded-full border px-7 py-2.5 text-xs font-medium uppercase tracking-[0.15em] transition-all duration-300 hover:text-[var(--wb-text-on-dark)]"
              style={{
                fontFamily: 'var(--wb-body-font, sans-serif)',
                borderColor: primaryColor,
                color: primaryColor,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = primaryColor;
                e.currentTarget.style.color = 'var(--wb-text-on-dark)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = primaryColor;
              }}
            >
              Request a Quote
            </Link>
          </div>

          <div
            className="grid min-w-0 grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-5"
            style={fadeUp('0.35s')}
          >
            <div>
              <p
                className="mb-3 text-xs uppercase tracking-[0.2em]"
                style={{
                  fontFamily: 'var(--wb-body-font, sans-serif)',
                  color: primaryColor,
                }}
              >
                Company
              </p>
              <nav className="divide-y border-y" style={{ borderColor: borderTint }}>
                {companyLinks.map((link) => (
                  <Link
                    key={`${link.href}-${link.text}`}
                    href={link.href}
                    className="group flex items-center gap-3 py-3 text-sm text-[var(--wb-text-secondary)] transition-colors hover:text-[var(--wb-text-main)]"
                    style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
                  >
                    <span
                      className="h-px w-3 shrink-0 transition-all duration-300 group-hover:w-5"
                      style={{ backgroundColor: primaryColor }}
                    />
                    {link.text}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <p
                className="mb-3 text-xs uppercase tracking-[0.2em]"
                style={{
                  fontFamily: 'var(--wb-body-font, sans-serif)',
                  color: primaryColor,
                }}
              >
                Services
              </p>
              <nav className="divide-y border-y" style={{ borderColor: borderTint }}>
                {footerServices.map((service, idx) => (
                  <Link
                    key={`${service.name}-${idx}`}
                    href={service.href}
                    className="group flex items-center gap-3 py-3 text-sm text-[var(--wb-text-secondary)] transition-colors hover:text-[var(--wb-text-main)]"
                    style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
                  >
                    <span
                      className="text-xs tabular-nums transition-opacity group-hover:opacity-100"
                      style={{
                        fontFamily: 'var(--wb-body-font, sans-serif)',
                        color: primaryColor,
                        opacity: 0.5,
                      }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    {service.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          <aside
            className="min-w-0 border bg-[color-mix(in_srgb,var(--wb-card-bg-light)_70%,transparent)] p-6 md:p-7 lg:col-span-3"
            style={{ borderColor: borderTint, ...fadeUp('0.5s') }}
          >
            <p
              className="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--wb-text-secondary)]"
              style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
            >
              Contact
            </p>
            <h3
              className="text-lg text-[var(--wb-text-main)]"
              style={{ fontFamily: 'var(--wb-heading-font, Georgia, serif)' }}
            >
              {businessName}
            </h3>

            <div
              className="mt-5 min-w-0 space-y-3 text-sm break-words"
              style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
            >
              {address?.street && (
                <p className={SECTION.body}>
                  {address.street}
                  <br />
                  {[address.city, address.state].filter(Boolean).join(', ')}
                  {address.zipCode ? ` ${address.zipCode}` : ''}
                </p>
              )}
              {business?.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="block text-[var(--wb-text-main)] transition-opacity hover:opacity-70"
                >
                  {business.phone}
                </a>
              )}
              {business?.email && (
                <a
                  href={`mailto:${business.email}`}
                  className="block max-w-full break-all text-[0.8125rem] leading-snug normal-case text-[var(--wb-text-main)] transition-opacity hover:opacity-70"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  {business.email}
                </a>
              )}
            </div>

            {business?.phone && (
              <Link
                href={`tel:${business.phone}`}
                className="mt-6 inline-block text-xs uppercase tracking-[0.15em] text-[var(--wb-text-main)] transition-opacity hover:opacity-70"
                style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
              >
                Call Us →
              </Link>
            )}
          </aside>
        </div>

        <div
          className="mt-8 flex flex-col items-start justify-between gap-3 border-t pt-5 sm:flex-row sm:items-center md:mt-10"
          style={{ borderColor: borderTint, ...fadeUp('0.6s') }}
        >
          <p
            className="min-w-0 max-w-full text-xs leading-relaxed text-[var(--wb-text-secondary)] break-words [&_a]:text-[var(--wb-primary)] [&_a]:transition-opacity [&_a]:hover:opacity-70"
            style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
          >
            {copyrightLine.useCmsCopyright && copyrightContent ? (
              <TiptapRenderer content={copyrightContent} as="inline" className="text-inherit" />
            ) : (
              <>
                {copyrightLine.text}
                {copyrightLine.showBuilderLink ? (
                  <>
                    {' '}
                    <a
                      href="https://usbrandbooster.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-opacity hover:opacity-70"
                      style={{ color: primaryColor }}
                    >
                      US Brand Booster
                    </a>
                  </>
                ) : null}
              </>
            )}
          </p>
          <p
            className="text-xs text-[var(--wb-text-secondary)]"
            style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
          >
            {footerTagline}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
