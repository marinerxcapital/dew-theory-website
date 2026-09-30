import './globals.css';
import { Figtree, Newsreader } from 'next/font/google';
import localFont from 'next/font/local';
import { PAGE_GREEN } from '@/lib/design-tokens';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import MotionBackground from '@/components/MotionBackground';
import AmbientGlow from '@/components/AmbientGlow';
import CardTilt from '@/components/CardTilt';
import ScrollTop from '@/components/ScrollTop';
import Concierge from '@/components/Concierge';
import JsonLd from '@/components/JsonLd';
import { CartProvider } from '@/components/CartProvider';

/** Green display, UI and journal fonts; original roman glyphs, swap loading. */
const display = localFont({
  src: './fonts/Fraunces-SOFT100-variable.woff2',
  weight: '100 900',
  style: 'normal',
  variable: '--font-display',
  display: 'swap',
  preload: true,
  adjustFontFallback: 'Times New Roman'
});
const body = Figtree({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  preload: true,
  adjustFontFallback: true
});

const journal = Newsreader({ subsets: ['latin'], style: 'normal', variable: '--font-journal', display: 'swap', preload: false });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dewtheoryco.com';

const SITE_DESCRIPTION =
  'Professional Skin Script skincare with licensed aesthetician Emily Mitchener. Shop clinical actives and book a virtual consultation.';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: PAGE_GREEN },
    { media: '(prefers-color-scheme: dark)', color: PAGE_GREEN }
  ],
  viewportFit: 'cover',
  colorScheme: 'light'
};

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Dew Theory — Professional Skin Script Skincare',
    template: '%s · Dew Theory'
  },
  description: SITE_DESCRIPTION,
  applicationName: 'Dew Theory',
  authors: [{ name: 'Emily Mitchener', url: siteUrl }],
  creator: 'Dew Theory',
  publisher: 'Dew Theory',
  category: 'beauty',
  keywords: [
    'Dew Theory',
    'Skin Script',
    'aesthetician',
    'Emily Mitchener',
    'professional skincare',
    'virtual skin consultation',
    'clinical skincare'
  ],
  alternates: {
    canonical: '/'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Dew Theory',
    title: 'Dew Theory — Professional Skin Script Skincare',
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/og-green.png',
        width: 1200,
        height: 630,
        alt: 'Dew Theory — clinical skin care'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dew Theory — Professional Skin Script Skincare',
    description: SITE_DESCRIPTION,
    images: ['/og-green.png']
  },
  icons: {
    icon: [{ url: '/favicon-green.png', type: 'image/png' }],
    apple: [{ url: '/apple-touch-icon-green.png', type: 'image/png' }]
  },
  manifest: '/site.webmanifest',
  formatDetection: {
    telephone: false,
    email: false,
    address: false
  }
};

const orgLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Dew Theory',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo-dewtheory-glass-wordmark-transparent.png`
      },
      description: SITE_DESCRIPTION
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Dew Theory',
      description: SITE_DESCRIPTION,
      publisher: { '@id': `${siteUrl}/#organization` },
      inLanguage: 'en-US',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/shop?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    },
    {
      '@type': 'BeautySalon',
      '@id': `${siteUrl}/#salon`,
      name: 'Dew Theory',
      url: siteUrl,
      description:
        'Licensed aesthetician Emily Mitchener — Skin Script professional skincare and virtual skin consultations.',
      image: `${siteUrl}/logo-dewtheory-glass-wordmark-transparent.png`,
      priceRange: '$$',
      makesOffer: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Virtual skin consultation',
            url: `${siteUrl}/virtual-consultation`
          }
        }
      ]
    }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${journal.variable}`}>
      <body className="relative bg-ivory font-body font-normal text-forest antialiased">
        <JsonLd data={orgLd} />
        <CartProvider>
          <MotionBackground />
          <AmbientGlow />
          <CardTilt />
          <div className="relative z-[1]">
            <Nav />
            <main id="main" tabIndex={-1} className="min-h-[50vh]">
              {children}
            </main>
            <Footer />
            <ScrollTop />
            <Concierge />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
