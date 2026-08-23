import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout, emailBrand } from "./_layout";

type WelcomeEmailProps = {
  name?: string;
  dashboardUrl?: string;
};

export function WelcomeEmail({
  name = "there",
  dashboardUrl = `${emailBrand.APP_URL}/dashboard/home`,
}: WelcomeEmailProps) {
  return (
    <EmailLayout preview={`Welcome to ${emailBrand.APP_NAME}, ${name}`}>
      <Heading
        as="h1"
        className="m-0 mb-4 text-2xl font-semibold text-neutral-900"
      >
        Welcome, {name}.
      </Heading>
      <Text className="m-0 mb-4 text-base leading-6 text-neutral-700">
        Thanks for joining {emailBrand.APP_NAME}. You can now build out your
        profile, browse the catalog, and connect with local businesses and
        students.
      </Text>
      <Text className="m-0 mb-6 text-base leading-6 text-neutral-700">
        Your next step is to complete your profile so the community can find
        you.
      </Text>
      <Section className="mb-6">
        <Button
          href={dashboardUrl}
          className="rounded-md bg-neutral-900 px-5 py-3 text-sm font-medium text-white no-underline"
        >
          Open your dashboard
        </Button>
      </Section>
      <Text className="m-0 text-sm leading-5 text-neutral-500">
        If the button doesn&apos;t work, paste this link into your browser:
        <br />
        {dashboardUrl}
      </Text>
    </EmailLayout>
  );
}

WelcomeEmail.PreviewProps = {
  name: "Ada",
  dashboardUrl: "https://community.wigxel.com/dashboard/home",
} satisfies WelcomeEmailProps;

export default WelcomeEmail;
