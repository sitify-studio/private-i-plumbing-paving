'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { Page, Service } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { tiptapToText, tiptapToLines } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';
import { OptimizedImage } from '@/app/components/ui/OptimizedImage';
import { resolveServiceSlug } from '@/app/lib/serviceAreaSlugs';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { EASE, splitTitleLines } from '@/components/AnimatedTitle';
import { EditorialBackdrop, SECTION, SectionTopAccent } from '@/components/EditorialSection';
import {
  getHighResImageUrl,
  SERVICE_IMAGE_QUALITY,
  SERVICE_IMAGE_SIZES,
  SERVICE_IMAGE_WIDTH,
} from '@/lib/images';
import { themeSurface } from '@/lib/theme';
import { useEditorialTheme } from '@/hooks/useEditorialTheme';

interface ServicesSectionProps {
  servicesSection?: Page['servicesSection'];
  companyDetailSection?: Page['companyDetailSection'];
  ctaSection?: Page['ctaSection'];
  page?: Page | null;
  className?: string;
}

type DisplayService = {
  id: string;
  name: string;
  description: string;
  features: string[];
  imageUrl: string;
  imageAlt: string;
  ctaHref: string;
  ctaLabel: string;
};

function HeadlineLine({
  text,
  delay,
  loaded,
}: {
  text: string;
  delay: number;
  loaded: boolean;
}) {
  return (
    <span
      className="block overflow-hidden"
      style={{
        clipPath: loaded ? 'inset(0 0 0 0)' : 'inset(100% 0 0 0)',
        transition: `clip-path 0.8s ${EASE}`,
        transitionDelay: `${delay}ms`,
      }}
    >
      <span
        className="block will-change-transform"
        style={{
          fontFamily: 'var(--wb-heading-font, Georgia, serif)',
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'translateY(0)' : 'translateY(12px)',
          transition: `opacity 0.8s ${EASE}, transform 0.8s ${EASE}`,
          transitionDelay: `${delay}ms`,
        }}
      >
        {text}
      </span>
    </span>
  );
}

function resolveFeatureLabels(service: Service): string[] {
  const tags = Array.isArray(service.tags) ? service.tags : [];
  if (tags.length) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  const features = Array.isArray(service.features) ? service.features : [];
  return features
    .map((feature) => {
      if (typeof feature === 'string') return feature.trim();
      return tiptapToText(feature);
    })
    .filter(Boolean);
}

function mapServiceToDisplay(service: Service): DisplayService {
  const gallery = Array.isArray(service.galleryImages) ? service.galleryImages : [];
  const imageUrl = service.thumbnailImage?.url
    ? getImageSrc(service.thumbnailImage.url)
    : gallery[0]?.url
      ? getImageSrc(gallery[0].url)
      : '';

  return {
    id: service._id,
    name: service.name,
    description:
      tiptapToText(service.shortDescription) || tiptapToText(service.description) || '',
    features: resolveFeatureLabels(service),
    imageUrl,
    imageAlt:
      service.thumbnailImage?.altText ||
      gallery[0]?.altText ||
      service.name,
    ctaHref: `/service/${resolveServiceSlug(service)}`,
    ctaLabel: 'Discuss Project',
  };
}

export function ServicesSection({
  servicesSection,
  className,
}: ServicesSectionProps) {
  const { services: allServices } = useWebBuilder();

  const theme = useEditorialTheme();
  const primaryColor = theme.primary;
  const secondaryColor = theme.secondaryText;

  const services = useMemo(() => {
    const ids = servicesSection?.serviceIds ?? [];
    const selected =
      ids.length > 0
        ? ids
            .map((id) => allServices.find((s) => s._id === id))
            .filter((s): s is Service => Boolean(s))
        : allServices.filter((s) => s.status === 'published');

    return selected.map(mapServiceToDisplay);
  }, [servicesSection?.serviceIds, allServices]);

  const sectionLabel = 'Our Services';
  const titleText = useMemo(
    () =>
      tiptapToText(servicesSection?.title) ||
      'Creating Digital Experiences That Drive Results',
    [servicesSection?.title]
  );

  const headlineLines = useMemo(() => {
    const fromBuilder = tiptapToLines(servicesSection?.title, 3);
    if (fromBuilder.length > 1) return fromBuilder;
    return splitTitleLines(titleText);
  }, [servicesSection?.title, titleText]);

  const enableHoverPreview = true;
  const enableStagger = true;

  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cursorPreview, setCursorPreview] = useState<{
    x: number;
    y: number;
    visible: boolean;
  }>({
    x: 0,
    y: 0,
    visible: false,
  });
  const [reducedMotion, setReducedMotion] = useState(false);

  const { ref: triggerRef, isVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.12,
  });
  const loaded = isVisible || reducedMotion;
  const anim = !reducedMotion;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onMq = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onMq);
    return () => mq.removeEventListener('change', onMq);
  }, []);

  useEffect(() => {
    if (activeIndex >= services.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, services.length]);

  const getServiceImage = useCallback(
    (index: number) => services[index]?.imageUrl || '',
    [services]
  );

  const handleServiceMouseMove = (e: React.MouseEvent, index: number) => {
    if (!enableHoverPreview || reducedMotion) return;
    setCursorPreview({ x: e.clientX, y: e.clientY, visible: true });
    setActiveIndex(index);
  };

  const activeSurface = themeSurface(primaryColor, 0.1);
  const activeService = services[activeIndex];
  const activeAlt = activeService?.imageAlt || `${activeService?.name || 'Service'} preview`;
  const activeSrc = activeService?.imageUrl
    ? getHighResImageUrl(activeService.imageUrl, SERVICE_IMAGE_WIDTH)
    : null;

  if (!servicesSection || servicesSection.enabled === false) return null;
  if (!services.length) return null;

  return (
    <section ref={sectionRef} id="services" className={cn(SECTION.wrap, className)}>
      <EditorialBackdrop primaryColor={primaryColor} />
      <SectionTopAccent primaryColor={primaryColor} />
      <div
        className={`pointer-events-none absolute inset-0 opacity-40 ${anim ? 'services-bg-shift' : ''}`}
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, ${themeSurface(primaryColor, 0.08)} 0%, transparent 50%),
                            radial-gradient(circle at 80% 70%, ${theme.mainTint(0.04)} 0%, transparent 45%)`,
          backgroundSize: '120% 120%',
        }}
      />

      <div ref={triggerRef} className={SECTION.container}>
        <div className={SECTION.header}>
          <div className="lg:col-span-8">
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
              <span
                className={SECTION.labelBar}
                style={{ backgroundColor: primaryColor }}
              />
              {sectionLabel}
            </p>

            <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] font-normal leading-[1.12] tracking-tight text-[var(--wb-text-main)]">
              {headlineLines.map((line, i) => (
                <HeadlineLine key={`${line}-${i}`} text={line} delay={150 + i * 150} loaded={loaded} />
              ))}
            </h2>
          </div>

        </div>

        <div
          className={`${SECTION.content} grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 lg:items-stretch`}
        >
          <div className="lg:col-span-6 xl:col-span-5 overflow-x-hidden lg:flex lg:min-h-full lg:flex-col">
            <div
              className="divide-y border-y lg:flex lg:min-h-full lg:flex-1 lg:flex-col"
              style={{ borderColor: themeSurface(primaryColor, 0.22) }}
            >
              {services.map((service, index) => {
                const isActive = activeIndex === index;
                const itemDelay = enableStagger ? 500 + index * 100 : 500;

                return (
                  <article
                    key={service.id}
                    className="relative transition-colors duration-500 lg:flex lg:flex-1 lg:flex-col"
                    style={{
                      backgroundColor: isActive ? activeSurface : 'transparent',
                      borderLeft: isActive
                        ? `2px solid ${primaryColor}`
                        : '2px solid transparent',
                      opacity: loaded ? 1 : 0,
                      transform: loaded ? 'translateX(0)' : 'translateX(-50px)',
                      transition: `opacity 0.7s ${EASE}, transform 0.7s ${EASE}, background-color 0.5s ${EASE}, padding-left 0.4s ${EASE}`,
                      transitionDelay: loaded ? `${itemDelay}ms` : '0ms',
                      paddingLeft: isActive ? 24 : 0,
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseMove={(e) => handleServiceMouseMove(e, index)}
                    onMouseLeave={() =>
                      setCursorPreview((preview) => ({ ...preview, visible: false }))
                    }
                  >
                    <button
                      type="button"
                      className="flex w-full flex-1 cursor-pointer items-start gap-6 py-5 text-left md:gap-8 md:py-6 lg:items-center lg:py-8"
                      onFocus={() => setActiveIndex(index)}
                      aria-expanded={isActive}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      <span
                        className="shrink-0 pt-1 text-sm tabular-nums transition-opacity duration-300"
                        style={{
                          fontFamily: 'var(--wb-body-font, sans-serif)',
                          opacity: isActive ? 1 : 0.4,
                          transform: loaded ? 'translateY(0)' : 'translateY(40px)',
                          transition: `opacity 0.4s ease, transform 0.6s ${EASE}`,
                          transitionDelay: loaded ? `${itemDelay + 50}ms` : '0ms',
                        }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <div className="min-w-0 flex-1">
                        <h3
                          className="text-xl transition-all duration-300 md:text-2xl lg:text-[1.75rem]"
                          style={{
                            fontFamily: 'var(--wb-heading-font, Georgia, serif)',
                            fontWeight: isActive ? 700 : 500,
                            color: 'var(--wb-text-main)',
                          }}
                        >
                          {service.name}
                        </h3>
                      </div>
                    </button>
                  </article>
                );
              })}
            </div>
          </div>

            <div className="relative lg:col-span-6 lg:col-start-7 lg:min-h-full xl:col-span-7 xl:col-start-6">
            <div className="lg:sticky lg:top-28">
              <div
                className="relative aspect-[4/3] w-full max-h-[min(420px,50vh)] overflow-hidden border bg-[var(--wb-page-bg)] shadow-[0_16px_40px_color-mix(in_srgb,var(--wb-text-main)_6%,transparent)]"
                style={{
                  borderColor: themeSurface(primaryColor, 0.15),
                  opacity: loaded ? 1 : 0,
                  transition: `opacity 0.8s ${EASE}`,
                  transitionDelay: loaded ? '400ms' : '0ms',
                }}
              >
                {activeSrc ? (
                  <OptimizedImage
                    key={activeIndex}
                    src={activeSrc}
                    alt={activeAlt}
                    fill
                    className="object-cover"
                    sizes={SERVICE_IMAGE_SIZES}
                    quality={SERVICE_IMAGE_QUALITY}
                    priority={activeIndex === 0}
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${themeSurface(primaryColor, 0.25)} 0%, ${themeSurface(secondaryColor, 0.45)} 100%)`,
                    }}
                  >
                    <span
                      className="text-sm uppercase tracking-[0.3em] text-[color-mix(in_srgb,var(--wb-text-main)_30%,transparent)]"
                      style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
                    >
                      {activeService?.name}
                    </span>
                  </div>
                )}
              </div>

              {activeService && (activeService.description || activeService.ctaHref) && (
                <div
                  key={activeService.id}
                  className="mt-6 md:mt-8"
                  style={{
                    opacity: loaded ? 1 : 0,
                    transform: loaded ? 'translateY(0)' : 'translateY(16px)',
                    transition: `opacity 0.5s ${EASE}, transform 0.5s ${EASE}`,
                  }}
                >
                  {activeService.description && (
                    <p
                      className="max-w-xl text-sm leading-relaxed text-[var(--wb-text-secondary)] md:text-[0.9375rem]"
                      style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
                    >
                      {activeService.description}
                    </p>
                  )}

                  <Link
                    href={activeService.ctaHref}
                    className="mt-6 inline-block rounded-full border px-6 py-2.5 text-xs font-medium uppercase tracking-[0.15em] transition-all duration-300 hover:text-[var(--wb-text-on-dark)]"
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
                    {activeService.ctaLabel}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {enableHoverPreview && anim && cursorPreview.visible && (
        <div
          className="pointer-events-none fixed z-50 hidden h-28 w-28 overflow-hidden rounded-sm shadow-lg md:block"
          style={{
            left: cursorPreview.x + 16,
            top: cursorPreview.y + 16,
            transform: 'translate(-50%, -50%)',
            transition: 'left 0.08s ease-out, top 0.08s ease-out',
          }}
        >
          {(() => {
            const previewUrl = getServiceImage(activeIndex);
            const previewSrc = previewUrl
              ? getHighResImageUrl(previewUrl, 640)
              : null;
            return previewSrc ? (
              <OptimizedImage
                src={previewSrc}
                alt=""
                fill
                className="object-contain object-center"
                sizes="112px"
                quality={SERVICE_IMAGE_QUALITY}
              />
            ) : (
              <div
                className="h-full w-full"
                style={{ backgroundColor: themeSurface(secondaryColor, 0.35) }}
              />
            );
          })()}
        </div>
      )}

      <style jsx global>{`
        @keyframes services-bg-shift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .services-bg-shift {
          animation: services-bg-shift 30s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .services-bg-shift {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}

export default ServicesSection;
