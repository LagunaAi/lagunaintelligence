import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

interface RiskScoreCardProps {
  title: string;
  score: number;
  description: string;
}

const RiskScoreCard = ({ title, score, description }: RiskScoreCardProps) => {
  const getRiskLevel = (score: number) => {
    if (score <= 30) return { level: "Low", color: "text-green-600", bgColor: "bg-green-50", icon: CheckCircle };
    if (score <= 60) return { level: "Medium", color: "text-yellow-600", bgColor: "bg-yellow-50", icon: AlertTriangle };
    return { level: "High", color: "text-red-600", bgColor: "bg-red-50", icon: AlertCircle };
  };

  const risk = getRiskLevel(score);
  const Icon = risk.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <Icon className={`h-5 w-5 ${risk.color}`} />
        </div>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-2xl font-bold ${risk.color}`}>{score}</span>
            <span className={`text-sm font-medium px-2 py-1 rounded ${risk.bgColor} ${risk.color}`}>
              {risk.level} Risk
            </span>
          </div>
          <Progress value={score} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskScoreCard;
