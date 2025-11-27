import { MapPin, DollarSign, TrendingUp, Clock, Droplets } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProjectHeroProps {
  project: any;
  financials: any;
  outcomes: any;
}

export const ProjectHero = ({ project, financials, outcomes }: ProjectHeroProps) => {
  const getTechColor = (tech: string) => {
    const colors: Record<string, string> = {
      desalination: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      reuse: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      leak_detection: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      smart_metering: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    };
    return colors[tech] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-border">
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,transparent)]" />
      
      <div className="relative p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3">{project.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <MapPin className="h-4 w-4" />
              <span>{project.city ? `${project.city}, ` : ''}{project.country}</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge className={getTechColor(project.technology_type)}>
                {project.technology_type?.replace('_', ' ')}
              </Badge>
              <Badge variant="outline">{project.sector}</Badge>
              <Badge variant="secondary">{project.project_stage}</Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {financials?.[0]?.total_investment_usd && (
            <div className="bg-card/50 backdrop-blur rounded-lg p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Investment</span>
              </div>
              <p className="text-2xl font-bold">
                ${(financials[0].total_investment_usd / 1000000).toFixed(1)}M
              </p>
            </div>
          )}
          
          {financials?.[0]?.roi_percent !== null && (
            <div className="bg-card/50 backdrop-blur rounded-lg p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">ROI</span>
              </div>
              <p className="text-2xl font-bold">{financials[0].roi_percent}%</p>
            </div>
          )}

          {financials?.[0]?.payback_years && (
            <div className="bg-card/50 backdrop-blur rounded-lg p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-muted-foreground">Payback</span>
              </div>
              <p className="text-2xl font-bold">{financials[0].payback_years} yrs</p>
            </div>
          )}

          {outcomes?.[0]?.water_saved_m3_year && (
            <div className="bg-card/50 backdrop-blur rounded-lg p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-muted-foreground">Water Impact</span>
              </div>
              <p className="text-2xl font-bold">
                {(outcomes[0].water_saved_m3_year / 1000).toLocaleString()}k m³
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};