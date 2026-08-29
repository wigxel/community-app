import {
  EmptyStateConceal,
  EmptyStateContent,
  EmptyStateDescription as EmptyStateDescriptionMain,
  EmptyState as EmptyStateRoot,
  EmptyStateTitle as EmptyStateTitleMain,
} from "@hyperbridge/ui";
import { cn } from "~/lib/utils";
import { FABPlusIcon, FAButton } from "../ui/fab-button";

function EmptyStateTitle(
  props: React.ComponentProps<typeof EmptyStateTitleMain>,
) {
  return (
    <EmptyStateTitleMain
      {...props}
      className={cn("text-[1.5rem]", props.className)}
    />
  );
}

function EmptyStateDescription(
  props: React.ComponentProps<typeof EmptyStateTitleMain>,
) {
  return (
    <EmptyStateDescriptionMain
      {...props}
      className={cn("text-base", props.className)}
    />
  );
}

function EmptyStateButton(props: React.ComponentProps<typeof FAButton>) {
  return (
    <FAButton {...props} className="mt-9 size-19 text-base">
      <FABPlusIcon />
    </FAButton>
  );
}

export const EmptyState = Object.assign(EmptyStateRoot, {
  Conceal: EmptyStateConceal,
  Content: EmptyStateContent,
  Description: EmptyStateDescription,
  Title: EmptyStateTitle,
  Button: EmptyStateButton,
});
