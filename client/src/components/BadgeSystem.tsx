import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Award, 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  Target, 
  Crown, 
  Zap, 
  Users, 
  Trophy,
  Calendar,
  CheckCircle
} from 'lucide-react';

interface UserBadge {
  id: number;
  userId: string;
  badgeType: string;
  badgeLevel: number;
  earnedAt: string;
  metadata?: any;
}

interface BadgeProgress {
  reviewCount: number;
  helpfulVotes: number;
  detailedReviews: number;
  avgRating: string;
  progress: {
    firstReview: boolean;
    prolificReviewer: {
      bronze: boolean;
      silver: boolean;
      gold: boolean;
    };
    helpfulReviewer: {
      bronze: boolean;
      silver: boolean;
      gold: boolean;
    };
    detailedReviewer: boolean;
    qualityReviewer: boolean;
  };
}

const badgeConfig = {
  first_review: {
    name: 'First Review',
    description: 'Wrote your first review',
    icon: Star,
    color: 'bg-purple-100 text-purple-800',
    iconColor: 'text-purple-600'
  },
  prolific_reviewer: {
    name: 'Prolific Reviewer',
    description: 'Active community contributor',
    icon: MessageSquare,
    color: 'bg-blue-100 text-blue-800',
    iconColor: 'text-blue-600'
  },
  helpful_reviewer: {
    name: 'Helpful Reviewer',
    description: 'Reviews voted helpful by community',
    icon: ThumbsUp,
    color: 'bg-green-100 text-green-800',
    iconColor: 'text-green-600'
  },
  detailed_reviewer: {
    name: 'Detailed Reviewer',
    description: 'Provides comprehensive feedback',
    icon: Target,
    color: 'bg-orange-100 text-orange-800',
    iconColor: 'text-orange-600'
  },
  quality_reviewer: {
    name: 'Quality Reviewer',
    description: 'Balanced and fair reviews',
    icon: CheckCircle,
    color: 'bg-teal-100 text-teal-800',
    iconColor: 'text-teal-600'
  },
  early_adopter: {
    name: 'Early Adopter',
    description: 'Joined the platform early',
    icon: Calendar,
    color: 'bg-indigo-100 text-indigo-800',
    iconColor: 'text-indigo-600'
  },
  expert_reviewer: {
    name: 'Expert Reviewer',
    description: 'Recognized expertise in reviews',
    icon: Award,
    color: 'bg-red-100 text-red-800',
    iconColor: 'text-red-600'
  },
  trusted_reviewer: {
    name: 'Trusted Reviewer',
    description: 'Highly trusted by community',
    icon: Crown,
    color: 'bg-yellow-100 text-yellow-800',
    iconColor: 'text-yellow-600'
  },
  community_builder: {
    name: 'Community Builder',
    description: 'Helps build the community',
    icon: Users,
    color: 'bg-pink-100 text-pink-800',
    iconColor: 'text-pink-600'
  },
  top_contributor: {
    name: 'Top Contributor',
    description: 'Top platform contributor',
    icon: Trophy,
    color: 'bg-amber-100 text-amber-800',
    iconColor: 'text-amber-600'
  },
  veteran_reviewer: {
    name: 'Veteran Reviewer',
    description: 'Long-time active reviewer',
    icon: Zap,
    color: 'bg-violet-100 text-violet-800',
    iconColor: 'text-violet-600'
  }
};

const levelColors = {
  1: 'border-amber-600 bg-amber-50', // Bronze
  2: 'border-gray-400 bg-gray-50', // Silver  
  3: 'border-yellow-500 bg-yellow-50' // Gold
};

const levelNames = {
  1: 'Bronze',
  2: 'Silver',
  3: 'Gold'
};

export const UserBadges: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: badges = [], isLoading } = useQuery<UserBadge[]>({
    queryKey: [`/api/badges/user/${userId}`],
    enabled: !!userId
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!badges.length) {
    return (
      <div className="text-center py-12">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-full p-8 w-24 h-24 mx-auto mb-6">
          <Award className="h-8 w-8 text-gray-400 mx-auto" />
        </div>
        <h3 className="text-xl font-bold text-gray-700 mb-3">No Achievements Yet</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Start your journey by writing detailed reviews and engaging with the community to unlock your first badges!
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm mx-auto">
          <p className="text-sm text-blue-700 font-medium">
            Write your first review to earn the "First Review" badge
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-xl shadow-lg">
            <Trophy className="h-7 w-7 text-white" />
          </div>
          Achievement Gallery
        </h2>
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-full border border-purple-200">
          <span className="text-sm font-bold text-purple-700">{badges.length} Achievements Unlocked</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {badges.map((badge) => {
          const config = badgeConfig[badge.badgeType as keyof typeof badgeConfig];
          if (!config) return null;

          const Icon = config.icon;
          const levelColor = levelColors[badge.badgeLevel as keyof typeof levelColors];
          const levelName = levelNames[badge.badgeLevel as keyof typeof levelNames];

          return (
            <div
              key={badge.id}
              className="group relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
            >
              {/* Decorative Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                <div className="w-full h-full bg-gradient-to-br from-current to-transparent rounded-full transform rotate-45 translate-x-16 -translate-y-16"></div>
              </div>

              {/* Achievement Card Header */}
              <div className="flex items-start gap-4 mb-4 relative z-10">
                <div className={`relative p-4 rounded-2xl ${config.color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <Icon className={`h-8 w-8 ${config.iconColor}`} />
                  {badge.badgeLevel > 1 && (
                    <div className="absolute -top-2 -right-2 bg-white border-2 border-gray-200 rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                      <span className="text-sm font-bold text-gray-700">{badge.badgeLevel}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xl text-gray-900 mb-2">{config.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">{config.description}</p>
                  
                  {/* Badge Tier Indicator */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border-2 ${levelColor}`}>
                    <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                    {badge.badgeLevel === 1 && badge.badgeType === 'first_review' && 'Milestone Achievement'}
                    {badge.badgeLevel === 1 && badge.badgeType === 'detailed_reviewer' && 'Quality Badge'}
                    {badge.badgeLevel === 1 && badge.badgeType === 'early_adopter' && 'Exclusive Badge'}
                    {badge.badgeLevel === 1 && !['first_review', 'detailed_reviewer', 'early_adopter'].includes(badge.badgeType) && 'Bronze Tier'}
                    {badge.badgeLevel === 2 && 'Silver Tier'}
                    {badge.badgeLevel === 3 && 'Gold Tier'}
                  </div>
                </div>
              </div>

              {/* Achievement Details */}
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-500 font-medium">Earned on</span>
                  <span className="font-bold text-gray-800">
                    {new Date(badge.earnedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {badge.metadata && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Achievement Stats</div>
                    <div className="space-y-1">
                      {badge.metadata.reviewCount && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Reviews Written</span>
                          <span className="font-bold text-lg text-blue-600">{badge.metadata.reviewCount}</span>
                        </div>
                      )}
                      {badge.metadata.helpfulVotes && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Helpful Votes</span>
                          <span className="font-bold text-lg text-green-600">{badge.metadata.helpfulVotes}</span>
                        </div>
                      )}
                      {badge.metadata.detailedCount && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Detailed Reviews</span>
                          <span className="font-bold text-lg text-purple-600">{badge.metadata.detailedCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Achievement Rarity Indicator */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Star className="h-3 w-3" />
                  <span>
                    {badge.badgeLevel === 3 ? 'Rare Achievement' : 
                     badge.badgeLevel === 2 ? 'Uncommon Achievement' : 
                     'Common Achievement'}
                  </span>
                </div>
              </div>

              {/* Hover Effect Shine */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 transition-all duration-700 group-hover:translate-x-full"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const BadgeProgress: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: progress, isLoading } = useQuery<BadgeProgress>({
    queryKey: [`/api/badges/progress/${userId}`],
    enabled: !!userId
  });

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-40 rounded-lg"></div>;
  }

  if (!progress) return null;

  const progressItems = [
    {
      label: 'First Review',
      completed: progress.progress.firstReview,
      current: progress.reviewCount,
      target: 1,
      description: 'Write your first review'
    },
    {
      label: 'Prolific Reviewer (Bronze)',
      completed: progress.progress.prolificReviewer.bronze,
      current: progress.reviewCount,
      target: 5,
      description: 'Write 5 reviews'
    },
    {
      label: 'Prolific Reviewer (Silver)',
      completed: progress.progress.prolificReviewer.silver,
      current: progress.reviewCount,
      target: 15,
      description: 'Write 15 reviews'
    },
    {
      label: 'Prolific Reviewer (Gold)',
      completed: progress.progress.prolificReviewer.gold,
      current: progress.reviewCount,
      target: 30,
      description: 'Write 30 reviews'
    },
    {
      label: 'Helpful Reviewer (Bronze)',
      completed: progress.progress.helpfulReviewer.bronze,
      current: progress.helpfulVotes,
      target: 10,
      description: 'Get 10 helpful votes'
    },
    {
      label: 'Helpful Reviewer (Silver)',
      completed: progress.progress.helpfulReviewer.silver,
      current: progress.helpfulVotes,
      target: 25,
      description: 'Get 25 helpful votes'
    },
    {
      label: 'Helpful Reviewer (Gold)',
      completed: progress.progress.helpfulReviewer.gold,
      current: progress.helpfulVotes,
      target: 50,
      description: 'Get 50 helpful votes'
    },
    {
      label: 'Detailed Reviewer',
      completed: progress.progress.detailedReviewer,
      current: progress.detailedReviews,
      target: 3,
      description: 'Write 3 detailed reviews (100+ characters)'
    },
    {
      label: 'Quality Reviewer',
      completed: progress.progress.qualityReviewer,
      current: parseFloat(progress.avgRating),
      target: 3.5,
      description: 'Maintain balanced review ratings (3-4 stars)'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Badge Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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

export const BadgeNotification: React.FC<{ badges: UserBadge[] }> = ({ badges }) => {
  if (!badges.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {badges.map((badge) => {
        const config = badgeConfig[badge.badgeType as keyof typeof badgeConfig];
        if (!config) return null;

        const Icon = config.icon;
        const levelName = levelNames[badge.badgeLevel as keyof typeof levelNames];

        return (
          <div
            key={badge.id}
            className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 animate-in slide-in-from-right-5"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${config.color}`}>
                <Icon className={`h-5 w-5 ${config.iconColor}`} />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Badge Earned!</h4>
                <p className="text-sm text-gray-600">
                  {config.name} {badge.badgeLevel > 1 && `(${levelName})`}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default { UserBadges, BadgeProgress, BadgeNotification };