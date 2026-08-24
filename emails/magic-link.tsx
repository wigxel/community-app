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
        className="m-0 mb-4 text-2xl font-semibold text-neutral-900"
      >
        Sign in to {emailBrand.APP_NAME}
      </Heading>
      <Text className="m-0 mb-4 text-base leading-6 text-neutral-700">
        Hi {name}, click the button below to sign in. This link will expire in{" "}
        {expiresInMinutes} minutes and can only be used once.
      </Text>
      <Section className="mb-6">
        <Button
          href={magicLink}
          className="rounded-md bg-neutral-900 px-5 py-3 text-sm font-medium text-white no-underline"
        >
          Sign in
        </Button>
      </Section>
      <Text className="m-0 mb-4 text-sm leading-5 text-neutral-500">
        If the button doesn&apos;t work, paste this link into your browser:
        <br />
        {magicLink}
      </Text>
      <Text className="m-0 text-sm leading-5 text-neutral-500">
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
