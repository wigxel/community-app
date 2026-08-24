import {
  Body,
  Container,
  Font,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

type EmailLayoutProps = {
  preview: string;
  children: ReactNode;
};

const APP_NAME = "Community App";
const APP_URL = process.env.SITE_URL ?? "https://community.wigxel.com";
const SUPPORT_EMAIL = "support@wigxel.com";

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily={["Helvetica", "Arial", "sans-serif"]}
          webFont={{
            url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-neutral-50 py-10 font-sans">
          <Container className="mx-auto max-w-[560px] rounded-xl border border-solid border-neutral-200 bg-white px-10 py-8">
            <Section>
              <Link
                href={APP_URL}
                className="text-lg font-semibold tracking-tight text-neutral-900 no-underline"
              >
                {APP_NAME}
              </Link>
            </Section>
            <Hr className="my-6 border-neutral-200" />
            <Section>{children}</Section>
            <Hr className="my-8 border-neutral-200" />
            <Section>
              <Text className="m-0 text-xs leading-5 text-neutral-500">
                {APP_NAME} &middot; Connecting local businesses with students
                for internships.
              </Text>
              <Text className="m-0 mt-2 text-xs leading-5 text-neutral-500">
                Questions? Reach us at{" "}
                <Link
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-neutral-700 underline"
                >
                  {SUPPORT_EMAIL}
                </Link>
                .
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export const emailBrand = { APP_NAME, APP_URL, SUPPORT_EMAIL };
