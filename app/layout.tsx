import type { Metadata } from "next";
import { Noto_Sans_SC, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import AntdProvider from "@/components/AntdProvider";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

const notoSansSC = Noto_Sans_SC({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "简阅 - 网页总结",
  description: "输入网址，自动提取内容并用 AI 生成简洁中文概要",
  icons: {
    icon: "/logo-mark.jpg",
    apple: "/logo-mark.jpg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${notoSansSC.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Suspense 包裹，避免 AntdRegistry 内部随机值触发预渲染报错 */}
        <Suspense fallback={null}>
          <AntdProvider>
            <div className="page-shell">
              <SiteHeader />
              <div className="page-main">{children}</div>
              <SiteFooter />
            </div>
          </AntdProvider>
        </Suspense>
      </body>
    </html>
  );
}
