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
            <h2 className="text-foreground text-xl font-semibold">Agreement</h2>

            <p>
              These Terms govern your use of the Inspace Talent Directory at
              [DOMAIN] ("the Directory"), operated by [INSPACE LEGAL ENTITY
              NAME], RC [RC NUMBER], of [REGISTERED ADDRESS] ("Inspace", "we",
              "us").
            </p>

            <p>
              By listing a profile, submitting a brief, contacting a
              professional through the Directory, or otherwise using the site,
              you agree to these Terms. If you do not agree, do not use the
              Directory.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              Definitions
            </h2>

            <ul className="list-disc space-y-2 pl-6">
              <li>
                <b>Talent</b> — an independent creative professional with a
                listed profile.
              </li>
              <li>
                <b>Client</b> — any person or organisation submitting a brief or
                contacting a professional through the Directory.
              </li>
              <li>
                <b>Profile</b> — a talent's public listing, including any case
                studies.
              </li>
              <li>
                <b>Enquiry</b> — a brief submitted through the intake form, or a
                contact made through a profile.
              </li>
              <li>
                <b>Introduction</b> — Inspace passing a client's details to a
                talent, or the reverse, following an enquiry.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              What the Directory is and what it is not
            </h2>

            <p>
              <b>
                Read this section carefully. It is the most important part of
                these Terms.
              </b>
            </p>

            <p>
              The Directory is a public showcase of independent creative
              professionals in Lagos and Port Harcourt. It exists so that a
              client can find credible people and decide whether to make an
              enquiry.
            </p>

            <p>
              <b>The Directory is not:</b>
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>a job board, and it does not host job postings</li>
              <li>a marketplace, and no transaction takes place on it</li>
              <li>an employment or recruitment agency</li>
              <li>a payment, escrow or contracting platform</li>
              <li>a guarantee, promise or implication that work exists</li>
            </ul>

            <p>
              We do not guarantee that listing a profile will result in any
              enquiry, introduction, job, or income of any kind. During the
              pilot phase, client demand is limited and is being built. We say
              this plainly everywhere on the site and we say it here: if you
              list expecting work to arrive, you may be disappointed.
            </p>

            <p>
              Inspace is not a party to any engagement between a talent and a
              client. If you agree to work together, that is a contract between
              the two of you. Terms, scope, fees, deadlines, deliverables,
              intellectual property, payment and any dispute are entirely your
              responsibility. We do not take a commission, we do not hold funds,
              and we do not mediate.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              Eligibility
            </h2>

            <p>
              You must be 18 or over to list a profile or submit a brief. You
              must have the legal capacity to enter into these Terms and, if
              acting for an organisation, authority to bind it.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              Accounts and access
            </h2>

            <p>
              The Directory uses passwordless authentication. You sign in with a
              link sent to your email address or a one-time code sent to your
              phone. There is no password.
            </p>

            <p>
              This means access to your account depends on access to your email
              inbox and your phone number. You are responsible for keeping both
              secure, for keeping the contact details on your account current,
              and for anything done through your account. Tell us immediately at{" "}
              <b>[Support@inspace.ng]</b> if you believe someone else has
              access.
            </p>

            <p>
              Do not share your sign-in links. They are single-use and
              time-limited, but they are still keys to your account.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              Talent obligations
            </h2>

            <p>By listing a profile you confirm and agree that:</p>

            <ol className="list-[lower-alpha] space-y-3 pl-6">
              <li>
                <b>Everything you publish is true.</b> Your name, discipline,
                city, tools, availability and work links are accurate. You will
                keep them accurate and will re-confirm your availability when
                prompted.
              </li>
              <li>
                <b>The work you show is yours.</b> You created it, or you had a
                defined role in creating it that you have described honestly.
                Where work was collaborative, you say so. You will not present
                another person's work as your own.
              </li>
              <li>
                <b>You have the right to publish it.</b> You hold the necessary
                rights, licences or permissions for every image, logo,
                screenshot and work link you publish. If a client owns the work,
                you have their permission to show it.
              </li>
              <li>
                <b>You will not breach a confidentiality obligation.</b> Case
                studies must not disclose anything you are contractually or
                professionally bound to keep confidential. If you cannot name a
                client, use the "confidential" option — do not name them anyway.
              </li>
              <li>
                <b>Results are real.</b> The result field of a case study must
                describe what actually happened. Do not invent numbers. Do not
                attribute a quote to a client who did not say it. Fabricated
                results are grounds for immediate removal, because the
                credibility of every other profile on the Directory depends on
                this.
              </li>
              <li>
                <b>You represent yourself.</b> One profile per person. Do not
                create a profile for someone else without their express
                permission, and do not list an agency or studio as though it
                were an individual.
              </li>
              <li>
                <b>Your content is lawful and appropriate.</b> No content that
                is defamatory, obscene, discriminatory, harassing, infringing,
                or otherwise unlawful.
              </li>
            </ol>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              Your content and the licence you give us
            </h2>

            <p>
              You own your content. Nothing here transfers ownership of your
              work, your case studies, your images or your intellectual property
              to Inspace.
            </p>

            <p>
              You grant Inspace a non-exclusive, worldwide, royalty-free licence
              to host, store, reproduce, adapt for format and display your
              profile content:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>
                on the Directory itself, including in search engine results
              </li>
              <li>
                when routing an enquiry — sharing your profile and case studies
                with a client
              </li>
              <li>
                in Inspace promotional material about the Directory, such as
                social posts and partner reports
              </li>
            </ul>

            <p>
              The licence lasts while your profile is listed. When you delete
              your profile, the licence ends for future uses. We may keep copies
              in backups for the period set out in the Privacy Policy, and we
              are not obliged to withdraw material already printed or
              distributed.
            </p>

            <p>
              Adaptation for format means resizing, cropping to fit a card, and
              compressing images. It does not mean editing your words. We will
              not materially alter the substance of your case studies without
              asking you.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              Review, approval and removal
            </h2>

            <p>
              Every new profile enters a review queue. We may approve, flag for
              correction, or decline it.
            </p>

            <p>
              We may edit, hide, suspend or remove a profile or any case study,
              with notice where practical, if:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>it breaches these Terms</li>
              <li>
                the content appears to be fabricated, plagiarised, or
                misattributed
              </li>
              <li>a third party makes a credible complaint about it</li>
              <li>
                the account has been inactive for an extended period and prompts
                go unanswered
              </li>
              <li>we are required to by law</li>
            </ul>

            <p>
              Review is not endorsement. We check profiles for obvious problems.
              We do not independently verify every claim, confirm the authorship
              of every piece of work, check qualifications, run background
              checks, or vet quality. See section 13.
            </p>

            <p>
              If your profile is removed and you believe that was wrong, email{" "}
              <b>[SUPPORT@inspace.ng]</b> and we will look at it again.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              Verified status
            </h2>

            <p>
              Some profiles may carry a verified marker. At V1, verified means{" "}
              <b>
                [DEFINITION TO BE FIXED see PRD Open Question 1: identity
                confirmed / portfolio confirmed authentic / attended an Inspace
                session]
              </b>
              , and nothing more.
            </p>

            <p>
              Verified status is applied manually by Inspace. It cannot be
              bought at V1. If we later offer verification as a paid credential,
              we will publish what it means and how it is assessed before doing
              so, and it will remain a statement about the specific thing
              verified — never a warranty of quality, reliability or
              performance.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              Client obligations
            </h2>

            <p>
              By submitting a brief or contacting a professional, you agree
              that:
            </p>

            <ol className="list-[lower-alpha] space-y-3 pl-6">
              <li>
                <b>Your brief is genuine.</b> You are describing a real need, in
                good faith, with a budget band and timeline you actually intend.
              </li>
              <li>
                <b>Contact details are for that enquiry only.</b> Where a
                professional's contact details are revealed to you or shared in
                an introduction, you may use them to discuss the work you
                enquired about. You may not add them to a marketing list, send
                them unsolicited commercial messages, or pass their details to
                anyone else.
              </li>
              <li>
                <b>You do your own due diligence.</b> Before engaging anyone,
                satisfy yourself as to their skills, experience, insurance,
                right to work and suitability. The Directory is a starting point
                for that assessment, not a substitute for it.
              </li>
              <li>
                <b>You will contract directly.</b> Any engagement is between you
                and the professional. Agree scope, fees, deadlines, IP ownership
                and payment terms in writing between yourselves.
              </li>
            </ol>

            <p>
              We respond to briefs on a concierge basis and aim to suggest two
              or three suitable people within one working day. We do not
              guarantee that we will find a match, or that anyone we suggest
              will be available or will accept the work.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              Prohibited use
            </h2>

            <p>You must not:</p>

            <ul className="list-disc space-y-2 pl-6">
              <li>
                scrape, crawl, harvest or bulk-extract profiles, contact details
                or any other data from the Directory, by any means, automated or
                manual
              </li>
              <li>
                use the Directory to build a competing database or mailing list
              </li>
              <li>
                send unsolicited marketing, recruitment spam, or scam messages
                to anyone listed
              </li>
              <li>misrepresent who you are or who you act for</li>
              <li>
                attempt to gain unauthorised access to any account, system or
                data
              </li>
              <li>
                interfere with the operation of the site, including by
                overloading it
              </li>
              <li>use the Directory for any unlawful purpose</li>
            </ul>

            <p>
              We take scraping seriously. The contact protections in this
              Directory exist because independent professionals gave us their
              phone numbers on the understanding that they would not be
              harvested.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              Our intellectual property
            </h2>

            <p>
              The Directory itself, its software, design, structure, the case
              study framework, the Inspace name and logo, and all site copy
              belongs to Inspace or our licensors. Nothing in these Terms gives
              you any right to it beyond using the site as intended.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              Disclaimers
            </h2>

            <p>The Directory is provided "as is".</p>

            <p>
              To the fullest extent permitted by Nigerian law, we make no
              warranty that:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>
                any professional listed is skilled, qualified, available,
                honest, reliable, insured, or suitable for your needs
              </li>
              <li>any information on a profile is accurate or current</li>
              <li>any work shown was produced by the person showing it</li>
              <li>
                listing a profile will produce enquiries, introductions or
                income
              </li>
              <li>submitting a brief will produce a match</li>
              <li>the site will be uninterrupted, error-free or secure</li>
            </ul>

            <p>
              We do not vet, endorse, recommend or guarantee any professional or
              any client. Ordering in the browse results is based on profile
              completeness and recency — it reflects how fully someone has
              filled in their profile, not their quality, and it is not a
              recommendation.
            </p>

            <p>
              Links to external portfolios, Instagram, Behance, GitHub, Dribbble
              and personal sites lead to content we neither control nor endorse.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              Limitation of liability
            </h2>

            <p>
              Nothing in these Terms limits liability for death or personal
              injury caused by our negligence, for fraud, or for anything else
              that cannot be limited under Nigerian law.
            </p>

            <p>Subject to that, and to the fullest extent permitted by law:</p>

            <ul className="list-disc space-y-2 pl-6">
              <li>
                We are not liable for any loss arising from an engagement
                between a talent and a client, including unpaid fees, poor or
                late work, breach of contract, misuse of intellectual property,
                or any dispute between you.
              </li>
              <li>
                We are not liable for indirect, consequential, special or
                punitive loss, or for loss of profit, business, opportunity,
                goodwill, or data.
              </li>
              <li>
                Our total aggregate liability to you, for all claims combined,
                is limited to the greater of the total amount you have paid us
                in the preceding 12 months or ₦50,000. During the pilot the
                Directory is free, so for most users this is ₦50,000.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">Indemnity</h2>

            <p>
              You will indemnify Inspace against claims, losses and reasonable
              legal costs arising from your breach of these Terms, from content
              you published on the Directory, or from any dispute between you
              and another user.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">Fees</h2>

            <p>
              Listing a profile and submitting a brief are free, and are
              expected to remain free for individual creative professionals.
            </p>

            <p>We may introduce paid features in future. If we do:</p>

            <ul className="list-disc space-y-2 pl-6">
              <li>
                We will give at least 30 days' notice before any charge applies
                to something currently free.
              </li>
              <li>
                Any paid placement will sit in clearly labelled slots, separate
                from organic results, and will never alter organic ordering. We
                sell visibility, not relevance.
              </li>
              <li>
                Reviews, ratings and community recommendation will remain
                permanently free and cannot be purchased, boosted or removed by
                payment. These are trust infrastructure, not products. This
                commitment binds us and survives any change to these Terms.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              Suspension and termination
            </h2>

            <p>
              You may delete your profile or account at any time from your
              dashboard. Do it whenever you like; you do not need a reason and
              you do not need to tell us why.
            </p>

            <p>
              We may suspend or terminate access where you breach these Terms,
              where we reasonably suspect fraud or misuse, or if we discontinue
              the Directory. Where we discontinue it, we will give reasonable
              notice and a way to export your profile and case study data.
            </p>

            <p>
              Sections 7 (for uses already made), 13, 14, 15, 16 and 20 survive
              termination.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              Changes to these Terms
            </h2>

            <p>
              We may update these Terms. The date at the top will change and,
              for material changes, we will notify listed talent by email or
              WhatsApp at least 14 days before they take effect. Continuing to
              use the Directory after that means you accept the change. If you
              do not accept it, delete your profile.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">General</h2>

            <p>
              <b>Severability</b> — if any provision is unenforceable, the rest
              stands.
            </p>

            <p>
              <b>No waiver</b> — not enforcing a term once does not waive it.
            </p>

            <p>
              <b>Assignment</b> — you may not assign these Terms; we may assign
              them to a successor on notice.
            </p>

            <p>
              <b>Entire agreement</b> — these Terms and the Privacy Policy are
              the whole agreement between us about the Directory.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              Governing law and disputes
            </h2>

            <p>
              These Terms are governed by the laws of the Federal Republic of
              Nigeria.
            </p>

            <p>
              Before starting proceedings, both sides agree to try to resolve
              the dispute in good faith by contacting{" "}
              <b>[Support@inspace.ng]</b>, and to allow 30 days for that.
            </p>

            <p>
              If that fails, the courts of <b>[Rivers State]</b>, Nigeria have
              exclusive jurisdiction.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">Contact</h2>

            <p>
              <b>INSPACE Hub</b>
              <br />
              71 NTA Rd, Mgbuoba, Port Harcourt 500272, Rivers
            </p>

            <p>
              <b>General:</b> Support@inspace.ng
              <br />
              <b>Privacy:</b> Privacy@inspace.ng
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
