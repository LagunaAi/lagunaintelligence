import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplets, Zap, Leaf, Users, Briefcase } from "lucide-react";

interface OutcomesDisplayProps {
  outcomes: any;
}

export const OutcomesDisplay = ({ outcomes }: OutcomesDisplayProps) => {
  const outcome = outcomes?.[0];
  
  if (!outcome) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">No outcomes data available</p>
        </CardContent>
      </Card>
    );
  }

  const impactMetrics = [
    {
      icon: Droplets,
      label: "Water Saved",
      value: outcome.water_saved_m3_year,
      unit: "m³/year",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900",
      formatter: (val: number) => `${(val / 1000).toLocaleString()}k`,
    },
    {
      icon: Droplets,
      label: "Water Produced",
      value: outcome.water_produced_m3_day,
      unit: "m³/day",
      color: "text-cyan-600",
      bgColor: "bg-cyan-100 dark:bg-cyan-900",
      formatter: (val: number) => val.toLocaleString(),
    },
    {
      icon: Zap,
      label: "Energy Saved",
      value: outcome.energy_saved_kwh_year,
      unit: "kWh/year",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
      formatter: (val: number) => `${(val / 1000).toLocaleString()}k`,
    },
    {
      icon: Leaf,
      label: "CO₂ Avoided",
      value: outcome.co2_avoided_tons_year,
      unit: "tons/year",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
      formatter: (val: number) => val.toLocaleString(),
    },
    {
      icon: Users,
      label: "Population Served",
      value: outcome.population_served,
      unit: "people",
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900",
      formatter: (val: number) => val.toLocaleString(),
    },
    {
      icon: Briefcase,
      label: "Jobs Created",
      value: outcome.jobs_created,
      unit: "positions",
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900",
      formatter: (val: number) => val.toString(),
    },
  ];

  const activeMetrics = impactMetrics.filter(m => m.value !== null && m.value !== undefined);

  return (
    <div className="space-y-6">
      {/* Impact Metrics Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {activeMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                    <p className="text-2xl font-bold">
                      {metric.formatter(metric.value)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{metric.unit}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* SDG Alignment */}
      <Card>
        <CardHeader>
          <CardTitle>UN Sustainable Development Goals Alignment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="px-3 py-1">
              SDG 6: Clean Water & Sanitation
            </Badge>
            {outcome.energy_saved_kwh_year && (
              <Badge variant="outline" className="px-3 py-1">
                SDG 7: Affordable & Clean Energy
              </Badge>
            )}
            {outcome.co2_avoided_tons_year && (
              <Badge variant="outline" className="px-3 py-1">
                SDG 13: Climate Action
              </Badge>
            )}
            {outcome.jobs_created && (
              <Badge variant="outline" className="px-3 py-1">
                SDG 8: Decent Work & Economic Growth
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confidence Score */}
      <Card>
        <CardHeader>
          <CardTitle>Data Quality</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${outcome.confidence_score}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-medium">{outcome.confidence_score}%</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Confidence score based on data verification and source reliability
          </p>
        </CardContent>
      </Card>
    </div>
  );
};