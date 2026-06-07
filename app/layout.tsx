import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "الحاسوب والإذاعة | منصة مراجعة",
  description: "منصة مراجعة موثقة تعتمد على ملفات PDF المحلية لمادة الحاسوب والإذاعة.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div className="app-shell">
            <SiteHeader />
            <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-8">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
