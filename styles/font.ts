import localFont from "next/font/local";

export const bodyFont = localFont({
  src: [
    {
      path: "../public/fonts/Geomanist-Regular-Webfont/geomanist-regular-webfont.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Geomanist-Book-Webfont/geomanist-book-webfont.woff2",
      weight: "450",
      style: "normal",
    },
    {
      path: "../public/fonts/Geomanist-Medium-Webfont/geomanist-medium-webfont.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Geomanist-Bold-Webfont/geomanist-bold-webfont.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-body",
  display: "swap",
});
