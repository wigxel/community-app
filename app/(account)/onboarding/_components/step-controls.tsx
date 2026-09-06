"use client";

import { Button } from "~/components/ui/button";

export type Stepper = {
  step: number;
  totalSteps: number;
  next: () => void;
  back: () => void;
};

export type StepControlsProps = {
  stepper: Stepper;
  onNext?: () => void;
  nextDisabled?: boolean;
  isSubmit?: boolean;
  isSubmitting?: boolean;
};

export function StepControls(props: StepControlsProps) {
  const { stepper, onNext, nextDisabled, isSubmit, isSubmitting } = props;

  const { step, totalSteps, back } = stepper;
  const isLast = step === totalSteps;

  return (
    <div className="flex gap-3 pt-4">
      {step > 1 && (
        <Button
          type="button"
          variant="secondary"
          onClick={back}
          disabled={isSubmitting}
          className="flex-1"
        >
          Back
        </Button>
      )}
      {isLast ? (
        <Button
          type={isSubmit ? "submit" : "button"}
          onClick={isSubmit ? undefined : onNext}
          disabled={isSubmitting || nextDisabled}
          variant="default"
          className="flex-1"
        >
          {isSubmitting ? "Creating Profile..." : "Complete Setup"}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          variant="default"
          className="flex-1"
        >
          Next
        </Button>
      )}
    </div>
  );
}
