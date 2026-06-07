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
        <Body className="bg-neutral-50 font-sans py-10">
          <Container className="bg-white max-w-[560px] mx-auto rounded-xl border border-solid border-neutral-200 px-10 py-8">
            <Section>
              <Link
                href={APP_URL}
                className="text-neutral-900 no-underline text-lg font-semibold tracking-tight"
              >
                {APP_NAME}
              </Link>
            </Section>
            <Hr className="border-neutral-200 my-6" />
            <Section>{children}</Section>
            <Hr className="border-neutral-200 my-8" />
            <Section>
              <Text className="text-xs text-neutral-500 leading-5 m-0">
                {APP_NAME} &middot; Connecting local businesses with students
                for internships.
              </Text>
              <Text className="text-xs text-neutral-500 leading-5 m-0 mt-2">
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
