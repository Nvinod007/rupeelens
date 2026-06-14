import "./global.css";

import { Inter } from "next/font/google";

import { Providers } from "@/app/providers";
import { AuthSessionWatcher } from "@/features/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  description: "Track. Analyze. Plan.",
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/favicon.ico" },
      { sizes: "16x16", type: "image/png", url: "/favicon-16x16.png" },
      { sizes: "32x32", type: "image/png", url: "/favicon-32x32.png" },
    ],
  },
  manifest: "/site.webmanifest",
  title: "RupeeLens",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html className={inter.variable} lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen font-sans antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <AuthSessionWatcher />
          {children}
        </Providers>
      </body>
    </html>
  );
}
