import React, { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'הובלות המקצוען - שירותי הובלה מקצועיים',
  description = 'חברת הובלות המקצוען - שירותי אריזה, הובלה ואחסנה בסטנדרטים בינלאומיים. צי מתקדם, צוות מקצועי וטכנולוגיה חכמה להובלות בטוחות ומהירות.',
  keywords = ['הובלות', 'אריזה', 'העברות', 'משרדים', 'דירות', 'מקצועי', 'ישראל', 'דדי'],
  image = '/images/og-image.jpg',
  url = typeof window !== 'undefined' ? window.location.href : 'https://hamiktzoan.com',
  type = 'website',
  author = 'הובלות המקצוען',
  publishedTime,
  modifiedTime
}) => {
  const siteName = 'הובלות המקצוען';
  const twitterHandle = '@hamiktzoan';

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;

      if (element) {
        element.content = content;
      } else {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        element.content = content;
        document.head.appendChild(element);
      }
    };

    // Basic Meta Tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords.join(', '));
    updateMetaTag('author', author);
    updateMetaTag('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    updateMetaTag('language', 'Hebrew');

    // Open Graph Meta Tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', siteName, true);
    updateMetaTag('og:locale', 'he_IL', true);

    // Twitter Card Meta Tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:site', twitterHandle);

    // Article specific tags
    if (type === 'article' && publishedTime) {
      updateMetaTag('article:published_time', publishedTime, true);
    }
    if (type === 'article' && modifiedTime) {
      updateMetaTag('article:modified_time', modifiedTime, true);
    }
    if (type === 'article') {
      updateMetaTag('article:author', author, true);
    }

    // Additional SEO tags
    updateMetaTag('theme-color', '#3B82F6');
    updateMetaTag('msapplication-TileColor', '#3B82F6');
    updateMetaTag('application-name', siteName);

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonicalLink) {
      canonicalLink.href = url;
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      canonicalLink.href = url;
      document.head.appendChild(canonicalLink);
    }

    // Structured Data
    const structuredData = [
      {
        "@context": "https://schema.org",
        "@type": "MovingCompany",
        "name": "הובלות המקצוען",
        "description": description,
        "url": "https://hamiktzoan.com",
        "logo": "/images/logo.png",
        "image": image,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "אחוזה 131",
          "addressLocality": "רעננה",
          "addressCountry": "IL"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+972-50-535-0148",
          "contactType": "customer service",
          "availableLanguage": "Hebrew"
        },
        "founder": {
          "@type": "Person",
          "name": "דדי",
          "jobTitle": "מנכ״ל ובעלים"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "הובלות המקצוען",
        "image": image,
        "telephone": "+972-50-535-0148",
        "email": "hovalotdedi@gmail.com",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "אחוזה 131",
          "addressLocality": "רעננה",
          "addressRegion": "מרכז",
          "addressCountry": "IL"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 32.0853,
          "longitude": 34.8579
        },
        "openingHours": "Mo-Su 00:00-23:59",
        "priceRange": "$$"
      }
    ];

    // Remove existing structured data
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    // Add new structured data
    structuredData.forEach(data => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    });

  }, [title, description, keywords, image, url, type, author, publishedTime, modifiedTime]);

  return null; // This component doesn't render anything
};

export default SEOHead;