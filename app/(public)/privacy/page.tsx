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
              Who we are
            </h2>
            <p>
              The Inspace Talent Directory ("the Directory") is operated by
              [INSPACE Community], a company registered in Nigeria with
              registration number [RC NUMBER], with its registered office at
              [REGISTERED ADDRESS]
            </p>{" "}
            <br />
            <p>
              We are the data controller for the personal data described in this
              policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              What this policy covers
            </h2>
            <p>
              This policy explains what personal data we collect through the
              Directory, why we collect it, who we share it with, and what
              rights you have. <br /> <br />
              <p>It applies to three groups of people:</p>
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Talent — creative professionals who list a profile, whether at a
                live session or otherwise
              </li>
              <li>
                Clients — people and organisations who submit a brief or contact
                a profile
              </li>
              <li>
                Visitors — anyone browsing the Directory without submitting
                anything
              </li>
            </ul>
            <p>
              We process personal data in line with the Nigeria Data Protection
              Act 2023 (NDPA) and, where applicable, the Nigeria Data Protection
              Regulation 2019.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              The most important thing to understand first
            </h2>
            <p>
              <b>A talent profile on the Directory is public.</b> That is its
              purpose. When you list, the following becomes visible to anyone on
              the internet and to search engines:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Your name</li>
              <li>Your discipline and any secondary disciplines</li>
              <li>Your city</li>
              <li>
                Your headline, bio, photo, tools and availability status, if you
                add them
              </li>
              <li>Your work links</li>
              <li>
                Any case studies you publish, including images and the client
                name you enter
              </li>
            </ul>

            <p>
              <b>
                Your phone number and email address are not public by default.
              </b>
              They are held privately. A visitor who wants to reach you sees a
              contact route, not your contact details and where the Directory
              reveals a contact detail, that action is logged and attributable.
            </p>

            <p>
              You control this. You can hide your profile from public view or
              delete it entirely at any time (see section 10).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              What we collect
            </h2>
            <h3 className="text-foreground text-lg font-semibold">
              From talent
            </h3>
            <h4 className="text-foreground text-lg font-semibold">
              At capture (during a session or via the signup link):
            </h4>
            <table className="h-75 w-full border-collapse border">
              <thead className="font-semibold">
                <tr className="border-b">
                  <td>Data</td>
                  <td>Why</td>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td>Full name</td>
                  <td>Identifies your profile publicly</td>
                </tr>
                <tr className="border-b">
                  <td>
                    Phone number
                    <br /> (WhatsApp-capable)
                  </td>
                  <td>
                    Sending your profile edit link; completion prompts; routing
                    a client introduction to you
                  </td>
                </tr>
                <tr className="border-b">
                  <td>Email address</td>
                  <td>
                    Passwordless sign-in; profile edit link; completion prompts
                  </td>
                </tr>
                <tr className="border-b">
                  <td>Discipline</td>
                  <td>Public profile and browse filters</td>
                </tr>
                <tr className="border-b">
                  <td>City</td>
                  <td>Public profile and browse filters</td>
                </tr>
                <tr className="border-b">
                  <td>One work link</td>
                  <td>Public profile</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="space-y-4">
            <p>
              <b>Added later, entirely at your choice:</b> Photo, headline, bio,
              tools, availability status, additional work links, and up to three
              case studies (project title, the problem, the constraint, the
              decision, the result, images, and an optional client name).
            </p>
            <p>
              <b>Captured automatically when you list:</b> Which session you
              attended, which partner community ran it, and the date. We use
              this to understand which sessions and partnerships bring people
              into the Directory, and to report signup counts to partner
              communities. Reporting to partners is in aggregate numbers{" "}
              <b>
                we do not give partners a list of which of their members listed
              </b>{" "}
              unless you have separately agreed.
            </p>
            <p>
              <b>Generated by your use of the Directory:</b> Account creation
              date, last active date, profile stage, verification flag,
              availability re-confirmation history, and internal notes made by
              Inspace administrators when reviewing or routing your profile.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              From clients
            </h2>
            <p>
              When you submit a brief: a description of what you need, the
              disciplines required, your budget band, timeline, location
              preference, and your name, company, email and phone number.
            </p>
            <p>
              When you use a contact route on a profile: the fact of the
              contact, which profile, and the contact details you provide.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              From everyone
            </h2>
            <p>
              Technical data necessary to serve and secure the site: IP address,
              browser and device type, pages requested, and timestamps. We keep
              this minimal.{" "}
              <b>
                We do not run behavioural advertising trackers, and we do not
                sell data to anyone, ever.
              </b>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              What we do not collect
            </h2>
            <p>
              We do not ask for and do not want: government ID numbers, bank or
              payment details, BVN, NIN, date of birth, health information, or
              any other sensitive personal data. If you send any of these to us
              unprompted, we will delete them.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              Why we use your data, and our lawful basis
            </h2>

            <table className="h-150 w-full border-collapse border">
              <thead className="font-semibold">
                <tr className="border-b">
                  <td>What we do</td>
                  <td>Lawful basis under the NDPA</td>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td>Create and display your public profile</td>
                  <td>Performance of a contract with you (the Terms of Use)</td>
                </tr>
                <tr className="border-b">
                  <td>Send you a sign-in link or OTP</td>
                  <td>Performance of a contract</td>
                </tr>
                <tr className="border-b">
                  <td>
                    Send profile completion prompts (day 1, day 3, day 7, then
                    monthly) and availability re-confirmation prompts
                  </td>
                  <td>
                    Legitimate interest in maintaining an accurate directory —
                    you can opt out at any time
                  </td>
                </tr>
                <tr className="border-b">
                  <td>Route a client enquiry to you and introduce you</td>
                  <td>Performance of a contract; legitimate interest</td>
                </tr>
                <tr className="border-b">
                  <td>Review, approve or flag profiles</td>
                  <td>
                    Legitimate interest in maintaining a directory clients can
                    trust
                  </td>
                </tr>
                <tr className="border-b">
                  <td>Record enquiries, introductions and outcomes</td>
                  <td>
                    Legitimate interest in running and evaluating the service
                  </td>
                </tr>
                <tr className="border-b">
                  <td>
                    Contact you about Inspace programmes, sessions and events
                  </td>
                  <td>
                    Consent, given at capture and withdrawable at any time
                  </td>
                </tr>
                <tr className="border-b">
                  <td>Respond to a client brief</td>
                  <td>Performance of a contract; legitimate interest</td>
                </tr>
                <tr className="border-b">
                  <td>Secure the platform and prevent abuse</td>
                  <td>Legitimate interest; legal obligation</td>
                </tr>
              </tbody>
            </table>

            <p>
              Where we rely on consent, you can withdraw it at any time without
              affecting anything we did before you withdrew it.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              Who we share your data with
            </h2>

            <h3 className="text-foreground text-lg font-semibold">Clients</h3>
            <p>
              This is the point of the Directory. When a client submits a brief
              and we identify you as a good fit, we may share your name,
              discipline, city, profile link and case studies with that client,
              and where you have accepted an introduction your contact details.
            </p>

            <h3 className="text-foreground text-lg font-semibold">
              Partner communities
            </h3>
            <p>Aggregate signup counts only, as described in section 4.1.</p>

            <h3 className="text-foreground text-lg font-semibold">Legal</h3>
            <p>
              We will disclose data where we are legally required to, or where
              it is necessary to establish, exercise or defend a legal claim.
            </p>

            <h3 className="text-foreground text-lg font-semibold">
              Business transfer
            </h3>
            <p>
              If Inspace is acquired or merges, your data may transfer with the
              service. You will be told before this happens and given the chance
              to delete your profile first.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              WhatsApp and SMS
            </h2>

            <p>
              We send messages to your phone number by SMS and WhatsApp — this
              is a deliberate design choice, because it is where the people
              using this Directory actually are.
            </p>

            <p>
              <b>You will receive:</b>
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>
                <b>
                  Transactional messages you cannot opt out of while your
                  profile is live:
                </b>{" "}
                sign-in links, your profile edit link, and notification of a
                client enquiry directed at you.
              </li>
              <li>
                <b>
                  Prompt and programme messages you can opt out of at any time:
                </b>{" "}
                completion prompts, availability re-confirmations, and news
                about Inspace sessions.
              </li>
            </ul>

            <p>
              To stop the second category, reply STOP to any message or change
              your notification settings in your profile dashboard.
            </p>

            <p>
              Messages sent over WhatsApp are also subject to WhatsApp's own
              privacy terms, which we do not control.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              Cookies and similar technologies
            </h2>

            <p>
              We use a small number of strictly necessary cookies: one to keep
              you signed in after you use a magic link or OTP, and one to
              preserve your form state if your connection drops during the
              capture flow.
            </p>

            <p>
              If we add any analytics cookie, it will be listed here and you
              will be asked before it is set. We do not use advertising cookies.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              How long we keep data
            </h2>

            <table className="h-130 w-full border-collapse border">
              <thead className="font-semibold">
                <tr className="border-b">
                  <th>Data</th>
                  <th>Retention</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td>Live talent profile</td>
                  <td>For as long as your profile is listed</td>
                </tr>
                <tr className="border-b">
                  <td>Availability status</td>
                  <td>
                    Auto-flagged as stale after 60 days without re-confirmation;
                    the profile stays live but is marked
                  </td>
                </tr>
                <tr className="border-b">
                  <td>Deleted profile</td>
                  <td>
                    Removed from public view immediately; erased from our
                    systems within 30 days
                  </td>
                </tr>
                <tr className="border-b">
                  <td>Enquiry and outcome records</td>
                  <td>
                    3 years from the date the enquiry is resolved, for reporting
                    and dispute purposes. Where the enquiry named you, we retain
                    your name and the outcome, not your full profile
                  </td>
                </tr>
                <tr className="border-b">
                  <td>Sign-in logs and contact-reveal logs</td>
                  <td>12 months</td>
                </tr>
                <tr className="border-b">
                  <td>Technical/server logs</td>
                  <td>90 days</td>
                </tr>
                <tr className="border-b">
                  <td>Records we must keep by law</td>
                  <td>For the period the law requires</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              Your rights
            </h2>

            <p>Under the NDPA you have the right to:</p>

            <ul className="list-disc space-y-2 pl-6">
              <li>Access the personal data we hold about you</li>
              <li>
                Correct anything inaccurate — most of this you can do yourself
                in your profile dashboard
              </li>
              <li>Delete your profile and your data</li>
              <li>
                Object to processing based on legitimate interest, including our
                prompt messages
              </li>
              <li>Withdraw consent at any time</li>
              <li>
                Restrict processing while a dispute about accuracy is resolved
              </li>
              <li>
                Portability — receive your profile and case study data in a
                machine-readable format
              </li>
              <li>Complain to the Nigeria Data Protection Commission</li>
            </ul>

            <p>
              <b>How to exercise them:</b> most actions are self-service in your
              profile dashboard — hide profile, delete account, edit any field,
              change notification settings. For anything else, email{" "}
              <b>[PRIVACY@Inspace.ng]</b>. We will respond within 30 days and
              will not charge you.
            </p>

            <p>
              Note that deleting your profile does not delete records of
              enquiries already made about you, or introductions already made,
              for the retention period in section 9.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">Security</h2>

            <p>
              We protect your data with encryption in transit (HTTPS),
              passwordless authentication with expiring sign-in links, access
              controls limiting administrative access to named Inspace staff,
              and logging of contact reveals and administrative actions.
            </p>

            <p>
              No system is perfectly secure. If a breach occurs that is likely
              to result in a risk to your rights, we will notify the Nigeria
              Data Protection Commission within 72 hours and tell you directly
              where the law requires it.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              Data stored outside Nigeria
            </h2>

            <p>
              Some of our service providers store data outside Nigeria — for
              example <b>[hosting region]</b>. Where that happens we rely on the
              transfer mechanisms permitted under the NDPA, including
              contractual safeguards with the provider and, where applicable, an
              adequacy determination by the Nigeria Data Protection Commission.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">Age</h2>

            <p>
              The Directory is for people aged 18 and over. We do not knowingly
              collect data from anyone under 18. If we learn that a profile
              belongs to a minor, we will delete it.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              Changes to this policy
            </h2>

            <p>
              We will post any change here and update the date at the top. If a
              change materially affects how we use your data particularly
              anything that changes what is public we will notify you by email
              or WhatsApp before it takes effect.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-foreground text-xl font-semibold">
              Complaints
            </h2>

            <p>
              Contact us first at <b>[privacy@inspace.ng]</b>. If you are not
              satisfied, you can complain to:
            </p>

            <p>
              <b>Nigeria Data Protection Commission (NDPC)</b>
              <br />
              Website: ndpc.gov.ng
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
