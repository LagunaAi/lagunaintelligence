import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, PieChart, Pie, Cell } from "recharts";

export default function Analytics() {
  const [techData, setTechData] = useState<any[]>([]);
  const [sectorData, setSectorData] = useState<any[]>([]);
  const [scatterData, setScatterData] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const { data: projects, error } = await supabase
      .from("projects")
      .select(`
        id,
        technology_type,
        sector,
        financials (
          total_investment_usd,
          roi_percent,
          payback_years
        )
      `);

    if (projects && !error) {
      // Technology comparison data
      const techMap = new Map();
      projects.forEach((p: any) => {
        if (p.financials[0]) {
          const tech = p.technology_type;
          if (!techMap.has(tech)) {
            techMap.set(tech, { roi: [], payback: [] });
          }
          if (p.financials[0].roi_percent !== null) {
            techMap.get(tech).roi.push(p.financials[0].roi_percent);
          }
          if (p.financials[0].payback_years !== null) {
            techMap.get(tech).payback.push(p.financials[0].payback_years);
          }
        }
      });

      const techAnalytics = Array.from(techMap.entries()).map(([tech, data]: any) => ({
        name: tech.replace("_", " "),
        avgROI: data.roi.length > 0 
          ? Math.round((data.roi.reduce((a: number, b: number) => a + b, 0) / data.roi.length) * 10) / 10 
          : 0,
        avgPayback: data.payback.length > 0
          ? Math.round((data.payback.reduce((a: number, b: number) => a + b, 0) / data.payback.length) * 10) / 10
          : 0,
      }));
      setTechData(techAnalytics);

      // Sector distribution
      const sectorMap = new Map();
      projects.forEach((p: any) => {
        const sector = p.sector;
        sectorMap.set(sector, (sectorMap.get(sector) || 0) + 1);
      });

      const sectorAnalytics = Array.from(sectorMap.entries()).map(([sector, count]) => ({
        name: sector,
        value: count,
      }));
      setSectorData(sectorAnalytics);

      // Scatter data (Investment vs ROI)
      const scatterAnalytics = projects
        .filter((p: any) => p.financials[0] && p.financials[0].roi_percent !== null)
        .map((p: any) => ({
          investment: p.financials[0].total_investment_usd / 1000000, // Convert to millions
          roi: p.financials[0].roi_percent,
          tech: p.technology_type,
        }));
      setScatterData(scatterAnalytics);
    }
  };

  const COLORS = ["#0A4D68", "#146C94", "#19A7CE", "#00C9A7", "#088395", "#05668D"];

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container py-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Analytics & Benchmarks</h1>
            <p className="text-muted-foreground">
              Compare performance across technologies, sectors, and regions
            </p>
          </div>

          {/* Technology Comparison */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Technology Comparison</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Average ROI by Technology</CardTitle>
                  <CardDescription>
                    Return on investment across different water technologies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={techData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        style={{ fontSize: "12px" }}
                      />
                      <YAxis label={{ value: "ROI (%)", angle: -90, position: "insideLeft" }} />
                      <Tooltip />
                      <Bar dataKey="avgROI" fill="#19A7CE" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Average Payback Period</CardTitle>
                  <CardDescription>
                    Time to recover investment by technology type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={techData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        style={{ fontSize: "12px" }}
                      />
                      <YAxis label={{ value: "Years", angle: -90, position: "insideLeft" }} />
                      <Tooltip />
                      <Bar dataKey="avgPayback" fill="#00C9A7" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Investment vs ROI Scatter */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Size vs ROI</CardTitle>
              <CardDescription>
                Relationship between investment amount and return
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="investment" 
                    name="Investment"
                    label={{ value: "Investment ($M)", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="roi" 
                    name="ROI"
                    label={{ value: "ROI (%)", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter name="Projects" data={scatterData} fill="#0A4D68" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sector Distribution */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Distribution by Sector</CardTitle>
                <CardDescription>
                  Number of projects in each sector
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>
                  Performance benchmarks across the database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {techData.slice(0, 5).map((tech, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium capitalize">{tech.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {tech.avgPayback.toFixed(1)} year payback
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold data-value text-primary">
                        {tech.avgROI.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">avg ROI</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
