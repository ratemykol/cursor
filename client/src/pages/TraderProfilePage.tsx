import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";

export const TraderProfilePage = (): JSX.Element => {
  const { id } = useParams();

  const { data: trader, isLoading } = useQuery({
    queryKey: [`/api/traders/${id}`],
    enabled: !!id,
  });

  const { data: ratings = [] } = useQuery({
    queryKey: [`/api/traders/${id}/ratings`],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!trader) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div>Trader not found</div>
      </div>
    );
  }

  const stats = trader?.stats || {
    averageRating: 0,
    totalRatings: 0,
    averageDifficulty: 0,
    wouldTakeAgainPercentage: 0,
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-black text-white flex justify-between items-center px-8 py-3">
        <Link href="/">
          <h1 className="font-bold text-xl">RMP</h1>
        </Link>
        
        <div className="flex items-center gap-4">
          <input
            className="px-3 py-2 rounded text-black"
            placeholder="Professor name"
          />
          <input
            className="px-3 py-2 rounded text-black"
            placeholder="Your school"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" className="text-white">Log In</Button>
          <Button className="bg-blue-600">Sign Up</Button>
          <Button variant="ghost" className="text-white">Help</Button>
        </div>
      </header>

      <div className="container mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Trader Info */}
            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{trader?.name}</h1>
                  <p className="text-gray-600">{trader?.specialty || 'Crypto Trader'}</p>
                  <p className="text-sm text-gray-500">Wallet: {trader?.walletAddress}</p>
                </div>
                {trader?.verified && (
                  <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
                )}
              </div>

              {/* Rating Overview */}
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div className="text-center">
                  <div className="text-6xl font-bold">
                    {stats.averageRating.toFixed(1)}
                  </div>
                  <div className="text-gray-600">Overall Quality</div>
                  <div className="text-sm text-gray-500">
                    Based on {stats.totalRatings} ratings
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-6xl font-bold">
                    {stats.averageDifficulty.toFixed(1)}
                  </div>
                  <div className="text-gray-600">Level of Difficulty</div>
                </div>
              </div>

              <div className="flex gap-4 mb-6">
                <Link href={`/trader/${id}/rate`}>
                  <Button className="bg-blue-600">Rate</Button>
                </Link>
                <Button variant="outline">Compare</Button>
              </div>

              {/* Rating Distribution */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4">Rating Distribution</h3>
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = ratings.filter((r: any) => Math.round(Number(r.overallRating)) === rating).length || 0;
                  const percentage = stats.totalRatings > 0 ? (count / stats.totalRatings) * 100 : 0;
                  
                  return (
                    <div key={rating} className="flex items-center gap-2 mb-2">
                      <span className="w-8 text-sm">{rating}</span>
                      <Progress value={percentage} className="flex-1 h-2" />
                      <span className="w-8 text-sm text-right">{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.wouldTakeAgainPercentage}%
                  </div>
                  <div className="text-sm text-gray-600">Would take again</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {stats.averageDifficulty.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Level of Difficulty</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {stats.totalRatings}
                  </div>
                  <div className="text-sm text-gray-600">Student Ratings</div>
                </div>
              </div>
            </div>

            {/* Student Reviews */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">
                {stats.totalRatings} Student Ratings
              </h2>

              {ratings.length === 0 ? (
                <p className="text-gray-600">No ratings yet. Be the first to rate this trader!</p>
              ) : (
                <div className="space-y-6">
                  {ratings.map((rating: any) => (
                    <div key={rating.id} className="border-b pb-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-4">
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded font-bold">
                            QUALITY
                          </div>
                          <div className="text-2xl font-bold">
                            {Number(rating.overallRating).toFixed(1)}
                          </div>
                          <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded font-bold">
                            DIFFICULTY
                          </div>
                          <div className="text-2xl font-bold">
                            {Number(rating.difficulty).toFixed(1)}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="mb-2">
                        <span className="text-sm text-gray-600">
                          For Credit: <strong>{rating.wouldTakeAgain ? 'Yes' : 'No'}</strong>
                        </span>
                        {rating.attendance && (
                          <span className="ml-4 text-sm text-gray-600">
                            Attendance: <strong>{rating.attendance}</strong>
                          </span>
                        )}
                        {rating.grade && (
                          <span className="ml-4 text-sm text-gray-600">
                            Grade: <strong>{rating.grade}</strong>
                          </span>
                        )}
                        <span className="ml-4 text-sm text-gray-600">
                          Textbook: <strong>{rating.textbook ? 'Yes' : 'No'}</strong>
                        </span>
                      </div>

                      {rating.review && (
                        <p className="text-gray-700 mb-3">{rating.review}</p>
                      )}

                      {rating.tags && rating.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {rating.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <button className="flex items-center gap-1 hover:text-green-600">
                          <ThumbsUp className="w-4 h-4" />
                          Helpful ({rating.helpful || 0})
                        </button>
                        <button className="flex items-center gap-1 hover:text-red-600">
                          <ThumbsDown className="w-4 h-4" />
                          Not Helpful ({rating.notHelpful || 0})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Similar Traders */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Similar Traders</h3>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center font-bold text-blue-600">
                        {(4.0 + i * 0.1).toFixed(1)}
                      </div>
                      <div>
                        <div className="font-medium">Trader Name {i}</div>
                        <div className="text-sm text-gray-600">Crypto Trading</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};