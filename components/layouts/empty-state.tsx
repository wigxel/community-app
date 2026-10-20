"use client";
import {
  EmptyStateConceal,
  EmptyStateContent,
  EmptyStateDescription as EmptyStateDescriptionMain,
  EmptyState as EmptyStateRoot,
  EmptyStateTitle as EmptyStateTitleMain,
} from "@hyperbridge/ui";
import { AlertOctagon } from "lucide-react";
import { cn } from "~/lib/utils";
import { FABPlusIcon, FAButton } from "../ui/fab-button";
import { SectionCard } from "./section-card";

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

export type BaseEmptyStateProps = {
  heading: React.ReactNode;
  children?: React.ReactNode;
};

export function BaseEmptyState(props: BaseEmptyStateProps) {
  const { heading, children } = props;

  return (
    <EmptyState isEmpty={true}>
      <EmptyState.Content>
        <SectionCard className="flex min-h-100 w-full flex-col items-center justify-center">
          <AlertOctagon className="text-3xl text-yellow-500" />

          <EmptyState.Title className="mt-4">{heading}</EmptyState.Title>
          {children ? (
            <EmptyState.Description>{children}</EmptyState.Description>
          ) : null}
        </SectionCard>
      </EmptyState.Content>
    </EmptyState>
  );
}
