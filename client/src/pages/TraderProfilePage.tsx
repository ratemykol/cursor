import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { TraderBadges, TraderBadgeProgress } from "@/components/TraderBadgeSystem";
import { ArrowLeft, Star, Image as ImageIcon, Edit, Trash2, ExternalLink, ThumbsUp, ThumbsDown } from "lucide-react";

export const TraderProfilePage = (): JSX.Element => {
  const { id } = useParams();

  const [visibleReviews, setVisibleReviews] = useState(20);
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  // Vote on review helpfulness
  const voteMutation = useMutation({
    mutationFn: async ({ reviewId, voteType }: { reviewId: number; voteType: 'helpful' | 'not_helpful' }) => {
      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ voteType }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to vote on review');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Refresh the ratings to get updated vote counts
      queryClient.invalidateQueries({ queryKey: [`/api/traders/${id}/ratings`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data: trader, isLoading: traderLoading } = useQuery({
    queryKey: [`/api/traders/${id}`],
    enabled: !!id,
  });

  const { data: ratings = [], isLoading: ratingsLoading } = useQuery({
    queryKey: [`/api/traders/${id}/ratings`],
    enabled: !!id,
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
    ? (ratings as any[]).reduce((sum: number, rating: any) => sum + rating.overallRating, 0) / totalRatings 
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
    <div className="bg-white w-full min-h-screen">
      <div className="bg-white overflow-hidden w-full max-w-[1920px] relative mx-auto">
        <Header />
        
        {/* Main Content */}
        <div className="px-16 py-10 max-w-6xl mx-auto">
          {/* Back to Search */}
          <Link href="/search">
            <Button variant="ghost" className="mb-8 p-0 h-auto font-normal text-gray-600 hover:text-gray-900 text-lg">
              <ArrowLeft size={20} className="mr-3" />
              Back to Search
            </Button>
          </Link>

          {/* Main Profile Card */}
          <Card className="mb-8 border border-gray-200 shadow-sm">
            <CardContent className="p-12">
              <div className="flex items-start gap-8">
                {/* Profile Image - Left Side */}
                <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {(trader as any)?.profileImage ? (
                    <img 
                      src={(trader as any).profileImage} 
                      alt={(trader as any).name}
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
                  {/* Trader Name with Twitter Icon */}
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-semibold text-gray-900">
                      {(trader as any)?.name}
                    </h1>
                    {(trader as any)?.twitterUrl && (
                      <button
                        onClick={() => window.open((trader as any).twitterUrl, '_blank')}
                        className="w-8 h-8 rounded-full overflow-hidden hover:scale-110 transition-transform duration-200 flex-shrink-0"
                        title="View Twitter Profile"
                      >
                        <img 
                          src="/twitter-blue.png" 
                          alt="Twitter"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    )}
                  </div>

                  {/* Specialty */}
                  <p className="text-gray-600 mb-4 text-lg">
                    {(trader as any)?.specialty || 'new pairs terrorist'}
                  </p>

                  {/* Rating Stars and Count */}
                  <div className="flex items-center gap-3 mb-4">
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
                          navigator.clipboard.writeText((trader as any)?.walletAddress);
                          toast({
                            title: "Copied to clipboard",
                            description: "Wallet address copied successfully",
                          });
                        }}
                        title="Click to copy wallet address"
                      >
                        {(trader as any)?.walletAddress}
                      </span>
                    </p>
                  </div>

                  {/* Bio */}
                  {(trader as any)?.bio && (
                    <p className="text-gray-700 mb-4">
                      {(trader as any).bio}
                    </p>
                  )}

                  {/* Rate This Trader Button */}
                  <div className="flex gap-3">
                    <Link href={`/trader/${id}/rate`}>
                      <Button className="bg-[#ab9ff2] text-black rounded-md transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#DCDAF0] hover:shadow-lg transform-gpu px-6 py-2">
                        Rate This Trader
                      </Button>
                    </Link>
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

          {/* Trader Badges Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <TraderBadges traderId={parseInt(id || '0')} />
            <TraderBadgeProgress traderId={parseInt(id || '0')} />
          </div>

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
                  {isAuthenticated ? (
                    <Link href={`/trader/${id}/rate`}>
                      <Button className="bg-[#ab9ff2] text-black rounded-md transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#DCDAF0] hover:shadow-lg transform-gpu">
                        Write First Review
                      </Button>
                    </Link>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-500">Sign in to leave a review</p>
                      <div className="flex gap-2 justify-center">
                        <Link href="/signin">
                          <Button className="bg-[#ab9ff2] text-black rounded-md transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#DCDAF0] hover:shadow-lg transform-gpu">
                            Sign In
                          </Button>
                        </Link>
                        <Link href="/signup">
                          <Button variant="outline" className="border-[#ab9ff2] text-[#ab9ff2] rounded-md transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#ab9ff2] hover:text-black transform-gpu">
                            Sign Up
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {ratings.slice(0, visibleReviews).map((rating: any) => (
                    <div key={rating.id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                      {/* User avatar and header */}
                      <div className="flex items-start gap-4">
                        {rating.userProfileImage ? (
                          <img 
                            src={rating.userProfileImage} 
                            alt={`${rating.reviewerName || 'Anonymous'} profile`}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                              // Fall back to initial avatar if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-medium ${rating.userProfileImage ? 'hidden' : ''}`}
                          style={{ backgroundColor: '#AB9FF2' }}
                        >
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

                          </div>
                          
                          {/* Review Content */}
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

                              {/* Helpfulness voting */}
                              {isAuthenticated && (
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                  <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-600">Was this review helpful?</span>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => voteMutation.mutate({ reviewId: rating.id, voteType: 'helpful' })}
                                        disabled={voteMutation.isPending}
                                        className="flex items-center gap-1 text-gray-600 hover:bg-[#AB9FF2] hover:text-white transition-colors duration-200"
                                      >
                                        <ThumbsUp size={16} />
                                        <span>{rating.helpful || 0}</span>
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => voteMutation.mutate({ reviewId: rating.id, voteType: 'not_helpful' })}
                                        disabled={voteMutation.isPending}
                                        className="flex items-center gap-1 text-gray-600 hover:bg-[#AB9FF2] hover:text-white transition-colors duration-200"
                                      >
                                        <ThumbsDown size={16} />
                                        <span>{rating.notHelpful || 0}</span>
                                      </Button>
                                    </div>
                                  </div>
                                </div>
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