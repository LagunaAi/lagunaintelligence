import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { Database, TrendingUp, MessageSquare, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

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
                  <div className="text-4xl md:text-5xl font-bold data-value text-primary">$7T</div>
                  <div className="text-sm text-muted-foreground mt-1">Investment Gap</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-4xl md:text-5xl font-bold data-value text-primary">8%</div>
                  <div className="text-sm text-muted-foreground mt-1">GDP at Risk</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-4xl md:text-5xl font-bold data-value text-primary">500+</div>
                  <div className="text-sm text-muted-foreground mt-1">Projects Tracked</div>
                </div>
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

        {/* Team Section */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Built by Water Finance Experts</h2>
              <p className="text-lg text-muted-foreground">
                Laguna is developed by Logan Whitall and David Selin at SSE Business Lab, combining deep expertise in water technology investment analysis with cutting-edge data intelligence.
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
