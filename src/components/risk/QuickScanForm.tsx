import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles, AlertTriangle, Zap, ArrowRight, RotateCcw } from "lucide-react";
import DetectedDataSection from "./DetectedDataSection";
import KeyRisksProfile from "./KeyRisksProfile";
import IndustryInsightsCard from "./IndustryInsightsCard";
import ReputationalRiskFeed from "./ReputationalRiskFeed";
import RecommendedActions from "./RecommendedActions";

interface RiskScoreDetail {
  score: number;
  level: string;
  factors: string[];
}

interface ParsedData {
  industrySector: string;
  primaryLocationCountry: string;
  primaryLocationRegion: string;
  facilitiesCount: number;
  waterSources: string[];
  waterDisruptions: boolean;
  currentTreatment: string;
  intakeWaterQuality: string;
  companyName: string;
  estimatedWaterConsumption: number;
  mentionedConcerns: string[];
  confidenceFields: Record<string, string>;
  industryBenchmark: {
    waterUseM3Year: number;
    waterUsePerDay: string;
    typicalSources: string[];
    keyRisks: string[];
    description: string;
  };
  regionalRiskFactors: Record<string, string> | null;
  industryInsights: string[];
  // New fields from enhanced prompt
  riskScores?: {
    overall: number;
    physical: RiskScoreDetail;
    regulatory: RiskScoreDetail;
    reputational: RiskScoreDetail;
    governance: RiskScoreDetail;
    financial: RiskScoreDetail;
  };
  topRisks?: Array<{
    category: string;
    score: number;
    headline: string;
    detail: string;
  }>;
  recommendations?: Array<{
    title: string;
    priority: string;
    description: string;
    expected_impact: string;
    example_project?: string | null;
  }>;
  newsKeywords?: string[];
  reputationalNews?: Array<{
    headline: string;
    source: string;
    date: string;
    summary: string;
    tags: string[];
    sentiment: "negative" | "warning";
  }>;
}

interface RiskData {
  overallRisk: number;
  physicalRisk: number;
  regulatoryRisk: number;
  reputationalRisk: number;
  financialRisk: number;
  governanceRisk: number;
  recommendations: any[];
}

const STORAGE_KEY = "laguna_quick_scan_state";

interface StoredState {
  step: "input" | "processing" | "review" | "complete";
  description: string;
  parsedData: ParsedData | null;
  riskData: RiskData | null;
}

const examplePrompts = [
  { label: "Chip factory in Phoenix", text: "We are a semiconductor manufacturing company in Phoenix, Arizona" },
  { label: "Data center in Dublin", text: "We run 2 data centers in Dublin, Ireland. We've faced some community pushback recently about water use." },
  { label: "Pharma in India", text: "Pharmaceutical manufacturing plant in Hyderabad, India. Municipal water supply. Concerned about upcoming PFAS regulations." },
  { label: "Mining in Chile", text: "Copper mining operation in Antofagasta, Chile. Groundwater and surface water sources. Past issues with water scarcity." }
];

const QuickScanForm = () => {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"input" | "processing" | "review" | "complete">("input");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [riskData, setRiskData] = useState<RiskData | null>(null);

  // Load persisted state on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const state: StoredState = JSON.parse(stored);
        if (state.step === "review" && state.parsedData && state.riskData) {
          setStep(state.step);
          setDescription(state.description);
          setParsedData(state.parsedData);
          setRiskData(state.riskData);
        }
      } catch (e) {
        console.error("Failed to restore quick scan state:", e);
      }
    }
  }, []);

  // Persist state when it changes
  useEffect(() => {
    if (step === "review" && parsedData && riskData) {
      const state: StoredState = { step, description, parsedData, riskData };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [step, description, parsedData, riskData]);

  const handleAnalyze = async () => {
    if (!description.trim()) {
      toast.error("Please describe your operation first");
      return;
    }

    if (description.trim().length < 15) {
      toast.error("Please provide more detail about your operation");
      return;
    }

    setLoading(true);
    setStep("processing");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Parse description with enhanced AI that includes risk scores
      toast.info("Analyzing your description with AI...");
      const { data: parsed, error: parseError } = await supabase.functions.invoke('parse-risk-description', {
        body: { description }
      });

      if (parseError) throw parseError;
      if (parsed.error) throw new Error(parsed.error);

      console.log('Parsed data:', parsed);
      setParsedData(parsed);

      // Use AI-generated risk scores if available, otherwise use calculate-risk
      if (parsed.riskScores) {
        console.log('Using AI-generated risk scores');
        const aiRisks: RiskData = {
          overallRisk: parsed.riskScores.overall || 50,
          physicalRisk: parsed.riskScores.physical?.score || 50,
          regulatoryRisk: parsed.riskScores.regulatory?.score || 50,
          reputationalRisk: parsed.riskScores.reputational?.score || 50,
          financialRisk: parsed.riskScores.financial?.score || 50,
          governanceRisk: parsed.riskScores.governance?.score || 50,
          recommendations: parsed.recommendations || []
        };
        setRiskData(aiRisks);
        setStep("review");
      } else {
        // Fallback to calculate-risk function
        toast.info("Calculating risk scores...");
        const { data: risks, error: riskError } = await supabase.functions.invoke('calculate-risk', {
          body: {
            industrySector: parsed.industrySector,
            waterSources: parsed.waterSources,
            waterDisruptions: parsed.waterDisruptions,
            currentTreatment: parsed.currentTreatment,
            primaryLocationCountry: parsed.primaryLocationCountry,
            primaryLocationRegion: parsed.primaryLocationRegion,
            intakeWaterQuality: parsed.intakeWaterQuality,
            primaryContaminants: [],
            treatmentBeforeUse: "Don't know",
            dischargePermitType: "Municipal sewer system",
            dischargeQualityConcerns: false,
            upstreamPollutionSources: [],
            waterQualityTestingFrequency: "Never / Don't know"
          }
        });

        if (riskError) throw riskError;

        console.log('Risk data:', risks);
        setRiskData(risks);
        setStep("review");
      }

    } catch (error: any) {
      console.error('Error in quick scan:', error);
      toast.error(error.message || "Failed to analyze. Please try again.");
      setStep("input");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndContinue = async () => {
    if (!parsedData || !riskData) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Save to database
      const { error: insertError } = await supabase
        .from('risk_assessments')
        .insert({
          user_id: user.id,
          company_name: parsedData.companyName + " (Quick Scan)",
          industry_sector: parsedData.industrySector,
          annual_water_consumption: parsedData.estimatedWaterConsumption,
          water_unit: "m3/year",
          primary_location_country: parsedData.primaryLocationCountry,
          primary_location_region: parsedData.primaryLocationRegion || null,
          facilities_count: parsedData.facilitiesCount,
          water_sources: parsedData.waterSources,
          water_disruptions_past_5y: parsedData.waterDisruptions,
          current_treatment_level: parsedData.currentTreatment,
          intake_water_source_quality: parsedData.intakeWaterQuality,
          discharge_permit_type: "Municipal sewer system",
          water_quality_testing_frequency: "Never / Don't know",
          overall_risk_score: riskData.overallRisk,
          physical_risk_score: riskData.physicalRisk,
          regulatory_risk_score: riskData.regulatoryRisk,
          reputational_risk_score: riskData.reputationalRisk,
          financial_risk_score: riskData.financialRisk,
          water_quality_risk_score: riskData.governanceRisk,
          recommended_actions: riskData.recommendations
        });

      if (insertError) throw insertError;

      setStep("complete");
      // Don't clear sessionStorage here - RiskDashboard needs to read reputationalNews from it
      toast.success("Quick scan completed!");
      navigate('/risk-dashboard');
    } catch (error: any) {
      console.error('Error saving assessment:', error);
      toast.error(error.message || "Failed to save assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("input");
    setParsedData(null);
    setRiskData(null);
    setDescription("");
    sessionStorage.removeItem(STORAGE_KEY); // Clear persisted state
  };

  const handleFieldUpdate = async (key: string, value: string | number) => {
    if (!parsedData) return;
    
    const updatedParsedData = {
      ...parsedData,
      [key]: value,
      confidenceFields: {
        ...parsedData.confidenceFields,
        [key]: "stated" // User corrected it, so now it's stated
      }
    };
    setParsedData(updatedParsedData);

    // Recalculate risk scores with updated values
    try {
      toast.info("Recalculating risk scores...");
      
      const { data: risks, error: riskError } = await supabase.functions.invoke('calculate-risk', {
        body: {
          industrySector: updatedParsedData.industrySector,
          waterSources: updatedParsedData.waterSources,
          waterDisruptions: updatedParsedData.waterDisruptions,
          currentTreatment: updatedParsedData.currentTreatment,
          primaryLocationCountry: updatedParsedData.primaryLocationCountry,
          primaryLocationRegion: updatedParsedData.primaryLocationRegion,
          intakeWaterQuality: updatedParsedData.intakeWaterQuality,
          facilitiesCount: updatedParsedData.facilitiesCount,
          estimatedWaterConsumption: updatedParsedData.estimatedWaterConsumption,
          primaryContaminants: [],
          treatmentBeforeUse: "Don't know",
          dischargePermitType: "Municipal sewer system",
          dischargeQualityConcerns: false,
          upstreamPollutionSources: [],
          waterQualityTestingFrequency: "Never / Don't know"
        }
      });

      if (riskError) throw riskError;

      setRiskData(risks);
      toast.success("Risk scores updated");
    } catch (error: any) {
      console.error('Error recalculating risks:', error);
      toast.error("Failed to recalculate risks");
    }
  };

  // Build risk items for KeyRisksProfile using AI-generated factors when available
  const buildRiskItems = (): Array<{
    name: string;
    score: number;
    level: 'low' | 'medium' | 'high';
    reason: string;
    icon: 'physical' | 'regulatory' | 'reputational' | 'financial' | 'governance';
  }> => {
    if (!riskData || !parsedData) return [];

    const location = parsedData.primaryLocationRegion || parsedData.primaryLocationCountry;
    const aiScores = parsedData.riskScores;

    const getLevel = (score: number): 'low' | 'medium' | 'high' => {
      if (score > 60) return 'high';
      if (score > 30) return 'medium';
      return 'low';
    };

    // Use AI-generated factors if available
    const getFactorReason = (category: string, fallback: string): string => {
      if (aiScores) {
        const scoreData = aiScores[category.toLowerCase() as keyof typeof aiScores];
        if (scoreData && typeof scoreData === 'object' && 'factors' in scoreData) {
          const factors = (scoreData as RiskScoreDetail).factors;
          if (factors && factors.length > 0) {
            return factors[0];
          }
        }
      }
      return fallback;
    };

    return [
      {
        name: "Physical Risk",
        score: riskData.physicalRisk,
        level: getLevel(riskData.physicalRisk),
        reason: getFactorReason('physical', `Water availability assessment for ${location}`),
        icon: 'physical' as const
      },
      {
        name: "Financial Risk",
        score: riskData.financialRisk,
        level: getLevel(riskData.financialRisk),
        reason: getFactorReason('financial', `Cost volatility assessment based on regional factors`),
        icon: 'financial' as const
      },
      {
        name: "Regulatory Risk",
        score: riskData.regulatoryRisk,
        level: getLevel(riskData.regulatoryRisk),
        reason: getFactorReason('regulatory', `Compliance requirements for ${parsedData.industrySector}`),
        icon: 'regulatory' as const
      },
      {
        name: "Reputational Risk",
        score: riskData.reputationalRisk,
        level: getLevel(riskData.reputationalRisk),
        reason: getFactorReason('reputational', `ESG and stakeholder perception for ${parsedData.industrySector}`),
        icon: 'reputational' as const
      },
      {
        name: "Governance Risk",
        score: riskData.governanceRisk,
        level: getLevel(riskData.governanceRisk),
        reason: getFactorReason('governance', `Water rights and jurisdiction complexity for ${location}`),
        icon: 'governance' as const
      }
    ];
  };

  // Build detected fields for display
  const buildDetectedFields = () => {
    if (!parsedData) return [];

    return [
      {
        label: "Industry",
        value: parsedData.industrySector,
        confidence: (parsedData.confidenceFields.industrySector || 'stated') as 'stated' | 'inferred',
        key: "industrySector",
        options: ["Semiconductors", "Data Centers", "Food & Beverage", "Pharmaceuticals", "Chemicals", "Mining", "Manufacturing", "Textiles", "Other"]
      },
      {
        label: "Location",
        value: parsedData.primaryLocationRegion 
          ? `${parsedData.primaryLocationRegion}, ${parsedData.primaryLocationCountry}`
          : parsedData.primaryLocationCountry,
        confidence: (parsedData.confidenceFields.primaryLocationCountry || 'stated') as 'stated' | 'inferred',
        key: "primaryLocationCountry",
        editable: false
      },
      {
        label: "Facilities",
        value: parsedData.facilitiesCount,
        confidence: (parsedData.confidenceFields.facilitiesCount || 'inferred') as 'stated' | 'inferred',
        key: "facilitiesCount"
      },
      {
        label: "Est. Water Use",
        value: parsedData.estimatedWaterConsumption,
        confidence: (parsedData.confidenceFields.estimatedWaterConsumption || 'inferred') as 'stated' | 'inferred',
        key: "estimatedWaterConsumption"
      },
      {
        label: "Water Sources",
        value: parsedData.waterSources.join(", "),
        confidence: (parsedData.confidenceFields.waterSources || 'inferred') as 'stated' | 'inferred',
        key: "waterSources",
        editable: false
      }
    ];
  };

  // Build industry insights
  const buildInsights = () => {
    if (!parsedData) return [];

    const insights = parsedData.industryInsights.map(text => ({ text }));
    
    // Add regional insight if available
    if (parsedData.regionalRiskFactors?.notes) {
      insights.push({
        text: parsedData.regionalRiskFactors.notes,
        source: "Regional Analysis"
      } as any);
    }

    return insights;
  };

  // Input step
  if (step === "input" || step === "processing") {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>AI Quick Scan</CardTitle>
            </div>
            <CardDescription>
              Describe your operation in plain language and let AI analyze your water risks instantly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Example prompts */}
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example) => (
                <Button
                  key={example.label}
                  variant="outline"
                  size="sm"
                  onClick={() => setDescription(example.text)}
                  disabled={loading}
                  className="text-xs"
                >
                  {example.label}
                </Button>
              ))}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Describe your operation</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g.: We are a semiconductor factory in Taiwan mainly using municipal water. We have had issues with water scarcity in previous years. Our facility treats water on-site before use in the manufacturing process."
                className="min-h-[180px] resize-none"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Include details like: industry type, location, water sources, any past water issues, and treatment practices.
              </p>
            </div>

            {step === "processing" && (
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <div>
                  <p className="text-sm font-medium">Analyzing your description...</p>
                  <p className="text-xs text-muted-foreground">AI is extracting key risk factors and calculating scores</p>
                </div>
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={loading || !description.trim()}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Quick Scan Disclaimer</AlertTitle>
          <AlertDescription>
            Results are based on AI estimates from your description. For a comprehensive and precise analysis, 
            please use the <strong>Detailed Assessment</strong> form which captures all relevant risk factors.
          </AlertDescription>
        </Alert>

        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <h4 className="font-medium mb-3">What the AI will extract:</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• <strong>Industry Sector</strong> - Semiconductors, data centers, pharmaceuticals, etc.</li>
              <li>• <strong>Location</strong> - Country and region for regional risk assessment</li>
              <li>• <strong>Facilities Count</strong> - Number of sites for water consumption estimates</li>
              <li>• <strong>Water Sources</strong> - Municipal, groundwater, surface water, etc.</li>
              <li>• <strong>Past Disruptions</strong> - Any water scarcity or supply issues mentioned</li>
              <li>• <strong>Treatment Level</strong> - Current water treatment and recycling practices</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Review step - show results before saving
  if (step === "review" && parsedData && riskData) {
    return (
      <div className="space-y-6">
        {/* Header with reset */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Quick Scan Results</h2>
            <p className="text-muted-foreground">Review and correct any AI assumptions before saving</p>
          </div>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Start Over
          </Button>
        </div>

        {/* Overall Risk Score Banner */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Overall Water Risk Score</p>
                <div className={`text-5xl font-bold ${
                  riskData.overallRisk > 60 ? 'text-red-600' : 
                  riskData.overallRisk > 30 ? 'text-amber-600' : 'text-green-600'
                }`}>
                  {riskData.overallRisk}
                </div>
                <p className="text-sm mt-1">
                  {riskData.overallRisk > 60 ? 'High Risk' : 
                   riskData.overallRisk > 30 ? 'Medium Risk' : 'Low Risk'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{parsedData.companyName}</p>
                <p className="text-sm text-muted-foreground">{parsedData.industrySector}</p>
                <p className="text-sm text-muted-foreground">
                  {parsedData.primaryLocationRegion 
                    ? `${parsedData.primaryLocationRegion}, ${parsedData.primaryLocationCountry}`
                    : parsedData.primaryLocationCountry}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column - Detected data */}
          <DetectedDataSection 
            fields={buildDetectedFields()}
            onFieldUpdate={handleFieldUpdate}
          />
          
          {/* Right column - Key risks */}
          <KeyRisksProfile
            industry={parsedData.industrySector}
            location={parsedData.primaryLocationRegion || parsedData.primaryLocationCountry}
            risks={buildRiskItems()}
          />
        </div>

        {/* Industry Insights */}
        <IndustryInsightsCard
          industry={parsedData.industrySector}
          location={parsedData.primaryLocationCountry}
          insights={buildInsights()}
        />

        {/* Recommended Actions */}
        <RecommendedActions
          recommendations={parsedData.recommendations}
          riskScores={{
            physicalRisk: riskData.physicalRisk,
            financialRisk: riskData.financialRisk,
            regulatoryRisk: riskData.regulatoryRisk,
            reputationalRisk: riskData.reputationalRisk,
            governanceRisk: riskData.governanceRisk
          }}
          industry={parsedData.industrySector}
        />

        {/* Reputational Risk Signals - Compact mode for Quick Scan */}
        <ReputationalRiskFeed
          industrySector={parsedData.industrySector}
          country={parsedData.primaryLocationCountry}
          newsKeywords={parsedData.newsKeywords}
          reputationalNews={parsedData.reputationalNews}
          compact={true}
        />

        {/* Action buttons */}
        <div className="flex gap-4">
          <Button 
            onClick={handleSaveAndContinue}
            disabled={loading}
            className="flex-1"
            size="lg"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ArrowRight className="h-4 w-4 mr-2" />
            )}
            Save & View Full Dashboard
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/risk-assessment', { state: { openDetailed: true } })}
            className="flex-1"
            size="lg"
          >
            Run Detailed Assessment Instead
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default QuickScanForm;
