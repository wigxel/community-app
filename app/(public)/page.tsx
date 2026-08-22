"use client";

// @ts-expect-error No declaration file yet
import { Type } from "@wigxel/react-components/lib/typography";
import { ArrowRight } from "lucide-react";
import { Balancer } from "react-wrap-balancer";
import { Container } from "~/components/layouts/container";
import { Button } from "~/components/ui/button";
import PublicProjectsCatalog from "../_components/ProjectFeed";

export default function Home() {
  return (
    <div className="container mx-auto">
      {/* Hero section */}
      <Container
        level="max"
        className="min-h-[40svh] flex items-start gap-8 py-32"
      >
        <div className="flex-1 lg:pl-12">
          <div className="flex flex-col flex-1 py-12 gap-4">
            <h1 className="text-6xl text-balance font-bold tracking-tighter">
              <Balancer>
                Show your best works <br /> in a{" "}
                <span className="text-accent-foreground">
                  <Type
                    values={["professional", "best", "creative"]}
                    speed={100}
                  />
                </span>{" "}
                way
              </Balancer>
            </h1>

            <p className="text-balance text-base text-muted-foreground max-w-md">
              Browse real design and development work from local talents. We
              make it easy to find the right locals for the jobs
            </p>

            <div className="flex mt-8">
              <Button size="lg">
                Get Started <ArrowRight />
              </Button>
            </div>
          </div>
        </div>

        <div className="aspect-video rounded-lg bg-gray-800 flex-1"></div>
      </Container>

      {/* Project Catalog */}
      <PublicProjectsCatalog />
    </div>
  );
}
