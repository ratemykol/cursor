import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/Header";
import { Edit, Plus, Save, X, Upload, Image, Trash2 } from "lucide-react";

export const AdminPage = (): JSX.Element => {
  const { isAuthenticated } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const [view, setView] = useState<"list" | "create" | "edit" | "reviews">("list");
  const [editingTrader, setEditingTrader] = useState<any>(null);
  const [editingReview, setEditingReview] = useState<any>(null);
  
  const [name, setName] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [bio, setBio] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [verified, setVerified] = useState(false);
  const [profileImage, setProfileImage] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check authentication and admin status
  if (adminLoading) {
    return (
      <div className="bg-white flex flex-row justify-center w-full">
        <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
          <Header currentPage="admin" />
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
          <Header currentPage="admin" />
          <div className="flex justify-center items-center min-h-[calc(100vh-200px)] px-20">
            <Card className="w-full max-w-md">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-semibold text-gray-900">Access Denied</h2>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-white flex flex-row justify-center w-full">
        <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
          <Header currentPage="admin" />
          <div className="flex justify-center items-center min-h-[calc(100vh-200px)] px-20">
            <Card className="w-full max-w-md">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Access Denied</h2>
                <p className="text-gray-600 mb-6">You don't have permission to access the admin panel.</p>
                <Button onClick={() => window.location.href = "/"} className="bg-[#ab9ff2] text-white">
                  Go to Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Fetch all traders
  const { data: traders = [], isLoading } = useQuery({
    queryKey: ["/api/traders"],
  });

  // Fetch all reviews for admin management
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["/api/admin/ratings"],
  });

  const createMutation = useMutation({
    mutationFn: async (traderData: any) => {
      const response = await fetch("/api/traders", {
        method: "POST",
        body: JSON.stringify(traderData),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error('Failed to create trader');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Trader created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/traders"] });
      resetForm();
      setView("list");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create trader. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...traderData }: any) => {
      const response = await fetch(`/api/traders/${id}`, {
        method: "PUT",
        body: JSON.stringify(traderData),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error('Failed to update trader');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Trader updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/traders"] });
      resetForm();
      setView("list");
      setEditingTrader(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update trader. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (traderId: number) => {
      const response = await fetch(`/api/traders/${traderId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error('Failed to delete trader');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Trader deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/traders"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete trader. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Review management mutations
  const updateReviewMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/admin/ratings/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error('Failed to update review');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Review updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ratings"] });
      setEditingReview(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      const response = await fetch(`/api/admin/ratings/${reviewId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error('Failed to delete review');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Review deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ratings"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setName("");
    setWalletAddress("");
    setBio("");
    setSpecialty("");
    setVerified(false);
    setProfileImage("");
  };

  const startEdit = (trader: any) => {
    setEditingTrader(trader);
    setName(trader.name);
    setWalletAddress(trader.walletAddress);
    setBio(trader.bio || "");
    setSpecialty(trader.specialty || "");
    setVerified(trader.verified);
    setProfileImage(trader.profileImage || "");
    setView("edit");
  };

  const startCreate = () => {
    resetForm();
    setEditingTrader(null);
    setView("create");
  };

  const handleDelete = (trader: any) => {
    if (window.confirm(`Are you sure you want to delete ${trader.name}? This action cannot be undone.`)) {
      deleteMutation.mutate(trader.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !walletAddress.trim()) {
      toast({
        title: "Required Fields",
        description: "Name and wallet address are required.",
        variant: "destructive",
      });
      return;
    }

    const traderData = {
      name: name.trim(),
      walletAddress: walletAddress.trim(),
      bio: bio.trim() || null,
      specialty: specialty.trim() || null,
      verified,
      profileImage: profileImage.trim() || null,
    };

    if (view === "edit" && editingTrader) {
      updateMutation.mutate({ id: editingTrader.id, ...traderData });
    } else {
      createMutation.mutate(traderData);
    }
  };

  const createSampleTraders = () => {
    const sampleTraders = [
      {
        name: "CryptoKing2024",
        walletAddress: "0x742d35Cc6634C0532925a3b8D404fA503e8d4125",
        bio: "Professional crypto trader with 5+ years experience in DeFi and NFT markets. Specializing in meme coins and high-risk/high-reward strategies.",
        specialty: "Meme Coins & DeFi",
        verified: true,
        profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoKing2024",
      },
      {
        name: "BlockchainExpert",
        walletAddress: "0x8ba1f109551bD432803012645Hac136c22C501e8",
        bio: "Experienced trader focusing on fundamental analysis and long-term investments in blockchain technology.",
        specialty: "Fundamental Analysis",
        verified: true,
        profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=BlockchainExpert",
      },
      {
        name: "NFTWhale",
        walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
        bio: "NFT collector and trader with expertise in digital art markets and gaming tokens.",
        specialty: "NFT Trading",
        verified: false,
        profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=NFTWhale",
      },
    ];

    sampleTraders.forEach((trader) => {
      createMutation.mutate(trader);
    });
  };

  if (view === "list") {
    return (
      <div className="bg-white min-h-screen max-w-[1920px] mx-auto">
        <Header currentPage="admin" />
        <div className="container mx-auto px-16 py-12">
          {/* Navigation Tabs */}
          <div className="flex gap-6 mb-8">
            <Button 
              variant={view === "list" ? "default" : "outline"}
              onClick={() => setView("list")}
              className="text-lg px-6 py-3"
            >
              Manage Traders
            </Button>
            <Button 
              variant={view === "reviews" ? "default" : "outline"}
              onClick={() => setView("reviews")}
              className="text-lg px-6 py-3"
            >
              Manage Reviews
            </Button>
          </div>

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Admin Panel - Manage Traders</h1>
            <Button onClick={startCreate} className="flex items-center gap-3 text-lg px-6 py-3">
              <Plus size={20} />
              Create New Trader
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading traders...</div>
          ) : (
            <div className="grid gap-4">
              {traders.map((trader: any) => (
                <Card key={trader.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {trader.profileImage ? (
                          <img 
                            src={trader.profileImage} 
                            alt={trader.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-300">
                            <Image size={20} className="text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{trader.name}</h3>
                          {trader.verified && (
                            <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-1">{trader.specialty || 'No specialty'}</p>
                        <p className="text-sm text-gray-500 mb-2">Wallet: {trader.walletAddress}</p>
                        {trader.bio && (
                          <p className="text-sm text-gray-700 line-clamp-2">{trader.bio}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(trader)}
                        className="flex items-center gap-2"
                      >
                        <Edit size={14} />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(trader)}
                        className="flex items-center gap-2"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 size={14} />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              
              {traders.length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-gray-600 mb-4">No traders found. Create your first trader profile!</p>
                  <Button onClick={createSampleTraders} variant="outline">
                    Add Sample Data
                  </Button>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === "reviews") {
    return (
      <div className="bg-white min-h-screen">
        <Header currentPage="admin" />
        <div className="container mx-auto px-8 py-8">
          {/* Navigation Tabs */}
          <div className="flex gap-4 mb-6">
            <Button 
              variant={view === "list" ? "default" : "outline"}
              onClick={() => setView("list")}
            >
              Manage Traders
            </Button>
            <Button 
              variant={view === "reviews" ? "default" : "outline"}
              onClick={() => setView("reviews")}
            >
              Manage Reviews
            </Button>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Admin Panel - Manage Reviews</h1>
          </div>

          {reviewsLoading ? (
            <div className="text-center py-8">Loading reviews...</div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <Card key={review.id} className="border border-gray-200">
                  <CardContent className="p-6">
                    {editingReview?.id === review.id ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold">Editing Review #{review.id}</h3>
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              onClick={() => {
                                updateReviewMutation.mutate({
                                  id: review.id,
                                  data: {
                                    comment: editingReview.comment,
                                    overallRating: editingReview.overallRating,
                                    profitabilityRating: editingReview.profitabilityRating,
                                    communicationRating: editingReview.communicationRating,
                                    reliabilityRating: editingReview.reliabilityRating,
                                  }
                                });
                              }}
                            >
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingReview(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Overall Rating</Label>
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              value={editingReview.overallRating}
                              onChange={(e) => setEditingReview({
                                ...editingReview,
                                overallRating: parseInt(e.target.value)
                              })}
                            />
                          </div>
                          <div>
                            <Label>Profitability Rating</Label>
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              value={editingReview.profitabilityRating}
                              onChange={(e) => setEditingReview({
                                ...editingReview,
                                profitabilityRating: parseInt(e.target.value)
                              })}
                            />
                          </div>
                          <div>
                            <Label>Trade Activity Rating</Label>
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              value={editingReview.communicationRating}
                              onChange={(e) => setEditingReview({
                                ...editingReview,
                                communicationRating: parseInt(e.target.value)
                              })}
                            />
                          </div>
                          <div>
                            <Label>Reliability Rating</Label>
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              value={editingReview.reliabilityRating}
                              onChange={(e) => setEditingReview({
                                ...editingReview,
                                reliabilityRating: parseInt(e.target.value)
                              })}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Comment</Label>
                          <Textarea
                            value={editingReview.comment}
                            onChange={(e) => setEditingReview({
                              ...editingReview,
                              comment: e.target.value
                            })}
                            className="min-h-[100px]"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-medium">Review #{review.id}</p>
                            <p className="text-sm text-gray-600">
                              Trader ID: {review.traderId} | Reviewer: {review.reviewerName || 'Anonymous'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingReview(review)}
                              className="flex items-center gap-2"
                            >
                              <Edit size={16} />
                              Edit Review
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this review?')) {
                                  deleteReviewMutation.mutate(review.id);
                                }
                              }}
                              className="flex items-center gap-2"
                            >
                              <Trash2 size={16} />
                              Delete
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Overall</p>
                            <p className="font-medium">{review.overallRating}/5</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Profitability</p>
                            <p className="font-medium">{review.profitabilityRating}/5</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Trade Activity</p>
                            <p className="font-medium">{review.communicationRating}/5</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Reliability</p>
                            <p className="font-medium">{review.reliabilityRating}/5</p>
                          </div>
                        </div>
                        
                        {review.comment && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Comment:</p>
                            <p className="text-gray-800">{review.comment}</p>
                          </div>
                        )}
                        
                        {review.tags && review.tags.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-2">Tags:</p>
                            <div className="flex flex-wrap gap-2">
                              {review.tags.map((tag: string, index: number) => (
                                <Badge key={index} variant="secondary">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {reviews.length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-gray-600">No reviews found.</p>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <Header currentPage="admin" />
      <div className="container mx-auto px-8 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {view === "edit" ? "Edit Trader Profile" : "Create Trader Profile"}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("list")}
                className="flex items-center gap-2"
              >
                <X size={16} />
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Trader Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter trader name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="walletAddress">Wallet Address *</Label>
                <Input
                  id="walletAddress"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="specialty">Specialty</Label>
                <Input
                  id="specialty"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="e.g., DeFi, NFTs, Meme Coins"
                />
              </div>

              <div>
                <Label htmlFor="profileImage">Profile Image URL</Label>
                <Input
                  id="profileImage"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {profileImage && (
                  <div className="mt-2">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                      <img 
                        src={profileImage} 
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Enter trader biography..."
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={verified}
                  onCheckedChange={(checked) => setVerified(!!checked)}
                />
                <Label htmlFor="verified">Verified Trader</Label>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 flex items-center gap-2"
                >
                  <Save size={16} />
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : view === "edit"
                    ? "Update Trader"
                    : "Create Trader"}
                </Button>
                {view === "create" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={createSampleTraders}
                    disabled={createMutation.isPending}
                  >
                    Add Sample Data
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};