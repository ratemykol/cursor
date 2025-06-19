import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Trophy, 
  TrendingUp, 
  Zap, 
  Shield, 
  Star, 
  Crown,
  Diamond,
  Flame,
  Target,
  Rocket
} from "lucide-react";

interface CryptoAchievementBadgesProps {
  traderRating?: number;
  totalRatings?: number;
  rank?: number;
  specialty?: string;
  className?: string;
}

interface Achievement {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  condition: (props: CryptoAchievementBadgesProps) => boolean;
  description: string;
}

const achievements: Achievement[] = [
  {
    id: "diamond-hands",
    title: "💎 Diamond Hands",
    icon: <Diamond className="w-3 h-3" />,
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    condition: ({ traderRating }) => (traderRating || 0) >= 4.8,
    description: "Exceptional trader with 4.8+ rating"
  },
  {
    id: "whale-status",
    title: "🐋 Whale Status",
    icon: <Crown className="w-3 h-3" />,
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    condition: ({ rank }) => rank === 1,
    description: "Top ranked trader"
  },
  {
    id: "rocket-fuel",
    title: "🚀 Rocket Fuel",
    icon: <Rocket className="w-3 h-3" />,
    color: "text-green-700",
    bgColor: "bg-green-100",
    condition: ({ traderRating }) => (traderRating || 0) >= 4.5,
    description: "Consistently high performance"
  },
  {
    id: "lightning-fast",
    title: "⚡ Lightning Fast",
    icon: <Zap className="w-3 h-3" />,
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    condition: ({ specialty }) => Boolean(specialty?.toLowerCase().includes('scalp') || specialty?.toLowerCase().includes('day')),
    description: "Expert in fast trading strategies"
  },
  {
    id: "trusted-veteran",
    title: "🛡️ Trusted Veteran",
    icon: <Shield className="w-3 h-3" />,
    color: "text-indigo-700",
    bgColor: "bg-indigo-100",
    condition: ({ totalRatings }) => (totalRatings || 0) >= 50,
    description: "Highly reviewed by community"
  },
  {
    id: "rising-star",
    title: "⭐ Rising Star",
    icon: <Star className="w-3 h-3" />,
    color: "text-pink-700",
    bgColor: "bg-pink-100",
    condition: ({ traderRating, totalRatings }) => (traderRating || 0) >= 4.0 && (totalRatings || 0) >= 10 && (totalRatings || 0) < 50,
    description: "Emerging talent with great potential"
  },
  {
    id: "hot-streak",
    title: "🔥 Hot Streak",
    icon: <Flame className="w-3 h-3" />,
    color: "text-red-700",
    bgColor: "bg-red-100",
    condition: ({ traderRating }) => (traderRating || 0) >= 4.2,
    description: "On fire with recent trades"
  },
  {
    id: "precision-sniper",
    title: "🎯 Precision Sniper",
    icon: <Target className="w-3 h-3" />,
    color: "text-orange-700",
    bgColor: "bg-orange-100",
    condition: ({ specialty }) => Boolean(specialty?.toLowerCase().includes('swing') || specialty?.toLowerCase().includes('position')),
    description: "Master of strategic positioning"
  }
];

export const CryptoAchievementBadges = ({ 
  traderRating, 
  totalRatings, 
  rank, 
  specialty,
  className 
}: CryptoAchievementBadgesProps) => {
  const earnedAchievements = achievements.filter(achievement => 
    achievement.condition({ traderRating, totalRatings, rank, specialty })
  );

  if (earnedAchievements.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {earnedAchievements.map((achievement) => (
        <Badge
          key={achievement.id}
          className={cn(
            "flex items-center gap-1 px-2 py-1 text-xs font-medium transition-all duration-300 hover:scale-105 cursor-help",
            achievement.bgColor,
            achievement.color,
            "border-0 shadow-sm hover:shadow-md"
          )}
          title={achievement.description}
        >
          {achievement.icon}
          <span className="hidden sm:inline">{achievement.title}</span>
          <span className="sm:hidden">{achievement.title.split(' ')[0]}</span>
        </Badge>
      ))}
    </div>
  );
};

export const getAchievementSummary = (props: CryptoAchievementBadgesProps): string => {
  const earnedAchievements = achievements.filter(achievement => 
    achievement.condition(props)
  );
  
  if (earnedAchievements.length === 0) return "";
  
  const titles = earnedAchievements.map(a => a.title).join(", ");
  return `🏆 Achievements: ${titles}`;
};