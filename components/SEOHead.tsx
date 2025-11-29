import React from 'react';
import { COMPANY_INFO } from '../types';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  canonical?: string;
  noindex?: boolean;
  structuredData?: object;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
  canonical,
  noindex = false,
  structuredData
}) => {
  // Generate full title with brand
  const fullTitle = `${title} | ${COMPANY_INFO.name}`;
  const fullDescription = description.length > 160 ? description.substring(0, 157) + '...' : description;
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const imageUrl = image || '/images/og-image.jpg';
  const allKeywords = [
    ...keywords,
    'הובלות',
    'העברות',
    'אריזה',
    'דירות',
    'משרדים',
    'מקצועי',
    'ישראל',
    COMPANY_INFO.name
  ];

  // Generate structured data for local business
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "MovingCompany",
    "name": COMPANY_INFO.name,
    "description": "חברת הובלות מקצועית בישראל המתמחה בהובלות דירות ומשרדים עם צי מתקדם וטכנולוגיה חכמה",
    "url": typeof window !== 'undefined' ? window.location.origin : '',
    "logo": typeof window !== 'undefined' ? `${window.location.origin}/images/logo.png` : '',
    "image": typeof window !== 'undefined' ? `${window.location.origin}${imageUrl}` : '',
    "telephone": COMPANY_INFO.phone,
    "email": COMPANY_INFO.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": COMPANY_INFO.address,
      "addressCountry": "IL"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 32.0853,
      "longitude": 34.7818
    },
    "areaServed": {
      "@type": "Country",
      "name": "ישראל"
    },
    "serviceType": [
      "הובלות דירות",
      "הובלות משרדים",
      "אריזה מקצועית",
      "שירותי מנוף",
      "אחסון זמני",
      "הובלה בינלאומית"
    ],
    "priceRange": "$$",
    "openingHours": "Mo-Su 00:00-23:59",
    "sameAs": [
      `https://facebook.com/hamiktzoan`,
      `https://instagram.com/hamiktzoan`,
      `https://wa.me/972${COMPANY_INFO.phone.replace(/-/g, '').substring(1)}`
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "שירותי הובלה",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "הובלת דירות",
            "description": "הובלת דירות מלאה עם אריזה מקצועית"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "הובלת משרדים",
            "description": "הובלת משרדים עם מינימום הפרעה לפעילות"
          }
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "150",
      "bestRating": "5",
      "worstRating": "1"
    },
    "founder": {
      "@type": "Person",
      "name": COMPANY_INFO.owner,
      "jobTitle": "בעלים ומנכ״ל"
    }
  };

  // Article schema if it's an article
  const articleSchema = type === 'article' ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": imageUrl,
    "author": {
      "@type": "Person",
      "name": author || COMPANY_INFO.owner
    },
    "publisher": {
      "@type": "Organization",
      "name": COMPANY_INFO.name,
      "logo": {
        "@type": "ImageObject",
        "url": typeof window !== 'undefined' ? `${window.location.origin}/images/logo.png` : ''
      }
    },
    "datePublished": publishedTime,
    "dateModified": modifiedTime || publishedTime,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": currentUrl
    },
    "articleSection": section,
    "keywords": tags.join(', ')
  } : null;

  // Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "בית",
        "item": typeof window !== 'undefined' ? window.location.origin : ''
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": title,
        "item": currentUrl
      }
    ]
  };

  return (
    <>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={allKeywords.join(', ')} />
      <meta name="author" content={COMPANY_INFO.owner} />
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1'} />
      <meta name="googlebot" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
      <meta name="language" content="he-IL" />
      <meta name="geo.region" content="IL" />
      <meta name="geo.country" content="Israel" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      <meta name="revisit-after" content="1 days" />

      {/* Canonical URL */}
      <link rel="canonical" href={canonical || currentUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={typeof window !== 'undefined' ? `${window.location.origin}${imageUrl}` : imageUrl} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={COMPANY_INFO.name} />
      <meta property="og:locale" content="he_IL" />
      <meta property="og:locale:alternate" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={typeof window !== 'undefined' ? `${window.location.origin}${imageUrl}` : imageUrl} />
      <meta name="twitter:site" content="@hamiktzoan" />
      <meta name="twitter:creator" content="@hamiktzoan" />

      {/* Article Specific Meta Tags */}
      {type === 'article' && publishedTime && (
        <>
          <meta property="article:published_time" content={publishedTime} />
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={COMPANY_INFO.name} />
      <meta name="application-name" content={COMPANY_INFO.name} />

      {/* Theme and App Icons */}
      <meta name="theme-color" content="#1e40af" />
      <meta name="msapplication-TileColor" content="#1e40af" />
      <meta name="msapplication-config" content="/browserconfig.xml" />

      {/* Favicon and Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />

      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />

      {/* DNS prefetch for critical resources */}
      <link rel="dns-prefetch" href="//api.telegram.org" />
      <link rel="dns-prefetch" href="//api.emailjs.com" />
      <link rel="dns-prefetch" href="//firestore.googleapis.com" />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema)
        }}
      />

      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleSchema)
          }}
        />
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />

      {/* Custom structured data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}

      {/* Additional SEO enhancements */}
      <meta name="format-detection" content="telephone=yes" />
      <meta name="HandheldFriendly" content="true" />
      <meta name="MobileOptimized" content="width" />

      {/* Search engine specific */}
      <meta name="google-site-verification" content="your-google-verification-code" />
      <meta name="yandex-verification" content="your-yandex-verification-code" />
      <meta name="msvalidate.01" content="your-bing-verification-code" />

      {/* Social media specific */}
      <meta property="fb:app_id" content="your-facebook-app-id" />
      <meta property="instagram:creator" content="@hamiktzoan" />

      {/* E-commerce specific (if applicable) */}
      <meta property="product:price:amount" content="0" />
      <meta property="product:price:currency" content="ILS" />

      {/* Accessibility */}
      <meta name="accessibility-features" content="high-contrast, large-text, keyboard-nav, screen-reader" />
      <meta name="accessibility-hazards" content="none" />
      <meta name="accessibility-summary" content="האתר נגיש עם תמיכה בקוראי מסך, ניווט מקלדת ותצוגה ברורה" />
    </>
  );
};

export default SEOHead;