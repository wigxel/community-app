import { ToastBox } from "@hyperbridge/ui";
import { Either } from "effect";
import { isNullable as isNil } from "effect/Predicate";
import type { ReactNode } from "react";
import { toast as sonnerToast } from "sonner";

type ToastSeverity = "success" | "error" | "warning" | "info";

interface ToastOptions {
  id?: string | number;
  heading?: string;
  description?: ReactNode;
  duration?: number;
  actions?: ReactNode;
  onDismiss?: () => void;
}

const createToast = (severity: ToastSeverity) => {
  return (message: ReactNode, options: ToastOptions = {}) => {
    const {
      heading,
      description,
      duration = 4000,
      actions,
      onDismiss,
      ...rest
    } = options;

    return sonnerToast.custom(
      (toastId) => (
        <ToastBox
          severity={severity}
          heading={heading || getSeverityHeading(severity)}
          actions={actions}
          onDismiss={() => {
            sonnerToast.dismiss(toastId);
            onDismiss?.();
          }}
        >
          <div className="lg:min-w-[30ch]">{description || message}</div>
        </ToastBox>
      ),
      {
        duration,
        dismissible: true,
        ...rest,
      },
    );
  };
};

const getSeverityHeading = (severity: ToastSeverity): string => {
  const headings = {
    success: "Success",
    error: "Error",
    warning: "Warning",
    info: "Info",
  };
  return headings[severity];
};

export const toast = {
  success: createToast("success"),
  error: createToast("error"),
  warning: createToast("warning"),
  info: createToast("info"),

  custom: (
    severity: ToastSeverity,
    message: ReactNode,
    options?: ToastOptions,
  ) => {
    return createToast(severity)(message, options);
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: { heading?: string; description?: ReactNode };
      success: { heading?: string; description?: ReactNode };
      error: { heading?: string; description?: ReactNode };
    },
  ) => {
    return sonnerToast.promise(promise, {
      loading: (
        <ToastBox
          severity="info"
          heading={loading.heading || "Loading"}
          onDismiss={() => sonnerToast.dismiss()}
        >
          {loading.description}
        </ToastBox>
      ),
      success: () => (
        <ToastBox
          severity="success"
          heading={success.heading || "Success"}
          onDismiss={() => {
            sonnerToast.dismiss();
          }}
        >
          {success.description}
        </ToastBox>
      ),
      error: () => (
        <ToastBox
          severity="error"
          heading={error.heading || "Error"}
          onDismiss={() => {
            sonnerToast.dismiss();
          }}
        >
          {error.description}
        </ToastBox>
      ),
    });
  },

  dismiss: sonnerToast.dismiss,
  dismissAll: () => sonnerToast.dismiss(),
};

export function findToasterRootElementFrom(
  el: HTMLElement | null,
): Either.Either<HTMLElement, Error> {
  if (isNil(el)) {
    return Either.left(new Error("Element required to find root Toaster"));
  }

  if (el === document.body) {
    return Either.left(new Error("Toaster not found"));
  }

  if (!el.hasAttribute("data-sonner-toaster")) {
    return findToasterRootElementFrom(el.parentElement);
  }

  return Either.right(el);
}
