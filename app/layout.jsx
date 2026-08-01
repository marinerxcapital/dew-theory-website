import './globals.css';
import { Bodoni_Moda, Jost, Karla } from 'next/font/google';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import MotionRoot from '@/components/MotionRoot';
import MotionBackground from '@/components/MotionBackground';
import ScrollTop from '@/components/ScrollTop';
import JsonLd from '@/components/JsonLd';
import { CartProvider } from '@/components/CartProvider';

const display = Bodoni_Moda({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400'],
  variable: '--font-display',
  display: 'swap',
  preload: true,
  adjustFontFallback: true
});
const label = Jost({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-label',
  display: 'swap',
  preload: true,
  adjustFontFallback: true
});
const body = Karla({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-body',
  display: 'swap',
  preload: true,
  adjustFontFallback: true
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dewtheoryco.com';

const SITE_DESCRIPTION =
  'Professional Skin Script skincare and in-studio facials with licensed aesthetician Emily Mitchener. Shop clinical actives, book treatments, or book a virtual consultation.';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F5F2' },
    { media: '(prefers-color-scheme: dark)', color: '#1F2128' }
  ],
  viewportFit: 'cover',
  colorScheme: 'light'
};

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Dew Theory — Clinical Skin Care & Facials',
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
    'facials',
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
    title: 'Dew Theory — Clinical Skin Care & Facials',
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Dew Theory — clinical skin care'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dew Theory — Clinical Skin Care & Facials',
    description: SITE_DESCRIPTION,
    images: ['/logo.png']
  },
  icons: {
    icon: [{ url: '/logo-mark.webp', type: 'image/webp' }],
    apple: [{ url: '/logo-mark.webp', type: 'image/webp' }]
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
        url: `${siteUrl}/logo.png`
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
      inLanguage: 'en-US'
    },
    {
      '@type': 'BeautySalon',
      '@id': `${siteUrl}/#salon`,
      name: 'Dew Theory',
      url: siteUrl,
      description:
        'Licensed aesthetician Emily Mitchener — in-studio facials and Skin Script professional skincare.',
      image: `${siteUrl}/logo.png`,
      priceRange: '$$',
      makesOffer: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'In-studio facial',
            url: `${siteUrl}/book`
          }
        },
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
    <html lang="en" className={`${display.variable} ${label.variable} ${body.variable}`}>
      <body className="relative bg-pearl font-body font-normal text-charcoal antialiased">
        <JsonLd data={orgLd} />
        <CartProvider>
          <MotionBackground />
          <MotionRoot />
          <div className="relative z-[1]">
            <Nav />
            <main id="main" tabIndex={-1}>
              {children}
            </main>
            <Footer />
            <ScrollTop />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
