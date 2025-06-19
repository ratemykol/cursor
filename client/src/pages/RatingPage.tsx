import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export const RatingPage = (): JSX.Element => {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [overallRating, setOverallRating] = useState([3]);
  const [difficulty, setDifficulty] = useState([3]);
  const [wouldTakeAgain, setWouldTakeAgain] = useState<boolean | null>(null);
  const [attendance, setAttendance] = useState("");
  const [grade, setGrade] = useState("");
  const [textbook, setTextbook] = useState(false);
  const [review, setReview] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: trader } = useQuery({
    queryKey: [`/api/traders/${id}`],
    enabled: !!id,
  });

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

  const availableTags = [
    "GET READY TO READ", "PARTICIPATION MATTERS", "EXTRA CREDIT",
    "GROUP PROJECTS", "AMAZING LECTURES", "CLEAR GRADING CRITERIA",
    "INSPIRATIONAL", "HILARIOUS", "BEWARE OF POP QUIZZES",
    "SO MANY PAPERS", "RESPECTED", "LECTURE HEAVY",
    "GRADED BY FEW THINGS", "ACCESSIBLE OUTSIDE CLASS", "ONLINE SAVVY"
  ];

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (wouldTakeAgain === null) {
      toast({
        title: "Required Field",
        description: "Please indicate if you would take again.",
        variant: "destructive",
      });
      return;
    }

    if (!attendance) {
      toast({
        title: "Required Field", 
        description: "Please select attendance type.",
        variant: "destructive",
      });
      return;
    }

    const ratingData = {
      overallRating: overallRating[0],
      difficulty: difficulty[0],
      wouldTakeAgain,
      attendance,
      grade: grade || null,
      textbook,
      review: review.trim() || null,
      tags: selectedTags,
    };

    mutation.mutate(ratingData);
  };

  if (!trader) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 border-b">
        <h1 className="font-bold text-xl text-[#3c315b]">RateMyKOL</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost">Log In</Button>
          <Button>Sign Up</Button>
        </div>
      </header>

      <div className="container mx-auto px-8 py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{trader?.name}</h1>
          <p className="text-gray-600">{trader?.specialty || 'Crypto Trading'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Overall Rating */}
          <Card>
            <CardContent className="p-6">
              <Label className="text-lg font-semibold mb-4 block">
                How difficult was this professor? *
              </Label>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Very Easy</span>
                  <span>Very Difficult</span>
                </div>
                <Slider
                  value={overallRating}
                  onValueChange={setOverallRating}
                  max={5}
                  min={1}
                  step={0.1}
                  className="w-full"
                />
                <div className="text-center text-lg font-bold">
                  {overallRating[0].toFixed(1)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Would Take Again */}
          <Card>
            <CardContent className="p-6">
              <Label className="text-lg font-semibold mb-4 block">
                Would you like this professor again? *
              </Label>
              <RadioGroup value={wouldTakeAgain?.toString()} onValueChange={(value) => setWouldTakeAgain(value === "true")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="yes" />
                  <Label htmlFor="yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="no" />
                  <Label htmlFor="no">No</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Difficulty */}
          <Card>
            <CardContent className="p-6">
              <Label className="text-lg font-semibold mb-4 block">
                How was this class taken for credit? *
              </Label>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Very Easy</span>
                  <span>Very Difficult</span>
                </div>
                <Slider
                  value={difficulty}
                  onValueChange={setDifficulty}
                  max={5}
                  min={1}
                  step={0.1}
                  className="w-full"
                />
                <div className="text-center text-lg font-bold">
                  {difficulty[0].toFixed(1)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance */}
          <Card>
            <CardContent className="p-6">
              <Label className="text-lg font-semibold mb-4 block">
                Did the professor use textbooks? *
              </Label>
              <RadioGroup value={attendance} onValueChange={setAttendance}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Mandatory" id="mandatory" />
                  <Label htmlFor="mandatory">Mandatory</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Optional" id="optional" />
                  <Label htmlFor="optional">Optional</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Textbook */}
          <Card>
            <CardContent className="p-6">
              <Label className="text-lg font-semibold mb-4 block">
                How attendance mandatory?
              </Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="textbook"
                  checked={textbook}
                  onCheckedChange={(checked) => setTextbook(!!checked)}
                />
                <Label htmlFor="textbook">Yes, textbook was required</Label>
              </div>
            </CardContent>
          </Card>

          {/* Grade */}
          <Card>
            <CardContent className="p-6">
              <Label htmlFor="grade" className="text-lg font-semibold mb-4 block">
                Select grade received
              </Label>
              <Input
                id="grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g., A+, A, B+, B, etc."
              />
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardContent className="p-6">
              <Label className="text-lg font-semibold mb-4 block">
                Select up to 3 tags
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    disabled={selectedTags.length >= 3 && !selectedTags.includes(tag)}
                    className={`p-2 text-sm border rounded transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-100 border-blue-300 text-blue-800'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    } ${
                      selectedTags.length >= 3 && !selectedTags.includes(tag)
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Selected: {selectedTags.length}/3
              </div>
            </CardContent>
          </Card>

          {/* Review */}
          <Card>
            <CardContent className="p-6">
              <Label htmlFor="review" className="text-lg font-semibold mb-4 block">
                Write a Review
              </Label>
              <Textarea
                id="review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Please provide a detailed review of your professor's professional abilities including their ability and willingness to help students outside class"
                rows={6}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation(`/trader/${id}`)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 bg-blue-600"
            >
              {mutation.isPending ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};