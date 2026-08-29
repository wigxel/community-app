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
    <Card className="border border-white/10 bg-blue-500/20 text-blue-300">
      <CardContent className="flex items-center gap-3 pt-6">
        {icon}
        <div>
          <p className="text-sm text-white/60">{label}</p>
          <p className="text-xl font-semibold text-white">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCard;
