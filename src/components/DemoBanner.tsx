import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { exitDemoMode } from "@/contexts/DemoContext";

export function DemoBanner() {
  const navigate = useNavigate();

  const handleSignUp = () => {
    exitDemoMode();
    navigate("/auth?mode=signup");
  };

  return (
    <div className="bg-primary text-primary-foreground px-4 py-2 flex items-center justify-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4" />
        <span>
          <strong>Demo Mode:</strong> Viewing sample assessment for Arizona Semiconductor
        </span>
      </div>
      <Button 
        size="sm" 
        variant="secondary"
        onClick={handleSignUp}
        className="h-7 text-xs"
      >
        Sign Up
      </Button>
    </div>
  );
}
