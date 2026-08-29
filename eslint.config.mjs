import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: [
      // "next/core-web-vitals",
      "next/typescript",
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "sonner",
              importNames: ["toast"],
              message:
                "Use '~/lib/toast' instead of importing from 'sonner' directly.",
            },
          ],
        },
      ],
    },
    ignorePatterns: [
      "node_modules",
      "public",
      "tests/setup.ts",
      "**/__tests__/*",
      "**/*.test.ts",
      "**/*.test.tsx",
    ],
  }),
];

export default eslintConfig;
