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
  CheckCircle,
  Share2,
  Twitter,
  Facebook,
  Linkedin
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

// Social media sharing utility functions
const shareBadgeAchievement = (badgeName: string, level: string, platform: string) => {
  const text = `🏆 Just earned the ${badgeName} ${level} badge on RateMyKOL! Join me in discovering top crypto traders. #RateMyKOL #CryptoTrading #Achievement`;
  const url = window.location.origin;
  
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

// Share dropdown component
const ShareDropdown: React.FC<{ badgeName: string; level: string; isOpen: boolean; onToggle: (open: boolean) => void }> = ({ badgeName, level, isOpen, onToggle }) => {
  return (
    <div 
      className="relative"
      onMouseEnter={() => onToggle(true)}
      onMouseLeave={() => onToggle(false)}
    >
      <button
        className="absolute bottom-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 flex items-center justify-center"
      >
        <Share2 className="h-3 w-3 text-gray-700" />
      </button>
      
      {isOpen && (
        <div className="absolute bottom-10 right-0 z-20 bg-white rounded-lg shadow-lg border p-2 min-w-[120px]">
          <div className="space-y-1">
            <button
              onClick={() => {
                shareBadgeAchievement(badgeName, level, 'twitter');
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

export const UserBadges: React.FC<{ userId: string }> = ({ userId }) => {
  const [openShareId, setOpenShareId] = React.useState<number | null>(null);
  const { data: badges = [], isLoading } = useQuery<UserBadge[]>({
    queryKey: [`/api/badges/user/${userId}`],
    enabled: !!userId
  });

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>;
  }

  if (!badges.length) {
    return (
      <div className="text-center py-4 text-gray-500">
        <Award className="mx-auto h-8 w-8 mb-2 opacity-50" />
        <p>No badges earned yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {badges.map((badge) => {
        const config = badgeConfig[badge.badgeType as keyof typeof badgeConfig];
        if (!config) return null;

        const Icon = config.icon;
        const levelColor = levelColors[badge.badgeLevel as keyof typeof levelColors];
        const levelName = levelNames[badge.badgeLevel as keyof typeof levelNames];

        return (
          <div
            key={badge.id}
            className={`group relative p-3 border-2 rounded-lg ${levelColor} transition-all duration-200 hover:scale-105`}
            onMouseEnter={() => setOpenShareId(badge.id)}
            onMouseLeave={() => setOpenShareId(null)}
          >
            <ShareDropdown 
              badgeName={config.name} 
              level={badge.badgeLevel > 1 ? levelName : ''}
              isOpen={openShareId === badge.id}
              onToggle={(open) => setOpenShareId(open ? badge.id : null)}
            />
            <div className="flex flex-col items-center text-center">
              <div className={`p-2 rounded-full ${config.color} mb-2`}>
                <Icon className={`h-4 w-4 ${config.iconColor}`} />
              </div>
              <h4 className="font-semibold text-xs mb-1">{config.name}</h4>
              {badge.badgeLevel > 1 && (
                <Badge variant="outline" className="text-xs mb-1">
                  {levelName}
                </Badge>
              )}
              <p className="text-xs text-gray-600 leading-tight">{config.description}</p>
            </div>
          </div>
        );
      })}
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
      target: 5,
      description: 'Write 5 detailed reviews (80+ characters)'
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