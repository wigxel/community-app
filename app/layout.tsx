import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Header } from "~/components/layouts/header";
import { getToken } from "~/lib/auth-server";
import "./globals.css";
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
        <html lang="en" className="dark">
          <body className={`${baseFont.variable} antialiased`}>
            <Header />
            {children}
          </body>
        </html>
      </Providers>
    </NuqsAdapter>
  );
}
