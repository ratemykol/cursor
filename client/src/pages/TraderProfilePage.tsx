import React from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { ArrowLeft, Star, Image as ImageIcon } from "lucide-react";

export const TraderProfilePage = (): JSX.Element => {
  const { id } = useParams();

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

                {/* Content - Right Side */}
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
                    <p className="text-sm text-gray-600 mb-1">Wallet: <span className="font-mono text-gray-800">{trader.walletAddress}</span></p>
                  </div>

                  {/* Bio */}
                  {trader.bio && (
                    <p className="text-gray-700 mb-4">
                      {trader.bio}
                    </p>
                  )}

                  {/* Rate This Trader Button */}
                  <Link href={`/trader/${id}/rate`}>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
                      Rate This Trader
                    </Button>
                  </Link>
                </div>
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
                  <div key={starCount} className="flex items-center justify-between">
                    <span className="text-gray-700">{starCount} star</span>
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
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Write First Review
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {ratings.map((rating: any) => (
                    <div key={rating.id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {renderStars(rating.overallRating)}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(rating.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      {rating.comment && (
                        <p className="text-gray-700 mt-2">{rating.comment}</p>
                      )}
                      
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                        <div>Strategy: {rating.strategyRating}/5</div>
                        <div>Communication: {rating.communicationRating}/5</div>
                        <div>Reliability: {rating.reliabilityRating}/5</div>
                        <div>Profitability: {rating.profitabilityRating}/5</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};