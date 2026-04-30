import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Providers from "../components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Global Meeting Coordinator CONNECT",
  description: "Advanced meeting coordination with Google and Microsoft Calendar integration.",
  icons: {
    icon: "/favicon-v2.ico",
    shortcut: "/favicon-v2.ico",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.variable} ${outfit.variable} antialiased bg-background text-white min-h-screen relative overflow-x-hidden`}>
        <div className="blob w-[400px] h-[400px] bg-indigo-600 -top-24 -left-24"></div>
        <div className="blob w-[350px] h-[350px] bg-purple-600 -bottom-12 -right-12" style={{ animationDelay: '-5s' }}></div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
