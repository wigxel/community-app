import type { ReactNode } from "react";
import { Card, CardContent } from "~/components/ui/card";

type StatCardProps = {
  icon?: ReactNode;
  label: string;
  value: string;
};

function StatCard(props: StatCardProps) {
  const { icon, label, value } = props;

  return (
    <Card>
      <CardContent className="flex items-start gap-3 pt-6">
        <p className="text-muted-foreground flex flex-col gap-2 text-sm">
          {icon}
          {label}
        </p>
        <p className="text-foreground flex-1 text-end text-4xl font-normal">
          {String(value).padStart(2, "0")}
        </p>
      </CardContent>
    </Card>
  );
}

export default StatCard;
