import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Droplets, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface FloodRiskSpotlightProps {
  region: string;
  country: string;
  riskLevel: 'low' | 'medium' | 'high';
  score: number;
  factors: string[];
  seasonalPeak: string;
  insight: string;
}

const FloodRiskSpotlight = ({
  region,
  country,
  riskLevel,
  score,
  factors,
  seasonalPeak,
  insight
}: FloodRiskSpotlightProps) => {
  const getRiskConfig = () => {
    switch (riskLevel) {
      case 'high':
        return {
          label: 'High Risk',
          color: 'bg-red-500/10 text-red-600 border-red-500/20',
          progressColor: 'bg-red-500',
          iconColor: 'text-red-500'
        };
      case 'medium':
        return {
          label: 'Medium Risk',
          color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
          progressColor: 'bg-yellow-500',
          iconColor: 'text-yellow-500'
        };
      default:
        return {
          label: 'Low Risk',
          color: 'bg-green-500/10 text-green-600 border-green-500/20',
          progressColor: 'bg-green-500',
          iconColor: 'text-green-500'
        };
    }
  };

  const config = getRiskConfig();

  return (
    <Card className="border-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Droplets className={`h-5 w-5 ${config.iconColor}`} />
            Flood Risk Spotlight
          </CardTitle>
          <Badge variant="outline" className={config.color}>
            {riskLevel === 'high' && <AlertTriangle className="h-3 w-3 mr-1" />}
            {config.label}
          </Badge>
        </div>
        <CardDescription>
          {region ? `${region}, ${country}` : country}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Flood Risk Score</span>
            <span className="font-medium">{score}/100</span>
          </div>
          <Progress value={score} className="h-2" />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Key Risk Factors:</p>
          <ul className="space-y-1">
            {factors.map((factor, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${config.progressColor}`} />
                {factor}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg p-3">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <span className="font-medium">Peak Season: </span>
            <span className="text-muted-foreground">{seasonalPeak}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground border-t pt-3">{insight}</p>
      </CardContent>
    </Card>
  );
};

export default FloodRiskSpotlight;
