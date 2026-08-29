"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { PasswordInput } from "~/components/fields/password";
import { LoadingButton } from "~/components/forms/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { SegmentProgressBar } from "~/components/ui/segmented-gradient-progress";
import { authClient } from "~/lib/auth-client";
import { toast } from "~/lib/toast";

const signUpSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpValues = z.infer<typeof signUpSchema>;

const defaultValues: Partial<SignUpValues> = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  terms: false,
};

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  gradient: { startColor: string; endColor: string };
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2)
    return {
      score,
      label: "Weak",
      gradient: { startColor: "#ef4444", endColor: "#f97316" },
    };
  if (score <= 4)
    return {
      score,
      label: "Fair",
      gradient: { startColor: "#f97316", endColor: "#eab308" },
    };
  return {
    score,
    label: "Strong",
    gradient: { startColor: "#22c55e", endColor: "#10b981" },
  };
}
export type SignUpFormProps = { redirectTo: string };
export default function SignUpForm(props: SignUpFormProps) {
  const { redirectTo } = props;

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues,
    mode: "onBlur",
  });

  const password = form.watch("password");
  const passwordStrength = getPasswordStrength(password ?? "");

  async function onSubmit(values: SignUpValues) {
    const { error } = await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: `${values.firstName} ${values.lastName}`,
    });

    if (error) {
      toast.error("Sign up failed", { description: error.message });
      return;
    }

    toast.success("Account created!", {
      description: "Redirecting to onboarding...",
    });
    window.location.href = `/onboarding?redirect=${encodeURIComponent(redirectTo)}`;
  }

  return (
    <div className="flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-start">
          <h1 className="text-foreground text-3xl font-semibold">
            Create account
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Get started with your free account
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="John"
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
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      placeholder="min. 8 characters"
                      autoComplete="new-password"
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  {password && password.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-foreground/50">
                          Password strength
                        </span>
                        <span
                          className={
                            passwordStrength.score <= 2
                              ? "text-red-400"
                              : passwordStrength.score <= 4
                                ? "text-yellow-400"
                                : "text-green-400"
                          }
                        >
                          {passwordStrength.label}
                        </span>
                      </div>

                      <SegmentProgressBar
                        progressValue={(passwordStrength.score / 6) * 100}
                        gradient={passwordStrength.gradient}
                        className="h-2"
                      />

                      <div className="text-foreground/40 grid grid-cols-2 gap-1 text-xs">
                        <span
                          className={
                            password.length >= 8 ? "text-foreground" : ""
                          }
                        >
                          8+ characters
                        </span>
                        <span
                          className={
                            /[A-Z]/.test(password ?? "")
                              ? "text-foreground"
                              : ""
                          }
                        >
                          Uppercase letter
                        </span>
                        <span
                          className={
                            /[a-z]/.test(password ?? "")
                              ? "text-foreground"
                              : ""
                          }
                        >
                          Lowercase letter
                        </span>
                        <span
                          className={
                            /[0-9]/.test(password ?? "")
                              ? "text-foreground"
                              : ""
                          }
                        >
                          Number
                        </span>
                      </div>
                    </div>
                  )}
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

            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-start gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={form.formState.isSubmitting}
                        className="mt-0.5"
                      />
                    </FormControl>
                    <div className="mt-0.5 text-sm leading-none">
                      <span className="text-foreground/50">
                        I agree to the{" "}
                        <Link
                          href="/terms"
                          target="_blank"
                          className="text-foreground hover:text-foreground/80 underline underline-offset-2"
                        >
                          Terms of Use
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          target="_blank"
                          className="text-foreground hover:text-foreground/80 underline underline-offset-2"
                        >
                          Privacy Policy
                        </Link>
                      </span>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <LoadingButton
              type="submit"
              loading={form.formState.isSubmitting}
              loadingText="Creating account…"
              className="mt-1 w-full"
            >
              Create Account
            </LoadingButton>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link
              href="/auth/sign-in"
              className="text-foreground hover:text-foreground/80 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
