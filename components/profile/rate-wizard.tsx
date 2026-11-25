"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@hyperbridge/ui";
import { useMutation } from "convex/react";
import { type ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AlertBox } from "~/components/molecules/alert-box";
import { Button } from "~/components/ui/button";
import { CurrencyInput } from "~/components/ui/currency-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { api } from "~/convex/_generated/api";
import type { Doc } from "~/convex/_generated/dataModel";
import { captureEvent } from "~/lib/analytics";
import { monthlyEquivalent, type RateUnit, rateBand } from "~/lib/rate-band";
import { toast } from "~/lib/toast";
import { cn } from "~/lib/utils";

const wizardSchema = z
  .object({
    unit: z.enum(["hour", "day", "week", "month", "project"]),
    rawAmount: z.string().refine((value) => Number(value) > 0, {
      message: "Enter a valid amount.",
    }),
    projectDays: z.string().optional(),
  })
  .refine(
    (values) => values.unit !== "project" || Number(values.projectDays) > 0,
    {
      path: ["projectDays"],
      message: "Enter a valid project duration.",
    },
  );

type WizardValues = z.infer<typeof wizardSchema>;

const UNIT_OPTIONS = [
  { value: "hour", label: "Per hour" },
  { value: "day", label: "Per day" },
  { value: "week", label: "Per week" },
  { value: "month", label: "Per month" },
  { value: "project", label: "Per project" },
] as const;

const UNIT_AMOUNT_LABEL: Record<RateUnit, string> = {
  hour: "Typical hourly rate (NGN)",
  day: "Typical daily rate (NGN)",
  week: "Typical weekly rate (NGN)",
  month: "Typical monthly rate (NGN)",
  project: "Typical project price (NGN)",
};

const STEP_LABELS = ["Pricing", "Amount", "Preview"];

const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

interface RateWizardDialogProps {
  /** Current rate answers, used to pre-fill the steps. */
  rate?: Doc<"profile">["rate"];
  children: ReactNode;
}

export function RateWizardDialog({ rate, children }: RateWizardDialogProps) {
  const updateProfileRate = useMutation(api.profiles.updateProfileRate);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  const form = useForm<WizardValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: { unit: "month", rawAmount: "", projectDays: "" },
  });

  const unit = form.watch("unit");
  const rawAmount = form.watch("rawAmount");
  const projectDays = form.watch("projectDays");
  const monthly = monthlyEquivalent(
    unit,
    Number(rawAmount),
    Number(projectDays),
  );
  const band = rateBand(monthly);

  function handleOpenChange(next: boolean) {
    if (next) {
      // Pre-fill from stored answers; legacy rates were monthly figures.
      form.reset({
        unit: rate?.unit ?? "month",
        rawAmount: String(rate?.rawAmount ?? rate?.amount ?? ""),
        projectDays: rate?.projectDays ? String(rate.projectDays) : "",
      });
      setStep(1);
    }
    setIsOpen(next);
  }

  async function handleNext() {
    if (step === 2) {
      const fields =
        unit === "project"
          ? (["rawAmount", "projectDays"] as const)
          : (["rawAmount"] as const);
      if (!(await form.trigger([...fields]))) return;
    }
    setStep(step + 1);
  }

  async function handleSave(values: WizardValues) {
    // Enter in a step-2 input would submit the form before reaching step 3.
    if (step !== 3) return;

    try {
      await updateProfileRate({
        rate: {
          unit: values.unit,
          rawAmount: Number(values.rawAmount),
          ...(values.unit === "project" && {
            projectDays: Number(values.projectDays),
          }),
        },
      });
      captureEvent("rate_updated", {
        unit: values.unit,
        band,
        monthly_equivalent: monthly,
      });
      toast.success("Rate saved", {
        description: `This places you in ${band}. You can update it again in 6 months.`,
      });
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to save rate", {
        description:
          error instanceof Error ? error.message : "Please try again.",
        duration: Infinity,
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set your rate</DialogTitle>
          <DialogDescription>
            Your answers place you in a public band. The exact amount stays
            private.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-2">
          {STEP_LABELS.map((label, index) => (
            <div key={label} className="flex flex-1 flex-col gap-1">
              <div
                className={cn(
                  "h-1 rounded-full",
                  step > index ? "bg-primary" : "bg-muted",
                )}
              />
              <span
                className={cn(
                  "text-xs",
                  step > index ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            {step === 1 && (
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How do you usually charge?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="pt-1"
                      >
                        {UNIT_OPTIONS.map((option) => (
                          <Label
                            key={option.value}
                            className={cn(
                              "hover:bg-muted has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5 flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm font-normal transition-colors",
                            )}
                          >
                            <RadioGroupItem value={option.value} />
                            {option.label}
                          </Label>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {step === 2 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="rawAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{UNIT_AMOUNT_LABEL[unit]}</FormLabel>
                      <FormControl>
                        <CurrencyInput
                          placeholder="150,000"
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {unit === "project" && (
                  <FormField
                    control={form.control}
                    name="projectDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          How many days does a typical project run?
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            placeholder="e.g., 30"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3 py-4 text-start text-sm">
                <p className="text-muted-foreground">This places you in</p>
                <p className="text-4xl font-semibold">{band}</p>
                <p className="text-muted-foreground text-lg">
                  ≈ {formatNaira(monthly)} per month
                </p>
                <AlertBox
                  severity="warning"
                  heading="Your rate will be locked for 6 months"
                >
                  Choose carefully — you won&apos;t be able to update it until
                  the lock ends.
                </AlertBox>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="shrink-0 basis-[30%]"
                onClick={() =>
                  step === 1 ? setIsOpen(false) : setStep(step - 1)
                }
              >
                {step === 1 ? "Cancel" : "Back"}
              </Button>
              {step < 3 ? (
                <Button
                  type="button"
                  className="basis-[70%]"
                  onClick={handleNext}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="basis-[70%]"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Saving..." : "Save rate"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
