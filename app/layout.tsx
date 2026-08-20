import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { bodyFont } from "~/styles/font";
import { getToken } from "~/lib/auth-server";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: {
    default: "Reveer",
    template: "%s | Reveer",
  },
  description: "Connect Local Businesses with Students for Internship",
};

export default async function RootLayout({ children }) {
  const token = await getToken();

  return (
    <NuqsAdapter>
      <Providers initialToken={token}>
        <html lang="en" className="dark">
          <body className={`${bodyFont.variable} font-sans antialiased flex flex-col min-h-screen`}>
            {children}
          </body>
        </html>
      </Providers>
    </NuqsAdapter>
  );
}
