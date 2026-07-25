import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';

export const metadata: Metadata = {
  metadataBase: new URL('https://drbongobong.com.ar'),
  title: {
    default: 'Dr Bongo Bong — Radio, Streaming y Cultura',
    template: '%s — Dr Bongo Bong',
  },
  description:
    'El latido del mundo. Radio en vivo, streaming cultural y artículos sobre música, cultura y exploración de la mente humana.',
  keywords: ['música', 'cultura', 'rock', 'underground', 'radio en vivo', 'streaming', 'cine', 'arte'],
  authors: [{ name: 'Dr Bongo Bong' }],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://drbongobong.com.ar',
    siteName: 'Dr Bongo Bong',
    title: 'Dr Bongo Bong — Radio, Streaming y Cultura',
    description: 'El latido del mundo. Música, cultura, radio en vivo y streaming.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dr Bongo Bong — Radio, Streaming y Cultura',
    description: 'El latido del mundo. Música, cultura, radio en vivo y streaming.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-bg text-white antialiased selection:bg-accent selection:text-white">
        <div className="accent-line" />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <ScrollReveal />
      </body>
    </html>
  );
}
