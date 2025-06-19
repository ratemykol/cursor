import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CryptoAchievementBadges, getAchievementSummary } from "@/components/CryptoAchievementBadges";
import { 
  Share2, 
  Twitter, 
  MessageCircle, 
  Copy, 
  ExternalLink,
  TrendingUp,
  Zap,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialShareBadgesProps {
  traderName?: string;
  traderRating?: number;
  walletAddress?: string;
  className?: string;
  variant?: "default" | "compact" | "floating";
  totalRatings?: number;
  rank?: number;
  specialty?: string;
}

export const SocialShareBadges = ({ 
  traderName = "Crypto Trader",
  traderRating = 0,
  walletAddress,
  className,
  variant = "default",
  totalRatings,
  rank,
  specialty
}: SocialShareBadgesProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const currentUrl = window.location.href;
  const shareText = traderRating > 0 
    ? `Check out ${traderName} - ${traderRating}⭐ rated crypto trader on RateMyKOL! 🚀📈`
    : `Discover ${traderName} on RateMyKOL - The premier crypto trader rating platform! 🚀📈`;

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}&hashtags=crypto,trading,DeFi,RateMyKOL`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`,
    discord: `https://discord.com/channels/@me`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast({
        title: "Link Copied! 🚀",
        description: "Share link copied to clipboard",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleShare = (platform: keyof typeof shareUrls) => {
    if (platform === 'discord') {
      // For Discord, copy the message and open Discord
      navigator.clipboard.writeText(`${shareText}\n${currentUrl}`);
      window.open(shareUrls[platform], '_blank');
      toast({
        title: "Ready to Share! 💬",
        description: "Message copied - paste it in Discord!",
        variant: "default",
      });
    } else {
      window.open(shareUrls[platform], '_blank');
    }
  };

  if (variant === "floating") {
    return (
      <div className={cn(
        "fixed bottom-6 right-6 z-50",
        className
      )}>
        <div className="relative">
          {isExpanded && (
            <div className="absolute bottom-16 right-0 flex flex-col gap-2 bg-white dark:bg-gray-900 p-3 rounded-lg shadow-lg border border-purple-200 dark:border-purple-800 animate-in slide-in-from-bottom-2">
              <Button
                onClick={() => handleShare('twitter')}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white gap-2 min-w-[120px]"
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </Button>
              <Button
                onClick={() => handleShare('telegram')}
                size="sm"
                className="bg-blue-400 hover:bg-blue-500 text-white gap-2 min-w-[120px]"
              >
                <MessageCircle className="h-4 w-4" />
                Telegram
              </Button>
              <Button
                onClick={() => handleShare('discord')}
                size="sm"
                className="bg-indigo-500 hover:bg-indigo-600 text-white gap-2 min-w-[120px]"
              >
                <MessageCircle className="h-4 w-4" />
                Discord
              </Button>
              <Button
                onClick={handleCopyLink}
                size="sm"
                variant="outline"
                className="gap-2 min-w-[120px] border-purple-300 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-950"
              >
                <Copy className="h-4 w-4" />
                Copy Link
              </Button>
            </div>
          )}
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-full w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          >
            <Share2 className="h-6 w-6" />
          </Button>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          onClick={() => handleShare('twitter')}
          size="sm"
          variant="outline"
          className="gap-1 px-3 py-1 h-8 text-xs border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-950"
        >
          <Twitter className="h-3 w-3" />
          Tweet
        </Button>
        <Button
          onClick={handleCopyLink}
          size="sm"
          variant="outline"
          className="gap-1 px-3 py-1 h-8 text-xs border-purple-300 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-950"
        >
          <Copy className="h-3 w-3" />
          Copy
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800",
      className
    )}>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1">
          <Zap className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Share this crypto gem!
          </span>
        </div>
        {traderRating > 0 && (
          <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
              {traderRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Button
          onClick={() => handleShare('twitter')}
          className="bg-blue-500 hover:bg-blue-600 text-white gap-2 transition-all duration-300 hover:scale-105"
        >
          <Twitter className="h-4 w-4" />
          <span className="hidden sm:inline">Twitter</span>
        </Button>

        <Button
          onClick={() => handleShare('telegram')}
          className="bg-blue-400 hover:bg-blue-500 text-white gap-2 transition-all duration-300 hover:scale-105"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Telegram</span>
        </Button>

        <Button
          onClick={() => handleShare('discord')}
          className="bg-indigo-500 hover:bg-indigo-600 text-white gap-2 transition-all duration-300 hover:scale-105"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Discord</span>
        </Button>

        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="gap-2 border-purple-300 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-950 transition-all duration-300 hover:scale-105"
        >
          <Copy className="h-4 w-4" />
          <span className="hidden sm:inline">Copy</span>
        </Button>
      </div>

      {walletAddress && (
        <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <TrendingUp className="h-3 w-3" />
            <span>Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            <Button
              onClick={() => navigator.clipboard.writeText(walletAddress)}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-purple-100 dark:hover:bg-purple-900"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};