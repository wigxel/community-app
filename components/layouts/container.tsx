import { cn } from "~/lib/utils";

const levels = {
  max: "container",
  inner: "container lg:w-[80svw]",
};
export type ContainerProps = React.ComponentProps<"div"> & {
  level?: keyof typeof levels;
};
export function Container(props: ContainerProps) {
  const { children, className, level = "max", ...restProps } = props;

  return (
    <div
      {...restProps}
      className={cn("mx-auto px-4", levels[level], className)}
    >
      {children}
    </div>
  );
}
