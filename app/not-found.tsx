import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function NotFound() {
  return (
    <div className="text-foreground flex min-h-[80vh] items-center justify-center">
      <div className="mx-auto flex max-w-sm flex-col justify-center gap-12 py-32 text-center">
        <hgroup className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold md:text-8xl">Wahala!</h1>
          <p className="text-muted-foreground text-center text-xl">
            404 — NOT FOUND
          </p>
        </hgroup>

        <div>
          <p className="text-start text-balance">
            We couldn't find what you're looking for. It may have been
            unpublished, deleted or never existed.
          </p>

          <Link href="/" className="mt-8 flex w-full gap-2">
            <Button type="button" size={"lg"} className="w-full">
              <ArrowLeftIcon /> Go home
            </Button>
            {/*<Button type="button" variant={"link"}>
            See Jobs
          </Button>*/}
          </Link>
        </div>
      </div>
    </div>
  );
}
