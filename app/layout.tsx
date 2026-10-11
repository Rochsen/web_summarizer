import type { Metadata } from "next";
import { Noto_Sans_SC, Geist_Mono } from "next/font/google";
import "./globals.css";

const notoSansSC = Noto_Sans_SC({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "网页总结",
  description: "输入网址，自动提取内容并用 AI 生成中文概要",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${notoSansSC.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
