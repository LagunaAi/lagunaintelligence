import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    company_name: "",
    subscription_tier: "free",
    queries_remaining: 10,
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.id)
      .single();

    if (data && !error) {
      setProfile({
        full_name: data.full_name || "",
        company_name: data.company_name || "",
        subscription_tier: data.subscription_tier || "free",
        queries_remaining: data.queries_remaining || 10,
      });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        company_name: profile.company_name,
      })
      .eq("id", user?.id);

    setLoading(false);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully!");
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container py-8 max-w-4xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account and preferences
            </p>
          </div>

          <Tabs defaultValue="profile">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal and company details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={profile.full_name}
                        onChange={(e) =>
                          setProfile({ ...profile, full_name: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input
                        id="company"
                        value={profile.company_name}
                        onChange={(e) =>
                          setProfile({ ...profile, company_name: e.target.value })
                        }
                      />
                    </div>

                    <Button type="submit" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscription" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>
                    Manage your subscription and usage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Subscription Tier</div>
                      <div className="text-sm text-muted-foreground">
                        Your current plan
                      </div>
                    </div>
                    <Badge variant="default" className="capitalize">
                      {profile.subscription_tier}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Queries Remaining</div>
                      <div className="text-sm text-muted-foreground">
                        AI chat questions this month
                      </div>
                    </div>
                    <div className="text-2xl font-bold data-value">
                      {profile.queries_remaining}
                    </div>
                  </div>

                  {profile.subscription_tier === "free" && (
                    <div className="p-4 bg-muted rounded-lg space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Upgrade to Pro</h3>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Unlimited AI queries</li>
                          <li>• Export data to CSV</li>
                          <li>• Advanced analytics</li>
                          <li>• Priority support</li>
                        </ul>
                      </div>
                      <Button className="w-full">Upgrade Now</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
