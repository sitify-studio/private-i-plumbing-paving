'use client';

import React from 'react';
import { cn, getImageSrc } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';
import type { Service } from '@/app/lib/types';
import { useThemeColors } from '@/app/hooks/useTheme';
import { HeroSection } from './HeroSection';
import { ServiceDetailsSection } from './ServiceDetailsSection';
import { OtherServicesCard, QuickContactCard } from './ServiceSidebarCards';
import { CTASection } from './CTASection';
import { FAQSection } from './FAQSection';
import { ContactSection } from './ContactSection';
import { ServiceServingAreasSection } from './ServiceServingAreasSection';

interface ServiceDetailProps {
    service: Service;
    allServices?: Service[];
    className?: string;
}

export const ServiceDetail: React.FC<ServiceDetailProps> = ({
    service,
    allServices = [],
    className,
}) => {
    const themeColors = useThemeColors();

    // Data Filtering - show all other services, no limit
    const otherServices = allServices.filter(
        (s) => s._id !== service._id && s.slug !== service.slug
    );
    const galleryImages = Array.isArray(service.galleryImages) ? service.galleryImages : [];

    // Banner (Home Page Pattern)
    const bannerTitle =
        service.banner?.useServiceNameAsTitle !== false
            ? service.name
            : service.banner?.customTitle || service.name;

    const bannerBgImage = service.banner?.backgroundImage?.url
        ? getImageSrc(service.banner.backgroundImage.url)
        : service.thumbnailImage?.url
            ? getImageSrc(service.thumbnailImage.url)
            : undefined;

    const heroDescription =
        tiptapToText(service.shortDescription) || tiptapToText(service.description) || '';

    const heroCta = {
        label: service.cta?.buttonText || 'Get Started',
        href: service.cta?.buttonUrl || '/contact',
    };

    // CTA (Home Page Pattern)
    const cta = service.cta;
    const isCtaEnabled = cta?.enabled ?? true;
    const ctaSection = {
        enabled: isCtaEnabled,
        title: cta?.title || `Excellence in ${service.name}`,
        description:
            cta?.description ||
            'Experience the gold standard in home services. Our team is ready to assist you today.',
        primaryButton: {
            label: cta?.buttonText || 'Schedule Now',
            href: cta?.buttonUrl || '/contact',
        },
        image: cta?.image?.url ? { url: cta.image.url } : undefined,
    };

    // FAQ (Home Page Pattern)
    const serviceFaqs = Array.isArray(service.faqs) ? service.faqs : [];
    const faqSection = {
        enabled: true,
        title: 'Frequently Asked Questions',
        description: `Get answers to common questions about our ${service.name} service.`,
        items: serviceFaqs.map((faq) => ({
            question: faq.question,
            answer: faq.answer,
        })),
    };

    // Contact (Home Page Pattern)
    const contactSection = {
        enabled: service.contactForm?.enabled ?? true,
        title: 'Any questions? Simply ask us.',
        description: `Ready to start your ${service.name} project? Get in touch with our team today.`,
        showForm: true,
        showMap: true,
        showContactInfo: true,
    };

    return (
        <div
            className={cn('min-h-screen', className)}
            style={{ backgroundColor: themeColors.pageBackground }}
        >
            {/* Home Banner */}
            <HeroSection
                title={bannerTitle}
                description={heroDescription}
                ctaButton={heroCta}
                backgroundImage={bannerBgImage}
            />

            {/* Main Content Architecture */}
            <main className="relative py-20 lg:py-32">
                <div className="w-full px-6 lg:px-12">
                    <div className="grid gap-16 lg:grid-cols-12 xl:gap-24">
                        {/* Left Side: Editorial Content */}
                        <div className="space-y-20 lg:col-span-8 lg:max-w-5xl">
                            <ServiceDetailsSection
                                service={service}
                                galleryImages={galleryImages}
                            />
                        </div>

                        {/* Right Side: Sticky Sidebar */}
                        <aside className="relative lg:col-span-4 lg:ml-auto lg:max-w-sm">
                            <div className="space-y-12 lg:sticky lg:top-32">
                                <OtherServicesCard otherServices={otherServices} />
                                <QuickContactCard service={service} />
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            {isCtaEnabled && <CTASection ctaSection={ctaSection} />}

            {/* Support Information Sections */}
            <div className="space-y-0">
                {serviceFaqs.length > 0 && <FAQSection faqSection={faqSection} />}

                <ServiceServingAreasSection service={service} />

                <ContactSection contactSection={contactSection} />
            </div>
        </div>
    );
};

export default ServiceDetail;