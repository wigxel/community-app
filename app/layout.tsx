import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { PropsWithChildren } from "react";
import { getToken } from "~/lib/auth-server";
import { bodyFont } from "~/styles/font";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: {
    default: "Reveer",
    template: "%s | Reveer",
  },
  description: "Connect Local Businesses with Students for Internship",
};

export default async function RootLayout({ children }: PropsWithChildren) {
  const token = await getToken().catch(() => null);

  return (
    <NuqsAdapter>
      <Providers initialToken={token}>
        <html lang="en" className="dark">
          <body
            className={`${bodyFont.variable} flex min-h-screen flex-col font-sans antialiased`}
          >
            {children}
          </body>
        </html>
      </Providers>
    </NuqsAdapter>
  );
}
