import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout, emailBrand } from "./_layout";

type MagicLinkEmailProps = {
  name?: string;
  magicLink: string;
  expiresInMinutes?: number;
};

export function MagicLinkEmail({
  name = "there",
  magicLink,
  expiresInMinutes = 15,
}: MagicLinkEmailProps) {
  return (
    <EmailLayout preview={`Your ${emailBrand.APP_NAME} sign-in link`}>
      <Heading
        as="h1"
        className="text-2xl font-semibold text-neutral-900 m-0 mb-4"
      >
        Sign in to {emailBrand.APP_NAME}
      </Heading>
      <Text className="text-base text-neutral-700 leading-6 m-0 mb-4">
        Hi {name}, click the button below to sign in. This link will expire in{" "}
        {expiresInMinutes} minutes and can only be used once.
      </Text>
      <Section className="mb-6">
        <Button
          href={magicLink}
          className="bg-neutral-900 text-white rounded-md px-5 py-3 text-sm font-medium no-underline"
        >
          Sign in
        </Button>
      </Section>
      <Text className="text-sm text-neutral-500 leading-5 m-0 mb-4">
        If the button doesn&apos;t work, paste this link into your browser:
        <br />
        {magicLink}
      </Text>
      <Text className="text-sm text-neutral-500 leading-5 m-0">
        Didn&apos;t request this? You can safely ignore this email — no one will
        be signed in without using the link above.
      </Text>
    </EmailLayout>
  );
}

MagicLinkEmail.PreviewProps = {
  name: "Ada",
  magicLink: "https://community.wigxel.com/auth/verify?token=example-token",
  expiresInMinutes: 15,
} satisfies MagicLinkEmailProps;

export default MagicLinkEmail;
