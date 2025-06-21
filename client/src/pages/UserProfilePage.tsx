import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { useLocation, Link } from "wouter";
import { Star, Edit, Trash2, ExternalLink, X } from "lucide-react";
import { UserBadges, BadgeProgress } from "@/components/BadgeSystem";

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
  const [activeTab, setActiveTab] = useState("profile");
  const [editingReview, setEditingReview] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    overallRating: [3],
    strategyRating: [3],
    communicationRating: [3],
    reliabilityRating: [3],
    profitabilityRating: [3],
    comment: "",
    tags: [] as string[],
  });

  // Fetch user reviews
  const { data: userReviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["/api/user/reviews"],
    enabled: isAuthenticated,
  });

  // Type the userReviews data to avoid unknown type errors
  const typedUserReviews = userReviews as any[];

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

  // Update review mutation
  const updateReviewMutation = useMutation({
    mutationFn: async ({ reviewId, reviewData }: { reviewId: number; reviewData: any }) => {
      const response = await fetch(`/api/user/reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
        credentials: "include"
      });

      if (!response.ok) {
        let errorMessage = "Failed to update review";
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Review updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/reviews"] });
      setEditingReview(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
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

  // Handle opening edit modal
  const handleEditReview = (review: any) => {
    setEditingReview(review);
    setEditFormData({
      overallRating: [review.overallRating],
      strategyRating: [review.strategyRating],
      communicationRating: [review.communicationRating],
      reliabilityRating: [review.reliabilityRating],
      profitabilityRating: [review.profitabilityRating],
      comment: review.comment || "",
      tags: review.tags || [],
    });
  };

  // Handle saving edited review
  const handleSaveEdit = () => {
    if (!editingReview) return;

    const reviewData = {
      overallRating: editFormData.overallRating[0],
      strategyRating: editFormData.strategyRating[0],
      communicationRating: editFormData.communicationRating[0],
      reliabilityRating: editFormData.reliabilityRating[0],
      profitabilityRating: editFormData.profitabilityRating[0],
      comment: editFormData.comment,
      tags: editFormData.tags,
    };

    updateReviewMutation.mutate({
      reviewId: editingReview.id,
      reviewData,
    });
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
    <>
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
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile">Profile Settings</TabsTrigger>
                  <TabsTrigger value="reviews">My Reviews ({typedUserReviews.length})</TabsTrigger>
                  <TabsTrigger value="badges">Badges & Progress</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="mt-6">
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
                </TabsContent>
                
                <TabsContent value="reviews" className="mt-6">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">My Reviews</h3>
                      <p className="text-sm text-gray-500">{typedUserReviews.length} total reviews</p>
                    </div>
                    
                    {reviewsLoading ? (
                      <div className="text-center py-8">Loading reviews...</div>
                    ) : typedUserReviews.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>You haven't written any reviews yet.</p>
                        <Link href="/search">
                          <Button variant="outline" className="mt-4">
                            Find Traders to Review
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {typedUserReviews.map((review: any) => (
                          <Card key={review.id} className="border border-gray-200">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <Link href={`/trader/${review.traderId}`}>
                                      <h4 className="font-semibold text-lg hover:text-[#ab9ff2] cursor-pointer">
                                        {review.traderName}
                                      </h4>
                                    </Link>
                                    <ExternalLink size={16} className="text-gray-400" />
                                  </div>
                                  <div className="flex items-center gap-4 mb-2">
                                    <div className="flex items-center gap-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                          key={star}
                                          size={16}
                                          className={star <= review.overallRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                                        />
                                      ))}
                                      <span className="text-sm font-medium ml-1">{review.overallRating}/5</span>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                      {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex gap-2 mb-3">
                                    <Badge variant="outline">Strategy: {review.strategyRating}/5</Badge>
                                    <Badge variant="outline">Communication: {review.communicationRating}/5</Badge>
                                    <Badge variant="outline">Reliability: {review.reliabilityRating}/5</Badge>
                                    <Badge variant="outline">Profitability: {review.profitabilityRating}/5</Badge>
                                  </div>
                                  {review.comment && (
                                    <p className="text-gray-700 text-sm leading-relaxed mb-3">
                                      {review.comment}
                                    </p>
                                  )}
                                  {review.tags && review.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {review.tags.map((tag: string, index: number) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2 ml-4">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditReview(review)}
                                  >
                                    <Edit size={14} className="mr-1" />
                                    Edit
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>

      {/* Edit Review Modal */}
      {editingReview && (
      <Dialog open={!!editingReview} onOpenChange={() => setEditingReview(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Edit Review for {editingReview.traderName}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingReview(null)}
              >
                <X size={16} />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Overall Rating */}
            <div>
              <Label className="text-sm font-medium">Overall Rating</Label>
              <div className="flex items-center gap-2 mt-1">
                <Slider
                  value={editFormData.overallRating}
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, overallRating: value }))}
                  max={5}
                  min={1}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-8">{editFormData.overallRating[0]}/5</span>
              </div>
            </div>

            {/* Strategy Rating */}
            <div>
              <Label className="text-sm font-medium">Strategy</Label>
              <div className="flex items-center gap-2 mt-1">
                <Slider
                  value={editFormData.strategyRating}
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, strategyRating: value }))}
                  max={5}
                  min={1}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-8">{editFormData.strategyRating[0]}/5</span>
              </div>
            </div>

            {/* Communication Rating */}
            <div>
              <Label className="text-sm font-medium">Communication</Label>
              <div className="flex items-center gap-2 mt-1">
                <Slider
                  value={editFormData.communicationRating}
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, communicationRating: value }))}
                  max={5}
                  min={1}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-8">{editFormData.communicationRating[0]}/5</span>
              </div>
            </div>

            {/* Reliability Rating */}
            <div>
              <Label className="text-sm font-medium">Reliability</Label>
              <div className="flex items-center gap-2 mt-1">
                <Slider
                  value={editFormData.reliabilityRating}
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, reliabilityRating: value }))}
                  max={5}
                  min={1}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-8">{editFormData.reliabilityRating[0]}/5</span>
              </div>
            </div>

            {/* Profitability Rating */}
            <div>
              <Label className="text-sm font-medium">Profitability</Label>
              <div className="flex items-center gap-2 mt-1">
                <Slider
                  value={editFormData.profitabilityRating}
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, profitabilityRating: value }))}
                  max={5}
                  min={1}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-8">{editFormData.profitabilityRating[0]}/5</span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <Label className="text-sm font-medium">Comment</Label>
              <Textarea
                value={editFormData.comment}
                onChange={(e) => setEditFormData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your experience..."
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSaveEdit}
                disabled={updateReviewMutation.isPending}
                className="flex-1 bg-[#ab9ff2] text-[#3c315b] hover:bg-[#DCDAF0]"
              >
                {updateReviewMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingReview(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      )}
    </>
  );
};