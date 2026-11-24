import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/context/session-context";
import { Header } from "@/components/header";
import { siteConfig } from "@/config/site";

// cyrillic-ext нужен для кыргызских букв Ү, Ө, Ң
const inter = Inter({ subsets: ["latin", "cyrillic", "cyrillic-ext"], variable: "--font-inter" });
const lora = Lora({ subsets: ["latin", "cyrillic", "cyrillic-ext"], variable: "--font-lora" });

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
    <html lang="ru" className={`${inter.variable} ${lora.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <SessionProvider>
          <Header />
          <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:py-16">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
