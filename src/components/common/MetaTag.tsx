// components/common/MetaTag.tsx
interface MetaTagProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  jsonLd?: object;
}

export default function MetaTag({ 
  title, 
  description, 
  url, 
  image = "https://walrung.com/og-image.webp", // 기본 공유 이미지 경로
  jsonLd 
}: MetaTagProps) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </>
  );
}