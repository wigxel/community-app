import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { OnboardingValues } from "../form";

export function RoleStep({
  form,
  titles,
}: {
  form: UseFormReturn<OnboardingValues>;
  titles: Array<{ _id: string; name: string }>;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="mb-1 text-xl font-semibold">Your Role</h2>
        <p className="text-muted-foreground text-sm">
          What best describes you? (optional)
        </p>
      </div>

      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Select Role</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {titles.map((title) => (
                  <SelectItem key={title._id} value={title._id}>
                    {title.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
