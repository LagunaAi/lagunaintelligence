import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Shield, Droplets, DollarSign } from "lucide-react";

interface RiskItem {
  name: string;
  score: number;
  level: 'low' | 'medium' | 'high';
  reason: string;
  icon: 'physical' | 'regulatory' | 'reputational' | 'financial' | 'quality';
}

interface KeyRisksProfileProps {
  industry: string;
  location: string;
  risks: RiskItem[];
}

const iconMap = {
  physical: Droplets,
  regulatory: Shield,
  reputational: AlertTriangle,
  financial: DollarSign,
  quality: TrendingUp
};

const levelStyles = {
  low: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    dot: "bg-green-500"
  },
  medium: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500"
  },
  high: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500"
  }
};

const KeyRisksProfile = ({ industry, location, risks }: KeyRisksProfileProps) => {
  // Sort by score descending and take top 4
  const topRisks = [...risks].sort((a, b) => b.score - a.score).slice(0, 4);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Key Risks for Your Profile</CardTitle>
        <p className="text-sm text-muted-foreground">
          {industry} in {location}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topRisks.map((risk, index) => {
            const Icon = iconMap[risk.icon];
            const styles = levelStyles[risk.level];
            
            return (
              <div
                key={risk.name}
                className={`p-3 rounded-lg border ${styles.border} ${styles.bg}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${styles.bg}`}>
                    <Icon className={`h-4 w-4 ${styles.text}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
                      <span className={`font-semibold ${styles.text}`}>
                        {risk.name}: {risk.level.toUpperCase()}
                      </span>
                      <Badge variant="outline" className={`${styles.text} ${styles.border} ml-auto`}>
                        {risk.score}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {risk.reason}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {risks.length > 4 && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            + {risks.length - 4} more risk categories assessed
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default KeyRisksProfile;
