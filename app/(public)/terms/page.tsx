import { CornerUpLeftIcon } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm transition-colors"
        >
          <CornerUpLeftIcon size="0.9rem" /> Back to home
        </Link>

        <h1 className="mb-8 text-3xl font-bold">Terms of Use</h1>

        <div className="prose prose-neutral dark:prose-invert text-muted-foreground max-w-none space-y-6">
          <p className="text-muted-foreground/70 text-sm">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using this application (&quot;Service&quot;), you
              agree to be bound by these Terms of Use. If you do not agree to
              these terms, please do not use the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              2. Use of Service
            </h2>
            <p>
              You may use the Service only for lawful purposes and in accordance
              with these Terms. You agree not to use the Service in any way that
              could damage, disable, overburden, or impair the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              3. User Accounts
            </h2>
            <p>
              When you create an account with us, you must provide information
              that is accurate, complete, and current. Failure to do so
              constitutes a breach of the Terms, which may result in immediate
              termination of your account.
            </p>
            <p>
              You are responsible for safeguarding the password that you use to
              access the Service and for any activities or actions under your
              password. We encourage you to use a strong, unique password.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              4. Intellectual Property
            </h2>
            <p>
              The Service and its original content, features, and functionality
              are owned by the Service provider and are protected by
              international copyright, trademark, patent, trade secret, and
              other intellectual property laws.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              5. Termination
            </h2>
            <p>
              We may terminate or suspend your account immediately, without
              prior notice or liability, for any reason whatsoever, including
              without limitation if you breach the Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              6. Limitation of Liability
            </h2>
            <p>
              In no event shall we be liable for any damages, including without
              limitation, indirect or consequential damages, arising out of or
              in connection with your use of the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              7. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify or replace these Terms at any time.
              If a revision is material, we will try to provide at least 30
              days&apos; notice prior to any new terms taking effect.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              8. Contact Us
            </h2>
            <p>
              If you have any questions about these Terms, please contact us.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
