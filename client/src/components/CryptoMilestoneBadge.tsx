import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Trophy, 
  Crown, 
  Diamond, 
  Zap, 
  Share2,
  Twitter,
  Copy,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CryptoMilestoneBadgeProps {
  traderName: string;
  milestone: "top-rank" | "diamond-rating" | "crypto-veteran" | "rising-star";
  traderRating?: number;
  rank?: number;
  className?: string;
}

const milestoneConfigs = {
  "top-rank": {
    title: "🏆 Rank #1 Crypto Trader",
    description: "Achieved the top ranking position",
    icon: <Crown className="w-6 h-6 text-yellow-500" />,
    gradient: "from-yellow-400 via-yellow-500 to-orange-500",
    bgPattern: "bg-gradient-to-br from-yellow-50 to-orange-50",
    shareText: "🚀 Just discovered the #1 ranked crypto trader on RateMyKOL!"
  },
  "diamond-rating": {
    title: "💎 Diamond Hands Rating",
    description: "Achieved 4.8+ star rating",
    icon: <Diamond className="w-6 h-6 text-blue-500" />,
    gradient: "from-blue-400 via-blue-500 to-purple-500", 
    bgPattern: "bg-gradient-to-br from-blue-50 to-purple-50",
    shareText: "💎 Found a diamond hands trader with exceptional ratings!"
  },
  "crypto-veteran": {
    title: "🛡️ Crypto Veteran",
    description: "Trusted by 50+ community members",
    icon: <Trophy className="w-6 h-6 text-purple-500" />,
    gradient: "from-purple-400 via-purple-500 to-pink-500",
    bgPattern: "bg-gradient-to-br from-purple-50 to-pink-50",
    shareText: "🛡️ Check out this crypto veteran with proven track record!"
  },
  "rising-star": {
    title: "⭐ Rising Star",
    description: "Emerging talent with high potential",
    icon: <Sparkles className="w-6 h-6 text-pink-500" />,
    gradient: "from-pink-400 via-pink-500 to-red-500",
    bgPattern: "bg-gradient-to-br from-pink-50 to-red-50",
    shareText: "⭐ Found a rising star in the crypto trading world!"
  }
};

export const CryptoMilestoneBadge = ({ 
  traderName, 
  milestone, 
  traderRating,
  rank,
  className 
}: CryptoMilestoneBadgeProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();
  
  const config = milestoneConfigs[milestone];
  const shareUrl = window.location.href;
  const fullShareText = `${config.shareText}\n\n${traderName} ${traderRating ? `- ${traderRating}⭐` : ''} on RateMyKOL 🚀📈`;

  const handleShare = async (platform: 'twitter' | 'copy') => {
    setIsSharing(true);
    
    try {
      if (platform === 'twitter') {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullShareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=crypto,trading,DeFi,RateMyKOL`;
        window.open(twitterUrl, '_blank');
        toast({
          title: "Shared to Twitter! 🐦",
          description: "Milestone achievement shared successfully",
        });
      } else {
        await navigator.clipboard.writeText(`${fullShareText}\n${shareUrl}`);
        toast({
          title: "Copied to Clipboard! 📋",
          description: "Milestone share text copied",
        });
      }
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Unable to share milestone",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Card className={cn(
      "relative overflow-hidden border-2 shadow-lg hover:shadow-xl transition-all duration-500",
      config.bgPattern,
      "border-transparent",
      className
    )}>
      {/* Animated Background Gradient */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r opacity-10 animate-pulse",
        config.gradient
      )} />
      
      {/* Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_ease-in-out_infinite]" />
      
      <CardContent className="relative p-6">
        <div className="flex items-start gap-4">
          {/* Milestone Icon */}
          <div className={cn(
            "rounded-full p-3 bg-gradient-to-r shadow-lg",
            config.gradient
          )}>
            {config.icon}
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {config.title}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {config.description}
            </p>
            <p className="text-sm font-medium text-gray-800">
              Achieved by {traderName}
            </p>
            
            {/* Share Buttons */}
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => handleShare('twitter')}
                disabled={isSharing}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white gap-2"
              >
                <Twitter className="w-4 h-4" />
                Share Milestone
              </Button>
              
              <Button
                onClick={() => handleShare('copy')}
                disabled={isSharing}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy
              </Button>
            </div>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute top-2 right-2">
            <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs font-medium text-gray-700">
                {rank ? `#${rank}` : 'Top Tier'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to determine which milestone badge to show
export const getMilestoneType = (
  traderRating?: number,
  totalRatings?: number,
  rank?: number
): CryptoMilestoneBadgeProps['milestone'] | null => {
  if (rank === 1) return "top-rank";
  if ((traderRating || 0) >= 4.8) return "diamond-rating";
  if ((totalRatings || 0) >= 50) return "crypto-veteran";
  if ((traderRating || 0) >= 4.0 && (totalRatings || 0) >= 10) return "rising-star";
  return null;
};