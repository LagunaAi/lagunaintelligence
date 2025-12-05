import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Newspaper, ChevronDown, ChevronUp, Info, ExternalLink } from "lucide-react";

interface NewsArticle {
  id: string;
  headline: string;
  source: string;
  date: string;
  summary: string;
  tags: string[];
  industryTag?: string;
  sentiment: "negative" | "warning";
  url: string;
}

const sampleArticles: NewsArticle[] = [
  {
    id: "1",
    headline: "UK running out of water – but data centres refuse to say how much they use",
    source: "BBC News",
    date: "December 2025",
    summary: "Tech firms failing to disclose water consumption as concerns grow over UK water supply shortages.",
    tags: ["Water Scarcity"],
    industryTag: "Data Centers",
    sentiment: "negative",
    url: "https://www.bbc.com/news/articles/ckg0d0p7d8po"
  },
  {
    id: "2",
    headline: "$98 billion in data center projects blocked or delayed by community opposition",
    source: "NBC News",
    date: "November 2025",
    summary: "Local resistance to data centers has become a sustained and intensifying trend across 17 US states.",
    tags: ["Community Opposition"],
    industryTag: "Data Centers",
    sentiment: "negative",
    url: "https://www.nbcnews.com/tech/tech-news/data-centers-blocked-delayed-community-resistance-rcna181444"
  },
  {
    id: "3",
    headline: "Prince George's County pauses all data center development",
    source: "MultiState",
    date: "October 2025",
    summary: "Maryland county halts new projects to study community impacts after 20,000-signature petition.",
    tags: ["Regulatory Pressure"],
    industryTag: "Data Centers",
    sentiment: "warning",
    url: "https://www.multistate.us/insider/2025/10/22/prince-georges-county-pauses-all-data-center-development"
  },
  {
    id: "4",
    headline: "Taiwan pays farmers not to grow rice so chip factories can have water",
    source: "NPR",
    date: "April 2023",
    summary: "For three consecutive years, 183,000 acres of farmland shut off during worst drought in 56 years.",
    tags: ["Water Scarcity"],
    industryTag: "Semiconductors",
    sentiment: "negative",
    url: "https://www.npr.org/2023/04/06/1167845487/taiwan-chips-drought-water-tsmc-semiconductors"
  },
  {
    id: "5",
    headline: "AI mega projects raise alarm in Europe's driest regions",
    source: "CNBC",
    date: "October 2025",
    summary: "Data center expansion plans collide with water scarcity concerns in Spain and southern Europe.",
    tags: ["Water Scarcity"],
    industryTag: "Data Centers",
    sentiment: "warning",
    url: "https://www.cnbc.com/2024/10/28/ai-data-centers-raise-alarm-in-europes-dry-regions.html"
  }
];

const ReputationalRiskFeed = () => {
  const [isOpen, setIsOpen] = useState(true);

  const getSentimentStyles = (sentiment: "negative" | "warning") => {
    if (sentiment === "negative") {
      return {
        dotClass: "bg-red-500",
        bgClass: "bg-red-50 dark:bg-red-950/20"
      };
    }
    return {
      dotClass: "bg-yellow-500",
      bgClass: "bg-yellow-50 dark:bg-yellow-950/20"
    };
  };

  const getTagVariant = (tag: string) => {
    switch (tag) {
      case "Community Opposition":
        return "destructive";
      case "Water Scarcity":
        return "secondary";
      case "Regulatory Pressure":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="border-2">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Newspaper className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">Reputational Risk Signals</CardTitle>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Reputational risks often precede regulatory action. We track news about community opposition, water controversies, and corporate water issues that may signal future risks for your industry and location.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <CardDescription>Recent news that may indicate emerging water risks</CardDescription>
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {sampleArticles.map((article) => {
                const sentimentStyles = getSentimentStyles(article.sentiment);
                return (
                  <a
                    key={article.id}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block p-4 rounded-lg border transition-all hover:shadow-md hover:border-primary/30 ${sentimentStyles.bgClass}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Sentiment Indicator */}
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${sentimentStyles.dotClass}`} />
                      
                      <div className="flex-1 min-w-0">
                        {/* Headline */}
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary">
                            {article.headline}
                          </h4>
                          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        </div>
                        
                        {/* Source and Date */}
                        <p className="text-sm text-muted-foreground mb-2">
                          {article.source} • {article.date}
                        </p>
                        
                        {/* Summary */}
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {article.summary}
                        </p>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {article.industryTag && (
                            <Badge variant="default" className="text-xs">
                              {article.industryTag}
                            </Badge>
                          )}
                          {article.tags.map((tag) => (
                            <Badge key={tag} variant={getTagVariant(tag)} className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
            
            {/* View All Link */}
            <div className="mt-4 pt-4 border-t">
              <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground">
                View All Risk Signals
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default ReputationalRiskFeed;
