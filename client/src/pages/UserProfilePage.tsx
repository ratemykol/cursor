import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { useLocation, Link } from "wouter";
import { Star, Edit, Trash2, ExternalLink } from "lucide-react";

export const UserProfilePage = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    email: "",
    bio: "",
    profileImageUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // File upload mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await fetch("/api/upload/profile-picture", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "File upload failed");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setFormData(prev => ({ ...prev, profileImageUrl: data.profileImageUrl }));
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been uploaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Access denied",
        description: "Please sign in to view your profile",
        variant: "destructive",
      });
      setLocation("/signin");
    }
  }, [isAuthenticated, isLoading, setLocation, toast]);

  // Populate form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        bio: user.bio || "",
        profileImageUrl: user.profileImageUrl || "",
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: typeof formData) => {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Profile update failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.includes('png') && !file.type.includes('jpeg') && !file.type.includes('jpg')) {
        toast({
          title: "Invalid file type",
          description: "Please select a PNG or JPEG file",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      uploadFileMutation.mutate(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="bg-white flex flex-row justify-center w-full">
        <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
          <Header />
          <div className="flex justify-center items-center min-h-[calc(100vh-200px)] px-20">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-white flex flex-row justify-center w-full">
        <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
          <Header />
          <div className="flex justify-center items-center min-h-[calc(100vh-200px)] px-20">
            <div className="text-center">Redirecting to sign in...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white w-full min-h-screen">
      <div className="bg-white overflow-hidden w-full max-w-[1920px] relative mx-auto">
        <Header />
        
        <div className="flex justify-center items-start min-h-[calc(100vh-200px)] px-32 py-16">
          <Card className="w-full max-w-4xl">
            <CardHeader className="pb-8">
              <div className="flex flex-col items-center gap-6">
                <Avatar className="w-28 h-28">
                  <AvatarImage src={user?.profileImageUrl} />
                  <AvatarFallback className="text-3xl">
                    {user?.username?.charAt(0).toUpperCase() || user?.firstName?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-3xl text-center text-[#3c315b]">
                  My Profile
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={user?.username || ""}
                    disabled
                    className="border-2 border-gray-300 bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">Username cannot be changed</p>
                </div>


                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="border-2 border-[#9f98b3]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profilePicture">Profile Picture (PNG or JPEG)</Label>
                  <Input
                    id="profilePicture"
                    name="profilePicture"
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="border-2 border-[#9f98b3]"
                  />
                  {formData.profileImageUrl && (
                    <div className="mt-2">
                      <img 
                        src={formData.profileImageUrl} 
                        alt="Current profile" 
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="border-2 border-[#9f98b3]"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="w-full bg-[#ab9ff2] text-[#3c315b] hover:bg-[#DCDAF0] transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
                >
                  {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};