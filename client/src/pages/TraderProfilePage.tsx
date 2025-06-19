import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { SocialShareBadges } from "@/components/SocialShareBadges";
import { ArrowLeft, Star, Image as ImageIcon, Edit, Trash2 } from "lucide-react";

export const TraderProfilePage = (): JSX.Element => {
  const { id } = useParams();
  const [editingReview, setEditingReview] = useState<any>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [visibleReviews, setVisibleReviews] = useState(20);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: trader, isLoading: traderLoading } = useQuery({
    queryKey: [`/api/traders/${id}`],
    enabled: !!id,
  });

  const { data: ratings = [], isLoading: ratingsLoading } = useQuery({
    queryKey: [`/api/traders/${id}/ratings`],
    enabled: !!id,
  });

  // Admin mutation functions for editing/deleting reviews
  const updateReviewMutation = useMutation({
    mutationFn: async ({ reviewId, data }: { reviewId: number; data: any }) => {
      const response = await fetch(`/api/admin/ratings/${reviewId}`, {
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
      queryClient.invalidateQueries({ queryKey: [`/api/traders/${id}/ratings`] });
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
      queryClient.invalidateQueries({ queryKey: [`/api/traders/${id}/ratings`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (traderLoading) {
    return (
      <div className="bg-white flex flex-row justify-center w-full">
        <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
          <Header />
          <div className="p-8 text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!trader) {
    return (
      <div className="bg-white flex flex-row justify-center w-full">
        <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
          <Header />
          <div className="p-8 text-center">Trader not found</div>
        </div>
      </div>
    );
  }

  // Calculate rating statistics
  const totalRatings = Array.isArray(ratings) ? ratings.length : 0;
  const averageRating = totalRatings > 0 
    ? ratings.reduce((sum: number, rating: any) => sum + rating.overallRating, 0) / totalRatings 
    : 0;

  // Rating breakdown (1-5 stars)
  const ratingCounts = [0, 0, 0, 0, 0]; // Index 0 = 1 star, Index 4 = 5 stars
  if (Array.isArray(ratings)) {
    ratings.forEach((rating: any) => {
      if (rating.overallRating >= 1 && rating.overallRating <= 5) {
        ratingCounts[rating.overallRating - 1]++;
      }
    });
  }

  // Calculate most common tags from reviews
  const tagCounts: Record<string, number> = {};
  if (Array.isArray(ratings)) {
    ratings.forEach((rating: any) => {
      if (rating.tags && Array.isArray(rating.tags)) {
        rating.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
  }

  // Get top 5 most common tags
  const popularTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tag]) => tag);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={20}
        className={i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
      />
    ));
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
        <Header />
        
        {/* Main Content */}
        <div className="px-8 py-6 max-w-4xl mx-auto">
          {/* Back to Search */}
          <Link href="/search">
            <Button variant="ghost" className="mb-6 p-0 h-auto font-normal text-gray-600 hover:text-gray-900">
              <ArrowLeft size={16} className="mr-2" />
              Back to Search
            </Button>
          </Link>

          {/* Main Profile Card */}
          <Card className="mb-6 border border-gray-200 shadow-sm">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                {/* Profile Image - Left Side */}
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {trader.profileImage ? (
                    <img 
                      src={trader.profileImage} 
                      alt={trader.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <ImageIcon size={24} className="text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Content - Middle */}
                <div className="flex-1">
                  {/* Trader Name */}
                  <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                    {trader.name}
                  </h1>

                  {/* Specialty */}
                  <p className="text-gray-600 mb-3">
                    {trader.specialty || 'new pairs terrorist'}
                  </p>

                  {/* Rating Stars and Count */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {renderStars(averageRating)}
                    </div>
                    <span className="text-gray-900 font-medium ml-1">
                      {averageRating.toFixed(1)}
                    </span>
                    <span className="text-gray-500">
                      {totalRatings} review{totalRatings !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Wallet Address */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">
                      Wallet: 
                      <span 
                        className="font-mono text-gray-800 cursor-pointer hover:text-[#ab9ff2] transition-colors duration-200 ml-1"
                        onClick={() => {
                          navigator.clipboard.writeText(trader.walletAddress);
                          toast({
                            title: "Copied to clipboard",
                            description: "Wallet address copied successfully",
                          });
                        }}
                        title="Click to copy wallet address"
                      >
                        {trader.walletAddress}
                      </span>
                    </p>
                  </div>

                  {/* Bio */}
                  {trader.bio && (
                    <p className="text-gray-700 mb-4">
                      {trader.bio}
                    </p>
                  )}

                  {/* Rate This Trader Button and Admin Toggle */}
                  <div className="flex gap-3">
                    <Link href={`/trader/${id}/rate`}>
                      <Button className="bg-[#ab9ff2] text-black rounded-md transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#DCDAF0] hover:shadow-lg transform-gpu px-6 py-2">
                        Rate This Trader
                      </Button>
                    </Link>
                    <Button 
                      variant={isAdminMode ? "default" : "outline"}
                      onClick={() => setIsAdminMode(!isAdminMode)}
                      className="px-4 py-2"
                    >
                      {isAdminMode ? "Exit Admin" : "Admin Mode"}
                    </Button>
                  </div>
                </div>

                {/* Popular Tags - Right Side */}
                {popularTags.length > 0 && (
                  <div className="w-64 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Popular Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {popularTags.map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-block px-3 py-1 text-sm font-medium text-black rounded-full"
                          style={{ backgroundColor: '#AB9FF2' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Social Share Badges */}
          <SocialShareBadges 
            traderName={trader?.name}
            traderRating={averageRating}
            walletAddress={trader?.walletAddress}
            className="mb-6"
          />

          {/* Rating Breakdown */}
          <Card className="mb-6 border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Rating Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((starCount) => (
                  <div key={starCount} className="flex items-center gap-3">
                    <span className="text-gray-700 w-12">{starCount} star</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${totalRatings > 0 ? (ratingCounts[starCount - 1] / totalRatings) * 100 : 0}%`, 
                          backgroundColor: '#AB9FF2' 
                        }}
                      ></div>
                    </div>
                    <span className="text-gray-600 text-right min-w-[30px]">
                      {ratingCounts[starCount - 1]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {ratingsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading reviews...</div>
              ) : !Array.isArray(ratings) || ratings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    No reviews yet. Be the first to rate this trader!
                  </p>
                  <Link href={`/trader/${id}/rate`}>
                    <Button className="bg-[#ab9ff2] text-black rounded-md transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#DCDAF0] hover:shadow-lg transform-gpu">
                      Write First Review
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {ratings.slice(0, visibleReviews).map((rating: any) => (
                    <div key={rating.id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                      {/* User avatar and header */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-medium" style={{ backgroundColor: '#AB9FF2' }}>
                          {rating.reviewerName ? rating.reviewerName.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {rating.reviewerName || 'Anonymous'}
                              </span>
                              <div className="flex">
                                {renderStars(rating.overallRating)}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(rating.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })} • {new Date(rating.createdAt).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </span>
                            </div>
                            {/* Admin Edit/Delete Buttons */}
                            {isAdminMode && (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setEditingReview(rating)}
                                  className="flex items-center gap-1"
                                >
                                  <Edit size={14} />
                                  Edit
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => {
                                    if (confirm('Are you sure you want to delete this review?')) {
                                      deleteReviewMutation.mutate(rating.id);
                                    }
                                  }}
                                  className="flex items-center gap-1"
                                >
                                  <Trash2 size={14} />
                                  Delete
                                </Button>
                              </div>
                            )}
                          </div>
                          
                          {/* Review Content - Edit Mode or Display Mode */}
                          {editingReview?.id === rating.id ? (
                            <div className="space-y-4 mt-4">
                              {/* Edit Form */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm">Overall Rating</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={editingReview.overallRating}
                                    onChange={(e) => setEditingReview({
                                      ...editingReview,
                                      overallRating: parseInt(e.target.value)
                                    })}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm">Profitability Rating</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={editingReview.profitabilityRating}
                                    onChange={(e) => setEditingReview({
                                      ...editingReview,
                                      profitabilityRating: parseInt(e.target.value)
                                    })}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm">Trade Activity Rating</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={editingReview.communicationRating}
                                    onChange={(e) => setEditingReview({
                                      ...editingReview,
                                      communicationRating: parseInt(e.target.value)
                                    })}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm">Reliability Rating</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={editingReview.reliabilityRating}
                                    onChange={(e) => setEditingReview({
                                      ...editingReview,
                                      reliabilityRating: parseInt(e.target.value)
                                    })}
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-sm">Comment</Label>
                                <Textarea
                                  value={editingReview.comment || ''}
                                  onChange={(e) => setEditingReview({
                                    ...editingReview,
                                    comment: e.target.value
                                  })}
                                  className="mt-1 min-h-[80px]"
                                />
                              </div>
                              
                              <div className="flex gap-2">
                                <Button 
                                  size="sm"
                                  onClick={() => {
                                    updateReviewMutation.mutate({
                                      reviewId: rating.id,
                                      data: {
                                        comment: editingReview.comment,
                                        overallRating: editingReview.overallRating,
                                        profitabilityRating: editingReview.profitabilityRating,
                                        communicationRating: editingReview.communicationRating,
                                        reliabilityRating: editingReview.reliabilityRating,
                                      }
                                    });
                                  }}
                                  className="bg-[#ab9ff2] hover:bg-[#9990e6]"
                                >
                                  Save Changes
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
                          ) : (
                            <>
                              {rating.comment && (
                                <p className="text-gray-700 mb-3">{rating.comment}</p>
                              )}
                              
                              {/* Rating bars and tags layout */}
                              <div className="flex justify-between items-start gap-6">
                                {/* Rating bars - left side */}
                                <div className="flex flex-wrap gap-6 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Profitability:</span>
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="h-2 rounded-full" 
                                        style={{ width: `${(rating.profitabilityRating / 5) * 100}%`, backgroundColor: '#AB9FF2' }}
                                      ></div>
                                    </div>
                                    <span className="text-sm text-gray-600">{rating.profitabilityRating}/5</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Trade Activity:</span>
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="h-2 rounded-full" 
                                        style={{ width: `${(rating.communicationRating / 5) * 100}%`, backgroundColor: '#AB9FF2' }}
                                      ></div>
                                    </div>
                                    <span className="text-sm text-gray-600">{rating.communicationRating}/5</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Reliability:</span>
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="h-2 rounded-full" 
                                        style={{ width: `${(rating.reliabilityRating / 5) * 100}%`, backgroundColor: '#AB9FF2' }}
                                      ></div>
                                    </div>
                                    <span className="text-sm text-gray-600">{rating.reliabilityRating}/5</span>
                                  </div>
                                </div>

                                {/* Tags - right side */}
                                {rating.tags && rating.tags.length > 0 && (
                                  <div className="flex-shrink-0">
                                    <div className="flex flex-wrap gap-1 justify-end">
                                      {rating.tags.slice(0, 5).map((tag: string, index: number) => (
                                        <span 
                                          key={index}
                                          className="inline-block px-2 py-1 text-xs font-medium text-black rounded-full"
                                          style={{ backgroundColor: '#AB9FF2' }}
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Load More Button */}
                  {Array.isArray(ratings) && ratings.length > visibleReviews && (
                    <div className="text-center pt-6 border-t border-gray-100">
                      <Button
                        onClick={() => setVisibleReviews(prev => prev + 10)}
                        className="bg-[#ab9ff2] text-black rounded-md transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#DCDAF0] hover:shadow-lg transform-gpu px-6 py-2"
                      >
                        Load More ({ratings.length - visibleReviews} remaining)
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};