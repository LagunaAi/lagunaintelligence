import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, HandCoins, AlertTriangle, CheckCircle2, Scale } from "lucide-react";

interface CapexWaasRecommendationProps {
  companySize: 'small' | 'mid' | 'large';
  physicalRiskScore: number;
  regulatoryRiskScore: number;
  overallRiskScore: number;
  industrySector: string;
}

type RecommendationType = 'capex' | 'waas' | 'hybrid';

interface FactorAnalysis {
  factor: string;
  profile: string;
  favors: 'CAPEX' | 'WaaS';
}

const CapexWaasRecommendation = ({
  companySize,
  physicalRiskScore,
  regulatoryRiskScore,
  overallRiskScore,
  industrySector,
}: CapexWaasRecommendationProps) => {
  // Calculate WaaS score starting at 50 (neutral)
  let waasScore = 50;

  // Company size factors
  if (companySize === 'small') waasScore += 20;
  if (companySize === 'mid') waasScore += 10;
  if (companySize === 'large') waasScore -= 20;

  // Risk-based factors
  if (physicalRiskScore > 60) waasScore += 10; // High physical risk
  if (regulatoryRiskScore > 60) waasScore += 15; // High regulatory risk
  if (regulatoryRiskScore <= 30) waasScore -= 10; // Low regulatory risk
  if (overallRiskScore > 70) waasScore += 10; // High overall risk
  if (overallRiskScore < 40) waasScore -= 10; // Low overall risk

  // Implementation urgency (derived from high physical risk)
  if (physicalRiskScore > 70) waasScore += 15;

  // Clamp score between 0 and 100
  waasScore = Math.max(0, Math.min(100, waasScore));

  // Determine recommendation
  let recommendation: RecommendationType;
  let recommendationLabel: string;
  let recommendationColor: string;
  let recommendationBgColor: string;

  if (waasScore > 65) {
    recommendation = 'waas';
    recommendationLabel = 'Recommend Water-as-a-Service';
    recommendationColor = 'text-blue-600';
    recommendationBgColor = 'bg-blue-50 border-blue-200';
  } else if (waasScore < 35) {
    recommendation = 'capex';
    recommendationLabel = 'Recommend CAPEX Investment';
    recommendationColor = 'text-green-600';
    recommendationBgColor = 'bg-green-50 border-green-200';
  } else {
    recommendation = 'hybrid';
    recommendationLabel = 'Consider Hybrid Approach';
    recommendationColor = 'text-yellow-600';
    recommendationBgColor = 'bg-yellow-50 border-yellow-200';
  }

  // Build factor analysis table
  const factors: FactorAnalysis[] = [
    {
      factor: 'Company Size',
      profile: companySize === 'small' ? 'Small' : companySize === 'mid' ? 'Mid-size' : 'Large',
      favors: companySize === 'large' ? 'CAPEX' : 'WaaS',
    },
    {
      factor: 'Implementation Urgency',
      profile: physicalRiskScore > 70 ? 'High' : physicalRiskScore > 40 ? 'Medium' : 'Low',
      favors: physicalRiskScore > 60 ? 'WaaS' : 'CAPEX',
    },
    {
      factor: 'Regulatory Risk',
      profile: regulatoryRiskScore > 60 ? 'High' : regulatoryRiskScore > 30 ? 'Medium' : 'Low',
      favors: regulatoryRiskScore > 50 ? 'WaaS' : 'CAPEX',
    },
    {
      factor: 'Technology Stability',
      profile: regulatoryRiskScore > 60 || overallRiskScore > 70 ? 'Evolving' : 'Stable',
      favors: regulatoryRiskScore > 60 || overallRiskScore > 70 ? 'WaaS' : 'CAPEX',
    },
  ];

  const capexPercentage = 100 - waasScore;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Investment Model Recommendation: CAPEX vs Water-as-a-Service
        </CardTitle>
        <CardDescription>
          Based on your risk profile and company characteristics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recommendation Badge */}
        <div className={`p-4 rounded-lg border-2 ${recommendationBgColor}`}>
          <div className="flex items-center gap-3">
            {recommendation === 'capex' && <Building2 className={`h-8 w-8 ${recommendationColor}`} />}
            {recommendation === 'waas' && <HandCoins className={`h-8 w-8 ${recommendationColor}`} />}
            {recommendation === 'hybrid' && <AlertTriangle className={`h-8 w-8 ${recommendationColor}`} />}
            <div>
              <div className={`text-xl font-bold ${recommendationColor}`}>
                {recommendationLabel}
              </div>
              <div className="text-sm text-muted-foreground">
                Score: {waasScore}/100 on WaaS preference scale
              </div>
            </div>
          </div>
        </div>

        {/* Visual Gauge */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-green-600">CAPEX (Own)</span>
            <span className="text-blue-600">WaaS (Service)</span>
          </div>
          <div className="relative h-4 bg-gradient-to-r from-green-200 via-yellow-200 to-blue-200 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 h-full w-1 bg-foreground rounded-full shadow-lg transition-all duration-500"
              style={{ left: `calc(${waasScore}% - 2px)` }}
            />
            <div 
              className="absolute -top-1 h-6 w-6 bg-foreground rounded-full shadow-lg flex items-center justify-center transition-all duration-500"
              style={{ left: `calc(${waasScore}% - 12px)` }}
            >
              <div className="h-3 w-3 bg-background rounded-full" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{capexPercentage}% toward CAPEX</span>
            <span>{waasScore}% toward WaaS</span>
          </div>
        </div>

        {/* Comparison Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CAPEX Column */}
          <div className={`p-4 rounded-lg border ${recommendation === 'capex' ? 'border-green-300 bg-green-50/50' : 'border-border bg-muted/30'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-700">CAPEX (Own)</h3>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Large upfront investment</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Tax benefits via depreciation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>You own the asset</span>
              </li>
            </ul>
            <div className="mt-3 pt-3 border-t border-green-200">
              <p className="text-xs text-muted-foreground">
                <strong>Best for:</strong> Large companies, 20+ year horizon, stable technology needs
              </p>
            </div>
          </div>

          {/* WaaS Column */}
          <div className={`p-4 rounded-lg border ${recommendation === 'waas' ? 'border-blue-300 bg-blue-50/50' : 'border-border bg-muted/30'}`}>
            <div className="flex items-center gap-2 mb-3">
              <HandCoins className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-700">WaaS (Service)</h3>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <span>Spread payments over time</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <span>Off-balance sheet</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <span>Provider handles operations</span>
              </li>
            </ul>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-muted-foreground">
                <strong>Best for:</strong> Mid-size companies, faster implementation, evolving regulations
              </p>
            </div>
          </div>
        </div>

        {/* Factor Analysis Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-semibold">Factor</th>
                <th className="text-left py-2 font-semibold">Your Profile</th>
                <th className="text-left py-2 font-semibold">Favors</th>
              </tr>
            </thead>
            <tbody>
              {factors.map((f, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 text-muted-foreground">{f.factor}</td>
                  <td className="py-2 font-medium">{f.profile}</td>
                  <td className="py-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      f.favors === 'CAPEX' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {f.favors}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Disclaimer */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <strong>Disclaimer:</strong> This recommendation is for informational purposes only. 
          Consult financial advisors for specific investment decisions.
        </div>
      </CardContent>
    </Card>
  );
};

export default CapexWaasRecommendation;
