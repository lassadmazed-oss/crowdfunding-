import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Noto_Kufi_Arabic, Noto_Sans_Arabic } from "next/font/google";
import { InstallHint } from "@/components/install-hint";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { LOCALES, LOCALE_INFO } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";
import "../globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], axes: ["opsz"] });
const arabic = Noto_Sans_Arabic({ variable: "--font-arabic", subsets: ["arabic"] });
const arabicDisplay = Noto_Kufi_Arabic({ variable: "--font-arabic-display", subsets: ["arabic"] });

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

// viewport-fit=cover lets the installed app draw under the status bar and home indicator;
// the .safe-* classes in globals.css keep the content itself clear of them.
export const viewport: Viewport = {
  themeColor: "#0e2b4c",
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return {
    title: { default: t.meta.title, template: t.meta.titleTemplate },
    description: t.meta.description,
    applicationName: "Lebna",
    appleWebApp: { capable: true, title: "Lebna", statusBarStyle: "black-translucent" },
    formatDetection: { telephone: false },
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(LOCALES.map((code) => [code, `/${code}`])),
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  const fonts = [inter, fraunces, arabic, arabicDisplay].map((font) => font.variable).join(" ");

  return (
    <html lang={locale} dir={LOCALE_INFO[locale].dir} className={`${fonts} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans safe-x">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <InstallHint t={t.install} />
      </body>
    </html>
  );
}
