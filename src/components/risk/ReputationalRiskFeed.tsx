import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Newspaper, ChevronDown, ChevronUp, Info, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NewsArticle {
  id: string;
  headline: string;
  source: string;
  date: string;
  summary: string;
  tags: string[];
  industryTag?: string;
  sentiment: "negative" | "warning";
}

interface ReputationalRiskFeedProps {
  industrySector?: string;
  country?: string;
}

const ReputationalRiskFeed = ({ industrySector, country }: ReputationalRiskFeedProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    if (industrySector && country && !hasGenerated) {
      generateNewsHeadlines();
    }
  }, [industrySector, country]);

  const generateNewsHeadlines = async () => {
    if (!industrySector || !country) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-risk-news', {
        body: { industrySector, country }
      });

      if (error) throw error;

      if (data?.articles) {
        setArticles(data.articles);
      }
      setHasGenerated(true);
    } catch (error) {
      console.error('Error generating news headlines:', error);
      // Fallback to default articles
      setArticles(getDefaultArticles(industrySector, country));
      setHasGenerated(true);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultArticles = (industry: string, location: string): NewsArticle[] => {
    return [
      {
        id: "1",
        headline: `Water scarcity concerns rise for ${industry} sector in ${location}`,
        source: "Industry Analysis",
        date: "Recent",
        summary: `Growing concerns about water availability affecting ${industry.toLowerCase()} operations in the region.`,
        tags: ["Water Scarcity"],
        industryTag: industry,
        sentiment: "warning"
      },
      {
        id: "2",
        headline: `New water regulations proposed for ${industry} industry`,
        source: "Regulatory Watch",
        date: "Recent",
        summary: `Proposed regulations could impact water usage permits and discharge requirements for ${industry.toLowerCase()} facilities.`,
        tags: ["Regulatory Pressure"],
        industryTag: industry,
        sentiment: "warning"
      },
      {
        id: "3",
        headline: `Community groups raise water usage concerns in ${location}`,
        source: "Local News",
        date: "Recent",
        summary: `Local stakeholders express concerns about industrial water consumption and its impact on regional water supplies.`,
        tags: ["Community Opposition"],
        industryTag: industry,
        sentiment: "negative"
      }
    ];
  };

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

  const getGoogleNewsUrl = (headline: string) => {
    return `https://news.google.com/search?q=${encodeURIComponent(headline)}`;
  };

  const getViewAllUrl = () => {
    const query = industrySector && country 
      ? `${industrySector} water risk ${country}`
      : "industrial water risk news";
    return `https://news.google.com/search?q=${encodeURIComponent(query)}`;
  };

  const displayArticles = articles.length > 0 ? articles : (industrySector && country ? getDefaultArticles(industrySector, country) : []);

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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <span className="text-muted-foreground">Generating personalized risk signals...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {displayArticles.map((article) => {
                  const sentimentStyles = getSentimentStyles(article.sentiment);
                  return (
                    <a
                      key={article.id}
                      href={getGoogleNewsUrl(article.headline)}
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
            )}
            
            {/* View All Link */}
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
                  View All Risk Signals
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </a>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default ReputationalRiskFeed;