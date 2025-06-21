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
  CheckCircle
} from 'lucide-react';

interface TraderBadge {
  id: number;
  trader_id: number;
  badge_type: string;
  badge_level: number;
  earned_at: string;
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

const traderBadgeConfig = {
  rising_star: {
    name: 'Rising Star',
    description: 'New trader with excellent performance',
    icon: TrendingUp,
    color: 'bg-yellow-100 text-yellow-800',
    iconColor: 'text-yellow-600'
  },
  top_performer: {
    name: 'Top Performer',
    description: 'Consistently high ratings from community',
    icon: Star,
    color: 'bg-purple-100 text-purple-800',
    iconColor: 'text-purple-600'
  },
  community_favorite: {
    name: 'Community Favorite',
    description: 'Widely reviewed and trusted trader',
    icon: Users,
    color: 'bg-blue-100 text-blue-800',
    iconColor: 'text-blue-600'
  },
  consistent_gains: {
    name: 'Consistent Gains',
    description: 'Exceptional profitability track record',
    icon: DollarSign,
    color: 'bg-green-100 text-green-800',
    iconColor: 'text-green-600'
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

export const TraderBadges: React.FC<{ traderId: number }> = ({ traderId }) => {
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

            return (
              <div key={badge.id} className="relative">
                <div className="bg-blue-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5 text-white" />
                      <span className="font-semibold text-sm">{config.name}</span>
                    </div>
                    {badge.badgeLevel > 1 && (
                      <div className="bg-white bg-opacity-20 rounded-full px-2 py-1">
                        <span className="text-xs font-medium text-white">{level}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-blue-100 mb-1">
                    {config.description}
                  </p>
                  <p className="text-xs text-blue-200">
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