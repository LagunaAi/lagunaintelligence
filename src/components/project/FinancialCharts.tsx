import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface FinancialChartsProps {
  financials: any;
}

export const FinancialCharts = ({ financials }: FinancialChartsProps) => {
  const financial = financials?.[0];
  
  if (!financial) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">No financial data available</p>
        </CardContent>
      </Card>
    );
  }

  // Investment breakdown data
  const investmentData = [
    { name: 'Capital', value: financial.total_investment_usd * 0.7 },
    { name: 'Operating (Annual)', value: financial.annual_operating_cost_usd || financial.total_investment_usd * 0.15 },
    { name: 'Other', value: financial.total_investment_usd * 0.15 },
  ];

  // ROI comparison data
  const roiData = [
    { name: 'This Project', roi: financial.roi_percent || 0 },
    { name: 'Industry Avg', roi: 15 },
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${(financial.total_investment_usd / 1000000).toFixed(2)}M
            </p>
          </CardContent>
        </Card>

        {financial.roi_percent !== null && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Return on Investment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{financial.roi_percent}%</p>
            </CardContent>
          </Card>
        )}

        {financial.npv_usd && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Net Present Value</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${(financial.npv_usd / 1000000).toFixed(2)}M
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Investment Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={investmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {investmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => `$${(value / 1000000).toFixed(2)}M`}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ROI Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roiData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="roi" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      {(financial.irr_percent || financial.payback_years || financial.annual_revenue_usd) && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Financial Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {financial.irr_percent && (
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">Internal Rate of Return</dt>
                  <dd className="text-2xl font-bold">{financial.irr_percent}%</dd>
                </div>
              )}
              {financial.payback_years && (
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">Payback Period</dt>
                  <dd className="text-2xl font-bold">{financial.payback_years} years</dd>
                </div>
              )}
              {financial.annual_revenue_usd && (
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">Annual Revenue</dt>
                  <dd className="text-2xl font-bold">
                    ${(financial.annual_revenue_usd / 1000000).toFixed(2)}M
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
};