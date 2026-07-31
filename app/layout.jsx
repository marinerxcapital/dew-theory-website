import './globals.css';
import { Bodoni_Moda, Jost, Karla } from 'next/font/google';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import MotionRoot from '@/components/MotionRoot';
import MotionBackground from '@/components/MotionBackground';
import AmbientField from '@/components/AmbientField';
import AidesignerRuntime from '@/components/AidesignerRuntime';
import ScrollTop from '@/components/ScrollTop';
import { CartProvider } from '@/components/CartProvider';

const display = Bodoni_Moda({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '500'],
  variable: '--font-display',
  display: 'swap'
});
const label = Jost({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-label',
  display: 'swap'
});
const body = Karla({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-body',
  display: 'swap'
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dewtheoryco.com';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Dew Theory — Skin Care',
    template: '%s · Dew Theory'
  },
  description:
    'Skin Script formulations and in-studio facials with licensed aesthetician Emily Mitchener.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Dew Theory',
    title: 'Dew Theory — Skin Care',
    description:
      'Skin Script formulations and in-studio facials with licensed aesthetician Emily Mitchener.',
    // Relative URLs resolve against metadataBase → absolute OG tags in production.
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'Dew Theory' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dew Theory — Skin Care',
    description:
      'Skin Script formulations and in-studio facials with licensed aesthetician Emily Mitchener.',
    images: ['/logo.png']
  },
  icons: {
    icon: '/logo-mark.webp'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${label.variable} ${body.variable}`}>
      <body className="relative bg-pearl font-body font-light text-charcoal antialiased">
        <CartProvider>
          <AidesignerRuntime />
          <MotionBackground />
          <AmbientField />
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
