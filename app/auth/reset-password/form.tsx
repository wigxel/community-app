"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { PasswordInput } from "~/components/fields/password";
import { LoadingButton } from "~/components/forms/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { authClient } from "~/lib/auth-client";
import { toast } from "~/lib/toast";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

const defaultValues: Partial<ResetPasswordValues> = {
  password: "",
  confirmPassword: "",
};

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues,
    mode: "onBlur",
  });

  async function onSubmit(values: ResetPasswordValues) {
    const { error } = await authClient.resetPassword({
      newPassword: values.password,
      token,
    });

    if (error) {
      toast.error("Reset failed", {
        description: error.message ?? "Something went wrong",
      });
      return;
    }

    toast.success("Password reset! Please sign in.");
    router.push("/auth/sign-in");
  }

  return (
    <div className="flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-start">
          <h1 className="text-foreground text-3xl font-semibold">
            Reset your password
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Choose a new password for your account.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      placeholder="min. 8 characters"
                      autoComplete="new-password"
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      showToggle={false}
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
              loadingText="Resetting..."
              className="mt-1 w-full"
            >
              Reset password
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
