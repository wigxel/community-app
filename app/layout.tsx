import { Inter } from "next/font/google";
import Link from "next/link";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";
import type { Metadata } from "next";
import { getToken } from "~/lib/auth-server";
import { Toaster } from "sonner";
import NavAuth from "./_components/NavAuth";
import Providers from "./providers";

const baseFont = Inter({
  variable: "--font-josefin-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Community App",
  description: "Connect Local Businesses with Students for Internship",
};

export default async function RootLayout({ children }) {
  const token = await getToken();

  return (
    <NuqsAdapter>
      <Providers initialToken={token}>
        <html lang="en">
          <body className={`${baseFont.variable} antialiased`}>
            <nav className="flex gap-2 justify-end items-center h-18 px-5">
              <Link href="/">Home</Link>
              <Link href="/catalog">Catalog</Link>
              <NavAuth />
            </nav>
            {children}
          </body>
        </html>
        <Toaster position="top-right" />
      </Providers>
    </NuqsAdapter>
  );
}
