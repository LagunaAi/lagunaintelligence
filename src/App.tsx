import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore";
import Analytics from "./pages/Analytics";
import AskLaguna from "./pages/AskLaguna";
import Settings from "./pages/Settings";
import ProjectDetail from "./pages/ProjectDetail";
import RiskAssessment from "./pages/RiskAssessment";
import RiskDashboard from "./pages/RiskDashboard";
import Admin from "./pages/Admin";
import Demo from "./pages/Demo";
import QRCode from "./pages/QRCode";
import NotFound from "./pages/NotFound";
import { DemoProvider } from "./contexts/DemoContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <DemoProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/ask" element={<AskLaguna />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/risk-assessment" element={<RiskAssessment />} />
            <Route path="/risk-dashboard" element={<RiskDashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/qr" element={<QRCode />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </DemoProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
