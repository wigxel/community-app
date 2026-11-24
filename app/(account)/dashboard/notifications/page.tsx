"use client";

import {
  Authenticated,
  useConvexAuth,
  useMutation,
  usePaginatedQuery,
} from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { Loader } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "~/components/layouts/empty-state";
import { SectionCard } from "~/components/layouts/section-card";
import { Button } from "~/components/ui/button";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";

type NotificationCardProps = {
  notification: {
    _id: Id<"notifications">;
    _creationTime: number;
    title: string;
    body?: string;
    href: string;
    readAt?: number;
  };
};

function NotificationCard({ notification }: NotificationCardProps) {
  const markRead = useMutation(api.notifications.markRead);

  const handleMarkRead = async () => {
    await markRead({ id: notification._id });
  };

  return (
    <div
      className={`flex items-start gap-4 rounded-xl border p-4 transition-colors ${
        notification.readAt
          ? "bg-background border-border/50 opacity-70"
          : "bg-muted/30 border-border shadow-sm"
      }`}
    >
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="font-medium">{notification.title}</span>
          <span className="text-muted-foreground text-xs">
            {formatDistanceToNow(notification._creationTime, {
              addSuffix: true,
            })}
          </span>
        </div>

        {notification.body && (
          <p className="text-muted-foreground text-sm">{notification.body}</p>
        )}

        <div className="mt-2 flex items-center gap-4">
          <Link
            href={notification.href}
            className="text-primary text-sm hover:underline"
          >
            View details
          </Link>

          {!notification.readAt && (
            <button
              type="button"
              onClick={handleMarkRead}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationsContent() {
  const { isAuthenticated } = useConvexAuth();
  const { results, status, loadMore } = usePaginatedQuery(
    api.notifications.list,
    isAuthenticated ? {} : "skip",
    { initialNumItems: 20 },
  );

  const markAllRead = useMutation(api.notifications.markAllRead);

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        {results.length > 0 && (
          <Button type="button" variant="outline" onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <p className="text-muted-foreground text-sm">
        You have {results.length} notifications.
      </p>
      <SectionCard className="overflow-hidden p-0">
        {status === "LoadingFirstPage" ? (
          <div className="flex h-64 w-full items-center justify-center">
            <Loader className="text-muted-foreground animate-spin" />
          </div>
        ) : (
          <EmptyState isEmpty={results.length === 0}>
            <EmptyState.Content>
              <SectionCard className="flex min-h-50 w-full flex-col items-center justify-center border-0 bg-transparent">
                <EmptyState.Title>No notifications yet</EmptyState.Title>
                <EmptyState.Description>
                  When you get a welcome message or security alert, it will show
                  up here.
                </EmptyState.Description>
              </SectionCard>
            </EmptyState.Content>

            <EmptyState.Conceal>
              <div className="divide-border flex flex-col gap-0 divide-y">
                {results.map((notification) => (
                  <NotificationCard
                    key={notification._id}
                    notification={notification}
                  />
                ))}

                {status === "CanLoadMore" && (
                  <div className="border-border flex justify-center border-t p-4">
                    <Button variant="ghost" onClick={() => loadMore(20)}>
                      Load more
                    </Button>
                  </div>
                )}
              </div>
            </EmptyState.Conceal>
          </EmptyState>
        )}
      </SectionCard>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Authenticated>
      <NotificationsContent />
    </Authenticated>
  );
}
