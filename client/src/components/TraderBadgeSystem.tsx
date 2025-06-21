import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Star, 
  Users, 
  DollarSign, 
  Diamond, 
  Award, 
  Target, 
  Shield,
  Zap,
  Crown,
  Trophy,
  CheckCircle,
  Share2,
  Twitter,
  Facebook,
  Linkedin
} from 'lucide-react';

interface TraderBadge {
  id: number;
  traderId: number;
  badgeType: string;
  badgeLevel: number;
  earnedAt: string;
  metadata?: any;
}

interface TraderBadgeProgress {
  averageRating: number;
  totalRatings: number;
  fiveStarCount: number;
  averageProfitability: number;
  badges: TraderBadge[];
  progress: {
    risingStar: boolean;
    topPerformer: {
      bronze: boolean;
      silver: boolean;
      gold: boolean;
    };
    communityFavorite: {
      bronze: boolean;
      silver: boolean;
      gold: boolean;
    };
    consistentGains: boolean;
    diamondHands: boolean;
    veteranTrader: boolean;
  };
}

// Function to get unique styling for each badge type
const getBadgeStyles = (badgeType: string, badgeLevel: number) => {
  const styles = {
    rising_star: {
      gradient: 'from-purple-500 to-pink-600',
      hoverGradient: 'hover:from-purple-400 hover:to-pink-500',
      glow: 'from-purple-400 to-pink-500',
      shadow: 'shadow-purple-400/20',
      border: 'border-purple-400/30'
    },
    top_performer: {
      gradient: badgeLevel === 1 ? 'from-amber-600 to-amber-700' : // Bronze
                badgeLevel === 2 ? 'from-gray-400 to-gray-500' : // Silver  
                'from-yellow-400 to-yellow-600', // Gold
      hoverGradient: badgeLevel === 1 ? 'hover:from-amber-500 hover:to-amber-600' :
                     badgeLevel === 2 ? 'hover:from-gray-300 hover:to-gray-400' :
                     'hover:from-yellow-300 hover:to-yellow-500',
      glow: badgeLevel === 1 ? 'from-amber-400 to-amber-500' :
            badgeLevel === 2 ? 'from-gray-300 to-gray-400' :
            'from-yellow-300 to-yellow-400',
      shadow: badgeLevel === 1 ? 'shadow-amber-400/20' :
              badgeLevel === 2 ? 'shadow-gray-400/20' :
              'shadow-yellow-400/20',
      border: badgeLevel === 1 ? 'border-amber-300/30' :
              badgeLevel === 2 ? 'border-gray-300/30' :
              'border-yellow-300/30'
    },
    community_favorite: {
      gradient: 'from-blue-500 to-indigo-600',
      hoverGradient: 'hover:from-blue-400 hover:to-indigo-500',
      glow: 'from-blue-400 to-indigo-500',
      shadow: 'shadow-blue-400/20',
      border: 'border-blue-300/30'
    },
    consistent_gains: {
      gradient: 'from-green-500 to-emerald-600',
      hoverGradient: 'hover:from-green-400 hover:to-emerald-500',
      glow: 'from-green-400 to-emerald-500',
      shadow: 'shadow-green-400/20',
      border: 'border-green-300/30'
    },
    diamond_hands: {
      gradient: 'from-cyan-400 to-blue-500',
      hoverGradient: 'hover:from-cyan-300 hover:to-blue-400',
      glow: 'from-cyan-300 to-blue-400',
      shadow: 'shadow-cyan-400/20',
      border: 'border-cyan-300/30'
    },
    veteran_trader: {
      gradient: 'from-purple-600 to-violet-700',
      hoverGradient: 'hover:from-purple-500 hover:to-violet-600',
      glow: 'from-purple-500 to-violet-600',
      shadow: 'shadow-purple-400/20',
      border: 'border-purple-300/30'
    },
    market_wizard: {
      gradient: 'from-pink-500 to-rose-600',
      hoverGradient: 'hover:from-pink-400 hover:to-rose-500',
      glow: 'from-pink-400 to-rose-500',
      shadow: 'shadow-pink-400/20',
      border: 'border-pink-300/30'
    },
    profit_legend: {
      gradient: 'from-teal-500 to-cyan-600',
      hoverGradient: 'hover:from-teal-400 hover:to-cyan-500',
      glow: 'from-teal-400 to-cyan-500',
      shadow: 'shadow-teal-400/20',
      border: 'border-teal-300/30'
    },
    alpha_caller: {
      gradient: 'from-red-500 to-orange-600',
      hoverGradient: 'hover:from-red-400 hover:to-orange-500',
      glow: 'from-red-400 to-orange-500',
      shadow: 'shadow-red-400/20',
      border: 'border-red-300/30'
    },
    whale_trader: {
      gradient: 'from-slate-600 to-slate-700',
      hoverGradient: 'hover:from-slate-500 hover:to-slate-600',
      glow: 'from-slate-500 to-slate-600',
      shadow: 'shadow-slate-400/20',
      border: 'border-slate-300/30'
    },
    community_leader: {
      gradient: 'from-indigo-500 to-purple-600',
      hoverGradient: 'hover:from-indigo-400 hover:to-purple-500',
      glow: 'from-indigo-400 to-purple-500',
      shadow: 'shadow-indigo-400/20',
      border: 'border-indigo-300/30'
    },
    innovative_strategist: {
      gradient: 'from-violet-500 to-purple-600',
      hoverGradient: 'hover:from-violet-400 hover:to-purple-500',
      glow: 'from-violet-400 to-purple-500',
      shadow: 'shadow-violet-400/20',
      border: 'border-violet-300/30'
    }
  };
  
  return styles[badgeType as keyof typeof styles] || styles.rising_star;
};

// Social media sharing utility functions for trader badges
const shareTraderBadgeAchievement = (traderName: string, badgeName: string, level: string, platform: string) => {
  const levelText = level ? ` ${level}` : '';
  const text = `🏆 ${traderName} just earned the${levelText} ${badgeName} badge on RateMyKOL! Check out this top crypto trader. #RateMyKOL #CryptoTrading #TopTrader`;
  const url = window.location.href;
  
  let shareUrl = '';
  
  switch (platform) {
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      break;
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
      break;
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`;
      break;
  }
  
  if (shareUrl) {
    window.open(shareUrl, '_blank');
  }
};

// Share dropdown component for trader badges
const TraderShareDropdown: React.FC<{ traderName: string; badgeName: string; level: string }> = ({ traderName, badgeName, level }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className="p-1.5 rounded-full bg-white/90 hover:bg-white shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 flex items-center justify-center"
      >
        <Share2 className="h-3 w-3 text-gray-700" />
      </button>
      
      {isOpen && (
        <div className="absolute bottom-10 right-0 z-30 bg-white rounded-lg shadow-lg border p-2 min-w-[120px]">
          <div className="space-y-1">
            <button
              onClick={() => {
                shareTraderBadgeAchievement(traderName, badgeName, level, 'twitter');
              }}
              className="flex items-center gap-2 w-full px-2 py-1 text-xs hover:bg-blue-50 rounded transition-colors"
            >
              <Twitter className="h-3 w-3 text-blue-500" />
              Share on Twitter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const traderBadgeConfig = {
  rising_star: {
    name: 'Rising Star',
    description: 'New trader with excellent performance',
    icon: TrendingUp,
  },
  top_performer: {
    name: 'Top Performer',
    description: 'Consistently high ratings from community',
    icon: Star,
  },
  community_favorite: {
    name: 'Community Favorite',
    description: 'Widely reviewed and trusted trader',
    icon: Users,
  },
  consistent_gains: {
    name: 'Consistent Gains',
    description: 'Exceptional profitability track record',
    icon: DollarSign,
  },
  diamond_hands: {
    name: 'Diamond Hands',
    description: 'Exceptional five-star reviews',
    icon: Diamond,
    color: 'bg-cyan-100 text-cyan-800',
    iconColor: 'text-cyan-600'
  },
  veteran_trader: {
    name: 'Veteran Trader',
    description: 'Experienced and reliable trader',
    icon: Shield,
    color: 'bg-gray-100 text-gray-800',
    iconColor: 'text-gray-600'
  },
  volume_leader: {
    name: 'Volume Leader',
    description: 'High trading volume activity',
    icon: Target,
    color: 'bg-orange-100 text-orange-800',
    iconColor: 'text-orange-600'
  },
  alpha_caller: {
    name: 'Alpha Caller',
    description: 'Expert at finding profitable opportunities',
    icon: Zap,
    color: 'bg-red-100 text-red-800',
    iconColor: 'text-red-600'
  },
  risk_manager: {
    name: 'Risk Manager',
    description: 'Excellent risk management skills',
    icon: Shield,
    color: 'bg-indigo-100 text-indigo-800',
    iconColor: 'text-indigo-600'
  },
  trend_setter: {
    name: 'Trend Setter',
    description: 'Identifies market trends early',
    icon: TrendingUp,
    color: 'bg-pink-100 text-pink-800',
    iconColor: 'text-pink-600'
  },
  accuracy_expert: {
    name: 'Accuracy Expert',
    description: 'Highly accurate trading calls',
    icon: Target,
    color: 'bg-emerald-100 text-emerald-800',
    iconColor: 'text-emerald-600'
  },
  market_wizard: {
    name: 'Market Wizard',
    description: 'Master of market analysis',
    icon: Crown,
    color: 'bg-violet-100 text-violet-800',
    iconColor: 'text-violet-600'
  }
};

const levelLabels = {
  1: 'Bronze',
  2: 'Silver',
  3: 'Gold'
};

export const TraderBadges: React.FC<{ traderId: number; traderName?: string }> = ({ traderId, traderName = "Trader" }) => {
  const { data: badges = [], isLoading, error } = useQuery<TraderBadge[]>({
    queryKey: [`/api/trader-badges/${traderId}`],
    enabled: !!traderId
  });

  console.log('TraderBadges - traderId:', traderId, 'badges:', badges, 'isLoading:', isLoading, 'error:', error);
  console.log('Rendering', badges.length, 'achievement cards');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Trader Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Loading badges...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Trader Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Error loading badges</p>
        </CardContent>
      </Card>
    );
  }

  if (!badges || badges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Trader Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">No badges earned yet. Keep building your reputation!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Trader Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {badges.map((badge) => {
            const config = traderBadgeConfig[badge.badgeType as keyof typeof traderBadgeConfig];
            console.log('Badge mapping:', badge.badgeType, 'config found:', !!config);
            if (!config) {
              console.log('No config found for badge type:', badge.badgeType);
              return null;
            }

            const IconComponent = config.icon;
            const level = levelLabels[badge.badgeLevel as keyof typeof levelLabels];
            const badgeStyles = getBadgeStyles(badge.badgeType, badge.badgeLevel);

            return (
              <div key={badge.id} className="relative group">
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${badgeStyles.glow} rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-md transform scale-110`}></div>
                <div className={`relative bg-gradient-to-br ${badgeStyles.gradient} ${badgeStyles.hoverGradient} rounded-2xl p-4 text-white shadow-lg ${badgeStyles.shadow} transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl cursor-pointer overflow-hidden border ${badgeStyles.border}`} style={{ 
                  willChange: 'transform', 
                  backfaceVisibility: 'hidden',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  transform: 'translateZ(0)'
                }}>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-all duration-700 ease-in-out w-full h-full"></div>
                  
                  {/* Share dropdown - positioned absolutely within the card */}
                  <div className="absolute bottom-2 right-2 z-20">
                    <TraderShareDropdown 
                      traderName={traderName} 
                      badgeName={config.name} 
                      level={badge.badgeLevel > 1 ? level : ''} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5 text-white transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                      <span className="font-semibold text-sm transition-colors duration-300">{config.name}</span>
                    </div>
                    {badge.badgeLevel > 1 && (
                      <div className="bg-white bg-opacity-20 rounded-full px-2 py-1 transform transition-all duration-300 group-hover:bg-opacity-30 group-hover:scale-110">
                        <span className="text-xs font-medium text-white">{level}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-blue-100 mb-1 transition-colors duration-300 group-hover:text-white">
                    {config.description}
                  </p>
                  <p className="text-xs text-blue-200 transition-colors duration-300 group-hover:text-blue-100">
                    {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export const TraderBadgeProgress: React.FC<{ traderId: number }> = ({ traderId }) => {
  const { data: progress, isLoading } = useQuery<TraderBadgeProgress>({
    queryKey: [`/api/trader-badges/progress/${traderId}`],
    enabled: !!traderId
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading progress...</div>;
  }

  if (!progress) return null;

  const progressItems = [
    {
      label: 'Rising Star',
      completed: progress.progress.risingStar,
      current: Math.min(progress.totalRatings, 5),
      target: 5,
      description: 'Get 5+ reviews with 4.5+ average rating'
    },
    {
      label: 'Top Performer (Bronze)',
      completed: progress.progress.topPerformer.bronze,
      current: Math.min(progress.totalRatings, 10),
      target: 10,
      description: 'Get 10+ reviews with 4.0+ average rating'
    },
    {
      label: 'Top Performer (Silver)',
      completed: progress.progress.topPerformer.silver,
      current: Math.min(progress.totalRatings, 10),
      target: 10,
      description: 'Get 10+ reviews with 4.5+ average rating'
    },
    {
      label: 'Top Performer (Gold)',
      completed: progress.progress.topPerformer.gold,
      current: Math.min(progress.totalRatings, 10),
      target: 10,
      description: 'Get 10+ reviews with 4.8+ average rating'
    },
    {
      label: 'Community Favorite (Bronze)',
      completed: progress.progress.communityFavorite.bronze,
      current: Math.min(progress.totalRatings, 25),
      target: 25,
      description: 'Receive 25+ reviews from the community'
    },
    {
      label: 'Community Favorite (Silver)',
      completed: progress.progress.communityFavorite.silver,
      current: Math.min(progress.totalRatings, 50),
      target: 50,
      description: 'Receive 50+ reviews from the community'
    },
    {
      label: 'Community Favorite (Gold)',
      completed: progress.progress.communityFavorite.gold,
      current: Math.min(progress.totalRatings, 100),
      target: 100,
      description: 'Receive 100+ reviews from the community'
    },
    {
      label: 'Consistent Gains',
      completed: progress.progress.consistentGains,
      current: Math.min(progress.totalRatings, 10),
      target: 10,
      description: 'Get 10+ reviews with 4.5+ profitability rating'
    },
    {
      label: 'Diamond Hands',
      completed: progress.progress.diamondHands,
      current: Math.min(progress.fiveStarCount, 20),
      target: 20,
      description: 'Receive 20+ five-star reviews'
    },
    {
      label: 'Veteran Trader',
      completed: progress.progress.veteranTrader,
      current: Math.min(progress.totalRatings, 30),
      target: 30,
      description: 'Get 30+ reviews with 4.0+ average rating'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Achievement Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{progress.averageRating.toFixed(1)}</div>
              <div className="text-sm text-gray-500">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{progress.totalRatings}</div>
              <div className="text-sm text-gray-500">Total Reviews</div>
            </div>
          </div>
          
          {progressItems.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${item.completed ? 'text-green-600' : 'text-gray-700'}`}>
                  {item.label}
                  {item.completed && <CheckCircle className="inline ml-1 h-4 w-4 text-green-500" />}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.min(item.current, item.target)}/{item.target}
                </span>
              </div>
              <Progress 
                value={Math.min((item.current / item.target) * 100, 100)} 
                className="h-2"
              />
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const TraderBadgeNotification: React.FC<{ badges: TraderBadge[] }> = ({ badges }) => {
  if (!badges.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {badges.map((badge) => {
        const config = traderBadgeConfig[badge.badgeType as keyof typeof traderBadgeConfig];
        if (!config) return null;

        const IconComponent = config.icon;
        const level = levelLabels[badge.badgeLevel as keyof typeof levelLabels];

        return (
          <div
            key={badge.id}
            className="bg-blue-500 border border-blue-600 rounded-2xl shadow-lg p-4 max-w-sm animate-in slide-in-from-right-5"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-white bg-opacity-20">
                <IconComponent className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">
                    New Achievement!
                  </p>
                  {badge.badgeLevel > 1 && (
                    <div className="bg-white bg-opacity-20 rounded-full px-2 py-1">
                      <span className="text-xs font-medium text-white">{level}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-blue-100">{config.name}</p>
                <p className="text-xs text-blue-200">{config.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};