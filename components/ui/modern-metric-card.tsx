import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModernMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function ModernMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-primary",
  trend,
  className
}: ModernMetricCardProps) {
  return (
    <Card className={cn("metric-card group cursor-default", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="text-sm font-medium text-muted-foreground">
          {title}
        </div>
        <div className={cn(
          "p-2 rounded-lg transition-colors group-hover:bg-muted/50",
          "bg-muted/20"
        )}>
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="text-2xl font-bold tracking-tight">
            {value}
          </div>
          {subtitle && (
            <div className="text-xs text-muted-foreground">
              {subtitle}
            </div>
          )}
        </div>
        
        {trend && (
          <div className="flex items-center space-x-1 mt-3">
            <div className={cn(
              "text-xs font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              {trend.isPositive ? "+" : ""}{trend.value}
            </div>
            <div className="text-xs text-muted-foreground">
              vs mois dernier
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
