"use client";
import { Text } from "@hyperbridge/ui";
import Link from "next/link";
import { Container } from "~/components/layouts/container";
import { Button } from "~/components/ui/button";

export default function JobsPage() {
  return (
    <Container className="flex min-h-svh items-center justify-center py-20">
      <div className="flex max-w-lg flex-col gap-4">
        <h1 className="text-h2 md:text-h3 leading-[2ex] font-medium text-balance">
          Job posting is coming soon
        </h1>
        <Text variant="p" className="text-muted-foreground mb-6 text-pretty">
          Expect to see local opportunities from real companies who are actively
          hiring. We help reduce the noise so you can focus on what matters.
          Whether it's a gig, internship, part-time, or full-time job. We'll
          have something for you.
        </Text>
        <div>
          <Link href={"/auth/sign-up"}>
            <Button className="cursor-pointer">Notify me when ready</Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
