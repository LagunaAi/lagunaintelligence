import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ExternalLink } from "lucide-react";

interface PeerInsight {
  title: string;
  description: string;
  frequency: 'Common' | 'Very Common' | 'Emerging';
}

interface PeerInsightsProps {
  industry: string;
  country: string;
  insights: PeerInsight[];
}

const PeerInsights = ({ industry, country, insights }: PeerInsightsProps) => {
  const getFrequencyConfig = (frequency: string) => {
    switch (frequency) {
      case 'Very Common':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'Emerging':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    }
  };

  const getSearchUrl = (title: string) => {
    const query = `${title} ${industry} ${country} water`;
    return `https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=news`;
  };

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Peer Insights</CardTitle>
        </div>
        <CardDescription>
          Common risks for {industry} companies in {country}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div 
            key={index} 
            className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4 className="font-medium text-sm">{insight.title}</h4>
              <Badge variant="outline" className={`shrink-0 text-xs ${getFrequencyConfig(insight.frequency)}`}>
                {insight.frequency}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
            <a
              href={getSearchUrl(insight.title)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Research this topic
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PeerInsights;
