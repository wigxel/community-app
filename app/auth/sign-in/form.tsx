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
import { Input } from "~/components/ui/input";
import { authClient } from "~/lib/auth-client";
import { toast } from "~/lib/toast";

const signInSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInValues = z.infer<typeof signInSchema>;

const defaultValues: Partial<SignInValues> = {
  email: "",
  password: "",
};
export type SignInFormProps = { redirectTo: string };
export default function SignInForm(props: SignInFormProps) {
  const { redirectTo } = props;

  const router = useRouter();

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues,
    mode: "onBlur",
  });

  async function onSubmit(values: SignInValues) {
    const { error } = await authClient.signIn.email(values);

    if (error) {
      toast.error("Sign in failed", { description: error.message });
      return;
    }

    toast.success("Welcome back!");
    router.push(redirectTo ? (redirectTo as never) : "/dashboard");
  }

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-start">
          <h1 className="text-foreground text-3xl font-semibold">
            Welcome back
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Sign in to your account to continue
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="/auth/forgot-password"
                      className="text-muted-foreground hover:text-foreground text-xs transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      placeholder="••••••••"
                      autoComplete="current-password"
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
              loadingText="Signing in…"
              className="mt-1 w-full"
            >
              Sign In
            </LoadingButton>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            New to Rever?{" "}
            <Link
              href="/auth/sign-up"
              className="text-foreground hover:text-foreground/80 transition-colors"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
