import { Footer } from "~/components/layouts/footer";
import { Header } from "~/components/layouts/header";
export type PublicLayoutProps = {
  children: React.ReactNode;
};
export default function PublicLayout(props: PublicLayoutProps) {
  const { children } = props;

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
