'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { resolvePrimaryCta } from '@/app/components/ui/made';
import { getPageHref } from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';
import { OptimizedImage, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { useParallaxMouse } from '@/hooks/useParallaxMouse';
import { AnimatedHeading, EASE, ENTRANCE } from '@/components/AnimatedTitle';
import { EditorialBackdrop, SECTION, SectionTopAccent } from '@/components/EditorialSection';
import { themeSurface } from '@/lib/theme';
import { useEditorialTheme } from '@/hooks/useEditorialTheme';

interface AboutSectionProps {
  aboutSection?: Page['aboutSection'];
  page?: Page | null;
  className?: string;
}

function resolveAboutCta(
  page: Page | null | undefined,
  site: ReturnType<typeof useWebBuilder>['site'],
  pages: Page[] | undefined
): { href: string; label: string } {
  const primary = resolvePrimaryCta(page, site, pages);
  if (primary) return primary;

  const aboutPage = pages?.find((p) => p.pageType === 'about');
  if (aboutPage?.name?.trim()) {
    return { label: 'Show More', href: getPageHref(aboutPage) };
  }

  const contactPage = pages?.find((p) => p.pageType === 'contact');
  if (contactPage) {
    return { label: 'Show More', href: getPageHref(contactPage) };
  }

  return { href: '#contact', label: 'Show More' };
}

export function AboutSection({ aboutSection, page, className }: AboutSectionProps) {
  const { site, pages } = useWebBuilder();
  const theme = useEditorialTheme();
  const primaryColor = theme.primary;

  const resolvedTitle = useMemo(
    () =>
      tiptapToText(aboutSection?.title) ||
      'Through Our Work, Beyond Your Expectations',
    [aboutSection?.title]
  );

  const resolvedDescription = useMemo(
    () =>
      tiptapToText(aboutSection?.description) ||
      'Specializing in land clearing and site preparation that captures the full scope of your project, delivers precision results, and creates lasting value for every acre we touch.',
    [aboutSection?.description]
  );

  const features = useMemo(
    () =>
      (aboutSection?.features ?? [])
        .map((feature) => ({
          label: feature.label?.trim() || '',
          description: tiptapToText(feature.description),
        }))
        .filter((feature) => feature.label || feature.description)
        .slice(0, 3),
    [aboutSection?.features]
  );

  const resolvedCta = useMemo(
    () => resolveAboutCta(page, site, pages),
    [page, site, pages]
  );

  const src = useMemo(() => {
    const url = aboutSection?.image?.url;
    return url ? getImageSrc(url) : '';
  }, [aboutSection?.image?.url]);

  const imageAlt = aboutSection?.image?.altText?.trim() || resolvedTitle || 'About';

  const sectionRef = useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const { ref: triggerRef, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.15 });
  const loaded = isVisible || reducedMotion;
  const mouse = useParallaxMouse(sectionRef, !reducedMotion);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onMq = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onMq);
    return () => mq.removeEventListener('change', onMq);
  }, []);

  const anim = !reducedMotion;
  const imageTransform = anim
    ? loaded
      ? `translate3d(${mouse.x * 8}px, ${mouse.y * 8}px, 0) scale(1.02)`
      : 'translateY(24px) scale(0.98)'
    : undefined;

  const borderTint = themeSurface(primaryColor, 0.2);

  const hasContent =
    Boolean(tiptapToText(aboutSection?.title)) ||
    Boolean(tiptapToText(aboutSection?.description)) ||
    Boolean(aboutSection?.image?.url) ||
    (aboutSection?.features?.length ?? 0) > 0;

  if (!aboutSection || aboutSection.enabled === false || !hasContent) return null;

  return (
    <section ref={sectionRef} id="about" className={cn(SECTION.wrap, className)}>
      <EditorialBackdrop primaryColor={primaryColor} />
      <SectionTopAccent primaryColor={primaryColor} />

      <div ref={triggerRef} className={SECTION.container}>
        <div className={SECTION.header}>
          <div className="min-w-0 lg:col-span-12">
            <p
              className={SECTION.label}
              style={{
                fontFamily: 'var(--wb-body-font, sans-serif)',
                color: primaryColor,
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.6s ${EASE}, transform 0.6s ${EASE}`,
              }}
            >
              <span className={SECTION.labelBar} style={{ backgroundColor: primaryColor }} />
              About Us
            </p>
            <AnimatedHeading
              title={resolvedTitle}
              loaded={loaded}
              baseDelay={0.2}
              lightSweep
            />
          </div>
        </div>

        <div className={`${SECTION.content} grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch lg:gap-10`}>
          <div className="min-w-0 lg:col-span-6">
            {resolvedDescription && (
              <p
                className={`max-w-lg ${SECTION.body}`}
                style={{
                  fontFamily: 'var(--wb-body-font, sans-serif)',
                  opacity: loaded ? 1 : 0,
                  transform: loaded ? 'translateY(0)' : 'translateY(24px)',
                  transition: `opacity 0.8s ${EASE}, transform 0.8s ${EASE}`,
                  transitionDelay: '0.6s',
                }}
              >
                {resolvedDescription}
              </p>
            )}

            {features.length > 0 && (
              <ul
                className="mt-8 divide-y border-t"
                style={{ borderColor: borderTint }}
              >
                {features.map((feature, i) => (
                  <li
                    key={`${feature.label}-${i}`}
                    className="flex gap-4 py-4"
                    style={{
                      opacity: loaded ? 1 : 0,
                      transform: loaded ? 'translateX(0)' : 'translateX(-16px)',
                      transition: `opacity 0.7s ${EASE}, transform 0.7s ${EASE}`,
                      transitionDelay: `${0.75 + i * 0.1}s`,
                    }}
                  >
                    <span
                      className="shrink-0 text-sm tabular-nums"
                      style={{
                        fontFamily: 'var(--wb-body-font, sans-serif)',
                        color: primaryColor,
                        opacity: 0.6,
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      {feature.label && (
                        <p
                          className="text-sm font-medium text-[var(--wb-text-main)]"
                          style={{ fontFamily: 'var(--wb-heading-font, Georgia, serif)' }}
                        >
                          {feature.label}
                        </p>
                      )}
                      {feature.description && (
                        <p
                          className="mt-1 text-sm leading-relaxed text-[var(--wb-text-secondary)]"
                          style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
                        >
                          {feature.description}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <Link
              href={resolvedCta.href}
              className="group mt-8 inline-flex items-center gap-3 bg-[var(--wb-card-bg-light)] px-6 py-3 text-sm font-medium tracking-wide text-[var(--wb-text-main)] shadow-[0_8px_24px_color-mix(in_srgb,var(--wb-text-main)_10%,transparent)] transition-shadow duration-300 hover:shadow-[0_12px_32px_color-mix(in_srgb,var(--wb-primary)_22%,transparent)] lg:mt-10"
              style={{
                fontFamily: 'var(--wb-body-font, sans-serif)',
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(16px)',
                transition: `opacity 0.6s ${EASE}, transform 0.6s ${EASE}, box-shadow 0.3s ease`,
                transitionDelay: `${0.9 + features.length * 0.1}s`,
              }}
            >
              {resolvedCta.label}
              <span
                className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          </div>

          <div
            className="relative min-w-0 lg:col-span-6 lg:h-full"
            style={{
              opacity: loaded ? 1 : 0,
              clipPath: loaded ? 'inset(0 0 0 0)' : 'inset(0 0 0 100%)',
              transition: `opacity 0.9s ${EASE}, clip-path ${ENTRANCE} ${EASE}`,
              transitionDelay: '0.45s',
            }}
          >
            <div
              className="h-full will-change-transform"
              style={{
                transform: imageTransform,
                transition: loaded
                  ? 'transform 0.15s ease-out'
                  : `transform ${ENTRANCE} ${EASE}`,
              }}
            >
              <div
                className="group relative aspect-[4/3] w-full overflow-hidden border sm:aspect-[16/10] lg:h-full"
                style={{
                  borderColor: borderTint,
                  backgroundColor: themeSurface(primaryColor, 0.04),
                }}
              >
                <div
                  className="absolute top-0 left-0 z-10 h-[2px] w-0 transition-all duration-700 group-hover:w-full"
                  style={{ backgroundColor: primaryColor }}
                />
                {src ? (
                  <OptimizedImage
                    src={src}
                    alt={imageAlt}
                    fill
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                    sizes={IMAGE_SIZES.sectionHalf}
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{ backgroundColor: themeSurface(theme.mainText, 0.06) }}
                  >
                    <span
                      className="text-xs uppercase tracking-[0.3em] text-[var(--wb-text-secondary)]"
                      style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
                    >
                      About
                    </span>
                  </div>
                )}
                <span
                  className="pointer-events-none absolute bottom-4 right-5 select-none text-5xl font-normal leading-none md:text-6xl"
                  style={{
                    fontFamily: 'var(--wb-heading-font, Georgia, serif)',
                    color: themeSurface(primaryColor, 0.12),
                  }}
                  aria-hidden="true"
                >
                  02
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
