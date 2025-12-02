import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { Database, TrendingUp, MessageSquare, ArrowRight, AlertTriangle, Target, BarChart3, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Landing() {
  const navigate = useNavigate();
  const [featuredProjects, setFeaturedProjects] = useState<any[]>([]);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      const { data } = await supabase
        .from('projects')
        .select(`
          *,
          financials(roi_percent, total_investment_usd, payback_years),
          outcomes(water_saved_m3_year, water_produced_m3_day)
        `)
        .limit(5);
      
      if (data) setFeaturedProjects(data);
    };
    fetchFeaturedProjects();
  }, []);

  const nextProject = () => {
    setCurrentProjectIndex((prev) => 
      prev === featuredProjects.length - 1 ? 0 : prev + 1
    );
  };

  const prevProject = () => {
    setCurrentProjectIndex((prev) => 
      prev === 0 ? featuredProjects.length - 1 : prev - 1
    );
  };

  return (
    <Layout>
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 bg-gradient-to-b from-primary/5 to-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="space-y-4 max-w-3xl">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Investment Intelligence for Water
                </h1>
                <p className="mx-auto max-w-[700px] text-lg md:text-xl text-muted-foreground">
                  The best database for tracking water investment outcomes - not just where capital flows, but whether it delivers returns
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => navigate("/auth?mode=signup")}>
                  Request Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
              </div>

              {/* Stats Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl pt-12">
                <div className="flex flex-col items-center">
                  <div className="text-4xl md:text-5xl font-bold data-value text-primary">$339B</div>
                  <div className="text-sm text-muted-foreground mt-1">Corporate Water Risk</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-4xl md:text-5xl font-bold data-value text-primary">69%</div>
                  <div className="text-sm text-muted-foreground mt-1">Companies Impacted</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-4xl md:text-5xl font-bold data-value text-primary">25+</div>
                  <div className="text-sm text-muted-foreground mt-1">Verified Projects</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-12 bg-muted/30 border-y">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-8">
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Trusted Data Sources</p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
              <div className="text-2xl font-bold text-muted-foreground">World Bank</div>
              <div className="text-2xl font-bold text-muted-foreground">EIB</div>
              <div className="text-2xl font-bold text-muted-foreground">CDP</div>
              <div className="text-2xl font-bold text-muted-foreground">Corporate ESG</div>
            </div>
          </div>
        </section>

        {/* Problem/Solution Section */}
        <section className="py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  The Problem
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Industrial Water Risk is Growing — And Invisible
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-destructive flex-shrink-0" />
                    <p><span className="font-semibold text-foreground">$339B</span> in water-related financial impacts reported by corporations — yet most companies don't price water into decisions <span className="text-xs">(CDP 2024)</span></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-destructive flex-shrink-0" />
                    <p><span className="font-semibold text-foreground">$4.2 trillion</span> in projected manufacturing losses from water disruption by 2050 <span className="text-xs">(GHD Aquanomics)</span></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-destructive flex-shrink-0" />
                    <p><span className="font-semibold text-foreground">69%</span> of companies report water-related business impacts, but lack data to evaluate solutions</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic border-l-2 border-destructive/30 pl-4">
                  In Taiwan, 183,000 acres of farmland were shut off for three years so semiconductor fabs could keep running. Water scarcity isn't coming — it's here.
                </p>
              </div>

              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-highlight/10 text-highlight text-sm font-medium">
                  <Target className="h-4 w-4" />
                  Our Solution
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  See What Works Before You Invest
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 text-highlight flex-shrink-0" />
                    <p><span className="font-semibold text-foreground">Real project outcomes</span> from TSMC, Nestlé, Carlsberg, Intel, Microsoft and 20+ industrial leaders</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 text-highlight flex-shrink-0" />
                    <p><span className="font-semibold text-foreground">Risk assessment</span> tailored to your industry, location, and water profile</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 text-highlight flex-shrink-0" />
                    <p><span className="font-semibold text-foreground">AI-powered recommendations</span> that cite actual data and comparable projects — not assumptions</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic border-l-2 border-highlight/30 pl-4">
                  The intelligence that used to cost $50-100K in consulting fees, available in seconds.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 md:py-32 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Three simple steps to make data-driven water investment decisions
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                    1
                  </div>
                  <Database className="h-12 w-12 text-primary" />
                  <h3 className="text-xl font-bold">Assess Your Risk</h3>
                  <p className="text-muted-foreground">
                    Answer a few questions about your company's water use and location to get a personalized risk score
                  </p>
                </div>
                <div className="hidden md:block absolute top-8 -right-4 w-8 h-0.5 bg-border" />
              </div>

              <div className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center text-primary-foreground text-2xl font-bold">
                    2
                  </div>
                  <BarChart3 className="h-12 w-12 text-accent" />
                  <h3 className="text-xl font-bold">Explore Solutions</h3>
                  <p className="text-muted-foreground">
                    Browse 25+ verified industrial water projects with real ROI data, filtered to your industry and region
                  </p>
                </div>
                <div className="hidden md:block absolute top-8 -right-4 w-8 h-0.5 bg-border" />
              </div>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-highlight flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  3
                </div>
                <TrendingUp className="h-12 w-12 text-highlight" />
                <h3 className="text-xl font-bold">Make Data-Driven Decisions</h3>
                <p className="text-muted-foreground">
                  Get AI-powered recommendations backed by actual project outcomes, not forecasts
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Value Propositions */}
        <section className="py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 md:grid-cols-3">
              <Card 
                className="border-2 hover:border-primary transition-colors cursor-pointer"
                onClick={() => navigate("/explore")}
              >
                <CardHeader>
                  <Database className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Verified Database</CardTitle>
                  <CardDescription className="text-base">
                    Outcomes data from World Bank, EIB, and corporate disclosures - not just project announcements
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card 
                className="border-2 hover:border-primary transition-colors cursor-pointer"
                onClick={() => navigate("/analytics")}
              >
                <CardHeader>
                  <TrendingUp className="h-12 w-12 text-accent mb-4" />
                  <CardTitle>Benchmark Analytics</CardTitle>
                  <CardDescription className="text-base">
                    Compare ROI across technologies, sectors, and regions - see what actually works
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card 
                className="border-2 hover:border-primary transition-colors cursor-pointer"
                onClick={() => navigate("/ask")}
              >
                <CardHeader>
                  <MessageSquare className="h-12 w-12 text-highlight mb-4" />
                  <CardTitle>Ask Laguna AI</CardTitle>
                  <CardDescription className="text-base">
                    Natural language queries with cited recommendations - get answers backed by real data
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Featured Projects Carousel */}
        {featuredProjects.length > 0 && (
          <section className="py-20 md:py-32 bg-muted/30">
            <div className="container px-4 md:px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                  Featured Projects
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Real water investments with verified outcomes
                </p>
              </div>

              <div className="relative max-w-4xl mx-auto">
                <Card className="border-2">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <CardTitle className="text-2xl">
                          {featuredProjects[currentProjectIndex]?.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{featuredProjects[currentProjectIndex]?.country}</span>
                          <span>•</span>
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {featuredProjects[currentProjectIndex]?.technology_type}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
                            {featuredProjects[currentProjectIndex]?.sector}
                          </span>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-base mt-4">
                      {featuredProjects[currentProjectIndex]?.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Investment</p>
                        <p className="text-2xl font-bold data-value">
                          ${(featuredProjects[currentProjectIndex]?.financials?.total_investment_usd / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      {featuredProjects[currentProjectIndex]?.financials?.roi_percent && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">ROI</p>
                          <p className="text-2xl font-bold data-value text-highlight">
                            {featuredProjects[currentProjectIndex]?.financials?.roi_percent.toFixed(1)}%
                          </p>
                        </div>
                      )}
                      {featuredProjects[currentProjectIndex]?.financials?.payback_years && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Payback</p>
                          <p className="text-2xl font-bold data-value">
                            {featuredProjects[currentProjectIndex]?.financials?.payback_years.toFixed(1)}y
                          </p>
                        </div>
                      )}
                      {(featuredProjects[currentProjectIndex]?.outcomes?.water_saved_m3_year || 
                        featuredProjects[currentProjectIndex]?.outcomes?.water_produced_m3_day) && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Water Impact</p>
                          <p className="text-2xl font-bold data-value text-primary">
                            {featuredProjects[currentProjectIndex]?.outcomes?.water_saved_m3_year 
                              ? `${(featuredProjects[currentProjectIndex]?.outcomes?.water_saved_m3_year / 1000).toFixed(0)}K m³/y`
                              : `${featuredProjects[currentProjectIndex]?.outcomes?.water_produced_m3_day?.toFixed(0)} m³/d`
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4"
                  onClick={prevProject}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4"
                  onClick={nextProject}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <div className="flex justify-center gap-2 mt-6">
                  {featuredProjects.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentProjectIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentProjectIndex
                          ? 'w-8 bg-primary'
                          : 'w-2 bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>

                <div className="text-center mt-8">
                  <Button onClick={() => navigate("/explore")} variant="outline" size="lg">
                    Explore All Projects
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Team Section */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Built by Students at SSE Business Lab</h2>
              <p className="text-lg text-muted-foreground">
                Laguna is developed by Logan Whitall and David Selin at SSE Business Lab, tackling the lack of standardized outcome data in water technology investments.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="space-y-4 max-w-2xl">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Make Smarter Water Investments?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Join leading banks, corporates, and investors using Laguna to identify high-performing water technology investments.
                </p>
              </div>
              <Button size="lg" onClick={() => navigate("/auth?mode=signup")}>
                Request Demo Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-12 bg-muted/20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-muted-foreground">
                © 2024 Laguna. All rights reserved.
              </div>
              <div className="flex gap-6">
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
}
