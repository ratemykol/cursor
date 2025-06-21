import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import { BadgeNotification } from "@/components/BadgeSystem";

export const RatingPage = (): JSX.Element => {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [overallRating, setOverallRating] = useState([3]);
  const [profitabilityRating, setProfitabilityRating] = useState([3]);
  const [communicationRating, setCommunicationRating] = useState([3]);
  const [reliabilityRating, setReliabilityRating] = useState([3]);
  const [review, setReview] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newBadges, setNewBadges] = useState<any[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to leave a review",
        variant: "destructive",
      });
      setLocation("/signin");
    }
  }, [authLoading, isAuthenticated, setLocation, toast]);

  const { data: trader } = useQuery({
    queryKey: [`/api/traders/${id}`],
    enabled: !!id,
  });

  const availableTags = [
    "beginner friendly",
    "high profit",
    "detailed analysis",
    "long term",
    "day trading",
    "swing trading",
    "risk management",
    "Copy Trade",
    "Chart Nuker",
    "New Pairs",
    "Scalper",
    "Alpha",
    "Bundler",
    "Whale",
    "Conviction"
  ];

  const mutation = useMutation({
    mutationFn: async (ratingData: any) => {
      const response = await fetch(`/api/traders/${id}/ratings`, {
        method: "POST",
        body: JSON.stringify(ratingData),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit rating');
      }
      return response.json();
    },
    onSuccess: (data: any) => {
      // Check for new badges from the response
      if (data.newBadges && data.newBadges.length > 0) {
        setNewBadges(data.newBadges);
        // Clear badges after 5 seconds
        setTimeout(() => setNewBadges([]), 5000);
      }
      
      // Invalidate and refetch trader data to refresh the profile page
      queryClient.invalidateQueries({ queryKey: [`/api/traders/${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/traders/${id}/ratings`] });
      queryClient.invalidateQueries({ queryKey: ['/api/traders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/reviews'] });
      queryClient.invalidateQueries({ queryKey: [`/api/badges/user/${user?.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/badges/progress/${user?.id}`] });
      
      toast({
        title: "Success",
        description: "Your rating has been submitted!",
      });
      setLocation(`/trader/${id}`);
    },
    onError: (error: any) => {
      if (error.message.includes("Authentication required")) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to leave a review",
          variant: "destructive",
        });
        setLocation("/signin");
      } else if (error.message.includes("Only one review is allowed per user!")) {
        toast({
          title: "Review Already Submitted",
          description: "Only one review is allowed per user!",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit rating. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (review.length < 50) {
      toast({
        title: "Review too short",
        description: `Please write at least 50 characters in your review. You currently have ${review.length} characters.`,
        variant: "destructive",
      });
      return;
    }

    const ratingData = {
      reviewerName: user?.username || "Anonymous",
      overallRating: overallRating[0],
      strategyRating: Math.round((profitabilityRating[0] + communicationRating[0] + reliabilityRating[0]) / 3),
      communicationRating: communicationRating[0],
      reliabilityRating: reliabilityRating[0],
      profitabilityRating: profitabilityRating[0],
      comment: review.trim(),
      tags: selectedTags,
    };

    mutation.mutate(ratingData);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const renderSlider = (
    label: string,
    value: number[],
    onChange: (value: number[]) => void,
    showLabels: boolean = true,
    customLabels?: { left: string; right: string }
  ) => (
    <div className="mb-6">
      <label className="text-sm font-medium text-gray-900 mb-3 block">{label}</label>
      <div className="px-3">
        <Slider
          value={value}
          onValueChange={onChange}
          max={5}
          min={1}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between mt-2 text-sm" style={{ color: '#AB9FF2' }}>
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
        {showLabels && (
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>{customLabels?.left || 'Poor'}</span>
            <span>{customLabels?.right || 'Excellent'}</span>
          </div>
        )}
        <div className="text-center mt-2">
          <span className="text-lg font-semibold" style={{ color: '#AB9FF2' }}>{value[0]}</span>
          <span className="text-gray-500"> / 5</span>
        </div>
      </div>
    </div>
  );

  if (!trader) {
    return (
      <div className="bg-white w-full min-h-screen">
        <div className="bg-white overflow-hidden w-full max-w-[1440px] relative mx-auto">
          <Header />
          <div className="p-8 text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white w-full min-h-screen">
      <div className="bg-white overflow-hidden w-full max-w-[1440px] relative mx-auto">
        <Header />
        
        <div className="px-8 py-6 max-w-2xl mx-auto">
          {/* Back to Profile */}
          <Link href={`/trader/${id}`}>
            <Button variant="ghost" className="mb-6 p-0 h-auto font-normal text-gray-600 hover:text-gray-900">
              <ArrowLeft size={16} className="mr-2" />
              Back to Profile
            </Button>
          </Link>

          {/* Main Form Card */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit}>
                {/* Header */}
                <div className="mb-6">
                  <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                    Rate {(trader as any)?.name || "Trader"}
                  </h1>
                  <p className="text-gray-600">
                    Share your experience with this trader to help others make informed decisions.
                  </p>
                </div>

                {/* Reviewing As */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-900 mb-2 block">
                    Reviewing as
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <span className="text-gray-900 font-medium">{user?.username || "Loading..."}</span>
                  </div>
                </div>

                {/* Overall Rating */}
                {renderSlider("Overall Rating", overallRating, setOverallRating, false)}

                {/* Detailed Ratings */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Ratings</h3>
                  
                  {renderSlider("Profitability", profitabilityRating, setProfitabilityRating)}
                  {renderSlider("Trade Activity", communicationRating, setCommunicationRating, true, { left: "Slow Cook", right: "Very Active" })}
                  {renderSlider("Reliability", reliabilityRating, setReliabilityRating)}
                </div>

                {/* Written Review */}
                <div className="mb-6">
                  <label htmlFor="review" className="text-sm font-medium text-gray-900 mb-2 block">
                    Written Review
                  </label>
                  <Textarea
                    id="review"
                    placeholder="Share your experience with this trader. What strategies did they use? How was their communication? Would you recommend them?"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className="w-full min-h-[120px] resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 50 characters required ({review.length}/50)
                  </p>
                </div>

                {/* Tags */}
                <div className="mb-8">
                  <label className="text-sm font-medium text-gray-900 mb-3 block">
                    Tags (optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                          selectedTags.includes(tag)
                            ? 'text-black border-transparent'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                        style={selectedTags.includes(tag) ? { backgroundColor: '#AB9FF2' } : {}}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full bg-[#ab9ff2] text-black rounded-md transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#DCDAF0] hover:shadow-lg transform-gpu py-3 text-lg font-medium"
                >
                  {mutation.isPending ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};