import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, MessageSquare, Search, Calendar, ExternalLink, Lightbulb } from "lucide-react";
import RiskScoreCard from "@/components/risk/RiskScoreCard";
import ReputationalRiskFeed from "@/components/risk/ReputationalRiskFeed";
import IndustryBenchmark from "@/components/risk/IndustryBenchmark";
import FloodRiskSpotlight from "@/components/risk/FloodRiskSpotlight";
import PeerInsights from "@/components/risk/PeerInsights";
import { DemoBanner } from "@/components/DemoBanner";
import { DemoRestrictionModal } from "@/components/DemoRestrictionModal";
import { 
  DEMO_ASSESSMENT, 
  DEMO_NEWS, 
  DEMO_COMPARATIVE_INTELLIGENCE 
} from "@/contexts/DemoContext";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const Demo = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [restrictionModalOpen, setRestrictionModalOpen] = useState(false);

  useEffect(() => {
    // Store demo mode in session
    sessionStorage.setItem("laguna_demo_mode", "true");
    // Simulate loading for realism
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const getRiskLevel = (score: number) => {
    if (score <= 30) return { level: "Low", color: "text-green-600" };
    if (score <= 60) return { level: "Medium", color: "text-yellow-600" };
    return { level: "High", color: "text-red-600" };
  };

  const handleRestrictedAction = () => {
    setRestrictionModalOpen(true);
  };

  const overallRisk = getRiskLevel(DEMO_ASSESSMENT.overall_risk_score);

  if (loading) {
    return (
      <>
        <DemoBanner />
        <Layout>
          <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[50vh]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading demo assessment...</p>
            </div>
          </div>
        </Layout>
      </>
    );
  }

  return (
    <>
      <DemoBanner />
      <Layout>
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Water Risk Dashboard</h1>
            <p className="text-muted-foreground">
              Assessment for <span className="font-semibold">{DEMO_ASSESSMENT.company_name}</span> · {DEMO_ASSESSMENT.industry_sector}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {DEMO_ASSESSMENT.facilities_count} facilities · Phoenix, Arizona, USA · {(DEMO_ASSESSMENT.annual_water_consumption / 1000000).toFixed(1)}M m³/year
            </p>
          </div>

          {/* Overall Risk Score */}
          <Card className="mb-8 border-2">
            <CardHeader>
              <CardTitle>Overall Water Risk Score</CardTitle>
              <CardDescription>
                Demo assessment for Arizona Semiconductor Manufacturing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                <div className="flex-1">
                  <div className={`text-6xl font-bold ${overallRisk.color}`}>
                    {DEMO_ASSESSMENT.overall_risk_score}
                  </div>
                  <div className="text-lg text-muted-foreground mt-2">
                    {overallRisk.level} Risk
                  </div>
                </div>
                <div className="flex-1">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">0-30:</span>
                      <span className="text-green-600 font-medium">Low Risk</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">31-60:</span>
                      <span className="text-yellow-600 font-medium">Medium Risk</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">61-100:</span>
                      <span className="text-red-600 font-medium">High Risk</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comparative Intelligence Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Comparative Intelligence</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <IndustryBenchmark
                userConsumption={DEMO_COMPARATIVE_INTELLIGENCE.industryBenchmark.userConsumption}
                industryAverage={DEMO_COMPARATIVE_INTELLIGENCE.industryBenchmark.industryAverage}
                unit={DEMO_COMPARATIVE_INTELLIGENCE.industryBenchmark.unit}
                status={DEMO_COMPARATIVE_INTELLIGENCE.industryBenchmark.status}
                percentageDifference={DEMO_COMPARATIVE_INTELLIGENCE.industryBenchmark.percentageDifference}
                insight={DEMO_COMPARATIVE_INTELLIGENCE.industryBenchmark.insight}
                industry={DEMO_ASSESSMENT.industry_sector}
              />
              <FloodRiskSpotlight
                region="Arizona"
                country="United States"
                riskLevel={DEMO_COMPARATIVE_INTELLIGENCE.floodRisk.riskLevel}
                score={DEMO_COMPARATIVE_INTELLIGENCE.floodRisk.score}
                factors={DEMO_COMPARATIVE_INTELLIGENCE.floodRisk.factors}
                seasonalPeak={DEMO_COMPARATIVE_INTELLIGENCE.floodRisk.seasonalPeak}
                insight={DEMO_COMPARATIVE_INTELLIGENCE.floodRisk.insight}
              />
              <PeerInsights
                industry={DEMO_ASSESSMENT.industry_sector}
                country="United States"
                insights={DEMO_COMPARATIVE_INTELLIGENCE.peerInsights}
              />
            </div>
          </div>

          {/* Risk Breakdown */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Risk Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <RiskScoreCard
                title="Physical Risk"
                score={DEMO_ASSESSMENT.physical_risk_score}
                description={DEMO_ASSESSMENT.risk_factors.physical}
              />
              <RiskScoreCard
                title="Financial Risk"
                score={DEMO_ASSESSMENT.financial_risk_score}
                description={DEMO_ASSESSMENT.risk_factors.financial}
              />
              <RiskScoreCard
                title="Governance Risk"
                score={DEMO_ASSESSMENT.water_quality_risk_score}
                description={DEMO_ASSESSMENT.risk_factors.governance}
              />
              <RiskScoreCard
                title="Regulatory Risk"
                score={DEMO_ASSESSMENT.regulatory_risk_score}
                description={DEMO_ASSESSMENT.risk_factors.regulatory}
              />
              <RiskScoreCard
                title="Reputational Risk"
                score={DEMO_ASSESSMENT.reputational_risk_score}
                description={DEMO_ASSESSMENT.risk_factors.reputational}
              />
            </div>
          </div>

          {/* Industry Insights */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Industry-Specific Insights</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {DEMO_ASSESSMENT.industry_insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recommended Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Recommended Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEMO_ASSESSMENT.recommended_actions.map((action, index) => (
                <Card key={index} className={`${action.priority === 'high' ? 'border-red-200 bg-red-50/50' : 'border-yellow-200 bg-yellow-50/50'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-semibold">{action.title}</CardTitle>
                      <Badge variant="outline" className={action.priority === 'high' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}>
                        {action.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                    <div className="bg-background/80 rounded-md p-3 border">
                      <p className="text-xs font-medium text-foreground mb-1">Expected Impact:</p>
                      <p className="text-xs text-muted-foreground">{action.expected_impact}</p>
                    </div>
                    {action.similar_project && (
                      <Link 
                        to={`/project/${action.similar_project.id}`}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Similar: {action.similar_project.name}
                        {action.similar_project.detail && (
                          <span className="text-muted-foreground text-xs">({action.similar_project.detail})</span>
                        )}
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Reputational Risk Signals */}
          <div className="mb-8">
            <ReputationalRiskFeed 
              industrySector={DEMO_ASSESSMENT.industry_sector}
              country={DEMO_ASSESSMENT.primary_location_country}
              reputationalNews={DEMO_NEWS}
              compact={false}
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              className="w-full h-auto py-6 flex flex-col items-center gap-2"
              onClick={() => navigate('/explore')}
            >
              <Search className="h-6 w-6" />
              <span className="font-semibold">Explore Solutions</span>
              <span className="text-xs opacity-90">Browse relevant projects</span>
            </Button>
            <Button
              variant="outline"
              className="w-full h-auto py-6 flex flex-col items-center gap-2"
              onClick={() => navigate('/ask')}
            >
              <MessageSquare className="h-6 w-6" />
              <span className="font-semibold">Ask Laguna AI</span>
              <span className="text-xs opacity-90">Get personalized advice</span>
            </Button>
            <Button
              variant="outline"
              className="w-full h-auto py-6 flex flex-col items-center gap-2"
              onClick={handleRestrictedAction}
            >
              <Download className="h-6 w-6" />
              <span className="font-semibold">Download Report</span>
              <span className="text-xs opacity-90">PDF summary</span>
            </Button>
            <Button
              variant="outline"
              className="w-full h-auto py-6 flex flex-col items-center gap-2"
              onClick={() => toast.info("Consultation scheduling coming soon")}
            >
              <Calendar className="h-6 w-6" />
              <span className="font-semibold">Schedule Call</span>
              <span className="text-xs opacity-90">Talk to an expert</span>
            </Button>
          </div>
        </div>
      </Layout>
      
      <DemoRestrictionModal 
        open={restrictionModalOpen} 
        onClose={() => setRestrictionModalOpen(false)} 
      />
    </>
  );
};

export default Demo;
