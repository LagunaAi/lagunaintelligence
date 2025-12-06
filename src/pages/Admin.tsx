import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Users, BarChart3, Briefcase, Database } from "lucide-react";
import { AdminProjects } from "@/components/admin/AdminProjects";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [generatingData, setGeneratingData] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Check if user has admin role
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) throw error;

      if (!roleData) {
        toast.error("Access denied. Admin privileges required.");
        navigate('/dashboard');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking admin access:', error);
      toast.error("Error verifying admin access");
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const generateMockFinancialData = async () => {
    setGeneratingData(true);
    try {
      // Fetch all projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name');

      if (projectsError) throw projectsError;
      if (!projects || projects.length === 0) {
        toast.error("No projects found to generate data for");
        return;
      }

      // Fetch existing financials to avoid duplicates
      const { data: existingFinancials, error: financialsError } = await supabase
        .from('financials')
        .select('project_id');

      if (financialsError) throw financialsError;

      const existingProjectIds = new Set(existingFinancials?.map(f => f.project_id) || []);
      const projectsWithoutFinancials = projects.filter(p => !existingProjectIds.has(p.id));

      if (projectsWithoutFinancials.length === 0) {
        toast.info("All projects already have financial data");
        return;
      }

      // Generate mock financials for each project
      const mockFinancials = projectsWithoutFinancials.map(project => ({
        project_id: project.id,
        total_investment_usd: Math.round((Math.random() * 4500000 + 500000) * 100) / 100, // $500k - $5M
        roi_percent: Math.round((Math.random() * 20 + 5) * 100) / 100, // 5% - 25%
        payback_years: Math.round((Math.random() * 6.5 + 1.5) * 10) / 10, // 1.5 - 8 years
        confidence_score: 85,
        data_source: "Mock Data Generator",
        annual_revenue_usd: Math.round((Math.random() * 2000000 + 100000) * 100) / 100,
        annual_operating_cost_usd: Math.round((Math.random() * 500000 + 50000) * 100) / 100,
        npv_usd: Math.round((Math.random() * 3000000 + 200000) * 100) / 100,
        irr_percent: Math.round((Math.random() * 15 + 8) * 100) / 100
      }));

      const { error: insertError } = await supabase
        .from('financials')
        .insert(mockFinancials);

      if (insertError) throw insertError;

      toast.success(`Generated financial data for ${mockFinancials.length} projects`);
    } catch (error: any) {
      console.error('Error generating mock data:', error);
      toast.error(error.message || "Failed to generate mock data");
    } finally {
      setGeneratingData(false);
    }
  };

  const generateMockOutcomesData = async () => {
    setGeneratingData(true);
    try {
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name');

      if (projectsError) throw projectsError;
      if (!projects || projects.length === 0) {
        toast.error("No projects found to generate data for");
        return;
      }

      const { data: existingOutcomes, error: outcomesError } = await supabase
        .from('outcomes')
        .select('project_id');

      if (outcomesError) throw outcomesError;

      const existingProjectIds = new Set(existingOutcomes?.map(o => o.project_id) || []);
      const projectsWithoutOutcomes = projects.filter(p => !existingProjectIds.has(p.id));

      if (projectsWithoutOutcomes.length === 0) {
        toast.info("All projects already have outcomes data");
        return;
      }

      const mockOutcomes = projectsWithoutOutcomes.map(project => ({
        project_id: project.id,
        water_produced_m3_day: Math.round(Math.random() * 50000 + 1000),
        water_saved_m3_year: Math.round(Math.random() * 5000000 + 100000),
        energy_saved_kwh_year: Math.round(Math.random() * 10000000 + 500000),
        co2_avoided_tons_year: Math.round(Math.random() * 50000 + 1000),
        jobs_created: Math.round(Math.random() * 200 + 10),
        population_served: Math.round(Math.random() * 500000 + 10000),
        confidence_score: 85
      }));

      const { error: insertError } = await supabase
        .from('outcomes')
        .insert(mockOutcomes);

      if (insertError) throw insertError;

      toast.success(`Generated outcomes data for ${mockOutcomes.length} projects`);
    } catch (error: any) {
      console.error('Error generating mock outcomes:', error);
      toast.error(error.message || "Failed to generate mock outcomes");
    } finally {
      setGeneratingData(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
              <p className="text-muted-foreground">Manage projects, users, and view platform analytics</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={generateMockFinancialData}
                disabled={generatingData}
              >
                {generatingData ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
                Generate Mock Financials
              </Button>
              <Button
                variant="outline"
                onClick={generateMockOutcomesData}
                disabled={generatingData}
              >
                {generatingData ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
                Generate Mock Outcomes
              </Button>
            </div>
          </div>

          <Tabs defaultValue="projects" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects">
              <AdminProjects />
            </TabsContent>

            <TabsContent value="users">
              <AdminUsers />
            </TabsContent>

            <TabsContent value="analytics">
              <AdminAnalytics />
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Admin;