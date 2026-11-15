import type { Metadata } from 'next';

export const SITE_URL = 'https://qrgenerato.com';
export const SITE_NAME = 'QR Generato';

/**
 * Per-route metadata with a self-referencing canonical URL and matching
 * Open Graph / Twitter tags. Every route renders the same HomePage component,
 * so a unique canonical per path is what stops Google treating them as duplicates.
 */
export function pageMetadata(path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      url: path,
      siteName: SITE_NAME,
      title,
      description,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}
