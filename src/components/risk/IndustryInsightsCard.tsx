import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface Insight {
  text: string;
  source?: string;
  projectLink?: string;
}

interface IndustryInsightsCardProps {
  industry: string;
  location: string;
  insights: Insight[];
  relatedProjects?: Array<{
    id: string;
    name: string;
    relevance: string;
  }>;
}

const IndustryInsightsCard = ({ industry, location, insights, relatedProjects }: IndustryInsightsCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Industry-Specific Insights
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          What you should know about {industry} water use
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg"
            >
              <span className="text-primary font-semibold mt-0.5">•</span>
              <div className="flex-1">
                <p className="text-sm">{insight.text}</p>
                {insight.source && (
                  <span className="text-xs text-muted-foreground">
                    Source: {insight.source}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {relatedProjects && relatedProjects.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Related Projects in Our Database</h4>
            <div className="space-y-2">
              {relatedProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/project/${project.id}`}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors group"
                >
                  <div>
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                      {project.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {project.relevance}
                    </span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IndustryInsightsCard;
