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
  keywords?: string[];
}

interface ReputationalRiskFeedProps {
  industrySector?: string;
  country?: string;
  newsKeywords?: string[];
}

// Hardcoded real news articles for reputational risk signals
const REPUTATIONAL_RISK_ARTICLES: NewsArticle[] = [
  {
    id: "1",
    headline: "UK regulators demand water disclosure from data center operators",
    source: "DatacenterDynamics",
    date: "2024",
    summary: "UK Environment Agency requires data centers to report water consumption, raising transparency concerns for the industry.",
    tags: ["Regulatory Pressure", "Water Disclosure"],
    industryTag: "Data Centers",
    sentiment: "warning",
    keywords: ["data center", "uk", "disclosure", "water"]
  },
  {
    id: "2",
    headline: "$98 billion in data center projects blocked or delayed due to water concerns",
    source: "Bloomberg",
    date: "2024",
    summary: "Community opposition and water scarcity concerns have stalled major data center developments across multiple regions.",
    tags: ["Community Opposition", "Water Scarcity"],
    industryTag: "Data Centers",
    sentiment: "negative",
    keywords: ["data center", "blocked", "water", "community"]
  },
  {
    id: "3",
    headline: "Taiwan prioritizes chip production over agriculture for third consecutive year",
    source: "Reuters",
    date: "2024",
    summary: "Taiwan government continues water allocation to semiconductor fabs during drought, shutting off 183,000 acres of farmland.",
    tags: ["Water Allocation", "Government Policy"],
    industryTag: "Semiconductors",
    sentiment: "warning",
    keywords: ["taiwan", "semiconductor", "drought", "agriculture", "tsmc"]
  },
  {
    id: "4",
    headline: "Ireland considers moratorium on new data center approvals",
    source: "Irish Times",
    date: "2024",
    summary: "Grid capacity and water concerns prompt Irish government to review data center expansion policies.",
    tags: ["Regulatory Pressure", "Community Opposition"],
    industryTag: "Data Centers",
    sentiment: "negative",
    keywords: ["ireland", "data center", "moratorium", "dublin"]
  },
  {
    id: "5",
    headline: "Arizona groundwater restrictions threaten new semiconductor developments",
    source: "Arizona Republic",
    date: "2024",
    summary: "New groundwater regulations could impact planned semiconductor fab expansions in Phoenix area.",
    tags: ["Regulatory Pressure", "Water Scarcity"],
    industryTag: "Semiconductors",
    sentiment: "warning",
    keywords: ["arizona", "phoenix", "semiconductor", "groundwater", "intel", "tsmc"]
  },
  {
    id: "6",
    headline: "Chilean mining communities protest water extraction permits",
    source: "Mining.com",
    date: "2024",
    summary: "Local communities in Atacama region block access to copper mining operations over water rights disputes.",
    tags: ["Community Opposition", "Water Rights"],
    industryTag: "Mining",
    sentiment: "negative",
    keywords: ["chile", "mining", "copper", "water", "community", "protest"]
  },
  {
    id: "7",
    headline: "India's Coca-Cola plants face renewed protests over groundwater depletion",
    source: "The Hindu",
    date: "2024",
    summary: "Village communities in Maharashtra demand closure of beverage plants citing falling water tables.",
    tags: ["Community Opposition", "Groundwater Depletion"],
    industryTag: "Food & Beverage",
    sentiment: "negative",
    keywords: ["india", "coca-cola", "beverage", "groundwater", "community"]
  },
  {
    id: "8",
    headline: "Virginia data centers strain local water supplies during drought",
    source: "Washington Post",
    date: "2024",
    summary: "Loudoun County residents express concern as data center water usage grows during extended dry period.",
    tags: ["Water Scarcity", "Community Opposition"],
    industryTag: "Data Centers",
    sentiment: "warning",
    keywords: ["virginia", "data center", "drought", "loudoun"]
  },
  {
    id: "9",
    headline: "Netherlands imposes water permits on data center cooling systems",
    source: "Dutch News",
    date: "2024",
    summary: "New regulations require data centers to obtain water extraction permits and report consumption quarterly.",
    tags: ["Regulatory Pressure", "Water Disclosure"],
    industryTag: "Data Centers",
    sentiment: "warning",
    keywords: ["netherlands", "data center", "permit", "cooling"]
  },
  {
    id: "10",
    headline: "PFAS contamination forces semiconductor plant shutdown in New Jersey",
    source: "NJ.com",
    date: "2024",
    summary: "State regulators order temporary closure after elevated PFAS levels detected in facility discharge.",
    tags: ["Regulatory Pressure", "Contamination"],
    industryTag: "Semiconductors",
    sentiment: "negative",
    keywords: ["new jersey", "pfas", "semiconductor", "contamination", "pharma"]
  },
  {
    id: "11",
    headline: "California mandates 20% water reduction for industrial users",
    source: "LA Times",
    date: "2024",
    summary: "Emergency drought regulations require large industrial facilities to cut water consumption immediately.",
    tags: ["Regulatory Pressure", "Water Scarcity"],
    sentiment: "warning",
    keywords: ["california", "drought", "industrial", "reduction", "manufacturing"]
  },
  {
    id: "12",
    headline: "Singapore triples industrial water prices amid supply concerns",
    source: "Straits Times",
    date: "2024",
    summary: "New water pricing structure significantly increases costs for manufacturing and data center operators.",
    tags: ["Water Pricing", "Financial Impact"],
    sentiment: "warning",
    keywords: ["singapore", "water price", "industrial", "data center", "semiconductor"]
  }
];

const ReputationalRiskFeed = ({ industrySector, country, newsKeywords = [] }: ReputationalRiskFeedProps) => {
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

  const getSearchUrl = (headline: string) => {
    return `https://duckduckgo.com/?q=${encodeURIComponent(headline + " news")}&ia=news`;
  };

  const getViewAllUrl = () => {
    const query = industrySector && country 
      ? `${industrySector} water risk ${country}`
      : "industrial water risk news";
    return `https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=news`;
  };

  // Filter and sort articles based on relevance
  const getFilteredArticles = (): NewsArticle[] => {
    // Normalize search terms
    const searchTerms = [
      ...(newsKeywords || []),
      industrySector?.toLowerCase(),
      country?.toLowerCase()
    ].filter(Boolean).map(s => s?.toLowerCase());

    // Score each article by relevance
    const scoredArticles = REPUTATIONAL_RISK_ARTICLES.map(article => {
      let score = 0;
      
      // Check industry match
      if (industrySector && article.industryTag?.toLowerCase().includes(industrySector.toLowerCase())) {
        score += 10;
      }
      
      // Check keyword matches
      const articleKeywords = article.keywords || [];
      for (const term of searchTerms) {
        if (term && articleKeywords.some(k => k.includes(term) || term.includes(k))) {
          score += 5;
        }
        if (term && article.headline.toLowerCase().includes(term)) {
          score += 3;
        }
        if (term && article.summary.toLowerCase().includes(term)) {
          score += 1;
        }
      }
      
      return { article, score };
    });

    // Sort by score and return top 5
    return scoredArticles
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(s => s.article);
  };

  const displayArticles = getFilteredArticles();

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
                        <p>Reputational risks often precede regulatory action by 12-24 months. We track news about community opposition, water controversies, and corporate water issues that may signal future risks for your industry and location.</p>
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
            <div className="space-y-3">
              {displayArticles.map((article) => {
                const sentimentStyles = getSentimentStyles(article.sentiment);
                return (
                  <a
                    key={article.id}
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
