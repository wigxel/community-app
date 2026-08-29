"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { LoadingButton } from "~/components/forms/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { toast } from "~/lib/toast";

const forgotPasswordSchema = z.object({
  email: z.email("Invalid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

const defaultValues: Partial<ForgotPasswordValues> = {
  email: "",
};

export default function ForgotPasswordForm() {
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues,
    mode: "onBlur",
  });

  async function onSubmit(values: ForgotPasswordValues) {
    const response = await fetch("/api/auth/request-password-reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: values.email,
        redirectTo: "/auth/reset-password",
      }),
    });

    if (!response.ok) {
      let errorMessage = `Server responded with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Use default error message if JSON parsing fails
      }
      toast.error("Request failed", { description: errorMessage });
      return;
    }

    toast.success("Check your email for a reset link");
  }

  return (
    <div className="flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-start">
          <h1 className="text-foreground text-3xl font-semibold">
            Forgot password?
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <LoadingButton
              type="submit"
              loading={form.formState.isSubmitting}
              loadingText="Sending..."
              className="mt-1 w-full"
            >
              Send reset link
            </LoadingButton>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <Link
            href="/auth/sign-in"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
