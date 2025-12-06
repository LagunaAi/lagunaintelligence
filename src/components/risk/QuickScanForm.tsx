import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles, AlertTriangle, Zap } from "lucide-react";

const QuickScanForm = () => {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"input" | "processing" | "complete">("input");

  const handleAnalyze = async () => {
    if (!description.trim()) {
      toast.error("Please describe your operation first");
      return;
    }

    if (description.trim().length < 20) {
      toast.error("Please provide more detail about your operation");
      return;
    }

    setLoading(true);
    setStep("processing");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Step 1: Parse description with AI
      toast.info("Analyzing your description...");
      const { data: parsedData, error: parseError } = await supabase.functions.invoke('parse-risk-description', {
        body: { description }
      });

      if (parseError) throw parseError;
      if (parsedData.error) throw new Error(parsedData.error);

      console.log('Parsed data:', parsedData);

      // Step 2: Calculate risk using existing function
      toast.info("Calculating risk scores...");
      const { data: riskData, error: riskError } = await supabase.functions.invoke('calculate-risk', {
        body: {
          industrySector: parsedData.industrySector,
          waterSources: parsedData.waterSources,
          waterDisruptions: parsedData.waterDisruptions,
          currentTreatment: parsedData.currentTreatment,
          primaryLocationCountry: parsedData.primaryLocationCountry,
          primaryLocationRegion: parsedData.primaryLocationRegion,
          intakeWaterQuality: parsedData.intakeWaterQuality,
          // Defaults for optional fields
          primaryContaminants: [],
          treatmentBeforeUse: "Don't know",
          dischargePermitType: "Municipal sewer system",
          dischargeQualityConcerns: false,
          upstreamPollutionSources: [],
          waterQualityTestingFrequency: "Never / Don't know"
        }
      });

      if (riskError) throw riskError;

      console.log('Risk data:', riskData);

      // Step 3: Save to database with quick scan flag
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
          facilities_count: 1,
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
          water_quality_risk_score: riskData.waterQualityRisk,
          recommended_actions: riskData.recommendations
        });

      if (insertError) throw insertError;

      setStep("complete");
      toast.success("Quick scan completed!");
      navigate('/risk-dashboard');
    } catch (error: any) {
      console.error('Error in quick scan:', error);
      toast.error(error.message || "Failed to complete quick scan");
      setStep("input");
    } finally {
      setLoading(false);
    }
  };

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
            <li>• <strong>Industry Sector</strong> - Manufacturing, semiconductors, food & beverage, etc.</li>
            <li>• <strong>Location</strong> - Country and region for physical risk assessment</li>
            <li>• <strong>Water Sources</strong> - Municipal, groundwater, surface water, etc.</li>
            <li>• <strong>Past Disruptions</strong> - Any water scarcity or supply issues mentioned</li>
            <li>• <strong>Treatment Level</strong> - Current water treatment practices</li>
            <li>• <strong>Water Quality</strong> - Estimated intake water quality</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickScanForm;
