"use client";
import { Text } from "@hyperbridge/ui";
import Link from "next/link";
import Balancer from "react-wrap-balancer";
import { Container } from "~/components/layouts/container";
import { Button } from "~/components/ui/button";

export default function MentorPage() {
  return (
    <Container
      className="flex min-h-svh items-center justify-center py-20"
      level={"max"}
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-12">
        <Text variant="h1" className="text-h3 md:text-h1 font-thin">
          <Balancer>
            Knowledge sharing is crucial for societal advancement.{" "}
            <span className="text-brand-primary">We are bridging the gap</span>
          </Balancer>
        </Text>

        <div className="flex flex-col gap-8 *:flex-1 md:flex-row">
          <div className="flex flex-col gap-4">
            <Text variant="h4">For Mentors</Text>
            <p className="text-muted-foreground max-w-sm text-balance">
              Work with us to turn your hard-earned scars into shortcuts for the
              next generation. Be a part of building journey today.
            </p>

            <Link href="https://chat.whatsapp.com/KDQZCN58c92Fi1AGRXMrOu?mode=gi_t">
              <Button>Join community</Button>
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            <Text variant="h4">For Mentees</Text>
            <p className="text-muted-foreground max-w-sm">
              Right now, you might feel like you’re piecing your career together
              from random threads.
              <br />
              <br />
              Here, you learn directly from people who’ve already done what
              you’re trying to do. 1-on-1, on real projects, with real feedback.
              <br />
              <br />
              Every session is a small leap forward: fewer mistakes, smarter
              decisions, and a clearer path from where you are to where you want
              to be.
            </p>
            <Link href="/auth/sign-up">
              <Button>Join the waitlist</Button>
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}
