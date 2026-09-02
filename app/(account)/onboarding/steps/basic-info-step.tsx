import type { UseFormReturn } from "react-hook-form";
import {
  CheckUsername,
  type UsernameStatus,
} from "~/components/onboarding/check-username";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import type { OnboardingValues } from "../form";

export function BasicInfoStep({
  form,
  onUsernameStatusChange,
}: {
  form: UseFormReturn<OnboardingValues>;
  onUsernameStatusChange: (status: UsernameStatus) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="mb-1 text-xl font-semibold">Basic Information</h2>
        <p className="text-sm text-white/60">Tell us about yourself</p>
      </div>

      <div className="flex gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>First name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Jane"
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Last name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Doe"
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <CheckUsername
              value={field.value}
              onChange={field.onChange}
              onStatusChange={onUsernameStatusChange}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
