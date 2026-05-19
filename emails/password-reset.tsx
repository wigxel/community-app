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
        className="text-2xl font-semibold text-neutral-900 m-0 mb-4"
      >
        Reset your password
      </Heading>
      <Text className="text-base text-neutral-700 leading-6 m-0 mb-4">
        Hi {name}, we received a request to reset the password on your{" "}
        {emailBrand.APP_NAME} account. Click the button below to choose a new
        one. This link expires in {expiresInMinutes} minutes.
      </Text>
      <Section className="mb-6">
        <Button
          href={resetLink}
          className="bg-neutral-900 text-white rounded-md px-5 py-3 text-sm font-medium no-underline"
        >
          Reset password
        </Button>
      </Section>
      <Text className="text-sm text-neutral-500 leading-5 m-0 mb-4">
        If the button doesn&apos;t work, paste this link into your browser:
        <br />
        {resetLink}
      </Text>
      <Text className="text-sm text-neutral-500 leading-5 m-0">
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
