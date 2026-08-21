import "react";

declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
    cornerShape?: "squircle" | "bevel" | "scoop" | "notch";
  }
}
