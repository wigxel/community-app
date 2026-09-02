import type { UseFormReturn } from "react-hook-form";
import { ImageUpload } from "~/components/profile/image-upload";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import type { OnboardingValues } from "../form";

export function AvatarStep({
  form,
}: {
  form: UseFormReturn<OnboardingValues>;
}) {
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
    </div>
  );
}
