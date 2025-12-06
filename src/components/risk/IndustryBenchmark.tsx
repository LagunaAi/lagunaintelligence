import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from "recharts";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface IndustryBenchmarkProps {
  userConsumption: number;
  industryAverage: number;
  unit: string;
  status: 'efficient' | 'average' | 'high';
  percentageDifference: number;
  insight: string;
  industry: string;
}

const IndustryBenchmark = ({
  userConsumption,
  industryAverage,
  unit,
  status,
  percentageDifference,
  insight,
  industry
}: IndustryBenchmarkProps) => {
  const chartData = [
    { name: "Your Usage", value: userConsumption },
    { name: "Industry Avg", value: industryAverage }
  ];

  const getStatusConfig = () => {
    switch (status) {
      case 'efficient':
        return {
          label: 'Efficient',
          color: 'bg-green-500/10 text-green-600 border-green-500/20',
          barColor: 'hsl(142, 76%, 36%)',
          icon: TrendingDown
        };
      case 'high':
        return {
          label: 'High Usage',
          color: 'bg-red-500/10 text-red-600 border-red-500/20',
          barColor: 'hsl(0, 84%, 60%)',
          icon: TrendingUp
        };
      default:
        return {
          label: 'Average',
          color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
          barColor: 'hsl(48, 96%, 53%)',
          icon: Minus
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
  };

  return (
    <Card className="border-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Industry Benchmark</CardTitle>
          <Badge variant="outline" className={config.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
        <CardDescription>
          Your water usage vs {industry} average
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-32 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 40 }}>
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                axisLine={false} 
                tickLine={false}
                width={90}
                tick={{ fontSize: 12 }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === 0 ? config.barColor : 'hsl(var(--muted-foreground) / 0.3)'} 
                  />
                ))}
                <LabelList 
                  dataKey="value" 
                  position="right" 
                  formatter={(value: number) => `${formatValue(value)} ${unit}`}
                  style={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <StatusIcon className={`h-4 w-4 ${status === 'efficient' ? 'text-green-600' : status === 'high' ? 'text-red-600' : 'text-yellow-600'}`} />
            <span className="font-medium">
              {Math.abs(percentageDifference).toFixed(0)}% {status === 'efficient' ? 'below' : status === 'high' ? 'above' : 'near'} average
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{insight}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default IndustryBenchmark;
