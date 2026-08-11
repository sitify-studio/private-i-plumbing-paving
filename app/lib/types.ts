// Enhanced Business Hours Types - supports multiple time ranges per day
export interface TimeRange {
  id?: string
  openTime: string // Format: "09:00"
  closeTime: string // Format: "17:00"
}

export interface BusinessHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isOpen: boolean;
  is24Hours: boolean;
  timeRanges: TimeRange[]; // Multiple time ranges per day
}

export interface SiteBusinessHours {
  isEnabled: boolean;
  is24_7: boolean;
  timezone: string;
  displayFormat: '12h' | '24h';
  hours: BusinessHours[];
}

// Add to existing Site interface - replace the old hours field
export interface Site {
  _id: string;
  name: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  subscriberUserId?: string;
  seoSpecialistUserId?: string;
  seo: {
    title?: string;
    description?: string;
    keywords: string[];
    faviconUrl?: string;
    ogImageUrl?: string;
    gtmId?: string;
    gaId?: string;
  };
  /** Sitify Studio → Integrations (tracking / verification / Maps). */
  integrations?: {
    ga4?: string;
    gtmHead?: string;
    gtmBody?: string;
    googleAds?: string;
    searchConsoleVerification?: string;
    googleMaps?: string;
  };
  theme: {
    logoUrl?: string;
    // Text Colors
    darkPrimaryColor?: string;
    darkSecondaryColor?: string;
    lightPrimaryColor?: string;
    lightSecondaryColor?: string;
    // Legacy (backward compatibility)
    mainTextColor?: string;
    secondaryTextColor?: string;
    // Background Colors
    pageBackgroundColor?: string;
    sectionBackgroundColorLight?: string;
    sectionBackgroundColorDark?: string;
    cardBackgroundColorLight?: string;
    cardBackgroundColorDark?: string;
    // Button/UI Colors
    primaryButtonColorLight?: string;
    primaryButtonColorDark?: string;
    hoverActiveColorLight?: string;
    hoverActiveColorDark?: string;
    inactiveColorLight?: string;
    inactiveColorDark?: string;
    textOnDarkColor?: string;
    textOnDarkSecondaryColor?: string;
    // Fonts
    headingFont?: string;
    bodyFont?: string;
  };
  business: {
    name?: string;
    tagline?: string;
    description?: any; // Tiptap JSON
    email?: string;
    phone?: string;
    emergencyPhone?: string;
    emergencyEmail?: string;
    address: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    coordinates: {
      latitude?: number;
      longitude?: number;
    };
    // Enhanced business hours
    businessHours?: SiteBusinessHours;
    // Keep legacy for backward compatibility
    hours?: Array<{
      day: string;
      hours: string;
      isClosed: boolean;
    }>;
  };
  socialLinks: Array<{
    platform: 'facebook' | 'instagram' | 'X' | 'youtube' | 'yelp' | 'linkedin' | 'tiktok' | 'pinterest';
    url: string;
  }>;
  footer: {
    logo?: {
      url: string;
      altText?: string;
    };
    description?: any; // Tiptap JSON or plain string
    columns: Array<{
      title: string;
      links: Array<{
        label: string;
        url: string;
      }>;
    }>;
    copyright?: any; // Tiptap JSON
    showSocialLinks: boolean;
  };
  contactSection?: {
    enabled: boolean;
    title?: any;
    description?: any;
    showForm: boolean;
    showMap: boolean;
    showContactInfo: boolean;
  };
  serviceAreas: string[];
  legal: {
    termsOfService?: {
      heading?: string;
      description?: string;
      content?: any; // Tiptap JSON
    };
    privacyPolicy?: {
      heading?: string;
      description?: string;
      content?: any; // Tiptap JSON
    };
  };
  files: {
    sitemap?: string;
    robotsTxt?: string;
    schemaJson?: string;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Page {
  _id: string;
  siteId: string;
  name: string;
  slug: string;
  pageType: 'home' | 'about' | 'contact' | 'service-list' | 'blog-list' | 'project-detail';
  status: 'draft' | 'published' | 'archived';
  serviceListTitle?: any;
  serviceListDescription?: any;
  serviceListImage?: {
    url: string;
    altText?: string;
  };
  seo: {
    title?: string;
    description?: string;
    keywords: string[];
    ogImageUrl?: string;
    noIndex?: boolean;
  };
  hero?: {
    enabled: boolean;
    title?: any; // Tiptap JSON
    subtitle?: any;
    description?: any;
    primaryCta?: {
      label: string;
      href: string;
    };
    secondaryCta?: {
      label: string;
      href: string;
    };
    mediaItems?: Array<{
      type: 'image' | 'video';
      url: string;
      altText?: string;
    }>;
    media?: {
      type: 'image' | 'video';
      url: string;
      altText?: string;
    };
    /** Optional eyebrow (Tiptap or plain); otherwise derived from site dates + business name */
    eyebrow?: any;
    /** Up to three kinetic lines are taken from the first three paragraph/heading blocks in `title` */
    editorialStats?: Array<{ value: number; suffix?: string; label: string }>;
    featuredSpotlight?: {
      label?: any;
      projectName?: string;
      rating?: number;
      completedLabel?: string;
    };
  };
  aboutSection?: {
    enabled: boolean;
    title?: any;
    description?: any;
    features: Array<{
      icon?: string;
      label: string;
      description?: any;
    }>;
    image?: {
      url: string;
      altText?: string;
    };
  };
  servicesSection?: {
    enabled: boolean;
    title?: any;
    description?: any;
    serviceIds: string[];
  };
  serviceHighlightsSection?: {
    enabled: boolean;
    title?: any;
    description?: any;
    highlights: Array<{
      icon?: string;
      title?: any;
      description?: any;
      price?: string;
      image?: {
        url: string;
        altText?: string;
      };
      featured?: boolean;
      order?: number;
    }>;
    backgroundColor?: string;
    layout?: 'grid' | 'carousel' | 'list';
  };
  gallerySection?: {
    enabled: boolean;
    title?: any;
    description?: any;
    images: Array<{
      url: string;
      altText?: string;
      caption?: any;
    }>;
  };
  testimonialsSection?: {
    enabled: boolean;
    title?: any;
    description?: any;
    testimonials: Array<{
      name: string;
      role?: string;
      company?: string;
      text?: any;
      rating?: number;
      avatar?: string;
      videoUrl?: string;
      videoThumbnailUrl?: string;
    }>;
  };
  faqSection?: {
    enabled: boolean;
    title?: any;
    description?: any;
    items: Array<{
      question?: any;
      answer?: any;
    }>;
  };
  contactSection?: {
    enabled: boolean;
    title?: any;
    description?: any;
    showForm: boolean;
    showMap: boolean;
    showContactInfo: boolean;
  };
  servingAreasSection?: {
    enabled: boolean;
    title?: any;
    description?: any;
    serviceSlug?: string;
  };
  blogSection?: {
    enabled: boolean;
    title?: any;
    description?: any;
    postsToShow: number;
    showExcerpt: boolean;
    showDate: boolean;
  };
  ctaSection?: {
    enabled: boolean;
    title?: any;
    description?: any;
    primaryButton?: {
      label: string;
      href: string;
    };
    backgroundImage?: string;
    backgroundColor?: string;
  };
  whyChooseUsSection?: {
    enabled: boolean;
    title?: any;
    description?: any;
    items?: Array<{
      title?: any;
      description?: any;
    }>;
  };
  companyDetailSection?: {
    enabled: boolean;
    title?: any;
    description?: any;
    details?: Array<{
      title?: any;
      description?: any;
      label?: string;
      value?: any;
      image?: {
        url: string;
        altText?: string;
      };
    }>;
  };
  projectsSection?: {
    enabled?: boolean;
    title?: any;
    description?: any;
    projectIds?: string[];
    projects?: Array<{
      title?: any;
      description?: any;
      image?: {
        url: string;
        altText?: string;
      };
      href?: string;
    }>;
  };
  /** CMS section header (title/description) — paired with `projectsSection` for project cards */
  projectSection?: {
    enabled: boolean;
    title?: any;
    description?: any;
  };
  cta2Section?: {
    enabled: boolean;
    title?: any;
    description?: any;
    primaryButton?: {
      label: string;
      href: string;
    };
    backgroundImage?: string;
    backgroundColor?: string;
  };
  cta3Section?: {
    enabled: boolean;
    title?: any;
    description?: any;
    primaryButton?: {
      label: string;
      href: string;
    };
    backgroundImage?: string;
    backgroundColor?: string;
  };
  cta5Section?: {
    enabled: boolean;
    title?: any;
    description?: any;
    primaryButton?: {
      label: string;
      href: string;
    };
    backgroundImage?: string;
    backgroundColor?: string;
  };
  customSections: Array<{
    _id: string;
    key: string;
    type: 'text' | 'image' | 'video' | 'html';
    title?: any;
    content?: any;
    images: Array<{
      url: string;
      altText?: string;
    }>;
    order: number;
  }>;
  footerOverrides?: {
    enabled: boolean;
    links: Array<{
      label: string;
      href: string;
    }>;
    copyright?: string;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Service {
  _id: string;
  siteId: string;
  name: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  shortDescription?: any; // Tiptap JSON
  description?: any;
  price?: string;
  priceType: 'fixed' | 'range' | 'quote';
  features: any[]; // Tiptap JSON
  category?: string;
  tags: string[];
  thumbnailImage?: {
    url: string;
    altText?: string;
  };
  galleryImages: Array<{
    url: string;
    altText?: string;
    caption?: any;
  }>;
  seo: {
    title?: string;
    description?: string;
    keywords: string[];
    ogImageUrl?: string;
    noIndex?: boolean;
  };
  serviceAreas: Array<{
    city: string;
    region: string;
    description?: string;
  }>;
  cta?: {
    enabled: boolean;
    title?: string;
    description?: string;
    buttonText?: string;
    buttonUrl?: string;
    buttonStyle?: 'primary' | 'secondary' | 'outline';
    image?: {
      url: string;
      altText?: string;
    };
  };
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  contactForm?: {
    enabled: boolean;
  };
  banner?: {
    enabled: boolean;
    backgroundImage?: {
      url: string;
      altText?: string;
    };
    useServiceNameAsTitle?: boolean;
    customTitle?: string;
    overlayOpacity?: number;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface BlogPost {
  _id: string;
  siteId: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: any; // Tiptap JSON
  featuredImage?: {
    url: string;
    altText?: string;
  };
  author: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  categories: string[];
  tags: string[];
  seo: {
    title?: string;
    description?: string;
    keywords: string[];
    ogImageUrl?: string;
  };
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  siteId: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  featuredImage?: {
    url: string;
    altText?: string;
  };
  galleryImages?: Array<{
    url: string;
    altText?: string;
  }>;
  shortDescription?: any;
  description?: any;
  category?: string;
  clientName?: string;
  date?: string;
  location?: string;
  servicesUsed?: string[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImageUrl?: string;
  };
  publishedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceAreaPage {
  _id: string;
  siteId: string;
  serviceId: string;
  city: string;
  region: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  seo: {
    title?: string;
    description?: string;
    keywords: string[];
    ogImageUrl?: string;
    noIndex?: boolean;
  };
  hero?: {
    title?: any;
    subtitle?: any;
    description?: any;
    primaryCta?: {
      label: string;
      href: string;
    };
    secondaryCta?: {
      label: string;
      href: string;
    };
    media?: {
      type: 'image' | 'video';
      url: string;
      altText?: string;
    };
  };
  about?: {
    title?: any;
    description?: any;
    features: Array<{
      icon?: string;
      label: string;
      description?: any;
    }>;
    image?: {
      url: string;
      altText?: string;
    };
  };
  services?: {
    title?: any;
    description?: any;
    services: Array<{
      name: string;
      description?: any;
      price?: string;
      image?: {
        url: string;
        altText?: string;
      };
    }>;
  };
  testimonials?: Array<{
    name: string;
    role?: string;
    company?: string;
    content?: any;
    rating?: number;
    avatar?: string;
  }>;
  faqs?: Array<{
    question?: any;
    answer?: any;
  }>;
  contact?: {
    title?: any;
    description?: any;
    showForm: boolean;
    showMap: boolean;
    showContactInfo: boolean;
  };
  cta?: {
    title?: any;
    description?: any;
    primaryButton?: {
      label: string;
      href: string;
    };
    backgroundImage?: string;
    backgroundColor?: string;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
