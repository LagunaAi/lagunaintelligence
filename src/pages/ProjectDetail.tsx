import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Bookmark, Share2, Download } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { toast } from "sonner";
import { ProjectHero } from "@/components/project/ProjectHero";
import { FinancialCharts } from "@/components/project/FinancialCharts";
import { OutcomesDisplay } from "@/components/project/OutcomesDisplay";
import { Card as DataCard, CardContent as DataCardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          financials (*),
          outcomes (*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error("Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to save projects");
        return;
      }

      const { error } = await supabase
        .from('saved_projects')
        .insert({
          user_id: user.id,
          project_id: id
        });

      if (error) throw error;
      toast.success("Project saved successfully!");
    } catch (error: any) {
      console.error('Error saving project:', error);
      toast.error(error.message || "Failed to save project");
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="container mx-auto py-8 px-4">
            <div className="flex items-center justify-center min-h-[60vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!project) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="container mx-auto py-8 px-4 max-w-4xl">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-lg mb-4">Project not found</p>
                <Button onClick={() => navigate('/explore')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Projects
                </Button>
              </CardContent>
            </Card>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto py-8 px-4">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSaveProject}>
                <Bookmark className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Hero Section */}
          <div className="mb-8">
            <ProjectHero 
              project={project}
              financials={project.financials}
              outcomes={project.outcomes}
            />
          </div>

          {/* Tabbed Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
              <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
              <TabsTrigger value="provenance">Data Source</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <DataCard>
                <CardHeader>
                  <CardTitle>Project Overview</CardTitle>
                </CardHeader>
                <DataCardContent className="space-y-6">
                  {project.description && (
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground">{project.description}</p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Project Details</h3>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Region:</dt>
                          <dd className="font-medium">{project.region}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Country:</dt>
                          <dd className="font-medium">{project.country}</dd>
                        </div>
                        {project.city && (
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">City:</dt>
                            <dd className="font-medium">{project.city}</dd>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Technology:</dt>
                          <dd className="font-medium">{project.technology_type?.replace('_', ' ')}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Sector:</dt>
                          <dd className="font-medium">{project.sector}</dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Timeline</h3>
                      <dl className="space-y-2">
                        {project.start_date && (
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Start Date:</dt>
                            <dd className="font-medium">
                              {new Date(project.start_date).toLocaleDateString()}
                            </dd>
                          </div>
                        )}
                        {project.completion_date && (
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Completion:</dt>
                            <dd className="font-medium">
                              {new Date(project.completion_date).toLocaleDateString()}
                            </dd>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Stage:</dt>
                          <dd>
                            <Badge>{project.project_stage}</Badge>
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  {(project.capacity_value && project.capacity_unit) && (
                    <div>
                      <h3 className="font-semibold mb-2">Capacity</h3>
                      <p className="text-2xl font-bold">
                        {project.capacity_value.toLocaleString()} {project.capacity_unit}
                      </p>
                    </div>
                  )}
                </DataCardContent>
              </DataCard>
            </TabsContent>

            <TabsContent value="financials">
              <FinancialCharts financials={project.financials} />
            </TabsContent>

            <TabsContent value="outcomes">
              <OutcomesDisplay outcomes={project.outcomes} />
            </TabsContent>

            <TabsContent value="provenance">
              <DataCard>
                <CardHeader>
                  <CardTitle>Data Provenance</CardTitle>
                  <CardDescription>Information about the source and reliability of this data</CardDescription>
                </CardHeader>
                <DataCardContent className="space-y-6">
                  {project.financials?.[0] && (
                    <div>
                      <h3 className="font-semibold mb-3">Financial Data Source</h3>
                      <dl className="space-y-3">
                        <div>
                          <dt className="text-sm text-muted-foreground mb-1">Source Organization</dt>
                          <dd className="font-medium">{project.financials[0].data_source}</dd>
                        </div>
                        {project.financials[0].source_url && (
                          <div>
                            <dt className="text-sm text-muted-foreground mb-1">Source Document</dt>
                            <dd>
                              <a 
                                href={project.financials[0].source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1"
                              >
                                View Original Document
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </dd>
                          </div>
                        )}
                        <div>
                          <dt className="text-sm text-muted-foreground mb-1">Data Confidence</dt>
                          <dd className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${project.financials[0].confidence_score}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {project.financials[0].confidence_score}%
                            </span>
                          </dd>
                          <p className="text-sm text-muted-foreground mt-2">
                            Based on source credibility, data completeness, and verification methods
                          </p>
                        </div>
                      </dl>
                    </div>
                  )}

                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-2">Verification Status</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        ✓ Verified
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Data has been cross-referenced with official sources
                      </span>
                    </div>
                  </div>
                </DataCardContent>
              </DataCard>
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}