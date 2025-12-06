import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { exitDemoMode } from "@/contexts/DemoContext";

interface DemoRestrictionModalProps {
  open: boolean;
  onClose: () => void;
}

export function DemoRestrictionModal({ open, onClose }: DemoRestrictionModalProps) {
  const navigate = useNavigate();

  const handleSignUp = () => {
    exitDemoMode();
    onClose();
    navigate("/auth?mode=signup");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a Free Account</DialogTitle>
          <DialogDescription>
            Create a free account to save your assessments and access full features including:
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 py-4 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Save and manage your risk assessments
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Create custom assessments for your facilities
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Download detailed PDF reports
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Unlimited Ask Laguna AI queries
          </li>
        </ul>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
          <Button onClick={handleSignUp}>
            Sign Up Free
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
