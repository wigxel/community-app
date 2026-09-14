import { Alert } from "@hyperbridge/ui/icons";
import { InfoIcon } from "lucide-react";

export function AlertBox({
  children,
  heading,
  severity = "error",
}: {
  severity?: "error" | "warning" | "info";
  heading: string;
  children?: React.ReactNode;
}) {
  const icon = icons[severity];
  return (
    <div className="corner-sharp bg-brand-black-500 text-muted-foreground flex flex-col items-start gap-3 rounded-2xl px-3 py-2.5 md:flex-row">
      <div
        className="text-brand-danger-500 shrink-0 grow-0 items-center justify-center"
        style={{ fontSize: "calc(1.5rem)" }}
      >
        {icon}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="text-body-2 text-foreground font-medium">{heading}</p>
        {children ? (
          <p className="text-caption-2 text-muted-foreground font-medium wrap-break-word">
            {children}
          </p>
        ) : null}
      </div>
    </div>
  );
}

const icons = {
  error: <Alert />,
  warning: <Alert />,
  info: <InfoIcon />,
};
