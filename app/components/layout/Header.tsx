'use client';

import Link from 'next/link';
import { OptimizedImage, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import {
  getBrandName,
  getPageHref,
  getTestimonialsNavItem,
} from '@/app/lib/siteContent';
import { buildNavServiceMenu } from '@/app/components/sections/ServingAreasSection';
import { getImageSrc } from '@/app/lib/utils';
import { themeSurface } from '@/lib/theme';
import { useEditorialTheme, WB } from '@/hooks/useEditorialTheme';

interface HeaderProps {
  businessName?: string;
  themeData?: { primaryColor: string; secondaryColor: string };
  phoneNumber?: string;
}

export function Header({ businessName, themeData, phoneNumber }: HeaderProps) {
  const { site, pages, services: allServices, serviceAreaPages } = useWebBuilder();
  const theme = useEditorialTheme();

  const resolvedBusinessName = businessName || getBrandName(site) || 'Business';
  const primaryColor = themeData?.primaryColor || theme.primary;

  const logoSrc = useMemo(() => {
    const url = site?.theme?.logoUrl || site?.footer?.logo?.url;
    return url ? getImageSrc(url) : '';
  }, [site?.theme?.logoUrl, site?.footer?.logo?.url]);

  const resolvedPhone = phoneNumber || site?.business?.phone;
  const logoAlt =
    site?.footer?.logo?.altText?.trim() || `${resolvedBusinessName} logo`;

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileExpandedService, setMobileExpandedService] = useState<string | null>(null);
  const [activeServiceSlug, setActiveServiceSlug] = useState<string | null>(null);

  const closeServicesTimeoutRef = useRef<number | null>(null);
  const servicesMenuRef = useRef<HTMLDivElement>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeServicesTimeoutRef.current) {
      clearTimeout(closeServicesTimeoutRef.current);
      closeServicesTimeoutRef.current = null;
    }
  }, []);

  const openServices = useCallback(() => {
    clearCloseTimer();
    setServicesOpen(true);
  }, [clearCloseTimer]);

  const closeServices = useCallback(() => {
    clearCloseTimer();
    setServicesOpen(false);
  }, [clearCloseTimer]);

  const scheduleCloseServices = useCallback(() => {
    clearCloseTimer();
    closeServicesTimeoutRef.current = window.setTimeout(() => {
      setServicesOpen(false);
      closeServicesTimeoutRef.current = null;
    }, 180);
  }, [clearCloseTimer]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 48);
      setIsVisible(currentScrollY <= lastScrollYRef.current || currentScrollY < 80);
      lastScrollYRef.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  useEffect(() => {
    if (!servicesOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeServices();
    };
    const onPointerDown = (e: MouseEvent) => {
      if (!servicesMenuRef.current?.contains(e.target as Node)) closeServices();
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousedown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousedown', onPointerDown);
    };
  }, [servicesOpen, closeServices]);

  const navItems = useMemo(() => {
    const aboutPage = pages.find((p) => p.pageType === 'about');
    const servicesPage = pages.find((p) => p.pageType === 'service-list');
    const contactPage = pages.find((p) => p.pageType === 'contact');
    const blogPage = pages.find((p) => p.pageType === 'blog-list');
    const testimonialsNav = getTestimonialsNavItem(pages);
    const servicesHref = servicesPage ? getPageHref(servicesPage) : '/services';

    return [
      { href: '/', label: 'Home', isServices: false },
      {
        href: aboutPage ? getPageHref(aboutPage) : '/about-us',
        label: aboutPage?.name?.trim() || 'About',
        isServices: false,
      },
      {
        href: servicesHref,
        label: servicesPage?.name?.trim() || 'Services',
        isServices: true,
      },
      { href: '/gallery', label: 'Gallery', isServices: false },
      {
        href: blogPage ? getPageHref(blogPage) : '/blog',
        label: 'Blog',
        isServices: false,
      },
      {
        href: testimonialsNav.href,
        label: testimonialsNav.name,
        isServices: false,
      },
      {
        href: contactPage ? getPageHref(contactPage) : '/contact-us',
        label: contactPage?.name?.trim() || 'Contact',
        isServices: false,
      },
    ];
  }, [pages]);

  /** Full tree: every visible service + all of its areas (CMS pages + service.serviceAreas). */
  const serviceMenu = useMemo(
    () => buildNavServiceMenu(allServices, serviceAreaPages, site?.serviceAreas),
    [allServices, serviceAreaPages, site?.serviceAreas]
  );

  const activeService = useMemo(() => {
    if (!serviceMenu.length) return null;
    return (
      serviceMenu.find((s) => s.slug === activeServiceSlug) ||
      serviceMenu.find((s) => s.areas.length > 0) ||
      serviceMenu[0]
    );
  }, [serviceMenu, activeServiceSlug]);

  const hasServicesMenu = serviceMenu.length > 0;

  useEffect(() => {
    if (!servicesOpen || !serviceMenu.length) return;
    setActiveServiceSlug((current) => {
      if (current && serviceMenu.some((s) => s.slug === current)) return current;
      return (
        serviceMenu.find((s) => s.areas.length > 0)?.slug || serviceMenu[0]?.slug || null
      );
    });
  }, [servicesOpen, serviceMenu]);

  const onHero = !isScrolled;
  const navBg = onHero
    ? 'bg-[color-mix(in_srgb,var(--wb-page-bg)_88%,transparent)] border-b border-transparent'
    : 'bg-[color-mix(in_srgb,var(--wb-page-bg)_95%,transparent)] backdrop-blur-md border-b';
  const navBorder = themeSurface(primaryColor, 0.14);
  const panelBorder = themeSurface(primaryColor, 0.16);
  const rowHover = 'hover:bg-[color-mix(in_srgb,var(--wb-primary)_7%,transparent)]';
  const rowActive = 'bg-[color-mix(in_srgb,var(--wb-primary)_10%,transparent)]';

  const NavLink = ({
    href,
    label,
  }: {
    href: string;
    label: string;
  }) => (
    <Link
      href={href}
      replace
      className="group relative inline-flex items-center gap-1 text-sm font-medium tracking-wide text-[var(--wb-text-main)] transition-colors hover:text-[var(--wb-primary)]"
      style={{ fontFamily: WB.bodyFont }}
    >
      <span>{label}</span>
      <span
        className="absolute -bottom-1 left-0 h-px w-0 transition-all duration-300 group-hover:w-full"
        style={{ backgroundColor: primaryColor }}
      />
    </Link>
  );

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${navBg} ${
          !isVisible ? '-translate-y-full' : 'translate-y-0'
        }`}
        style={{ borderColor: navBorder, ['--wb-header-height' as string]: '4.5rem' }}
      >
        <div className="mx-auto flex h-[var(--wb-header-height)] max-w-7xl items-center justify-between gap-4 px-6 sm:px-8 lg:px-12">
          <div className="shrink-0">
            <Link
              href="/"
              replace
              className="inline-flex items-center"
              aria-label={resolvedBusinessName}
            >
              {logoSrc ? (
                <OptimizedImage
                  alt={logoAlt}
                  src={logoSrc}
                  width={220}
                  height={80}
                  sizes={IMAGE_SIZES.logo}
                  className="h-12 w-auto object-contain transition-all duration-300 md:h-14"
                  priority
                />
              ) : (
                <span
                  className="text-base font-medium tracking-tight text-[var(--wb-text-main)] md:text-lg"
                  style={{ fontFamily: WB.headingFont }}
                >
                  {resolvedBusinessName}
                </span>
              )}
            </Link>
          </div>

          <div className="hidden flex-1 items-center justify-center gap-8 lg:flex">
            {navItems.map((item) => {
              if (item.isServices) {
                return (
                  <div
                    key={item.label}
                    ref={servicesMenuRef}
                    className="relative"
                    onMouseEnter={openServices}
                    onMouseLeave={scheduleCloseServices}
                  >
                    <div className="group relative inline-flex items-center gap-1">
                      <NavLink href={item.href} label={item.label} />
                      <button
                        type="button"
                        className="inline-flex items-center text-[var(--wb-text-main)] transition-colors hover:text-[var(--wb-primary)]"
                        aria-expanded={servicesOpen}
                        aria-haspopup="true"
                        aria-label="Toggle services menu"
                        onClick={() => (servicesOpen ? closeServices() : openServices())}
                      >
                        <svg
                          className={`h-3 w-3 transition-transform ${servicesOpen ? 'rotate-180' : ''}`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>

                    {servicesOpen && hasServicesMenu && (
                      <div
                        className="absolute left-1/2 top-full z-50 pt-3 -translate-x-1/2"
                        onMouseEnter={openServices}
                      >
                        <div
                          className="flex max-h-[min(70vh,28rem)] overflow-hidden border bg-[var(--wb-page-bg)] shadow-[0_20px_48px_color-mix(in_srgb,var(--wb-text-main)_12%,transparent)]"
                          style={{ borderColor: panelBorder }}
                          role="menu"
                        >
                          {/* All services */}
                          <div
                            className="flex w-72 shrink-0 flex-col border-r"
                            style={{ borderColor: themeSurface(primaryColor, 0.12) }}
                          >
                            <div className="px-4 pb-2 pt-3">
                              <p
                                className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--wb-text-secondary)]"
                                style={{ fontFamily: WB.bodyFont }}
                              >
                                Services
                              </p>
                            </div>
                            <ul className="flex-1 overflow-y-auto pb-2">
                              {serviceMenu.map((svc) => {
                                const isActive = activeService?.slug === svc.slug;
                                return (
                                  <li key={svc.slug}>
                                    <div
                                      className={`flex items-center gap-1 ${isActive ? rowActive : rowHover}`}
                                      onMouseEnter={() => setActiveServiceSlug(svc.slug)}
                                      onFocus={() => setActiveServiceSlug(svc.slug)}
                                    >
                                      <Link
                                        href={svc.href}
                                        replace
                                        role="menuitem"
                                        className={`min-w-0 flex-1 px-4 py-2.5 text-sm transition-colors ${
                                          isActive
                                            ? 'font-medium text-[var(--wb-text-main)]'
                                            : 'text-[var(--wb-text-secondary)] hover:text-[var(--wb-text-main)]'
                                        }`}
                                        style={{ fontFamily: WB.bodyFont }}
                                        onClick={closeServices}
                                      >
                                        <span className="block truncate">{svc.label}</span>
                                      </Link>
                                      {svc.areas.length > 0 && (
                                        <span
                                          className="pr-3 text-[var(--wb-text-secondary)]"
                                          aria-hidden
                                        >
                                          ›
                                        </span>
                                      )}
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                            <div
                              className="border-t px-4 py-2.5"
                              style={{ borderColor: themeSurface(primaryColor, 0.12) }}
                            >
                              <Link
                                href={item.href}
                                replace
                                className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--wb-primary)] transition-opacity hover:opacity-80"
                                style={{ fontFamily: WB.bodyFont }}
                                onClick={closeServices}
                              >
                                View all services →
                              </Link>
                            </div>
                          </div>

                          {/* Areas for the hovered/selected service */}
                          <div className="flex w-64 shrink-0 flex-col sm:w-72">
                            <p
                              className="truncate px-4 pb-2 pt-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--wb-text-secondary)]"
                              style={{ fontFamily: WB.bodyFont }}
                              title={activeService?.label}
                            >
                              {activeService?.label
                                ? `${activeService.label} areas`
                                : 'Serving areas'}
                            </p>
                            <ul className="flex-1 overflow-y-auto pb-2">
                              {activeService && activeService.areas.length > 0 ? (
                                activeService.areas.map((area, index) => (
                                  <li key={`${activeService.slug}-area-${index}-${area.href}`}>
                                    <Link
                                      href={area.href}
                                      replace
                                      role="menuitem"
                                      className={`block px-4 py-2.5 text-sm text-[var(--wb-text-secondary)] transition-colors hover:text-[var(--wb-text-main)] ${rowHover}`}
                                      style={{ fontFamily: WB.bodyFont }}
                                      onClick={closeServices}
                                    >
                                      {area.label}
                                    </Link>
                                  </li>
                                ))
                              ) : (
                                <li className="px-4 py-8 text-sm leading-relaxed text-[var(--wb-text-secondary)]">
                                  {activeService
                                    ? 'No serving areas linked to this service yet.'
                                    : 'Hover a service to see its areas.'}
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              return <NavLink key={item.href} href={item.href} label={item.label} />;
            })}
          </div>

          <div className="hidden items-center lg:flex">
            <Link
              href={resolvedPhone ? `tel:${resolvedPhone}` : '#'}
              className="inline-flex items-center gap-2 bg-[var(--wb-card-bg-light)] px-5 py-2 text-xs font-medium tracking-wide text-[var(--wb-text-main)] shadow-[0_4px_16px_color-mix(in_srgb,var(--wb-text-main)_10%,transparent)] transition-shadow duration-300 hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--wb-primary)_22%,transparent)]"
              style={{ fontFamily: WB.bodyFont }}
            >
              Call Us
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="border p-2 text-[var(--wb-text-main)] transition-colors hover:text-[var(--wb-primary)]"
              style={{ borderColor: themeSurface(primaryColor, 0.35) }}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? (
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <div className="flex h-4 w-6 flex-col justify-between">
                  <span className="block h-px w-full bg-current" />
                  <span className="block h-px w-full bg-current" />
                  <span className="block h-px w-3/4 self-end bg-current" />
                </div>
              )}
            </button>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-[var(--wb-page-bg)]">
          <div
            className="flex items-center justify-between border-b px-6 py-4"
            style={{ borderColor: themeSurface(primaryColor, 0.12) }}
          >
            <Link href="/" replace onClick={() => setIsOpen(false)}>
              {logoSrc ? (
                <OptimizedImage
                  alt={logoAlt}
                  src={logoSrc}
                  width={200}
                  height={82}
                  sizes={IMAGE_SIZES.logo}
                  className="h-16 w-auto object-contain"
                />
              ) : (
                <span
                  className="text-lg font-medium text-[var(--wb-text-main)]"
                  style={{ fontFamily: WB.headingFont }}
                >
                  {resolvedBusinessName}
                </span>
              )}
            </Link>
            <button
              aria-label="Close menu"
              onClick={() => setIsOpen(false)}
              className="p-2 text-[var(--wb-text-main)] transition-colors hover:text-[var(--wb-primary)]"
            >
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto px-6 py-8">
            <nav
              className="flex flex-col divide-y"
              style={{ borderColor: themeSurface(primaryColor, 0.12) }}
            >
              {navItems.map((item) => {
                if (item.isServices) {
                  return (
                    <div key={item.label} className="py-4">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between text-left text-lg text-[var(--wb-text-main)] transition-colors hover:text-[var(--wb-primary)]"
                        style={{ fontFamily: WB.headingFont }}
                        onClick={() => setMobileServicesOpen((v) => !v)}
                        aria-expanded={mobileServicesOpen}
                      >
                        {item.label}
                        <span className="text-sm" style={{ color: primaryColor }}>
                          {mobileServicesOpen ? '−' : '+'}
                        </span>
                      </button>

                      {mobileServicesOpen && hasServicesMenu && (
                        <div
                          className="mt-3 space-y-1 border-l pl-3"
                          style={{ borderColor: themeSurface(primaryColor, 0.16) }}
                        >
                          {serviceMenu.map((svc) => {
                            const expanded = mobileExpandedService === svc.slug;
                            return (
                              <div key={svc.slug} className="py-1">
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={svc.href}
                                    replace
                                    onClick={() => setIsOpen(false)}
                                    className="min-w-0 flex-1 py-2 text-sm text-[var(--wb-text-secondary)] transition-colors hover:text-[var(--wb-primary)]"
                                    style={{ fontFamily: WB.bodyFont }}
                                  >
                                    <span className="block">{svc.label}</span>
                                  </Link>
                                  {svc.areas.length > 0 && (
                                    <button
                                      type="button"
                                      className="shrink-0 px-2 py-2 text-sm"
                                      style={{ color: primaryColor }}
                                      aria-label={expanded ? 'Hide areas' : 'Show areas'}
                                      aria-expanded={expanded}
                                      onClick={() =>
                                        setMobileExpandedService((cur) =>
                                          cur === svc.slug ? null : svc.slug
                                        )
                                      }
                                    >
                                      {expanded ? '−' : '+'}
                                    </button>
                                  )}
                                </div>
                                {expanded && (
                                  <ul
                                    className="mb-2 ml-2 space-y-1 border-l pl-3"
                                    style={{ borderColor: themeSurface(primaryColor, 0.12) }}
                                  >
                                    {svc.areas.map((area, index) => (
                                      <li key={`${svc.slug}-area-${index}-${area.href}`}>
                                        <Link
                                          href={area.href}
                                          replace
                                          onClick={() => setIsOpen(false)}
                                          className="block py-1.5 text-sm text-[var(--wb-text-secondary)] transition-colors hover:text-[var(--wb-primary)]"
                                          style={{ fontFamily: WB.bodyFont }}
                                        >
                                          {area.label}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            );
                          })}

                          <Link
                            href={item.href}
                            replace
                            onClick={() => setIsOpen(false)}
                            className="mt-2 block py-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--wb-primary)]"
                            style={{ fontFamily: WB.bodyFont }}
                          >
                            View all services →
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    replace
                    onClick={() => setIsOpen(false)}
                    className="py-4 text-lg text-[var(--wb-text-main)] transition-colors hover:text-[var(--wb-primary)]"
                    style={{ fontFamily: WB.headingFont }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pt-10">
              <Link
                href={resolvedPhone ? `tel:${resolvedPhone}` : '#'}
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-3 bg-[var(--wb-card-bg-light)] px-7 py-3.5 text-sm font-medium tracking-wide text-[var(--wb-text-main)] shadow-[0_8px_24px_color-mix(in_srgb,var(--wb-text-main)_12%,transparent)] transition-shadow duration-300 hover:shadow-[0_12px_40px_color-mix(in_srgb,var(--wb-primary)_25%,transparent)]"
                style={{ fontFamily: WB.bodyFont }}
              >
                Call Us <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
