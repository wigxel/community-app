import { CornerUpLeftIcon } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm transition-colors"
        >
          <CornerUpLeftIcon size="0.9rem" /> Back to home
        </Link>

        <h1 className="mb-8 text-3xl font-bold">Privacy Policy</h1>

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
              1. Information We Collect
            </h2>
            <p>
              We collect information you provide directly to us, such as when
              you create an account, update your profile, or contact us for
              support. This may include your name, email address, and any other
              information you choose to provide.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              2. How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Provide, maintain, and improve our Service</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>
                Respond to your comments, questions, and customer service
                requests
              </li>
              <li>
                Detect, prevent, and address technical issues and fraudulent
                activity
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              3. Information Sharing
            </h2>
            <p>
              We do not sell or rent your personal information to third parties.
              We may share your information only in the following circumstances:
              with your consent, to comply with legal obligations, or to protect
              our rights and safety.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              4. Data Security
            </h2>
            <p>
              We take reasonable measures to help protect your personal
              information from loss, theft, misuse, unauthorized access,
              disclosure, alteration, and destruction. However, no method of
              transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              5. Your Rights
            </h2>
            <p>
              You have the right to access, correct, or delete your personal
              information. You may also object to or request restriction of
              processing. To exercise these rights, please contact us.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              6. Cookies
            </h2>
            <p>
              We use cookies and similar tracking technologies to track activity
              on our Service and hold certain information. You can instruct your
              browser to refuse all cookies, though some features may not
              function properly without them.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              7. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              8. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
