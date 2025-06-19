import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";

export const RatingPage = (): JSX.Element => {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [yourName, setYourName] = useState("");
  const [overallRating, setOverallRating] = useState([3]);
  const [profitabilityRating, setProfitabilityRating] = useState([3]);
  const [communicationRating, setCommunicationRating] = useState([3]);
  const [reliabilityRating, setReliabilityRating] = useState([3]);
  const [review, setReview] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: trader } = useQuery({
    queryKey: [`/api/traders/${id}`],
    enabled: !!id,
  });

  const availableTags = [
    "beginner friendly",
    "high profit",
    "responsive",
    "detailed analysis",
    "long term",
    "day trading",
    "swing trading",
    "risk management"
  ];

  const mutation = useMutation({
    mutationFn: async (ratingData: any) => {
      const response = await fetch(`/api/traders/${id}/ratings`, {
        method: "POST",
        body: JSON.stringify(ratingData),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error('Failed to submit rating');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your rating has been submitted!",
      });
      setLocation(`/trader/${id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!yourName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }

    const ratingData = {
      reviewerName: yourName.trim(),
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

  const CustomSlider = ({ value, onChange }: { value: number[], onChange: (value: number[]) => void }) => {
    return (
      <div className="relative">
        <input
          type="range"
          min="1"
          max="5"
          step="0.1"
          value={value[0]}
          onChange={(e) => onChange([Math.round(parseFloat(e.target.value))])}
          onInput={(e) => onChange([Math.round(parseFloat((e.target as HTMLInputElement).value))])}
          className="w-full custom-slider"
        />
      </div>
    );
  };

  const renderSlider = (
    label: string,
    value: number[],
    onChange: (value: number[]) => void,
    showLabels: boolean = true
  ) => (
    <div className="mb-6">
      <label className="text-sm font-medium text-gray-900 mb-3 block">{label}</label>
      <div className="px-3">
        <CustomSlider value={value} onChange={onChange} />
        
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
        {showLabels && (
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
        )}
        <div className="text-center mt-2">
          <span className="text-lg font-semibold text-blue-600">{value[0]}</span>
          <span className="text-gray-500"> / 5</span>
        </div>
      </div>
    </div>
  );

  if (!trader) {
    return (
      <div className="bg-white flex flex-row justify-center w-full">
        <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
          <Header />
          <div className="p-8 text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
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
                    Rate {trader.name}
                  </h1>
                  <p className="text-gray-600">
                    Share your experience with this trader to help others make informed decisions.
                  </p>
                </div>

                {/* Your Name */}
                <div className="mb-6">
                  <label htmlFor="yourName" className="text-sm font-medium text-gray-900 mb-2 block">
                    Your Name
                  </label>
                  <Input
                    id="yourName"
                    placeholder="Enter your name or pseudonym"
                    value={yourName}
                    onChange={(e) => setYourName(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Overall Rating */}
                {renderSlider("Overall Rating", overallRating, setOverallRating, false)}

                {/* Detailed Ratings */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Ratings</h3>
                  
                  {renderSlider("Profitability", profitabilityRating, setProfitabilityRating)}
                  {renderSlider("Communication", communicationRating, setCommunicationRating)}
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
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={mutation.isPending || review.length < 50}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
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