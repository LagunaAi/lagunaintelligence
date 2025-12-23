import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Download, MessageSquare, Search, Calendar } from "lucide-react";
import RiskScoreCard from "@/components/risk/RiskScoreCard";
import RecommendationCard from "@/components/risk/RecommendationCard";
import ReputationalRiskFeed from "@/components/risk/ReputationalRiskFeed";
import IndustryBenchmark from "@/components/risk/IndustryBenchmark";
import FloodRiskSpotlight from "@/components/risk/FloodRiskSpotlight";
import PeerInsights from "@/components/risk/PeerInsights";
import CapexWaasRecommendation from "@/components/risk/CapexWaasRecommendation";

interface RiskAssessment {
  id: string;
  company_name: string;
  industry_sector: string;
  primary_location_country: string;
  primary_location_region: string | null;
  overall_risk_score: number;
  physical_risk_score: number;
  regulatory_risk_score: number;
  reputational_risk_score: number;
  financial_risk_score: number;
  water_quality_risk_score: number;
  recommended_actions: any;
  created_at: string;
  annual_water_consumption: number;
  water_unit: string;
}

interface ComparativeIntelligence {
  industryBenchmark: {
    userConsumption: number;
    industryAverage: number;
    unit: string;
    status: 'efficient' | 'average' | 'high';
    percentageDifference: number;
    insight: string;
  };
  floodRisk: {
    riskLevel: 'low' | 'medium' | 'high';
    score: number;
    factors: string[];
    seasonalPeak: string;
    insight: string;
  };
  peerInsights: Array<{
    title: string;
    description: string;
    frequency: 'Common' | 'Very Common' | 'Emerging';
  }>;
}

interface ReputationalNewsItem {
  headline: string;
  source: string;
  date: string;
  summary: string;
  tags: string[];
  sentiment: 'negative' | 'warning';
}

const QUICK_SCAN_STORAGE_KEY = 'laguna_quick_scan_state';

const RiskDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [intelligence, setIntelligence] = useState<ComparativeIntelligence | null>(null);
  const [intelligenceLoading, setIntelligenceLoading] = useState(false);
  const [reputationalNews, setReputationalNews] = useState<ReputationalNewsItem[]>([]);

  useEffect(() => {
    loadLatestAssessment();
    
    // Load reputational news from Quick Scan session storage
    const savedState = sessionStorage.getItem(QUICK_SCAN_STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.parsedData?.reputationalNews) {
          setReputationalNews(parsed.parsedData.reputationalNews);
        }
      } catch (e) {
        console.error('Error loading reputational news from session:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (assessment) {
      loadComparativeIntelligence();
    }
  }, [assessment]);

  const loadLatestAssessment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('risk_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error("No risk assessment found. Please complete an assessment first.");
        navigate('/risk-assessment');
        return;
      }

      setAssessment(data);
    } catch (error: any) {
      console.error('Error loading assessment:', error);
      toast.error(error.message || "Failed to load assessment");
    } finally {
      setLoading(false);
    }
  };

  const loadComparativeIntelligence = async () => {
    if (!assessment) return;

    setIntelligenceLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-comparative-intelligence', {
        body: {
          industrySector: assessment.industry_sector,
          country: assessment.primary_location_country,
          region: assessment.primary_location_region,
          annualWaterConsumption: assessment.annual_water_consumption,
          waterUnit: assessment.water_unit
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setIntelligence(data);
    } catch (error: any) {
      console.error('Error loading comparative intelligence:', error);
      // Don't show toast - silently fail and just don't show the section
    } finally {
      setIntelligenceLoading(false);
    }
  };

  const getRiskLevel = (score: number) => {
    if (score <= 30) return { level: "Low", color: "text-green-600" };
    if (score <= 60) return { level: "Medium", color: "text-yellow-600" };
    return { level: "High", color: "text-red-600" };
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!assessment) {
    return null;
  }

  const overallRisk = getRiskLevel(assessment.overall_risk_score);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Water Risk Dashboard</h1>
            <p className="text-muted-foreground">
              Assessment for <span className="font-semibold">{assessment.company_name}</span> · {assessment.industry_sector}
            </p>
          </div>

          {/* Overall Risk Score */}
          <Card className="mb-8 border-2">
            <CardHeader>
              <CardTitle>Overall Water Risk Score</CardTitle>
              <CardDescription>
                Assessed on {new Date(assessment.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                <div className="flex-1">
                  <div className={`text-6xl font-bold ${overallRisk.color}`}>
                    {assessment.overall_risk_score}
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
          {(intelligence || intelligenceLoading) && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Comparative Intelligence</h2>
              {intelligenceLoading ? (
                <div className="flex items-center gap-3 text-muted-foreground p-8 border rounded-lg">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Generating industry insights...</span>
                </div>
              ) : intelligence && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <IndustryBenchmark
                    userConsumption={intelligence.industryBenchmark.userConsumption}
                    industryAverage={intelligence.industryBenchmark.industryAverage}
                    unit={intelligence.industryBenchmark.unit}
                    status={intelligence.industryBenchmark.status}
                    percentageDifference={intelligence.industryBenchmark.percentageDifference}
                    insight={intelligence.industryBenchmark.insight}
                    industry={assessment.industry_sector}
                  />
                  <FloodRiskSpotlight
                    region={assessment.primary_location_region || ''}
                    country={assessment.primary_location_country}
                    riskLevel={intelligence.floodRisk.riskLevel}
                    score={intelligence.floodRisk.score}
                    factors={intelligence.floodRisk.factors}
                    seasonalPeak={intelligence.floodRisk.seasonalPeak}
                    insight={intelligence.floodRisk.insight}
                  />
                  <PeerInsights
                    industry={assessment.industry_sector}
                    country={assessment.primary_location_country}
                    insights={intelligence.peerInsights}
                  />
                </div>
              )}
            </div>
          )}

          {/* Risk Breakdown */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Risk Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <RiskScoreCard
                title="Physical Risk"
                score={assessment.physical_risk_score}
                description="Water scarcity, flooding, and quality issues"
              />
              <RiskScoreCard
                title="Regulatory Risk"
                score={assessment.regulatory_risk_score}
                description="Permits, compliance, and discharge regulations"
              />
              <RiskScoreCard
                title="Reputational Risk"
                score={assessment.reputational_risk_score}
                description="ESG concerns and community relations"
              />
              <RiskScoreCard
                title="Financial Risk"
                score={assessment.financial_risk_score}
                description="Cost volatility and supply disruptions"
              />
              <RiskScoreCard
                title="Water Quality Risk"
                score={assessment.water_quality_risk_score}
                description="Intake quality, contaminants, and discharge compliance"
              />
            </div>
          </div>

          {/* Recommended Actions */}
          {assessment.recommended_actions && Array.isArray(assessment.recommended_actions) && assessment.recommended_actions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Recommended Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assessment.recommended_actions.map((action: any, index: number) => (
                  <RecommendationCard
                    key={index}
                    title={action.title}
                    description={action.description}
                    priority={action.priority}
                    industry={assessment.industry_sector}
                  />
                ))}
              </div>
            </div>
          )}

          {/* CAPEX vs WaaS Recommendation */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Investment Model Analysis</h2>
            <CapexWaasRecommendation
              companySize={
                assessment.annual_water_consumption > 1000000 ? 'large' :
                assessment.annual_water_consumption > 100000 ? 'mid' : 'small'
              }
              physicalRiskScore={assessment.physical_risk_score}
              regulatoryRiskScore={assessment.regulatory_risk_score}
              overallRiskScore={assessment.overall_risk_score}
              industrySector={assessment.industry_sector}
            />
          </div>

          {/* Reputational Risk Signals - Full mode */}
          <div className="mb-8">
            <ReputationalRiskFeed 
              industrySector={assessment.industry_sector}
              country={assessment.primary_location_country}
              reputationalNews={reputationalNews}
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
              onClick={() => toast.info("Report download coming soon")}
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
    </ProtectedRoute>
  );
};

export default RiskDashboard;
