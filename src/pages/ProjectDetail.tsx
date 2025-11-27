import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, ArrowLeft, Loader2 } from "lucide-react";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        financials (*),
        outcomes (*)
      `)
      .eq("id", id)
      .single();

    if (data && !error) {
      setProject(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex min-h-[60vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!project) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="container py-8">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">Project not found</p>
                <Button onClick={() => navigate("/explore")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Explore
                </Button>
              </CardContent>
            </Card>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const financial = project.financials[0];
  const outcome = project.outcomes[0];

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container py-8 max-w-5xl space-y-6">
          <Button variant="ghost" onClick={() => navigate("/explore")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Explore
          </Button>

          <div>
            <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {project.city && `${project.city}, `}{project.country}
            </div>
            <div className="flex gap-2 mt-3">
              <Badge className="capitalize">
                {project.technology_type.replace("_", " ")}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {project.sector}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {project.project_stage}
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
              <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.description && (
                    <div>
                      <div className="font-semibold mb-1">Description</div>
                      <p className="text-muted-foreground">{project.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Region</div>
                      <div className="font-semibold">{project.region}</div>
                    </div>
                    {project.start_date && (
                      <div>
                        <div className="text-sm text-muted-foreground">Start Date</div>
                        <div className="font-semibold">
                          {new Date(project.start_date).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                    {project.completion_date && (
                      <div>
                        <div className="text-sm text-muted-foreground">Completion Date</div>
                        <div className="font-semibold">
                          {new Date(project.completion_date).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                    {project.capacity_value && (
                      <div>
                        <div className="text-sm text-muted-foreground">Capacity</div>
                        <div className="font-semibold data-value">
                          {project.capacity_value} {project.capacity_unit}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financials" className="space-y-4">
              {financial ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Metrics</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Confidence: {financial.confidence_score}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div>
                        <div className="text-sm text-muted-foreground">Total Investment</div>
                        <div className="text-2xl font-bold data-value">
                          ${(financial.total_investment_usd / 1000000).toFixed(1)}M
                        </div>
                      </div>
                      {financial.roi_percent !== null && (
                        <div>
                          <div className="text-sm text-muted-foreground">ROI</div>
                          <div className="text-2xl font-bold data-value text-primary">
                            {financial.roi_percent.toFixed(1)}%
                          </div>
                        </div>
                      )}
                      {financial.payback_years !== null && (
                        <div>
                          <div className="text-sm text-muted-foreground">Payback Period</div>
                          <div className="text-2xl font-bold data-value">
                            {financial.payback_years.toFixed(1)} yrs
                          </div>
                        </div>
                      )}
                      {financial.annual_operating_cost_usd && (
                        <div>
                          <div className="text-sm text-muted-foreground">Annual Op. Cost</div>
                          <div className="text-2xl font-bold data-value">
                            ${(financial.annual_operating_cost_usd / 1000000).toFixed(1)}M
                          </div>
                        </div>
                      )}
                      {financial.annual_revenue_usd && (
                        <div>
                          <div className="text-sm text-muted-foreground">Annual Revenue</div>
                          <div className="text-2xl font-bold data-value">
                            ${(financial.annual_revenue_usd / 1000000).toFixed(1)}M
                          </div>
                        </div>
                      )}
                      {financial.npv_usd && (
                        <div>
                          <div className="text-sm text-muted-foreground">NPV</div>
                          <div className="text-2xl font-bold data-value">
                            ${(financial.npv_usd / 1000000).toFixed(1)}M
                          </div>
                        </div>
                      )}
                      {financial.irr_percent !== null && (
                        <div>
                          <div className="text-sm text-muted-foreground">IRR</div>
                          <div className="text-2xl font-bold data-value">
                            {financial.irr_percent.toFixed(1)}%
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-6 border-t">
                      <div className="text-sm font-semibold mb-2">Data Source</div>
                      <p className="text-sm text-muted-foreground">{financial.data_source}</p>
                      {financial.source_url && (
                        <a
                          href={financial.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          View Source →
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No financial data available for this project
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="outcomes" className="space-y-4">
              {outcome ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Environmental & Social Impact</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Confidence: {outcome.confidence_score}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {outcome.water_saved_m3_year && (
                        <div>
                          <div className="text-sm text-muted-foreground">Water Saved</div>
                          <div className="text-2xl font-bold data-value text-highlight">
                            {(outcome.water_saved_m3_year / 1000).toFixed(0)}k
                          </div>
                          <div className="text-sm text-muted-foreground">m³/year</div>
                        </div>
                      )}
                      {outcome.water_produced_m3_day && (
                        <div>
                          <div className="text-sm text-muted-foreground">Water Produced</div>
                          <div className="text-2xl font-bold data-value">
                            {(outcome.water_produced_m3_day / 1000).toFixed(0)}k
                          </div>
                          <div className="text-sm text-muted-foreground">m³/day</div>
                        </div>
                      )}
                      {outcome.energy_saved_kwh_year && (
                        <div>
                          <div className="text-sm text-muted-foreground">Energy Saved</div>
                          <div className="text-2xl font-bold data-value">
                            {(outcome.energy_saved_kwh_year / 1000).toFixed(0)}k
                          </div>
                          <div className="text-sm text-muted-foreground">kWh/year</div>
                        </div>
                      )}
                      {outcome.co2_avoided_tons_year && (
                        <div>
                          <div className="text-sm text-muted-foreground">CO₂ Avoided</div>
                          <div className="text-2xl font-bold data-value">
                            {outcome.co2_avoided_tons_year.toFixed(0)}
                          </div>
                          <div className="text-sm text-muted-foreground">tons/year</div>
                        </div>
                      )}
                      {outcome.jobs_created && (
                        <div>
                          <div className="text-sm text-muted-foreground">Jobs Created</div>
                          <div className="text-2xl font-bold data-value">
                            {outcome.jobs_created}
                          </div>
                        </div>
                      )}
                      {outcome.population_served && (
                        <div>
                          <div className="text-sm text-muted-foreground">Population Served</div>
                          <div className="text-2xl font-bold data-value">
                            {(outcome.population_served / 1000).toFixed(0)}k
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No outcome data available for this project
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
