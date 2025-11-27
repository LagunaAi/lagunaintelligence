import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Database, TrendingUp, Droplet, Plus, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProjects: 0,
    avgRoi: 0,
    totalWaterSaved: 0,
    projectsThisMonth: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data: projects } = await supabase.from("projects").select("id, created_at");
    
    const { data: financials } = await supabase
      .from("financials")
      .select("roi_percent");

    const { data: outcomes } = await supabase
      .from("outcomes")
      .select("water_saved_m3_year");

    const totalProjects = projects?.length || 0;
    
    const avgRoi = financials && financials.length > 0
      ? financials.reduce((acc, f) => acc + (f.roi_percent || 0), 0) / financials.length
      : 0;

    const totalWaterSaved = outcomes && outcomes.length > 0
      ? outcomes.reduce((acc, o) => acc + (o.water_saved_m3_year || 0), 0)
      : 0;

    const thisMonth = new Date();
    thisMonth.setDate(1);
    const projectsThisMonth = projects?.filter(
      p => new Date(p.created_at) >= thisMonth
    ).length || 0;

    setStats({
      totalProjects,
      avgRoi: Math.round(avgRoi * 10) / 10,
      totalWaterSaved: Math.round(totalWaterSaved),
      projectsThisMonth,
    });
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container py-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground">
              Here's your water investment intelligence overview
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Projects
                </CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold data-value">{stats.totalProjects}</div>
                <p className="text-xs text-muted-foreground">
                  In database
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average ROI
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold data-value">{stats.avgRoi}%</div>
                <p className="text-xs text-muted-foreground">
                  Across all projects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Water Saved
                </CardTitle>
                <Droplet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold data-value">
                  {(stats.totalWaterSaved / 1000000).toFixed(1)}M
                </div>
                <p className="text-xs text-muted-foreground">
                  m³ per year
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  New This Month
                </CardTitle>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold data-value">{stats.projectsThisMonth}</div>
                <p className="text-xs text-muted-foreground">
                  Projects added
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with these common tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <Button
                variant="outline"
                className="h-auto flex-col items-start gap-2 p-6"
                onClick={() => navigate("/explore")}
              >
                <Database className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <div className="font-semibold">Explore Projects</div>
                  <div className="text-sm text-muted-foreground">
                    Browse and filter water investments
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-start gap-2 p-6"
                onClick={() => navigate("/analytics")}
              >
                <TrendingUp className="h-8 w-8 text-accent" />
                <div className="text-left">
                  <div className="font-semibold">View Benchmarks</div>
                  <div className="text-sm text-muted-foreground">
                    Compare performance metrics
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-start gap-2 p-6"
                onClick={() => navigate("/ask")}
              >
                <svg
                  className="h-8 w-8 text-highlight"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <div className="text-left">
                  <div className="font-semibold">Ask a Question</div>
                  <div className="text-sm text-muted-foreground">
                    Get AI-powered insights
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
