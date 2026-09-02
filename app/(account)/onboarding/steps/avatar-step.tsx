"use client";

import type { UseFormReturn } from "react-hook-form";
import { ImageUpload } from "~/components/profile/image-upload";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import type { Stepper } from "../_components/step-controls";
import { StepControls } from "../_components/step-controls";
import type { OnboardingValues } from "../form";

export type AvatarStepProps = {
  form: UseFormReturn<OnboardingValues>;
  stepper: Stepper;
};

export function AvatarStep(props: AvatarStepProps) {
  const { form, stepper } = props;

  const handleNext = async () => {
    const ok = await form.trigger("profileImage");
    if (ok) stepper.next();
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="mb-1 text-xl font-semibold">Profile Picture</h2>
        <p className="text-muted-foreground text-sm">Upload your avatar</p>
      </div>

      <FormField
        control={form.control}
        name="profileImage"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <ImageUpload
                currentImage={field.value}
                onImageChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <StepControls stepper={stepper} onNext={handleNext} />
    </div>
  );
}
