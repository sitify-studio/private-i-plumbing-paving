'use client';

import React from 'react';
import Link from 'next/link';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';
import { getImageSrc } from '@/app/lib/utils';
import { OptimizedImage } from '@/app/components/ui/OptimizedImage';

interface OtherServicesCardProps {
    otherServices: any[];
}

interface QuickContactCardProps {
    service: any;
}

export const OtherServicesCard: React.FC<OtherServicesCardProps> = ({ otherServices }) => {
    const themeColors = useThemeColors();
    const themeFonts = useThemeFonts();

    // Utility function to get full image URL
    const getFullImageUrl = (url?: string): string | undefined => {
        if (!url) return undefined;
        const resolved = getImageSrc(url);
        return resolved || undefined;
    };

    if (otherServices.length === 0) return null;

    return (
        <div 
            className="border-l-2 pl-6 md:pl-8"
            style={{
                borderColor: `${themeColors.primaryButton}40`,
            }}
        >
            <h3 
                className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase mb-6"
                style={{ 
                    color: themeColors.mainText,
                    fontFamily: themeFonts.heading
                }}
            >
                Other Services
            </h3>
            
            <ul className="space-y-4">
                {otherServices.slice(0, 5).map((otherService: any) => (
                    <li key={otherService._id}>
                        <Link
                            href={`/service/${otherService.slug}`}
                            className="group flex items-center gap-3 transition-all duration-300"
                        >
                            {otherService.thumbnailImage?.url && (
                                <OptimizedImage
                                    src={getFullImageUrl(otherService.thumbnailImage.url) || ''}
                                    alt={otherService.name}
                                    width={40}
                                    height={40}
                                    sizes="40px"
                                    className="w-10 h-10 object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                />
                            )}
                            <span 
                                className="text-sm font-light tracking-wide group-hover:text-primary transition-colors"
                                style={{ 
                                    color: themeColors.secondaryText,
                                    fontFamily: themeFonts.body
                                }}
                            >
                                {otherService.name}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
            
            {/* View All Services Link */}
            <div className="mt-8 pt-6 border-t" style={{ borderColor: `${themeColors.inactive}15` }}>
                <Link
                    href="/services"
                    className="group inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-300 hover:gap-4"
                    style={{
                        color: themeColors.primaryButton,
                        fontFamily: themeFonts.body
                    }}
                >
                    View All
                    <svg 
                        className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

interface RelatedArticlePost {
    _id: string;
    slug: string;
    title?: string;
}

interface RelatedArticlesCardProps {
    posts: RelatedArticlePost[];
    onViewAll?: string;
}

export const RelatedArticlesCard: React.FC<RelatedArticlesCardProps> = ({ posts, onViewAll = '/blog' }) => {
    const themeColors = useThemeColors();
    const themeFonts = useThemeFonts();

    if (!posts || posts.length === 0) return null;

    return (
        <div className="border-l-2 pl-6 md:pl-8" style={{ borderColor: `${themeColors.primaryButton}40` }}>
            <h3
                className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase mb-6"
                style={{
                    color: themeColors.mainText,
                    fontFamily: themeFonts.heading
                }}
            >
                More Blogs
            </h3>

            <ul className="space-y-5">
                {posts.map((post, index) => (
                    <li key={post._id}>
                        <Link
                            href={`/blog/${post.slug}`}
                            className="group flex items-start gap-4 transition-all duration-300"
                        >
                            <span
                                className="text-[10px] font-bold uppercase tracking-[0.2em] pt-1 shrink-0"
                                style={{
                                    color: themeColors.primaryButton,
                                    fontFamily: themeFonts.heading
                                }}
                            >
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <span className="min-w-0 flex-1">
                                <span
                                    className="block text-sm font-light tracking-wide leading-snug line-clamp-2 group-hover:opacity-70 transition-opacity"
                                    style={{
                                        color: themeColors.mainText,
                                        fontFamily: themeFonts.body
                                    }}
                                >
                                    {post.title}
                                </span>
                                <span
                                    className="mt-2 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{
                                        color: themeColors.primaryButton,
                                        fontFamily: themeFonts.body
                                    }}
                                >
                                    Read Article
                                    <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </span>
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>

            <div className="mt-8 pt-6 border-t" style={{ borderColor: `${themeColors.inactive}15` }}>
                <Link
                    href={onViewAll}
                    className="group inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-300 hover:gap-4"
                    style={{
                        color: themeColors.primaryButton,
                        fontFamily: themeFonts.body
                    }}
                >
                    View All
                    <svg
                        className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export const QuickContactCard: React.FC<QuickContactCardProps> = ({ service }) => {
    const themeColors = useThemeColors();
    const themeFonts = useThemeFonts();

    return (
        <div className="border-l-2 pl-6 md:pl-8" style={{ borderColor: `${themeColors.primaryButton}40` }}>
            <h3
                className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase mb-3"
                style={{
                    color: themeColors.mainText,
                    fontFamily: themeFonts.heading
                }}
            >
                Get Started
            </h3>
            
            <p
                className="text-sm font-light leading-relaxed mb-6"
                style={{ 
                    color: themeColors.secondaryText,
                    fontFamily: themeFonts.body
                }}
            >
                Ready to transform your space? Let's discuss your {service.name.toLowerCase()} project.
            </p>
            
            <Link
                href="/contact-us"
                className="group inline-flex items-center gap-3 transition-all duration-300"
                style={{
                    color: themeColors.primaryButton,
                }}
            >
                <span 
                    className="text-[10px] font-bold uppercase tracking-[0.3em]"
                    style={{ fontFamily: themeFonts.body }}
                >
                    Contact Us
                </span>
                <div 
                    className="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ borderColor: themeColors.primaryButton }}
                >
                    <svg 
                        className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </div>
            </Link>
        </div>
    );
};
