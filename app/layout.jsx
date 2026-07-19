import './globals.css';
import { Bodoni_Moda, Jost, Karla } from 'next/font/google';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import MotionRoot from '@/components/MotionRoot';
import AmbientField from '@/components/AmbientField';
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

export const metadata = {
  title: 'Dew Theory — Skin Care',
  description:
    'Skin Script formulations and in-studio facials with licensed aesthetician Emily Mitchener.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${label.variable} ${body.variable}`}>
      <body className="relative bg-pearl font-body font-light text-charcoal antialiased">
        <CartProvider>
          <AmbientField />
          <MotionRoot />
          <div className="relative z-[1]">
            <Nav />
            <main id="main">{children}</main>
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
