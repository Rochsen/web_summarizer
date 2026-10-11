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
      data-theme="light"
      className={`${notoSansSC.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* 尽早应用主题，减少首屏闪烁 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('jianyu-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t;}}catch(e){}})();`,
          }}
        />
      </head>
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
