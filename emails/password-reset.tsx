import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout, emailBrand } from "./_layout";

type PasswordResetEmailProps = {
  name?: string;
  resetLink: string;
  expiresInMinutes?: number;
};

export function PasswordResetEmail({
  name = "there",
  resetLink,
  expiresInMinutes = 30,
}: PasswordResetEmailProps) {
  return (
    <EmailLayout preview={`Reset your ${emailBrand.APP_NAME} password`}>
      <Heading
        as="h1"
        className="m-0 mb-4 text-2xl font-semibold text-neutral-900"
      >
        Reset your password
      </Heading>
      <Text className="m-0 mb-4 text-base leading-6 text-neutral-700">
        Hi {name}, we received a request to reset the password on your{" "}
        {emailBrand.APP_NAME} account. Click the button below to choose a new
        one. This link expires in {expiresInMinutes} minutes.
      </Text>
      <Section className="mb-6">
        <Button
          href={resetLink}
          className="rounded-md bg-neutral-900 px-5 py-3 text-sm font-medium text-white no-underline"
        >
          Reset password
        </Button>
      </Section>
      <Text className="m-0 mb-4 text-sm leading-5 text-neutral-500">
        If the button doesn&apos;t work, paste this link into your browser:
        <br />
        {resetLink}
      </Text>
      <Text className="m-0 text-sm leading-5 text-neutral-500">
        Didn&apos;t ask for a reset? You can ignore this email and your password
        will stay the same.
      </Text>
    </EmailLayout>
  );
}

PasswordResetEmail.PreviewProps = {
  name: "Ada",
  resetLink: "https://community.wigxel.com/auth/reset?token=example-token",
  expiresInMinutes: 30,
} satisfies PasswordResetEmailProps;

export default PasswordResetEmail;
