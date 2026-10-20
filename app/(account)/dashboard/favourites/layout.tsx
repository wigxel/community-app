import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favourites",
};

export default function FavouritesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
