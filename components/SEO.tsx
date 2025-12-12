import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  price?: number;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url,
  type = 'website',
  price
}) => {
  const location = useLocation();
  // Parse URL parameters for "Instant Metadata" (Optimization for CSR sharing)
  const searchParams = new URLSearchParams(location.search);
  
  const siteTitle = "Phayao Asset Hub - ศูนย์รวมบ้านและที่ดินพะเยา";
  const defaultDescription = "ค้นหาบ้าน ที่ดิน หอพัก และอสังหาริมทรัพย์ในจังหวัดพะเยา ราคาถูก ทำเลดี เจ้าของขายเอง";
  const defaultKeywords = "ขายบ้านพะเยา, ที่ดินพะเยา, บ้านมือสอง, หอพักพะเยา, อสังหาพะเยา";
  const siteUrl = window.location.origin;
  const defaultImage = "https://cdn-icons-png.flaticon.com/512/3655/3655589.png";

  // Priority: 1. URL Params (Fastest for bots) -> 2. Props (Real data) -> 3. Defaults
  const metaTitle = searchParams.get('og_title') || (title ? `${title} | Phayao Asset Hub` : siteTitle);
  const metaDescription = searchParams.get('og_desc') || description || defaultDescription;
  const metaImage = searchParams.get('og_image') || image || defaultImage;
  const metaUrl = url || window.location.href;
  
  const rawPrice = searchParams.get('og_price');
  const metaPrice = rawPrice ? parseFloat(rawPrice) : price;
  
  // If price exists, treat as product
  const metaType = metaPrice ? 'product' : type;

  // Schema.org Structured Data
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
    ...(metaPrice && {
      "offers": {
        "@type": "Offer",
        "price": metaPrice,
        "priceCurrency": "THB",
        "availability": "https://schema.org/InStock"
      }
    })
  };

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:site_name" content="Phayao Asset Hub" />
      <meta property="og:type" content={metaType} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={metaTitle} />
      
      {/* Product Specific Tags */}
      {metaPrice && (
        <>
          <meta property="product:price:amount" content={metaPrice.toString()} />
          <meta property="product:price:currency" content="THB" />
          <meta property="og:price:amount" content={metaPrice.toString()} />
          <meta property="og:price:currency" content="THB" />
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={metaUrl} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
};

export default SEO;