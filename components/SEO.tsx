import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url,
  type = 'website'
}) => {
  const siteTitle = "Phayao Asset Hub - ศูนย์รวมบ้านและที่ดินพะเยา";
  const defaultDescription = "ค้นหาบ้าน ที่ดิน หอพัก และอสังหาริมทรัพย์ในจังหวัดพะเยา ราคาถูก ทำเลดี เจ้าของขายเอง";
  const defaultKeywords = "ขายบ้านพะเยา, ที่ดินพะเยา, บ้านมือสอง, หอพักพะเยา, อสังหาพะเยา";
  const siteUrl = window.location.origin;
  const defaultImage = "https://cdn-icons-png.flaticon.com/512/619/619153.png";

  const metaTitle = title ? `${title} | Phayao Asset Hub` : siteTitle;
  const metaDescription = description || defaultDescription;
  const metaKeywords = keywords || defaultKeywords;
  const metaImage = image || defaultImage;
  const metaUrl = url || window.location.href;

  // Schema.org Structured Data for Local Business / Real Estate
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Phayao Asset Hub",
    "image": metaImage,
    "description": metaDescription,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Phayao",
      "addressRegion": "Phayao",
      "addressCountry": "TH"
    },
    "url": siteUrl,
    "priceRange": "฿฿"
  };

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={metaUrl} />
      <meta property="twitter:title" content={metaTitle} />
      <meta property="twitter:description" content={metaDescription} />
      <meta property="twitter:image" content={metaImage} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
};

export default SEO;