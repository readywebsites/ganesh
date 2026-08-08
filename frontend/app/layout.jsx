import '@/styles/globals.css';
import { Cinzel_Decorative, Montserrat, Playfair_Display, Noto_Sans_Gujarati } from 'next/font/google';
import CustomCursor from '@/components/CustomCursor';
import Loader from '@/components/Loader';

const cinzel = Cinzel_Decorative({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-heading',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-subheading',
  display: 'swap',
});

const notoGujarati = Noto_Sans_Gujarati({
  subsets: ['gujarati'],
  weight: ['400', '700'],
  variable: '--font-gujarati',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://suratchagaurinandan.com'),
  title: 'Surat Cha Gaurinandan Ganesh Mahotsav 2026 | Official 3D Temple Experience',
  description:
    'Surat Cha Gaurinandan Ganesh Mahotsav 2026 Official Digital Portal. Experience 3D WebGL Temple Darshan, Live Evening Aarti, Bhakta Membership registration, and event schedule at Nandanvan 2, Vesu, Surat.',
  keywords: [
    'Surat Cha Gaurinandan',
    'Ganesh Mahotsav 2026',
    'Vesu Surat Ganesh',
    'Bappa Darshan',
    'Ganesh Utsav Surat',
    '3D Ganesh Temple',
  ],
  authors: [{ name: 'Surat Cha Gaurinandan Mahotsav Trust' }],
  robots: 'index, follow, max-image-preview:large',
  openGraph: {
    type: 'website',
    locale: 'gu_IN',
    title: 'Surat Cha Gaurinandan Ganesh Mahotsav 2026',
    description:
      'Official 3D Temple Experience, Live Aarti, and Bhakta Membership at Nandanvan 2, Vesu, Surat.',
    url: 'https://suratchagaurinandan.com/',
    siteName: 'Surat Cha Gaurinandan',
    images: [
      {
        url: '/images/instagram_story.webp',
        width: 1200,
        height: 630,
        alt: 'Surat Cha Gaurinandan Mahotsav',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Surat Cha Gaurinandan Ganesh Mahotsav 2026',
    description:
      'Official 3D Temple Experience, Live Aarti, and Bhakta Membership at Nandanvan 2, Vesu, Surat.',
    images: ['/images/instagram_story.webp'],
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Surat Cha Gaurinandan Ganesh Mahotsav 2026',
    description:
      'Annual Ganesh Mahotsav Celebrations featuring 3D Temple Darshan, Live Aarti, and Bhandara Sewa.',
    startDate: '2026-09-14T06:00:00+05:30',
    endDate: '2026-09-24T22:00:00+05:30',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'Surat Cha Gaurinandan Mandap',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Nandanvan 2, Vesu',
        addressLocality: 'Surat',
        addressRegion: 'Gujarat',
        postalCode: '395007',
        addressCountry: 'IN',
      },
    },
    image: ['/images/ganesh_idol_front.webp', '/images/instagram_story.webp'],
    organizer: {
      '@type': 'Organization',
      name: 'Surat Cha Gaurinandan Mahotsav Trust',
      url: 'https://suratchagaurinandan.com/',
    },
  };

  return (
    <html lang="gu" dir="ltr" className={`${cinzel.variable} ${montserrat.variable} ${playfair.variable} ${notoGujarati.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <a href="#home" className="skip-to-content">
          Skip to main content
        </a>
        <Loader />
        <CustomCursor />
        <div className="noise-overlay" />
        <div className="bg-ambient-glow" />
        <div className="bg-ambient-saffron" />
        {children}
      </body>
    </html>
  );
}

