import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Target, ArrowRight, ExternalLink, Droplets, Building2, FileText, Users, Shield, Bookmark, MessageSquare, Search } from "lucide-react";

interface Recommendation {
  title: string;
  priority: string;
  description: string;
  expected_impact: string;
  example_project?: string | null;
}

interface RiskScores {
  physicalRisk: number;
  financialRisk: number;
  regulatoryRisk: number;
  reputationalRisk: number;
  governanceRisk: number;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  technology_type: string;
  sector: string;
  country: string;
  financials: { roi_percent: number | null; payback_years: number | null } | null;
  outcomes: { water_saved_m3_year: number | null } | null;
}

interface RecommendedActionsProps {
  recommendations?: Recommendation[];
  riskScores: RiskScores;
  industry: string;
}

// Recommendation rules based on risk profiles
const recommendationRules = {
  highPhysicalRisk: [
    {
      title: "Implement Water Recycling (85%+ Recovery)",
      icon: Droplets,
      priority: "HIGH",
      description: "Reduce freshwater dependency by recycling process water. Critical for drought resilience.",
      expectedImpact: [
        "Reduce freshwater demand by 60-80%",
        "Typical payback: 2-4 years",
        "Drought resilience significantly improved"
      ],
      projectFilters: {
        technology_type: ["reuse", "circular_systems"]
      }
    },
    {
      title: "Develop On-Site Water Storage",
      icon: Building2,
      priority: "MEDIUM",
      description: "Build emergency storage capacity to buffer against supply disruptions.",
      expectedImpact: [
        "7-14 days operational buffer",
        "Protection during rationing periods"
      ],
      projectFilters: null
    }
  ],
  highFinancialRisk: [
    {
      title: "Water Efficiency Audit & Quick Wins",
      icon: Target,
      priority: "HIGH",
      description: "Identify and fix water waste to reduce costs immediately.",
      expectedImpact: [
        "10-30% reduction in water costs",
        "Often <1 year payback",
        "No major capital investment needed"
      ],
      projectFilters: {
        technology_type: ["reuse", "treatment", "smart_metering"]
      }
    }
  ],
  highRegulatoryRisk: [
    {
      title: "Upgrade Wastewater Treatment",
      icon: FileText,
      priority: "HIGH",
      description: "Meet current and anticipated discharge standards with advanced treatment.",
      expectedImpact: [
        "Full regulatory compliance",
        "Avoid fines and permit issues",
        "Prepare for stricter future standards"
      ],
      projectFilters: {
        technology_type: ["treatment", "circular_systems"]
      }
    }
  ],
  highReputationalRisk: [
    {
      title: "Proactive Water Stewardship Program",
      icon: Users,
      priority: "MEDIUM",
      description: "Engage with community, set public targets, report transparently on water use.",
      expectedImpact: [
        "Improved community relations",
        "Reduced opposition risk",
        "ESG rating improvement"
      ],
      projectFilters: {
        technology_type: ["nature_based"]
      }
    }
  ],
  highGovernanceRisk: [
    {
      title: "Secure Long-Term Water Rights",
      icon: Shield,
      priority: "HIGH",
      description: "Review and strengthen water allocation agreements. Consider alternative sources.",
      expectedImpact: [
        "Supply security for 10+ years",
        "Protection from allocation cuts"
      ],
      projectFilters: null
    }
  ]
};

const formatWaterSaved = (m3: number): string => {
  if (m3 >= 1000000) {
    return `${(m3 / 1000000).toFixed(1)}M m³/yr`;
  }
  if (m3 >= 1000) {
    return `${(m3 / 1000).toFixed(0)}K m³/yr`;
  }
  return `${m3} m³/yr`;
};

const RecommendedActions = ({ recommendations: aiRecommendations, riskScores, industry }: RecommendedActionsProps) => {
  const navigate = useNavigate();
  const [matchedProjects, setMatchedProjects] = useState<Record<string, Project[]>>({});
  const [loading, setLoading] = useState(true);

  // Generate recommendations based on risk scores
  const generateRecommendations = () => {
    const recs: Array<{
      title: string;
      icon: any;
      priority: string;
      description: string;
      expectedImpact: string[];
      projectFilters: { technology_type: string[] } | null;
    }> = [];

    // Add recommendations based on high-risk categories
    if (riskScores.physicalRisk > 60) {
      recs.push(...recommendationRules.highPhysicalRisk);
    }
    if (riskScores.financialRisk > 60) {
      recs.push(...recommendationRules.highFinancialRisk);
    }
    if (riskScores.regulatoryRisk > 60) {
      recs.push(...recommendationRules.highRegulatoryRisk);
    }
    if (riskScores.reputationalRisk > 60) {
      recs.push(...recommendationRules.highReputationalRisk);
    }
    if (riskScores.governanceRisk > 60) {
      recs.push(...recommendationRules.highGovernanceRisk);
    }

    // If no high risks, add general recommendations
    if (recs.length === 0) {
      recs.push(recommendationRules.highFinancialRisk[0]); // Always useful
      if (riskScores.physicalRisk > 30) {
        recs.push(recommendationRules.highPhysicalRisk[0]);
      }
    }

    // Sort by priority and limit to 4
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return recs
      .sort((a, b) => (priorityOrder[a.priority as keyof typeof priorityOrder] || 2) - (priorityOrder[b.priority as keyof typeof priorityOrder] || 2))
      .slice(0, 4);
  };

  const generatedRecs = generateRecommendations();

  // Fetch matching projects
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const projectMap: Record<string, Project[]> = {};

      for (const rec of generatedRecs) {
        if (rec.projectFilters) {
          const techTypes = rec.projectFilters.technology_type as Array<'reuse' | 'circular_systems' | 'treatment' | 'smart_metering' | 'nature_based' | 'desalination' | 'leak_detection' | 'other'>;
          const { data, error } = await supabase
            .from('projects')
            .select(`
              id, name, description, technology_type, sector, country,
              financials (roi_percent, payback_years),
              outcomes (water_saved_m3_year)
            `)
            .in('technology_type', techTypes)
            .limit(3);

          if (!error && data) {
            projectMap[rec.title] = data as Project[];
          }
        }
      }

      setMatchedProjects(projectMap);
      setLoading(false);
    };

    fetchProjects();
  }, [riskScores]);

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return {
          badge: 'bg-destructive/10 text-destructive border-destructive/20',
          border: 'border-l-destructive'
        };
      case 'MEDIUM':
        return {
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          border: 'border-l-amber-500'
        };
      default:
        return {
          badge: 'bg-primary/10 text-primary border-primary/20',
          border: 'border-l-primary'
        };
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <CardTitle>Recommended Actions</CardTitle>
        </div>
        <CardDescription>
          Based on your risk profile for {industry}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {generatedRecs.map((rec, index) => {
          const styles = getPriorityStyles(rec.priority);
          const projects = matchedProjects[rec.title] || [];
          const IconComponent = rec.icon;

          return (
            <div
              key={index}
              className={`border-l-4 ${styles.border} bg-card rounded-lg p-4 space-y-3`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <IconComponent className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={styles.badge}>
                        {rec.priority} PRIORITY
                      </Badge>
                    </div>
                    <h4 className="font-semibold">{rec.title}</h4>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground pl-12">
                {rec.description}
              </p>

              {/* Expected Impact */}
              <div className="pl-12">
                <p className="text-xs font-medium text-muted-foreground mb-2">Expected Impact:</p>
                <ul className="text-sm space-y-1">
                  {rec.expectedImpact.map((impact, i) => (
                    <li key={i} className="flex items-center gap-2 text-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {impact}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Matching Projects */}
              {projects.length > 0 && (
                <div className="pl-12 pt-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Search className="h-3 w-3" />
                    See Similar Projects:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {projects.slice(0, 2).map((project) => (
                      <button
                        key={project.id}
                        onClick={() => navigate(`/project/${project.id}`)}
                        className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors group"
                      >
                        <div className="flex-1 text-left">
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {project.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {project.outcomes?.water_saved_m3_year
                              ? formatWaterSaved(project.outcomes.water_saved_m3_year)
                              : project.financials?.roi_percent
                                ? `${project.financials.roi_percent}% ROI`
                                : project.country}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* CTA Section */}
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground text-center mb-4">
            Want a detailed investment analysis?
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="outline" size="sm">
              <Bookmark className="h-4 w-4 mr-2" />
              Save This Assessment
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/explore')}>
              <Search className="h-4 w-4 mr-2" />
              Explore All Projects
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/ask-laguna')}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Ask Laguna
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendedActions;
