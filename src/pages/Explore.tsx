import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search, MapPin, TrendingUp, Droplet, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Project = {
  id: string;
  name: string;
  country: string;
  city: string | null;
  technology_type: string;
  sector: string;
  financials: {
    total_investment_usd: number;
    roi_percent: number | null;
    payback_years: number | null;
    confidence_score: number;
  }[];
  outcomes: {
    water_saved_m3_year: number | null;
  }[];
};

const technologyTypes = [
  "desalination",
  "reuse",
  "leak_detection",
  "smart_metering",
  "nature_based",
  "circular_systems",
  "treatment",
  "other",
];

const sectors = ["municipal", "industrial", "agriculture", "mining", "energy", "commercial"];

export default function Explore() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedTech, selectedSectors, projects]);

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select(`
        id,
        name,
        country,
        city,
        technology_type,
        sector,
        financials (
          total_investment_usd,
          roi_percent,
          payback_years,
          confidence_score
        ),
        outcomes (
          water_saved_m3_year
        )
      `);

    if (data && !error) {
      setProjects(data as any);
    }
  };

  const applyFilters = () => {
    let filtered = projects;

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.country.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedTech.length > 0) {
      filtered = filtered.filter((p) => selectedTech.includes(p.technology_type));
    }

    if (selectedSectors.length > 0) {
      filtered = filtered.filter((p) => selectedSectors.includes(p.sector));
    }

    setFilteredProjects(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTech([]);
    setSelectedSectors([]);
  };

  const getTechColor = (tech: string) => {
    const colors: Record<string, string> = {
      desalination: "bg-blue-500",
      reuse: "bg-green-500",
      leak_detection: "bg-purple-500",
      smart_metering: "bg-orange-500",
      nature_based: "bg-emerald-500",
      circular_systems: "bg-teal-500",
      treatment: "bg-cyan-500",
      other: "bg-gray-500",
    };
    return colors[tech] || "bg-gray-500";
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 80) return { label: "High", color: "bg-green-500" };
    if (score >= 60) return { label: "Medium", color: "bg-yellow-500" };
    return { label: "Low", color: "bg-red-500" };
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-64 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  {(selectedTech.length > 0 || selectedSectors.length > 0 || searchQuery) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear
                    </Button>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="search">Search</Label>
                    <div className="relative mt-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Project name or country..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Technology Type</Label>
                    <div className="mt-2 space-y-2">
                      {technologyTypes.map((tech) => (
                        <div key={tech} className="flex items-center space-x-2">
                          <Checkbox
                            id={tech}
                            checked={selectedTech.includes(tech)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTech([...selectedTech, tech]);
                              } else {
                                setSelectedTech(selectedTech.filter((t) => t !== tech));
                              }
                            }}
                          />
                          <label
                            htmlFor={tech}
                            className="text-sm capitalize cursor-pointer"
                          >
                            {tech.replace("_", " ")}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Sector</Label>
                    <div className="mt-2 space-y-2">
                      {sectors.map((sector) => (
                        <div key={sector} className="flex items-center space-x-2">
                          <Checkbox
                            id={sector}
                            checked={selectedSectors.includes(sector)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedSectors([...selectedSectors, sector]);
                              } else {
                                setSelectedSectors(selectedSectors.filter((s) => s !== sector));
                              }
                            }}
                          />
                          <label
                            htmlFor={sector}
                            className="text-sm capitalize cursor-pointer"
                          >
                            {sector}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Area */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredProjects.length} projects found
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {filteredProjects.map((project) => {
                  const financial = project.financials[0];
                  const outcome = project.outcomes[0];
                  const confidence = financial ? getConfidenceLabel(financial.confidence_score) : null;

                  return (
                    <Card key={project.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          {confidence && (
                            <Badge variant="outline" className="shrink-0">
                              <span className={`w-2 h-2 rounded-full ${confidence.color} mr-1`} />
                              {confidence.label}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {project.city ? `${project.city}, ` : ""}{project.country}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-2">
                          <Badge className={`${getTechColor(project.technology_type)} text-white`}>
                            {project.technology_type.replace("_", " ")}
                          </Badge>
                          <Badge variant="secondary">{project.sector}</Badge>
                        </div>

                        {financial && (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Investment</div>
                              <div className="font-semibold data-value">
                                ${(financial.total_investment_usd / 1000000).toFixed(1)}M
                              </div>
                            </div>
                            {financial.roi_percent !== null && (
                              <div>
                                <div className="text-muted-foreground">ROI</div>
                                <div className="font-semibold data-value flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  {financial.roi_percent.toFixed(1)}%
                                </div>
                              </div>
                            )}
                            {financial.payback_years !== null && (
                              <div>
                                <div className="text-muted-foreground">Payback</div>
                                <div className="font-semibold data-value">
                                  {financial.payback_years.toFixed(1)} years
                                </div>
                              </div>
                            )}
                            {outcome?.water_saved_m3_year && (
                              <div>
                                <div className="text-muted-foreground">Water Saved</div>
                                <div className="font-semibold data-value flex items-center gap-1">
                                  <Droplet className="h-3 w-3" />
                                  {(outcome.water_saved_m3_year / 1000).toFixed(0)}k m³/yr
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate(`/project/${project.id}`)}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredProjects.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      No projects found matching your filters.
                    </p>
                    <Button variant="outline" className="mt-4" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
