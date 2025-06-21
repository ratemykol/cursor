import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Loader2, Save } from "lucide-react";

export const TraderProfileManagementPage = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    walletAddress: "",
    bio: "",
    twitterUrl: "",
    profileImageUrl: ""
  });

  // Redirect if not a trader user
  if (!user || user.userType !== "trader") {
    setLocation("/");
    return <div>Redirecting...</div>;
  }

  const { data: traderProfile, isLoading } = useQuery({
    queryKey: ["/api/user/trader-profile"],
    enabled: !!user && user.userType === "trader",
  });

  // Update form data when trader profile loads
  React.useEffect(() => {
    if (traderProfile && typeof traderProfile === 'object') {
      setFormData({
        username: user?.username || "",
        name: (traderProfile as any).name || "",
        walletAddress: (traderProfile as any).walletAddress || "",
        bio: (traderProfile as any).bio || "",
        twitterUrl: (traderProfile as any).twitterUrl || "",
        profileImageUrl: (traderProfile as any).profileImageUrl || ""
      });
    }
  }, [traderProfile, user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: typeof formData) => {
      const response = await fetch("/api/user/trader-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Your trader profile has been updated successfully",
      });
      
      // If username was updated, refresh all queries to update the auth context
      if (data.user?.username) {
        queryClient.invalidateQueries();
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/user/trader-profile"] });
        queryClient.invalidateQueries({ queryKey: ["/api/traders"] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      toast({
        title: "Error",
        description: "Username is required",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.username.length < 3 || formData.username.length > 50) {
      toast({
        title: "Error",
        description: "Username must be between 3 and 50 characters",
        variant: "destructive",
      });
      return;
    }
    
    if (!/^[a-zA-Z0-9._-]+$/.test(formData.username)) {
      toast({
        title: "Error",
        description: "Username can only contain letters, numbers, dots, hyphens, and underscores",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Trader name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.walletAddress.trim()) {
      toast({
        title: "Error",
        description: "Wallet address is required",
        variant: "destructive",
      });
      return;
    }
    
    updateProfileMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="bg-white w-full min-h-screen">
        <div className="bg-white overflow-hidden w-full max-w-[1440px] relative mx-auto">
          <Header />
          <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
            <Loader2 className="h-8 w-8 animate-spin text-[#ab9ff2]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white w-full min-h-screen">
      <div className="bg-white overflow-hidden w-full max-w-[1440px] relative mx-auto">
        <Header />
        
        <div className="flex justify-center items-start min-h-[calc(100vh-200px)] px-20 pt-20">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-[#3c315b]">
                Manage Your Trader Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="border-2 border-[#9f98b3]"
                    placeholder="Your unique username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Trader Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="border-2 border-[#9f98b3]"
                    placeholder="Your trading name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="walletAddress">Wallet Address *</Label>
                  <Input
                    id="walletAddress"
                    name="walletAddress"
                    type="text"
                    value={formData.walletAddress}
                    onChange={handleInputChange}
                    required
                    className="border-2 border-[#9f98b3]"
                    placeholder="Your wallet address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="border-2 border-[#9f98b3]"
                    placeholder="Tell people about your trading style and experience"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitterUrl">Twitter URL</Label>
                  <Input
                    id="twitterUrl"
                    name="twitterUrl"
                    type="url"
                    value={formData.twitterUrl}
                    onChange={handleInputChange}
                    className="border-2 border-[#9f98b3]"
                    placeholder="https://twitter.com/yourusername"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profileImageUrl">Profile Image URL</Label>
                  <Input
                    id="profileImageUrl"
                    name="profileImageUrl"
                    type="url"
                    value={formData.profileImageUrl}
                    onChange={handleInputChange}
                    className="border-2 border-[#9f98b3]"
                    placeholder="https://example.com/your-image.jpg"
                  />
                  {formData.profileImageUrl && (
                    <div className="mt-2">
                      <img
                        src={formData.profileImageUrl}
                        alt="Profile preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-[#9f98b3]"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="w-full bg-[#ab9ff2] text-[#3c315b] hover:bg-[#DCDAF0] transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating Profile...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Profile
                    </>
                  )}
                </Button>
              </form>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-[#3c315b] mb-2">Profile Management Tips:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Keep your trader name professional and memorable</li>
                  <li>• Your wallet address helps users verify your trading activity</li>
                  <li>• A good bio helps users understand your trading style</li>
                  <li>• Twitter URL will automatically fetch your profile image</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};