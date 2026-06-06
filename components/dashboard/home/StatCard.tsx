import type { ReactNode } from "react";
import { Card, CardContent } from "~/components/ui/card";

const StatCard = ({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
}) => (
  <Card className="bg-blue-500/20 text-blue-300 border border-white/10">
    <CardContent className="flex items-center gap-3 pt-6">
      {icon}
      <div>
        <p className="text-sm text-white/60">{label}</p>
        <p className="text-xl font-semibold text-white">{value}</p>
      </div>
    </CardContent>
  </Card>
);

export default StatCard;
