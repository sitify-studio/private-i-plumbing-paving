'use client';

import React from 'react';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { cn, getImageSrc, TIPTAP_INHERIT } from '@/app/lib/utils';
import { OptimizedImage, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';

interface ServiceDetailsSectionProps {
    service: any;
    galleryImages: any[];
}

const getFullImageUrl = (url?: string): string | undefined => {
    if (!url) return undefined;
    const resolved = getImageSrc(url);
    return resolved || undefined;
};

export const ServiceDetailsSection: React.FC<ServiceDetailsSectionProps> = ({
    service,
    galleryImages
}) => {
    const themeColors = useThemeColors();
    const themeFonts = useThemeFonts();

    return (
        <div className="lg:col-span-8">
            {service.thumbnailImage?.url && (
                <div className="mb-8">
                    <OptimizedImage
                        src={getFullImageUrl(service.thumbnailImage.url) || ''}
                        alt={service.thumbnailImage.altText || service.name}
                        width={1400}
                        height={560}
                        sizes={IMAGE_SIZES.sectionWide}
                        className="w-full h-auto max-h-[400px] object-cover rounded-2xl shadow-lg"
                    />
                </div>
            )}

            {service.price && (
                <div
                    className="mb-8 flex flex-wrap items-baseline justify-between gap-4 border-y py-5"
                    style={{
                        borderColor: `color-mix(in srgb, ${themeColors.mainText} 12%, transparent)`,
                    }}
                >
                    <span
                        className="text-[10px] font-bold uppercase tracking-[0.3em]"
                        style={{
                            color: themeColors.secondaryText,
                            fontFamily: themeFonts.body,
                        }}
                    >
                        Pricing
                    </span>
                    <span
                        className="text-2xl font-light uppercase tracking-[0.05em] lg:text-3xl"
                        style={{
                            color: themeColors.mainText,
                            fontFamily: themeFonts.heading,
                        }}
                    >
                        {service.price}
                        {service.priceType === 'range' ? (
                            <span className="ml-2 text-xs font-light uppercase tracking-[0.15em] text-[var(--wb-text-secondary)]">
                                starts at
                            </span>
                        ) : null}
                    </span>
                </div>
            )}

            {service.description && (
                <div
                    className={cn('prose prose-lg max-w-none', TIPTAP_INHERIT)}
                    style={{ color: themeColors.mainText }}
                >
                    <TiptapRenderer content={service.description} />
                </div>
            )}

            {(Array.isArray(service.features) ? service.features.length > 0 : !!service.features) && (
                <div className={service.description ? 'mt-12' : ''}>
                    <h2
                        className="text-2xl lg:text-3xl font-semibold mb-4"
                        style={{ color: themeColors.mainText }}
                    >
                        Features
                    </h2>
                    <div
                        className={cn('prose prose-lg max-w-none', TIPTAP_INHERIT)}
                        style={{ color: themeColors.mainText }}
                    >
                        {Array.isArray(service.features) ? (
                            <ul>
                                {service.features.map((feature: any, index: number) => (
                                    <li key={index}>
                                        {typeof feature === 'string' ? feature : <TiptapRenderer content={feature} as="inline" />}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <TiptapRenderer content={service.features} />
                        )}
                    </div>
                </div>
            )}

            {galleryImages.length > 0 && (
                <div className="mt-12 space-y-8">
                    {galleryImages.map((image: any, index: number) => {
                        const isEven = index % 2 === 0;
                        return (
                            <div
                                key={index}
                                className={cn(
                                    "flex flex-col md:flex-row gap-6 items-center",
                                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                                )}
                            >
                                <div className="md:w-1/2">
                                    <OptimizedImage
                                        src={getFullImageUrl(image.url) || ''}
                                        alt={image.altText || `${service.name} image ${index + 1}`}
                                        width={1000}
                                        height={640}
                                        sizes={IMAGE_SIZES.sectionHalf}
                                        className="w-full h-64 object-cover rounded-xl shadow-md"
                                    />
                                </div>
                                <div className="md:w-1/2">
                                    {image.caption && (
                                        <p
                                            className="text-sm italic"
                                            style={{ color: themeColors.secondaryText }}
                                        >
                                            {image.caption}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
