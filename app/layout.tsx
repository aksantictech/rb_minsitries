import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Roy Bondo Ministries",
  description:
    "Application officielle du ministère pastoral Roy Bondo Ministries.",
  applicationName: "Roy Bondo Ministries",
  manifest: "/manifest.json",
  icons: {
    icon: [
      {
        url: "/images/logo_rb.png",
        type: "image/png",
      },
    ],
    shortcut: "/images/logo_rb.png",
    apple: "/images/logo_rb.png",
  },
  appleWebApp: {
    capable: true,
    title: "Roy Bondo Ministries",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}