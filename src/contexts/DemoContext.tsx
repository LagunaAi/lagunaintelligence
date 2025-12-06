import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface DemoContextType {
  isDemo: boolean;
  demoData: typeof DEMO_ASSESSMENT;
}

// Pre-filled Arizona Semiconductor scenario
export const DEMO_ASSESSMENT = {
  company_name: "Arizona Semiconductor Manufacturing",
  industry_sector: "Semiconductors",
  primary_location_country: "United States",
  primary_location_region: "Arizona",
  facilities_count: 2,
  annual_water_consumption: 8200000,
  water_unit: "m³",
  water_sources: ["Municipal (Phoenix)", "Groundwater"],
  current_treatment_level: "On-site treatment with 65% recycling rate",
  
  // Risk Scores
  overall_risk_score: 78,
  physical_risk_score: 85,
  financial_risk_score: 80,
  water_quality_risk_score: 75, // Governance Risk
  regulatory_risk_score: 55,
  reputational_risk_score: 50,
  
  // Risk explanations
  risk_factors: {
    physical: "Severe drought conditions in Arizona. Colorado River allocation reduced 21% in 2024. Groundwater levels declining rapidly.",
    financial: "Phoenix water rates increased 8% in 2024. Projected 15% increase by 2027. High exposure to scarcity pricing.",
    governance: "Colorado River Compact renegotiation ongoing. Tribal water rights claims pending. Multi-state allocation disputes.",
    regulatory: "Arizona Groundwater Management Act compliance required. Discharge permits under review.",
    reputational: "Data center and semiconductor water use facing increased public scrutiny in Phoenix area."
  },
  
  created_at: new Date().toISOString(),
  
  // Recommended Actions
  recommended_actions: [
    {
      title: "Increase Water Recycling to 85%+",
      description: "Reduce freshwater dependency from 35% to 15%. Critical for drought resilience in Arizona.",
      priority: "high",
      expected_impact: "Reduce municipal water demand by 60%, saving $2.4M annually at projected 2027 rates",
      similar_project: {
        id: "473c891e-3e64-4301-a6ff-47d4796518de",
        name: "TSMC Taiwan",
        detail: "87% recycling, $130M investment"
      }
    },
    {
      title: "Develop Alternative Water Sources",
      description: "Secure reclaimed water contracts with Phoenix or Tempe water utilities.",
      priority: "high",
      expected_impact: "Diversify supply, reduce single-source dependency by 40%",
      similar_project: {
        id: "b8a94cd8-c4f3-4dbb-972a-1c3f3e3b9856",
        name: "Samsung Korea Sewage Recycling"
      }
    },
    {
      title: "On-Site Water Storage",
      description: "Build 7-14 day buffer storage for operational continuity during restrictions",
      priority: "medium",
      expected_impact: "Maintain operations during Level 2 or Level 3 water restrictions"
    }
  ],
  
  // Industry insights
  industry_insights: [
    "Semiconductor fabs in Arizona typically use 4-10 million gallons of ultrapure water per day",
    "TSMC's nearby facility is investing in 90% water recycling to reduce Colorado River dependency",
    "Intel Arizona has achieved 80% water recycling and 243% water restoration through offset programs",
    "Phoenix water rates are among the fastest-rising in the US due to Colorado River shortages"
  ]
};

export const DEMO_NEWS = [
  {
    headline: "Arizona Faces Deepest Colorado River Cuts Yet",
    source: "Reuters",
    date: "Oct 2024",
    summary: "Federal government announces additional 21% cuts to Arizona's Colorado River allocation, impacting industrial and agricultural users.",
    tags: ["Water Scarcity", "Regulatory Pressure"],
    sentiment: "negative" as const
  },
  {
    headline: "Tech Industry Water Use Draws Scrutiny in Drought-Stricken West",
    source: "Wall Street Journal",
    date: "Sept 2024",
    summary: "Semiconductor and data center water consumption faces growing criticism as western states struggle with historic drought.",
    tags: ["Community Opposition", "ESG Concerns"],
    sentiment: "warning" as const
  },
  {
    headline: "Phoenix Approves 8% Water Rate Increase for Industrial Users",
    source: "AZ Central",
    date: "Aug 2024",
    summary: "Phoenix City Council approves significant rate hike for industrial water users, with additional increases projected through 2027.",
    tags: ["Financial Impact", "Regulatory Pressure"],
    sentiment: "negative" as const
  }
];

export const DEMO_COMPARATIVE_INTELLIGENCE = {
  industryBenchmark: {
    userConsumption: 8200000,
    industryAverage: 6500000,
    unit: "m³/year",
    status: "high" as const,
    percentageDifference: 26,
    insight: "Your water consumption is 26% above the industry average for semiconductor facilities of similar capacity. Consider advanced recycling systems to reduce intake."
  },
  floodRisk: {
    riskLevel: "low" as const,
    score: 15,
    factors: ["Desert climate", "Low precipitation"],
    seasonalPeak: "July-September (monsoon season)",
    insight: "While flood risk is low, monsoon season can bring flash flooding. Primary concern is drought, not flooding."
  },
  peerInsights: [
    {
      title: "Water Recycling Investment",
      description: "Leading semiconductor manufacturers in water-stressed regions are achieving 80-90% recycling rates through advanced treatment systems.",
      frequency: "Very Common" as const
    },
    {
      title: "Alternative Source Development",
      description: "Peers are securing reclaimed water contracts and developing on-site treatment for municipal wastewater reuse.",
      frequency: "Common" as const
    },
    {
      title: "Colorado River Diversification",
      description: "Companies dependent on Colorado River allocations are actively seeking groundwater rights and alternative sources.",
      frequency: "Emerging" as const
    }
  ]
};

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Check if we're in demo mode based on URL or sessionStorage
    const isDemoPath = location.pathname.startsWith("/demo");
    const isDemoSession = sessionStorage.getItem("laguna_demo_mode") === "true";
    
    if (isDemoPath) {
      sessionStorage.setItem("laguna_demo_mode", "true");
      setIsDemo(true);
    } else if (isDemoSession) {
      setIsDemo(true);
    } else {
      setIsDemo(false);
    }
  }, [location.pathname]);

  return (
    <DemoContext.Provider value={{ isDemo, demoData: DEMO_ASSESSMENT }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return context;
}

export function exitDemoMode() {
  sessionStorage.removeItem("laguna_demo_mode");
}
