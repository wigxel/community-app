import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("global toast provider", () => {
  it("mounts one Sonner Toaster across the root layout and providers", () => {
    const rootFiles = ["app/layout.tsx", "app/providers.tsx"];
    const mountCount = rootFiles.reduce((count, file) => {
      const source = readFileSync(resolve(process.cwd(), file), "utf8");
      return count + (source.match(/<Toaster\b/g)?.length ?? 0);
    }, 0);

    expect(mountCount).toBe(1);
  });
});
