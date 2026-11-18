import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/context/session-context";
import { Header } from "@/components/header";
import { siteConfig } from "@/config/site";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin", "cyrillic"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: siteConfig.brand,
  description: "Зарегистрируйтесь, пройдите тест и сразу получите результат.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${playfair.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <SessionProvider>
          <Header />
          <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:py-16">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
