"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex h-[calc(100lvh-75px)] items-center justify-center">
      <div className="flex flex-col items-center gap-6 px-4 text-center">
        <Image
          src={"/404.svg"}
          alt={"404"}
          width={300}
          height={300}
          className="object-cover object-center"
        />

        <h2 className="text-3xl font-semibold text-slate-50">Page Not Found</h2>

        <p className="max-w-md text-slate-50">
          Sorry, we couldn't find the page you're looking for. It might have
          been renamed or deleted.
        </p>

        <div className="flex justify-center gap-4">
          <Button
            onClick={() => router.push("/")}
            className="bg-blue-500 text-white hover:bg-blue-700"
          >
            Go Home
          </Button>

          <Button onClick={() => router.push("/catalog")} variant={"secondary"}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
