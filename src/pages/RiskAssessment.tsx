import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ClipboardList, Zap } from "lucide-react";
import QuickScanForm from "@/components/risk/QuickScanForm";

const INDUSTRY_SECTORS = [
  "Manufacturing",
  "Food & Beverage",
  "Pharmaceuticals",
  "Semiconductors",
  "Mining",
  "Agriculture",
  "Energy",
  "Data Centers",
  "Textiles",
  "Other"
];

const WATER_SOURCES = [
  "Municipal supply",
  "Groundwater",
  "Surface water",
  "Recycled/reclaimed",
  "Desalinated",
  "Rainwater"
];

const TREATMENT_LEVELS = [
  "None",
  "Basic",
  "Advanced",
  "Zero Liquid Discharge"
];

const INTAKE_QUALITY_OPTIONS = [
  "Excellent",
  "Good",
  "Fair",
  "Poor",
  "Unknown"
];

const CONTAMINANT_OPTIONS = [
  "High TDS/Salinity",
  "Heavy metals (arsenic, lead, chromium)",
  "Organic compounds (pesticides, solvents)",
  "Microbial contamination",
  "PFAS/Forever chemicals",
  "Nitrates/phosphates",
  "High sediment/turbidity",
  "None known",
  "Not tested"
];

const TREATMENT_BEFORE_USE_OPTIONS = [
  "None - source water used directly",
  "Basic filtration only",
  "Reverse osmosis / Ultrafiltration",
  "Full ultrapure water (UPW) train",
  "Don't know"
];

const DISCHARGE_PERMIT_OPTIONS = [
  "Direct to surface water (river, ocean)",
  "Municipal sewer system",
  "Zero liquid discharge (no external discharge)",
  "Evaporation ponds",
  "Recycled internally",
  "Other"
];

const UPSTREAM_POLLUTION_OPTIONS = [
  "Agricultural runoff (fertilizers, pesticides)",
  "Other industrial facilities",
  "Urban stormwater",
  "Mining operations",
  "Wastewater treatment plants",
  "None known"
];

const TESTING_FREQUENCY_OPTIONS = [
  "Continuous online monitoring",
  "Daily",
  "Weekly",
  "Monthly",
  "Annually or less",
  "Never / Don't know"
];

const INDUSTRY_QUALITY_REQUIREMENTS: Record<string, { standard: string; tolerance: string; riskNote: string }> = {
  "Semiconductors": {
    standard: "Ultrapure Water (UPW) - 18.2 MΩ·cm resistivity",
    tolerance: "Zero tolerance for particles >0.05μm",
    riskNote: "Any quality deviation = chip defects worth millions"
  },
  "Pharmaceuticals": {
    standard: "USP Purified Water or WFI (Water for Injection)",
    tolerance: "TOC <500 ppb, Conductivity <1.3 μS/cm",
    riskNote: "Quality failures = FDA violations, product recalls"
  },
  "Food & Beverage": {
    standard: "Potable water quality minimum",
    tolerance: "Must meet local drinking water standards",
    riskNote: "Contamination = product recalls, brand damage"
  },
  "Data Centers": {
    standard: "Cooling tower quality - low TDS preferred",
    tolerance: "High TDS = scaling, corrosion, Legionella risk",
    riskNote: "Quality issues = equipment damage, downtime"
  },
  "Mining": {
    standard: "Process-dependent, often tolerates lower quality",
    tolerance: "Discharge is primary concern",
    riskNote: "Tailings pond failures = catastrophic liability"
  }
};

const RiskAssessment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    companyName: "",
    industrySector: "",
    annualWaterConsumption: "",
    waterUnit: "m3/year",
    primaryLocationCountry: "",
    primaryLocationRegion: "",
    facilitiesCount: "",
    waterSources: [] as string[],
    waterCostPerM3: "",
    waterCostCurrency: "USD",
    waterDisruptions: false,
    disruptionDescription: "",
    currentTreatment: "",
    // Water quality fields
    intakeWaterQuality: "",
    primaryContaminants: [] as string[],
    treatmentBeforeUse: "",
    dischargePermitType: "",
    dischargeQualityConcerns: false,
    dischargeDescription: "",
    upstreamPollutionSources: [] as string[],
    waterQualityTestingFrequency: ""
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleWaterSourceToggle = (source: string) => {
    setFormData(prev => ({
      ...prev,
      waterSources: prev.waterSources.includes(source)
        ? prev.waterSources.filter(s => s !== source)
        : [...prev.waterSources, source]
    }));
  };

  const handleContaminantToggle = (contaminant: string) => {
    setFormData(prev => ({
      ...prev,
      primaryContaminants: prev.primaryContaminants.includes(contaminant)
        ? prev.primaryContaminants.filter(c => c !== contaminant)
        : [...prev.primaryContaminants, contaminant]
    }));
  };

  const handleUpstreamPollutionToggle = (source: string) => {
    setFormData(prev => ({
      ...prev,
      upstreamPollutionSources: prev.upstreamPollutionSources.includes(source)
        ? prev.upstreamPollutionSources.filter(s => s !== source)
        : [...prev.upstreamPollutionSources, source]
    }));
  };

  const handleNext = () => {
    if (step === 1 && (!formData.companyName || !formData.industrySector || !formData.annualWaterConsumption || !formData.primaryLocationCountry || !formData.facilitiesCount)) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (step === 2 && (formData.waterSources.length === 0 || !formData.currentTreatment)) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (step === 3 && (!formData.intakeWaterQuality || !formData.treatmentBeforeUse || !formData.dischargePermitType || !formData.waterQualityTestingFrequency)) {
      toast.error("Please fill in all required fields");
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Call edge function to calculate risk scores
      const { data: riskData, error: functionError } = await supabase.functions.invoke('calculate-risk', {
        body: { 
          industrySector: formData.industrySector,
          waterSources: formData.waterSources,
          waterDisruptions: formData.waterDisruptions,
          currentTreatment: formData.currentTreatment,
          primaryLocationCountry: formData.primaryLocationCountry,
          intakeWaterQuality: formData.intakeWaterQuality,
          primaryContaminants: formData.primaryContaminants,
          treatmentBeforeUse: formData.treatmentBeforeUse,
          dischargePermitType: formData.dischargePermitType,
          dischargeQualityConcerns: formData.dischargeQualityConcerns,
          upstreamPollutionSources: formData.upstreamPollutionSources,
          waterQualityTestingFrequency: formData.waterQualityTestingFrequency
        }
      });

      if (functionError) throw functionError;

      // Save assessment to database
      const { error: insertError } = await supabase
        .from('risk_assessments')
        .insert({
          user_id: user.id,
          company_name: formData.companyName,
          industry_sector: formData.industrySector,
          annual_water_consumption: parseFloat(formData.annualWaterConsumption),
          water_unit: formData.waterUnit,
          primary_location_country: formData.primaryLocationCountry,
          primary_location_region: formData.primaryLocationRegion,
          facilities_count: parseInt(formData.facilitiesCount),
          water_sources: formData.waterSources,
          water_cost_per_m3: formData.waterCostPerM3 ? parseFloat(formData.waterCostPerM3) : null,
          water_cost_currency: formData.waterCostCurrency,
          water_disruptions_past_5y: formData.waterDisruptions,
          disruption_description: formData.disruptionDescription,
          current_treatment_level: formData.currentTreatment,
          intake_water_source_quality: formData.intakeWaterQuality,
          primary_contaminants: formData.primaryContaminants,
          treatment_before_use: formData.treatmentBeforeUse,
          discharge_permit_type: formData.dischargePermitType,
          discharge_quality_concerns: formData.dischargeQualityConcerns,
          upstream_pollution_sources: formData.upstreamPollutionSources,
          water_quality_testing_frequency: formData.waterQualityTestingFrequency,
          overall_risk_score: riskData.overallRisk,
          physical_risk_score: riskData.physicalRisk,
          regulatory_risk_score: riskData.regulatoryRisk,
          reputational_risk_score: riskData.reputationalRisk,
          financial_risk_score: riskData.financialRisk,
          water_quality_risk_score: riskData.waterQualityRisk,
          recommended_actions: riskData.recommendations
        });

      if (insertError) throw insertError;

      toast.success("Risk assessment completed!");
      navigate('/risk-dashboard');
    } catch (error: any) {
      console.error('Error saving assessment:', error);
      toast.error(error.message || "Failed to complete assessment");
    } finally {
      setLoading(false);
    }
  };

  const progressValue = (step / 4) * 100;

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Water Risk Assessment</h1>
            <p className="text-muted-foreground">Complete this assessment to understand your water-related risks and receive personalized recommendations</p>
          </div>

          <Tabs defaultValue="quick-scan" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="quick-scan" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                AI Quick Scan
              </TabsTrigger>
              <TabsTrigger value="detailed" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Detailed Assessment
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quick-scan">
              <QuickScanForm />
            </TabsContent>

            <TabsContent value="detailed">
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">Step {step} of 4</span>
                  </div>
                  <Progress value={progressValue} className="h-2" />
                </CardContent>
              </Card>

              {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>Tell us about your organization and water usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industrySector">Industry Sector *</Label>
                  <Select value={formData.industrySector} onValueChange={(value) => handleInputChange('industrySector', value)}>
                    <SelectTrigger id="industrySector">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRY_SECTORS.map(sector => (
                        <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="waterConsumption">Annual Water Consumption *</Label>
                    <Input
                      id="waterConsumption"
                      type="number"
                      value={formData.annualWaterConsumption}
                      onChange={(e) => handleInputChange('annualWaterConsumption', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="waterUnit">Unit</Label>
                    <Select value={formData.waterUnit} onValueChange={(value) => handleInputChange('waterUnit', value)}>
                      <SelectTrigger id="waterUnit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="m3/year">m³/year</SelectItem>
                        <SelectItem value="ML/year">ML/year</SelectItem>
                        <SelectItem value="gallons/year">gallons/year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Primary Location (Country) *</Label>
                    <Input
                      id="country"
                      value={formData.primaryLocationCountry}
                      onChange={(e) => handleInputChange('primaryLocationCountry', e.target.value)}
                      placeholder="e.g. United States"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      value={formData.primaryLocationRegion}
                      onChange={(e) => handleInputChange('primaryLocationRegion', e.target.value)}
                      placeholder="e.g. California"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facilities">Number of Facilities *</Label>
                  <Input
                    id="facilities"
                    type="number"
                    value={formData.facilitiesCount}
                    onChange={(e) => handleInputChange('facilitiesCount', e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleNext}>Next</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Water Source Assessment</CardTitle>
                <CardDescription>Help us understand your water sources and treatment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Primary Water Sources * (select all that apply)</Label>
                  {WATER_SOURCES.map(source => (
                    <div key={source} className="flex items-center space-x-2">
                      <Checkbox
                        id={source}
                        checked={formData.waterSources.includes(source)}
                        onCheckedChange={() => handleWaterSourceToggle(source)}
                      />
                      <label htmlFor={source} className="text-sm font-normal cursor-pointer">
                        {source}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="waterCost">Water Cost per m³</Label>
                    <Input
                      id="waterCost"
                      type="number"
                      step="0.01"
                      value={formData.waterCostPerM3}
                      onChange={(e) => handleInputChange('waterCostPerM3', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.waterCostCurrency} onValueChange={(value) => handleInputChange('waterCostCurrency', value)}>
                      <SelectTrigger id="currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="disruptions"
                      checked={formData.waterDisruptions}
                      onCheckedChange={(checked) => handleInputChange('waterDisruptions', checked)}
                    />
                    <label htmlFor="disruptions" className="text-sm font-medium cursor-pointer">
                      Have you experienced water disruptions in the past 5 years?
                    </label>
                  </div>
                  {formData.waterDisruptions && (
                    <Textarea
                      value={formData.disruptionDescription}
                      onChange={(e) => handleInputChange('disruptionDescription', e.target.value)}
                      placeholder="Briefly describe the disruptions..."
                      className="mt-2"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treatment">Current Water Treatment On-Site *</Label>
                  <Select value={formData.currentTreatment} onValueChange={(value) => handleInputChange('currentTreatment', value)}>
                    <SelectTrigger id="treatment">
                      <SelectValue placeholder="Select treatment level" />
                    </SelectTrigger>
                    <SelectContent>
                      {TREATMENT_LEVELS.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleBack}>Back</Button>
                  <Button onClick={handleNext}>Next</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Water Quality Profile</CardTitle>
                <CardDescription>Assess your water quality risks and monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.industrySector && INDUSTRY_QUALITY_REQUIREMENTS[formData.industrySector] && (
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <h3 className="font-semibold text-sm">Industry-Specific Requirements: {formData.industrySector}</h3>
                    <div className="text-xs space-y-1">
                      <p><strong>Standard:</strong> {INDUSTRY_QUALITY_REQUIREMENTS[formData.industrySector].standard}</p>
                      <p><strong>Tolerance:</strong> {INDUSTRY_QUALITY_REQUIREMENTS[formData.industrySector].tolerance}</p>
                      <p className="text-red-600"><strong>Risk:</strong> {INDUSTRY_QUALITY_REQUIREMENTS[formData.industrySector].riskNote}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="intakeQuality">Intake Water Quality *</Label>
                  <Select value={formData.intakeWaterQuality} onValueChange={(value) => handleInputChange('intakeWaterQuality', value)}>
                    <SelectTrigger id="intakeQuality">
                      <SelectValue placeholder="Select quality rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {INTAKE_QUALITY_OPTIONS.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Contaminants Present in Source Water (select all that apply)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {CONTAMINANT_OPTIONS.map(contaminant => (
                      <div key={contaminant} className="flex items-center space-x-2">
                        <Checkbox
                          id={contaminant}
                          checked={formData.primaryContaminants.includes(contaminant)}
                          onCheckedChange={() => handleContaminantToggle(contaminant)}
                        />
                        <label htmlFor={contaminant} className="text-sm font-normal cursor-pointer">
                          {contaminant}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treatmentBeforeUse">Treatment Before Use in Operations *</Label>
                  <Select value={formData.treatmentBeforeUse} onValueChange={(value) => handleInputChange('treatmentBeforeUse', value)}>
                    <SelectTrigger id="treatmentBeforeUse">
                      <SelectValue placeholder="Select treatment level" />
                    </SelectTrigger>
                    <SelectContent>
                      {TREATMENT_BEFORE_USE_OPTIONS.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dischargePermit">Wastewater Discharge Method *</Label>
                  <Select value={formData.dischargePermitType} onValueChange={(value) => handleInputChange('dischargePermitType', value)}>
                    <SelectTrigger id="dischargePermit">
                      <SelectValue placeholder="Select discharge method" />
                    </SelectTrigger>
                    <SelectContent>
                      {DISCHARGE_PERMIT_OPTIONS.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="dischargeConcerns"
                      checked={formData.dischargeQualityConcerns}
                      onCheckedChange={(checked) => handleInputChange('dischargeQualityConcerns', checked)}
                    />
                    <label htmlFor="dischargeConcerns" className="text-sm font-medium cursor-pointer">
                      Have you experienced discharge permit violations or compliance concerns in the past 3 years?
                    </label>
                  </div>
                  {formData.dischargeQualityConcerns && (
                    <Textarea
                      value={formData.dischargeDescription}
                      onChange={(e) => handleInputChange('dischargeDescription', e.target.value)}
                      placeholder="Briefly describe the compliance concerns..."
                      className="mt-2"
                    />
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Upstream Pollution Sources (select all that apply)</Label>
                  {UPSTREAM_POLLUTION_OPTIONS.map(source => (
                    <div key={source} className="flex items-center space-x-2">
                      <Checkbox
                        id={source}
                        checked={formData.upstreamPollutionSources.includes(source)}
                        onCheckedChange={() => handleUpstreamPollutionToggle(source)}
                      />
                      <label htmlFor={source} className="text-sm font-normal cursor-pointer">
                        {source}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testingFrequency">Water Quality Testing Frequency *</Label>
                  <Select value={formData.waterQualityTestingFrequency} onValueChange={(value) => handleInputChange('waterQualityTestingFrequency', value)}>
                    <SelectTrigger id="testingFrequency">
                      <SelectValue placeholder="Select testing frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {TESTING_FREQUENCY_OPTIONS.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleBack}>Back</Button>
                  <Button onClick={handleNext}>Review & Calculate</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Review & Calculate</CardTitle>
                <CardDescription>Review your assessment details before calculating risk scores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Company</p>
                    <p className="font-semibold">{formData.companyName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Industry</p>
                    <p className="font-semibold">{formData.industrySector}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Annual Water Use</p>
                    <p className="font-semibold">{formData.annualWaterConsumption} {formData.waterUnit}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-semibold">{formData.primaryLocationCountry}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Intake Water Quality</p>
                    <p className="font-semibold">{formData.intakeWaterQuality}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Testing Frequency</p>
                    <p className="font-semibold">{formData.waterQualityTestingFrequency}</p>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBack}>Back</Button>
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calculating...</> : "Calculate Risk"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default RiskAssessment;