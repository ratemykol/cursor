import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { CryptoAchievementBadges } from "@/components/CryptoAchievementBadges";
import { CryptoMilestoneBadge } from "@/components/CryptoMilestoneBadge";
import { SocialShareBadges } from "@/components/SocialShareBadges";

export const DemoPage = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="Demo" />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Milestone Badges & Celebration Cards Demo
        </h1>
        
        {/* Achievement Badges Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Crypto Achievement Badges</CardTitle>
            <p className="text-gray-600">Small badges that appear next to trader names based on their performance</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Top Rank Trader (Rank #1)</h3>
              <CryptoAchievementBadges 
                traderRating={4.9}
                totalRatings={75}
                rank={1}
                specialty="DeFi Expert"
              />
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Diamond Hands Trader (4.8+ rating)</h3>
              <CryptoAchievementBadges 
                traderRating={4.8}
                totalRatings={45}
                rank={3}
                specialty="Swing Trading"
              />
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Rising Star (4.0+ rating, 10+ reviews)</h3>
              <CryptoAchievementBadges 
                traderRating={4.3}
                totalRatings={15}
                rank={12}
                specialty="Day Trading"
              />
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Lightning Fast (Scalping specialist)</h3>
              <CryptoAchievementBadges 
                traderRating={4.2}
                totalRatings={25}
                rank={8}
                specialty="Scalping Expert"
              />
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Trusted Veteran (50+ reviews)</h3>
              <CryptoAchievementBadges 
                traderRating={4.6}
                totalRatings={65}
                rank={5}
                specialty="Position Trading"
              />
            </div>
          </CardContent>
        </Card>

        {/* Milestone Celebration Cards Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Milestone Celebration Cards</CardTitle>
            <p className="text-gray-600">Special animated cards that appear for top achievements with sharing functionality</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Top Rank Achievement</h3>
              <CryptoMilestoneBadge 
                traderName="Cupsey"
                milestone="top-rank"
                traderRating={4.9}
                rank={1}
              />
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Diamond Rating Achievement</h3>
              <CryptoMilestoneBadge 
                traderName="CryptoMaster"
                milestone="diamond-rating"
                traderRating={4.8}
                rank={2}
              />
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Crypto Veteran Achievement</h3>
              <CryptoMilestoneBadge 
                traderName="BlockchainPro"
                milestone="crypto-veteran"
                traderRating={4.6}
                rank={4}
              />
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Rising Star Achievement</h3>
              <CryptoMilestoneBadge 
                traderName="NewTalent"
                milestone="rising-star"
                traderRating={4.3}
                rank={15}
              />
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Social Share Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enhanced Social Share with Achievements</CardTitle>
            <p className="text-gray-600">Social sharing includes achievement summaries and crypto-themed messaging</p>
          </CardHeader>
          <CardContent>
            <SocialShareBadges 
              traderName="Cupsey"
              traderRating={4.9}
              walletAddress="suqh5sHtr8HyJ7q8scBimULPkPpA557prMG47xCHQfK"
              totalRatings={75}
              rank={1}
              specialty="DeFi Expert"
            />
          </CardContent>
        </Card>

        {/* Features Explanation */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-purple-700">Achievement Badges</h4>
              <p className="text-gray-600">Small, colorful badges that automatically appear based on trader performance metrics like rating, review count, rank, and specialty.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-purple-700">Milestone Cards</h4>
              <p className="text-gray-600">Large celebration cards with animations, gradients, and sharing buttons that appear when traders reach significant milestones.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-purple-700">Smart Sharing</h4>
              <p className="text-gray-600">Social share messages automatically include earned achievements and crypto-specific hashtags for better engagement.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};