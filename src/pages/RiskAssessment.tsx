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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
    currentTreatment: ""
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

  const handleNext = () => {
    if (step === 1 && (!formData.companyName || !formData.industrySector || !formData.annualWaterConsumption || !formData.primaryLocationCountry || !formData.facilitiesCount)) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (step === 2 && (formData.waterSources.length === 0 || !formData.currentTreatment)) {
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
          primaryLocationCountry: formData.primaryLocationCountry
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
          overall_risk_score: riskData.overallRisk,
          physical_risk_score: riskData.physicalRisk,
          regulatory_risk_score: riskData.regulatoryRisk,
          reputational_risk_score: riskData.reputationalRisk,
          financial_risk_score: riskData.financialRisk,
          recommended_actions: riskData.recommendations
        });

      if (insertError) throw insertError;

      toast.success("Risk assessment completed!");
      setStep(3);
    } catch (error: any) {
      console.error('Error saving assessment:', error);
      toast.error(error.message || "Failed to complete assessment");
    } finally {
      setLoading(false);
    }
  };

  const progressValue = (step / 3) * 100;

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Water Risk Assessment</h1>
            <p className="text-muted-foreground">Complete this assessment to understand your water-related risks and receive personalized recommendations</p>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">Step {step} of 3</span>
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
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calculating...</> : "Calculate Risk"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Assessment Complete!</CardTitle>
                <CardDescription>Your risk assessment has been saved</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Your personalized water risk dashboard is being prepared. You'll be redirected to view your results shortly.</p>
                <div className="flex gap-4">
                  <Button onClick={() => navigate('/dashboard')}>View Dashboard</Button>
                  <Button variant="outline" onClick={() => navigate('/explore')}>Explore Solutions</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default RiskAssessment;