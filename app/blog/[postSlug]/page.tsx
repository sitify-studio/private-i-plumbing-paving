'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { blogApi } from '@/app/lib/api';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { Footer } from '@/app/components/layout/Footer';
import { BlogPost } from '@/app/lib/types';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { getImageSrc } from '@/app/lib/utils';
import { OptimizedImage, IMAGE_QUALITY_HIGH, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';
import { SeoHead } from '@/app/components/ui/SeoHead';
import { normalizeSeoImage, tiptapToText, truncate } from '@/app/lib/seo';
import { QuickContactCard, RelatedArticlesCard } from '@/app/components/sections/ServiceSidebarCards';

export default function BlogPostPage() {
    const params = useParams();
    const postSlug = params.postSlug as string;
    const { site, loading: siteLoading } = useWebBuilder();

    const [post, setPost] = useState<BlogPost | null>(null);
    const [otherPosts, setOtherPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const themeColors = useThemeColors();
    const themeFonts = useThemeFonts();

    useEffect(() => {
        async function loadPost() {
            if (!site) return;
            try {
                setLoading(true);
                const postData = await blogApi.getPostBySlug(site.slug, postSlug);
                setPost(postData);

                const allPosts = await blogApi.getPostsBySite(site.slug);
                const filtered = allPosts
                    .filter(p => p.status === 'published' && p.slug !== postSlug)
                    .slice(0, 3);
                setOtherPosts(filtered);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to load blog post');
            } finally {
                setLoading(false);
            }
        }
        if (!siteLoading) loadPost();
    }, [site, postSlug, siteLoading]);

    if (siteLoading || loading) {
        return <div className="min-h-screen flex items-center justify-center animate-pulse uppercase tracking-[0.3em] text-xs">Loading Perspective...</div>;
    }

    if (error || !post) {
        return <div className="min-h-screen flex items-center justify-center text-red-500 uppercase tracking-widest">Entry Not Found</div>;
    }

    const siteName = site?.business?.name || site?.name || 'Perspective';
    const seoTitle = `${post.seo?.title || post.title} | ${siteName}`;
    const seoDescription = truncate(post.seo?.description || tiptapToText(post.excerpt) || tiptapToText(post.content), 160);
    const ogImage = normalizeSeoImage(post.seo?.ogImageUrl || post.featuredImage?.url, post.title);

    return (
        <div className="min-h-screen" style={{ backgroundColor: themeColors.pageBackground }}>
            <SeoHead title={seoTitle} description={seoDescription} canonicalPath={`/blog/${post.slug}`} ogType="article" ogImage={ogImage} />

            <main className="relative">
                {/* HERO SECTION - WHITE TEXT OVER IMAGE */}
                <div className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden flex items-end">
                    {post.featuredImage && (
                        <div className="absolute inset-0 z-0">
                            <OptimizedImage
                                src={getImageSrc(post.featuredImage.url)}
                                alt={post.featuredImage.altText || post.title}
                                fill
                                quality={IMAGE_QUALITY_HIGH}
                                sizes={IMAGE_SIZES.fullWidth}
                                priority
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60" /> 
                        </div>
                    )}
                    
                    <div className="container mx-auto px-6 lg:px-12 relative z-10 pb-16 lg:pb-24">
                        <div className="max-w-4xl">
                            {post.categories?.[0] && (
                                <span className="text-[6px] md:text-xs uppercase tracking-[0.3em] text-white/80 mb-6 block font-medium">
                                    {post.categories[0]}
                                </span>
                            )}
                            <h1 
                                className="text-3xl md:text-5xl lg:text-6xl font-extralight uppercase leading-[1.1] tracking-tight md:tracking-[-0.02em] text-balance"
                                style={{ fontFamily: themeFonts.heading, color: 'white' }}
                            >
                                {post.title}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT & SIDEBAR */}
                <main className="relative py-20 lg:py-32">
                    <div className="w-full px-6 lg:px-12">
                        <div className="grid gap-16 lg:grid-cols-12 xl:gap-24">
                            {/* Left Side: Blog Content */}
                            <div className="space-y-20 lg:col-span-8 lg:max-w-5xl">
                                <div 
                                    className="prose prose-lg md:prose-xl max-w-none prose-headings:uppercase prose-headings:font-light prose-headings:tracking-widest prose-img:rounded-none prose-blockquote:border-l prose-blockquote:italic"
                                    style={{ 
                                        color: themeColors.mainText, 
                                        fontFamily: themeFonts.body,
                                    }}
                                >
                                    <TiptapRenderer content={post.content || post.excerpt} />
                                </div>

                                {/* Tags - Minimalist style */}
{post.tags && post.tags.length > 0 && (
                                <div className="mt-12 pt-8 flex flex-wrap gap-4" style={{ borderTop: `1px solid ${themeColors.inactive}` }}>
                                    {post.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="text-[10px] uppercase tracking-[0.3em] px-4 py-2"
                                            style={{
                                                backgroundColor: themeColors.cardBackgroundLight,
                                                color: themeColors.mainText
                                            }}
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            </div>

                            {/* Right Side: Sticky Sidebar */}
                            <aside className="relative lg:col-span-4 lg:ml-auto lg:max-w-sm">
                                <div className="space-y-12 lg:sticky lg:top-32">
                                    {/* Related Articles */}
                                    {otherPosts.length > 0 && (
                                        <RelatedArticlesCard posts={otherPosts} />
                                    )}

                                    {/* Quick Contact */}
                                    <QuickContactCard service={{ name: post.title }} />
                                </div>
                            </aside>
                        </div>
                    </div>
                </main>

                <Footer />
            </main>
        </div>
    );
}