import { Inter } from 'next/font/google';

import { AuthProvider } from '@/lib/auth/AuthProvider';
import { QueryProvider } from '@/lib/queries/QueryProvider';
import { ThemeProvider } from '@/lib/theme';

import './global.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  description: 'Track. Analyze. Plan.',
  icons: {
    apple: '/apple-touch-icon.png',
    icon: [
      { url: '/favicon.ico' },
      { sizes: '16x16', type: 'image/png', url: '/favicon-16x16.png' },
      { sizes: '32x32', type: 'image/png', url: '/favicon-32x32.png' },
    ],
  },
  manifest: '/site.webmanifest',
  title: 'RupeeLens',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k='rupeelens-theme',m=localStorage.getItem(k)||'dark',d=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <AuthProvider>
            <QueryProvider>{children}</QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
