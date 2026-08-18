import type { Metadata } from "next";
import "./globals.css";

const title = "SaigeAPPs — SaigeVision 网页工具集合";
const description =
  "SaigeAPPs 收集用于 SaigeVision 项目导出、版本转换与标注质检的轻量网页工具。";

export const metadata: Metadata = {
  metadataBase: new URL("https://saige-apps-beta.saigeai.com"),
  title,
  description,
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: "/",
    images: [
      { url: "/og-v2.png", width: 1680, height: 945, alt: "SaigeAPPs" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-v2.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
