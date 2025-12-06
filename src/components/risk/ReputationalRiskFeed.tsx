import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Newspaper, ChevronDown, ChevronUp, Info, ExternalLink, Sparkles } from "lucide-react";

interface NewsArticle {
  headline: string;
  source: string;
  date: string;
  summary: string;
  tags: string[];
  sentiment: "negative" | "warning";
}

interface ReputationalRiskFeedProps {
  industrySector?: string;
  country?: string;
  newsKeywords?: string[];
  reputationalNews?: NewsArticle[];
}

const ReputationalRiskFeed = ({ 
  industrySector, 
  country, 
  newsKeywords = [],
  reputationalNews = []
}: ReputationalRiskFeedProps) => {
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
      case "Environmental Impact":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getSearchUrl = (headline: string) => {
    return `https://news.google.com/search?q=${encodeURIComponent(headline)}&hl=en`;
  };

  const getViewAllUrl = () => {
    const query = industrySector && country 
      ? `${industrySector} water risk ${country}`
      : "industrial water risk news";
    return `https://news.google.com/search?q=${encodeURIComponent(query)}&hl=en`;
  };

  // Use AI-generated news if available, otherwise show placeholder
  const displayArticles = reputationalNews.length > 0 ? reputationalNews : [];
  const hasAINews = reputationalNews.length > 0;

  if (!hasAINews && !industrySector) {
    return null;
  }

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
                  {hasAINews && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Sparkles className="h-3 w-3" />
                      AI Generated
                    </Badge>
                  )}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>These news headlines represent realistic water risk scenarios for your industry and location. Click any headline to search for real news coverage on that topic.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <CardDescription>
                  {industrySector && country 
                    ? `Risk signals for ${industrySector} in ${country}`
                    : "Recent news that may indicate emerging water risks"
                  }
                </CardDescription>
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
            {displayArticles.length > 0 ? (
              <div className="space-y-3">
                {displayArticles.map((article, index) => {
                  const sentimentStyles = getSentimentStyles(article.sentiment);
                  return (
                    <a
                      key={index}
                      href={getSearchUrl(article.headline)}
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
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Newspaper className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Complete the Quick Scan to see personalized risk signals</p>
              </div>
            )}
            
            {/* View All Link */}
            {(industrySector || country) && (
              <div className="mt-4 pt-4 border-t">
                <a 
                  href={getViewAllUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button 
                    variant="ghost" 
                    className="w-full text-muted-foreground hover:text-foreground"
                  >
                    Search Real News Coverage
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </a>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default ReputationalRiskFeed;