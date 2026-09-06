"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";

type DescriptionFieldProps = {
  name: string;
  label?: string;
  placeholder?: string;
  maxLength?: number;
};

export function DescriptionField({
  name,
  label = "Description",
  placeholder = "What did you build or work on?",
  maxLength = 300,
}: DescriptionFieldProps) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col gap-1.5">
          <FormLabel className="text-muted-foreground">{label}</FormLabel>
          <div className="relative">
            <FormControl>
              <Textarea
                placeholder={placeholder}
                rows={3}
                maxLength={maxLength}
                className="text-foreground resize-none border-white/15 bg-white/5 placeholder:text-white/30"
                {...field}
              />
            </FormControl>
            <span className="text-foreground/30 absolute right-3 bottom-2 text-[10px]">
              {field.value?.length ?? 0}/{maxLength}
            </span>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
