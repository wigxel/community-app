"use client";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { Doc } from "~/convex/_generated/dataModel";
import {
  formatDate,
  RATE_LOCK_MS,
  rateBand,
  rateUnlocksAt,
} from "~/lib/rate-band";
import { RateWizardDialog } from "./rate-wizard";

interface RateSectionProps {
  rate?: Doc<"profile">["rate"];
}

const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

function unitSummary(rate: NonNullable<Doc<"profile">["rate"]>): string {
  const perUnit = formatNaira(rate.rawAmount ?? rate.amount);
  switch (rate.unit) {
    case "hour":
      return `${perUnit}/hour`;
    case "day":
      return `${perUnit}/day`;
    case "week":
      return `${perUnit}/week`;
    case "project":
      return rate.projectDays
        ? `${perUnit} per project (${rate.projectDays} days)`
        : `${perUnit} per project`;
    default:
      return `${perUnit}/month`;
  }
}

export function RateSection({ rate }: RateSectionProps) {
  const isLocked = Boolean(
    rate?.confirmedAt && Date.now() - rate.confirmedAt < RATE_LOCK_MS,
  );
  const unlocksAt = rate?.confirmedAt ? rateUnlocksAt(rate.confirmedAt) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate &amp; placement</CardTitle>
        <CardDescription>
          Help the right clients find you at the right budget.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rate ? (
          <div className="space-y-1">
            <p className="text-2xl font-semibold">{rateBand(rate.amount)}</p>
            <p className="text-base">
              ≈ {formatNaira(rate.amount)}/month&nbsp;
              <span className="text-muted-foreground">
                · {unitSummary(rate)}
              </span>
            </p>
          </div>
        ) : (
          <p className="text-base">
            Answer a few questions about how you price your work and we&apos;ll
            place you in a band.
          </p>
        )}

        <div>
          <RateWizardDialog rate={rate}>
            <Button type="button" disabled={isLocked}>
              {rate ? "Update rate" : "Set your rate"}
            </Button>
          </RateWizardDialog>
          {isLocked && unlocksAt && (
            <p className="text-muted-foreground mt-2 text-xs">
              * Rates can be updated next on {formatDate(unlocksAt)}.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
