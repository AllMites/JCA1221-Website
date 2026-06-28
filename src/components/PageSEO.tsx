import { Helmet } from 'react-helmet-async'

const BASE_URL = 'https://jca1221.com'
const DEFAULT_IMAGE = `${BASE_URL}/images/og-preview.jpg`
const SITE_NAME = 'JCA 1221 Holdings'

interface PageSEOProps {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  noIndex?: boolean
}

export function PageSEO({ title, description, canonical, ogImage = DEFAULT_IMAGE, noIndex }: PageSEOProps) {
  const canonicalUrl = canonical ?? (typeof window !== 'undefined' ? window.location.href.split('?')[0] : BASE_URL)

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  )
}
