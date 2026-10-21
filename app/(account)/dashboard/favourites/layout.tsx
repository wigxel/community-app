import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favourites",
};

export type FavouritesLayoutProps = {
  children: React.ReactNode;
};

export default function FavouritesLayout(props: FavouritesLayoutProps) {
  const { children } = props;

  return children;
}
