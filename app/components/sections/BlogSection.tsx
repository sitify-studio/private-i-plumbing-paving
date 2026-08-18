'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getPageHref } from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { getImageSrc, cn } from '@/app/lib/utils';
import { OptimizedImage, IMAGE_QUALITY_HIGH, IMAGE_SIZES } from '@/app/components/ui/OptimizedImage';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { AnimatedHeading, EASE } from '@/components/AnimatedTitle';
import { EditorialBackdrop, SECTION, SectionTopAccent } from '@/components/EditorialSection';
import { themeSurface } from '@/lib/theme';
import { useEditorialTheme } from '@/hooks/useEditorialTheme';

type BlogSectionInput = NonNullable<Page['blogSection']> & {
  heading?: unknown;
  subtitle?: unknown;
};

function pickSectionField(
  section: BlogSectionInput | undefined,
  primary: 'title' | 'description'
): unknown {
  if (!section) return undefined;
  const alt = primary === 'title' ? section.heading : section.subtitle;
  const value = section[primary] ?? alt;
  if (value == null || value === '') return undefined;
  return value;
}

function hasTiptapContent(content: unknown): boolean {
  if (content == null || content === '') return false;
  if (typeof content === 'object') return Boolean(tiptapToText(content));
  return Boolean(String(content).trim());
}

function resolvePostImageRaw(post: {
  featuredImage?: unknown;
  seo?: { ogImageUrl?: string };
}): string | undefined {
  const img = post?.featuredImage;
  if (typeof img === 'string' && img.trim()) return img;
  if (img && typeof img === 'object' && (img as { url?: string }).url) {
    return (img as { url: string }).url;
  }
  if (post?.seo?.ogImageUrl) return post.seo.ogImageUrl;
  return undefined;
}

function getPostImageSrc(post: {
  featuredImage?: unknown;
  seo?: { ogImageUrl?: string };
}): string {
  const raw = resolvePostImageRaw(post);
  return raw ? getImageSrc(raw) : '';
}

function getPostImageAlt(post: { featuredImage?: unknown; title?: string }): string {
  const img = post?.featuredImage;
  if (img && typeof img === 'object' && (img as { altText?: string }).altText) {
    return (img as { altText: string }).altText;
  }
  return post?.title || '';
}

function formatPostDate(iso: string | undefined, show: boolean): string | null {
  if (!show || !iso) return null;
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

interface BlogSectionProps {
  blogSection?: Page['blogSection'];
  className?: string;
}

type BlogPostItem = {
  _id: string;
  slug: string;
  title?: string;
  excerpt?: unknown;
  publishedAt?: string;
  createdAt?: string;
  author?: { name?: string };
  categories?: string[];
  featuredImage?: unknown;
  seo?: { ogImageUrl?: string };
};

export function BlogSection({ blogSection, className }: BlogSectionProps) {
  const { blogPosts, loading, pages } = useWebBuilder();

  const theme = useEditorialTheme();
  const primaryColor = theme.primary;
  const secondaryColor = theme.secondaryText;

  const sectionData = useMemo(() => {
    const fallback = pages.find((p) => p.pageType === 'blog-list')?.blogSection as
      | BlogSectionInput
      | undefined;
    const current = blogSection as BlogSectionInput | undefined;
    if (!current && !fallback) return undefined;

    return {
      enabled: current?.enabled ?? fallback?.enabled ?? true,
      postsToShow: current?.postsToShow ?? fallback?.postsToShow ?? 3,
      showExcerpt: current?.showExcerpt ?? fallback?.showExcerpt ?? true,
      showDate: current?.showDate ?? fallback?.showDate ?? true,
      title: pickSectionField(current, 'title') ?? pickSectionField(fallback, 'title'),
      description:
        pickSectionField(current, 'description') ??
        pickSectionField(fallback, 'description'),
    };
  }, [blogSection, pages]);

  const resolvedTitle = useMemo(
    () => tiptapToText(sectionData?.title) || 'Latest Articles',
    [sectionData?.title]
  );

  const resolvedDescription = useMemo(
    () => tiptapToText(sectionData?.description),
    [sectionData?.description]
  );

  const hasTitle = hasTiptapContent(sectionData?.title);
  const hasDescription = hasTiptapContent(sectionData?.description);

  const blogHref = useMemo(() => {
    const blogPage = pages.find((p) => p.pageType === 'blog-list');
    return blogPage ? getPageHref(blogPage) : '/blog';
  }, [pages]);

  const { ref: triggerRef, isVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.12,
  });
  const loaded = isVisible;

  if (!sectionData?.enabled) return null;

  const count = Math.min(Math.max(sectionData.postsToShow || 3, 1), 12);
  const displayPosts = blogPosts.slice(0, count) as BlogPostItem[];
  const showExcerpt = Boolean(sectionData.showExcerpt);
  const showDate = Boolean(sectionData.showDate);

  if (loading && blogPosts.length === 0) {
    return (
      <section id="blog" className={cn(SECTION.wrap, className)}>
        <EditorialBackdrop primaryColor={primaryColor} />
        <SectionTopAccent primaryColor={primaryColor} />
        <div className={SECTION.container}>
          <div
            className="aspect-[21/9] animate-pulse border"
            style={{
              borderColor: themeSurface(primaryColor, 0.2),
              background: themeSurface(secondaryColor, 0.12),
            }}
          />
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse border"
                style={{
                  borderColor: themeSurface(primaryColor, 0.15),
                  background: themeSurface(secondaryColor, 0.08),
                }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (displayPosts.length === 0 && !hasTitle && !hasDescription) {
    return null;
  }

  const [featured, ...morePosts] = displayPosts;

  return (
    <section id="blog" className={cn(SECTION.wrap, className)}>
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
              <span
                className={SECTION.labelBar}
                style={{ backgroundColor: primaryColor }}
              />
              Journal
            </p>
            <AnimatedHeading
              title={resolvedTitle}
              loaded={loaded}
              baseDelay={0.2}
              lightSweep
            />
            {resolvedDescription && (
              <p
                className={`mt-8 max-w-xl ${SECTION.body}`}
                style={{
                  fontFamily: 'var(--wb-body-font, sans-serif)',
                  opacity: loaded ? 1 : 0,
                  transform: loaded ? 'translateY(0)' : 'translateY(24px)',
                  transition: `opacity 0.8s ${EASE}, transform 0.8s ${EASE}`,
                  transitionDelay: '0.8s',
                }}
              >
                {resolvedDescription}
              </p>
            )}
          </div>
        </div>

        {displayPosts.length === 0 ? (
          <p
            className={`${SECTION.content} text-center ${SECTION.body}`}
            style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
          >
            No published posts yet. Add posts in the builder to show them here.
          </p>
        ) : (
          <div className={SECTION.content}>
            {featured && (
              <FeaturedPostCard
                post={featured}
                showExcerpt={showExcerpt}
                showDate={showDate}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                loaded={loaded}
              />
            )}

            {morePosts.length > 0 && (
              <div
                className="mt-10 border-t pt-2"
                style={{ borderColor: themeSurface(primaryColor, 0.2) }}
              >
                {morePosts.map((post, i) => (
                  <MorePostCard
                    key={post._id}
                    post={post}
                    showExcerpt={showExcerpt}
                    showDate={showDate}
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                    loaded={loaded}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {displayPosts.length > 0 && (
          <div className="mt-8 flex justify-end">
            <Link
              href={blogHref}
              className="group inline-flex items-center gap-2 text-sm transition-transform duration-300 hover:-translate-y-0.5"
              style={{
                fontFamily: 'var(--wb-body-font, sans-serif)',
                color: primaryColor,
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.6s ${EASE}, transform 0.6s ${EASE}`,
                transitionDelay: '1s',
              }}
            >
              View All Articles
              <span
                className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function PostMeta({
  post,
  showDate,
  primaryColor,
  className,
}: {
  post: BlogPostItem;
  showDate: boolean;
  primaryColor: string;
  className?: string;
}) {
  const dateLabel = formatPostDate(post.publishedAt || post.createdAt, showDate);
  const author = post.author?.name?.trim();
  const category = post.categories?.[0];

  return (
    <div
      className={cn('flex flex-wrap items-center gap-2 text-xs text-[var(--wb-text-secondary)]', className)}
      style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
    >
      {category && (
        <span
          className="border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
          style={{
            borderColor: themeSurface(primaryColor, 0.3),
            color: primaryColor,
          }}
        >
          {category}
        </span>
      )}
      
      {dateLabel && <span>{dateLabel}</span>}
    </div>
  );
}

function FeaturedPostCard({
  post,
  showExcerpt,
  showDate,
  primaryColor,
  secondaryColor,
  loaded,
}: {
  post: BlogPostItem;
  showExcerpt: boolean;
  showDate: boolean;
  primaryColor: string;
  secondaryColor: string;
  loaded: boolean;
}) {
  const imgSrc = getPostImageSrc(post);
  const excerpt = tiptapToText(post.excerpt);
  const dateLabel = formatPostDate(post.publishedAt || post.createdAt, showDate);

  return (
    <article
      className="group relative overflow-hidden border"
      style={{
        borderColor: themeSurface(primaryColor, 0.2),
        opacity: loaded ? 1 : 0,
        transform: loaded ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.9s ${EASE}, transform 0.9s ${EASE}`,
        transitionDelay: '0.45s',
      }}
    >
      <Link href={`/blog/${post.slug}`} className="block no-underline">
        <div className="relative aspect-[4/3] min-h-[200px] w-full overflow-hidden sm:aspect-[21/9] sm:min-h-[280px]">
          {imgSrc ? (
            <OptimizedImage
              src={imgSrc}
              alt={getPostImageAlt(post)}
              fill
              className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
              sizes={IMAGE_SIZES.fullWidth}
              quality={IMAGE_QUALITY_HIGH}
              priority
            />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: `linear-gradient(135deg, ${themeSurface(primaryColor, 0.35)} 0%, ${themeSurface(secondaryColor, 0.5)} 100%)`,
              }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, color-mix(in srgb, var(--wb-text-main) 82%, transparent) 0%, color-mix(in srgb, var(--wb-text-main) 35%, transparent) 45%, transparent 100%)',
            }}
          />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 md:p-10 lg:p-12">
            <PostMeta
              post={post}
              showDate={showDate}
              primaryColor={primaryColor}
              className="mb-4 text-white/70 [&_span]:border-white/30 [&_span]:text-white"
            />
            {post.title && (
              <h3
                className="max-w-3xl text-xl leading-tight text-white break-words sm:text-2xl md:text-4xl lg:text-[2.75rem]"
                style={{ fontFamily: 'var(--wb-heading-font, Georgia, serif)' }}
              >
                {post.title}
              </h3>
            )}
            {showExcerpt && excerpt && (
              <p
                className="mt-4 line-clamp-2 max-w-2xl text-sm leading-relaxed text-white/75 md:text-base"
                style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
              >
                {excerpt}
              </p>
            )}
            <span
              className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white transition-transform duration-300 group-hover:translate-x-1"
              style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
            >
              Read feature
              <span aria-hidden="true">→</span>
            </span>
          </div>
          {dateLabel && (
            <span
              className="absolute right-6 top-6 hidden text-[10px] uppercase tracking-[0.28em] text-white/60 md:block"
              style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
            >
              {dateLabel}
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}

function MorePostCard({
  post,
  showExcerpt,
  showDate,
  primaryColor,
  secondaryColor,
  loaded,
  index,
}: {
  post: BlogPostItem;
  showExcerpt: boolean;
  showDate: boolean;
  primaryColor: string;
  secondaryColor: string;
  loaded: boolean;
  index: number;
}) {
  const imgSrc = getPostImageSrc(post);
  const excerpt = tiptapToText(post.excerpt);
  const dateLabel = formatPostDate(post.publishedAt || post.createdAt, showDate);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex items-stretch gap-0 border-b py-6 no-underline transition-colors duration-300 last:border-b-0 hover:bg-[color-mix(in_srgb,var(--wb-card-bg-light)_50%,transparent)] md:gap-8 md:py-8"
      style={{
        borderColor: themeSurface(primaryColor, 0.15),
        opacity: loaded ? 1 : 0,
        transform: loaded ? 'translateX(0)' : 'translateX(-24px)',
        transition: `opacity 0.7s ${EASE}, transform 0.7s ${EASE}, background-color 0.3s ease`,
        transitionDelay: `${0.65 + index * 0.1}s`,
      }}
    >
      <div className="hidden w-16 shrink-0 flex-col justify-between md:flex lg:w-20">
        <span
          className="text-3xl tabular-nums leading-none lg:text-4xl"
          style={{
            fontFamily: 'var(--wb-heading-font, Georgia, serif)',
            color: themeSurface(primaryColor, 0.18),
          }}
        >
          {String(index + 2).padStart(2, '0')}
        </span>
        {dateLabel && (
          <span
            className="text-[10px] uppercase tracking-[0.18em] text-[var(--wb-text-secondary)]"
            style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
          >
            {dateLabel}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1 pr-4 md:pr-0">
        <PostMeta post={post} showDate={showDate && !dateLabel} primaryColor={primaryColor} className="mb-2 md:hidden" />
        <PostMeta post={post} showDate={false} primaryColor={primaryColor} className="mb-2 hidden md:flex" />
        {post.title && (
          <h4
            className="text-lg text-[var(--wb-text-main)] transition-colors duration-300 group-hover:text-[var(--wb-text-main)] md:text-xl lg:text-2xl"
            style={{ fontFamily: 'var(--wb-heading-font, Georgia, serif)' }}
          >
            {post.title}
          </h4>
        )}
        {showExcerpt && excerpt && (
          <p
            className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--wb-text-secondary)]"
            style={{ fontFamily: 'var(--wb-body-font, sans-serif)' }}
          >
            {excerpt}
          </p>
        )}
        <span
          className="mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] opacity-0 transition-all duration-300 group-hover:opacity-100"
          style={{
            fontFamily: 'var(--wb-body-font, sans-serif)',
            color: primaryColor,
          }}
        >
          Continue reading
          <span aria-hidden="true">→</span>
        </span>
      </div>

      <div
        className="relative hidden h-24 w-36 shrink-0 overflow-hidden sm:block md:h-28 md:w-44"
        style={{ border: `1px solid ${themeSurface(primaryColor, 0.15)}` }}
      >
        {imgSrc ? (
          <OptimizedImage
            src={imgSrc}
            alt={getPostImageAlt(post)}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes={IMAGE_SIZES.thumb}
          />
        ) : (
          <div
            className="h-full w-full"
            style={{ background: themeSurface(secondaryColor, 0.15) }}
          />
        )}
      </div>
    </Link>
  );
}

export default BlogSection;
