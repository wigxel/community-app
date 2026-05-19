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
        className="text-2xl font-semibold text-neutral-900 m-0 mb-4"
      >
        Welcome, {name}.
      </Heading>
      <Text className="text-base text-neutral-700 leading-6 m-0 mb-4">
        Thanks for joining {emailBrand.APP_NAME}. You can now build out your
        profile, browse the catalog, and connect with local businesses and
        students.
      </Text>
      <Text className="text-base text-neutral-700 leading-6 m-0 mb-6">
        Your next step is to complete your profile so the community can find
        you.
      </Text>
      <Section className="mb-6">
        <Button
          href={dashboardUrl}
          className="bg-neutral-900 text-white rounded-md px-5 py-3 text-sm font-medium no-underline"
        >
          Open your dashboard
        </Button>
      </Section>
      <Text className="text-sm text-neutral-500 leading-5 m-0">
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
