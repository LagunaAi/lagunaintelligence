import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

interface RecommendationCardProps {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  industry?: string;
}

const RecommendationCard = ({ title, description, priority, industry }: RecommendationCardProps) => {
  const getPriorityColor = (priority: string) => {
    if (priority === "high") return "bg-red-100 text-red-800 border-red-200";
    if (priority === "medium") return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const handleLearnMore = () => {
    const searchQuery = industry 
      ? `${title} solutions for ${industry} industry`
      : `${title} water management solutions`;
    const encodedQuery = encodeURIComponent(searchQuery);
    window.open(`https://www.google.com/search?q=${encodedQuery}`, '_blank');
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <Badge variant="outline" className={getPriorityColor(priority)}>
            {priority.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm mb-3">{description}</CardDescription>
        <div 
          className="flex items-center text-sm text-primary font-medium cursor-pointer hover:underline"
          onClick={handleLearnMore}
        >
          Learn more <ArrowRight className="ml-1 h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;