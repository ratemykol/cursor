import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/Header";
import type { UserRegistration } from "@shared/schema";

export const SignUpPage = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [userType, setUserType] = useState<"user" | "trader">("user");
  const [formData, setFormData] = useState<UserRegistration & {
    name?: string;
    walletAddress?: string;
    bio?: string;
    twitterUrl?: string;
  }>({
    username: "",
    email: "",
    password: "",
    userType: "user",
  });
  
  const [passwordError, setPasswordError] = useState<string>("");

  const registerMutation = useMutation({
    mutationFn: async (userData: UserRegistration & {
      name?: string;
      walletAddress?: string;
      bio?: string;
      twitterUrl?: string;
    }) => {
      const endpoint = userData.userType === "trader" ? "/api/auth/register-trader" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Registration failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account created successfully",
        description: "You can now sign in with your credentials",
      });
      setLocation("/signin");
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate password length
    if (name === "password") {
      if (value.length > 0 && value.length < 6) {
        setPasswordError("Password must be greater than 6 characters");
      } else {
        setPasswordError("");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check password length before submitting
    if (formData.password.length < 6) {
      setPasswordError("Password must be greater than 6 characters");
      return;
    }
    
    // Validate trader-specific fields
    if (userType === "trader") {
      if (!formData.name?.trim()) {
        toast({
          title: "Error",
          description: "Trader name is required",
          variant: "destructive",
        });
        return;
      }
      if (!formData.walletAddress?.trim()) {
        toast({
          title: "Error", 
          description: "Wallet address is required",
          variant: "destructive",
        });
        return;
      }
    }
    
    registerMutation.mutate({ ...formData, userType });
  };

  return (
    <div className="bg-white w-full min-h-screen">
      <div className="bg-white overflow-hidden w-full max-w-[1440px] relative mx-auto">
        <Header />
        
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)] px-20">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-[#3c315b]">
                Create Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                  <Label>Account Type</Label>
                  <RadioGroup value={userType} onValueChange={(value) => setUserType(value as "user" | "trader")}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="user" id="user" />
                      <Label htmlFor="user">Regular User (Rate and review traders)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="trader" id="trader" />
                      <Label htmlFor="trader">Trader (Manage your own trader profile)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="border-2 border-[#9f98b3]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="border-2 border-[#9f98b3]"
                    placeholder="Enter your email address (optional)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="border-2 border-[#9f98b3]"
                  />
                  {passwordError && (
                    <p className="text-red-500 text-sm">{passwordError}</p>
                  )}
                </div>
                
                {userType === "trader" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Trader Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name || ""}
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
                        value={formData.walletAddress || ""}
                        onChange={handleInputChange}
                        required
                        className="border-2 border-[#9f98b3]"
                        placeholder="Your wallet address"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio (Optional)</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        className="border-2 border-[#9f98b3]"
                        placeholder="Tell people about your trading style and experience"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitterUrl">Twitter URL (Optional)</Label>
                      <Input
                        id="twitterUrl"
                        name="twitterUrl"
                        type="url"
                        value={formData.twitterUrl || ""}
                        onChange={handleInputChange}
                        className="border-2 border-[#9f98b3]"
                        placeholder="https://twitter.com/yourusername"
                      />
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full bg-[#ab9ff2] text-[#3c315b] hover:bg-[#DCDAF0] transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
                >
                  {registerMutation.isPending ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    onClick={() => setLocation("/signin")}
                    className="text-[#ab9ff2] hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};