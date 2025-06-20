import React, { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Star, Image, Search, TrendingUp, Crown } from "lucide-react";

export const HomePage = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrollPaused, setScrollPaused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch search results when search query exists
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['/api/traders', searchQuery.trim()],
    queryFn: async () => {
      const query = searchQuery.trim();
      if (!query) return [];
      
      const url = new URL('/api/traders', window.location.origin);
      url.searchParams.set('q', query);
      
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: searchQuery.trim().length > 0,
  });

  // Fetch all traders for cards
  const { data: allTraders, isLoading: isLoadingTraders } = useQuery({
    queryKey: ["/api/traders"],
  });

  // Background colors for trader cards
  const cardColors = [
    "bg-[#ffdadc]",
    "bg-[#ffffc4]", 
    "bg-[#3c315b]",
    "bg-[#2ec08b]",
    "bg-[#4a87f2]",
    "bg-[#FFD13F]",
    "bg-[#FFC0B6]",
    "bg-[#FC5655]",
    "bg-[#E8E6E2]",
    "bg-[#FFDADC]",
  ];

  // Process and rank traders
  const rankedTraders = useMemo(() => {
    if (!allTraders || !Array.isArray(allTraders)) return [];
    
    // Sort by average rating (desc), then by number of 5-star ratings (desc)
    const sorted = [...allTraders].sort((a: any, b: any) => {
      // First compare by average rating
      const ratingDiff = (b.averageRating || 0) - (a.averageRating || 0);
      if (ratingDiff !== 0) return ratingDiff;
      
      // If tied, compare by number of 5-star ratings
      return (b.fiveStarCount || 0) - (a.fiveStarCount || 0);
    });
    
    // Add rank and background color to each trader
    return sorted.slice(0, 10).map((trader: any, index: number) => ({
      ...trader,
      rank: index + 1,
      bgColor: cardColors[index] || "bg-gray-200"
    }));
  }, [allTraders]);

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Show/hide dropdown based on search query and focus
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleTraderSelect = (traderId: number) => {
    setShowDropdown(false);
    setSearchQuery("");
    setLocation(`/trader/${traderId}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white overflow-hidden w-full max-w-[1920px] relative">
        <Header currentPage="home" />

        {/* Hero Section */}
        <section className="relative px-32 mt-[120px] mb-[120px]">
          {/* Decorative elements - scaled for 1920x1080 */}
          <img
            className="w-[90px] h-[91px] absolute left-[480px] top-[146px] mt-[-231px] mb-[-231px] ml-[-61px] mr-[-61px]"
            alt="Star"
            src="/figmaAssets/star-2.svg"
          />
          <div className="absolute w-[32px] h-[42px] top-[173px] left-[670px] bg-[#3c315b] rounded-[13.26px/17.32px] rotate-[96deg] ml-[-26px] mr-[-26px] mt-[-256px] mb-[-256px]" />
          <div className="absolute w-[72px] h-[96px] top-[265px] left-[664px] bg-[#ffd13f] rounded-full rotate-[15deg] mt-[-296px] mb-[-296px] ml-[-26px] mr-[-26px] z-[1]" />
          <div className="absolute w-[110px] h-[85px] top-[217px] left-[770px] bg-[#4a87f2] rounded-[45.85px/35.6px] rotate-[-15deg] ml-[-26px] mr-[-26px] mt-[-296px] mb-[-296px]" />
          <img
            className="absolute w-[92px] h-[73px] top-[329px] left-[1520px] mt-[-300px] mb-[-300px]"
            alt="Polygon"
            src="/figmaAssets/polygon-1.svg"
          />

          <div className="max-w-4xl mx-auto text-center relative z-[5]">
            <h2 className="font-medium text-[#3c315b] text-[82px] leading-tight">
              Rate Your Crypto KOLs
            </h2>
            <p className="font-medium text-[#9f98b3] text-[26px] mt-6">
              Find and review KOLs based on their performance, reliability, and
              trading strategies
            </p>
          </div>

          {/* Search Bar with Dropdown */}
          <div className="mt-20 relative max-w-4xl mx-auto z-[10]" ref={dropdownRef}>
            <div className="relative">
              <div className="relative">
                <Input
                  ref={inputRef}
                  className="h-14 rounded-[6px] border-2 border-[#9f98b3] pl-6 pr-32 w-full text-lg"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyPress={handleKeyPress}
                />
                <Button 
                  className="absolute right-0 top-0 h-full w-[128px] bg-[#ab9ff2] text-[#3c315b] rounded-r-[6px] rounded-l-none font-medium transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#DCDAF0] hover:shadow-lg transform-gpu flex items-center justify-center border-2 border-[#9f98b3] border-l-0 text-lg"
                  onClick={() => {
                    if (searchQuery.trim()) {
                      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }}
                >
                  <Search size={24} />
                </Button>
              </div>
            </div>

            {/* Dropdown Results */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto z-50">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">Loading...</div>
                ) : !Array.isArray(searchResults) || searchResults.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-red-500 font-medium">No Results</p>
                  </div>
                ) : (
                  <div>
                    {searchResults.map((trader: any) => (
                      <div
                        key={trader.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleTraderSelect(trader.id)}
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          {trader.profileImage ? (
                            <img 
                              src={trader.profileImage} 
                              alt={trader.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-300">
                              <Image size={16} className="text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {trader.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {trader.walletAddress}
                          </div>
                        </div>
                        {/* Rating display on the right */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Star
                            className="w-3 h-3 fill-yellow-400 text-yellow-400"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {trader.averageRating ? trader.averageRating.toFixed(1) : '0.0'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <p className="text-center font-medium text-[#9f98b3] text-base mt-4">
              Search examples: &#34;crypto_expert_2024&#34; or
              &#34;0x742d35Cc6634C0532925a3b8D404fA503e8d&#34;
            </p>
          </div>
        </section>

        {/* Top Traders Section */}
        <section className="mt-[480px] relative">
          {/* Decorative elements - scaled for 1920x1080 */}
          <img
            className="w-[210px] h-[200px] absolute left-[60px] top-[470px] mt-[-1213px] mb-[-1213px]"
            alt="Star"
            src="/figmaAssets/star-1.svg"
          />
          <div className="absolute w-[340px] h-[475px] top-[830px] left-[-209px] bg-[#ab9ff2] rounded-[169.7px/237.8px] rotate-[-76deg] mt-[-1200px] mb-[-1200px]" />
          <div className="absolute w-[150px] h-[223px] top-[907px] left-[94px] bg-black rounded-[75.5px/111.3px] rotate-[15deg] mt-[-1118px] mb-[-1118px]" />
          <div className="absolute w-[114px] h-[198px] top-[720px] left-[458px] bg-[#ffdadc] rounded-[57.2px/99px] rotate-[96deg] mt-[-1151px] mb-[-1151px] ml-[-34px] mr-[-34px]" />
          <div className="absolute w-[150px] h-[223px] top-[545px] left-[1620px] bg-[#ff7243] rounded-[75.5px/111.3px] rotate-[15deg] mt-[-1126px] mb-[-1126px] ml-[-276px] mr-[-276px] z-[1]" />
          <div className="absolute w-[340px] h-[475px] top-[814px] left-[1587px] bg-[#2ec08b] rounded-[169.7px/237.8px] rotate-[-76deg] mt-[-992px] mb-[-992px]" />
          <div className="absolute w-[150px] h-[223px] top-[704px] left-[1307px] bg-[#e2dffd] rounded-[75.5px/111.3px] rotate-[-18deg] mt-[-1006px] mb-[-1006px] ml-[-310px] mr-[-310px]" />
          <div className="absolute w-[62px] h-[88px] top-[847px] left-[1281px] bg-[#ffffc4] rounded-[31.1px/43.6px] rotate-[32deg] ml-[-299px] mr-[-299px] mt-[-1001px] mb-[-1001px]" />
          <div className="absolute w-[482px] h-[311px] top-[-24px] left-[1380px] bg-[#d9d9d9] rounded-[241px/155.6px] rotate-[-15deg] z-[-1]" />

          <div className="text-center mb-20">
            <h2 className="font-medium text-[#3c315b] text-[82px]">
              Top Traders
            </h2>
            <p className="font-medium text-[#9f98b3] text-[26px] mt-6">
              Discover top performing meme coin traders with verified track
              records
            </p>
          </div>

          {/* Trader Cards */}
          <div className="relative w-full overflow-hidden py-10">
            <div 
              className={`trader-scroll-container flex gap-8 will-change-transform animate-scroll ${scrollPaused ? 'paused' : ''}`}
              style={{ 
                width: `${rankedTraders.length * 3 * 300}px`,
                minWidth: '100vw',
                paddingTop: '50px',
                paddingBottom: '50px'
              }}
            >
              {isLoadingTraders ? (
                // Loading skeleton
                Array.from({ length: 10 }).map((_, index) => (
                  <Card
                    key={index}
                    className={`flex-shrink-0 w-[280px] h-[500px] ${cardColors[index]} rounded-[18px] border-none shadow-none animate-pulse ml-8`}
                  >
                    <CardContent className="p-0 flex flex-col items-center px-5">
                      <div className="w-[109px] h-[116px] mt-[36px] bg-white/50 rounded-[54.5px/58px]" />
                      <div className="mt-5 bg-white/50 rounded-full w-20 h-7" />
                      <div className="mt-4 mb-5 bg-white/50 rounded-full w-24 h-7" />
                      <div className="mt-4 mb-5 bg-white/50 rounded-full w-28 h-7" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                // Duplicate cards for seamless scrolling
                [...rankedTraders, ...rankedTraders, ...rankedTraders].map((trader, index) => (
                  <Card
                    key={`${trader.id}-${index}`}
                    className={`flex-shrink-0 w-[280px] h-[500px] ${trader.rank === 1 ? 'diamond-background golden-shine' : trader.bgColor} rounded-[18px] border-none shadow-none relative cursor-pointer trader-card ml-8`}
                    onMouseEnter={() => setScrollPaused(true)}
                    onMouseLeave={() => setScrollPaused(false)}
                  >
                    <CardContent className="p-0 flex flex-col items-center px-5">
                      {/* Profile Image with Crown for Rank 1 */}
                      <div className="relative w-[109px] h-[116px] mt-[36px]">
                        <div className="w-full h-full bg-white rounded-[54.5px/58px] overflow-hidden flex items-center justify-center">
                          {trader.profileImage ? (
                            <img 
                              src={trader.profileImage} 
                              alt={trader.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image size={38} className="text-gray-400" />
                          )}
                        </div>
                        {/* Crown for Rank 1 only */}
                        {trader.rank === 1 && (
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <Crown className="w-10 h-10 text-yellow-500 fill-yellow-400 drop-shadow-lg" />
                          </div>
                        )}
                      </div>
                      
                      {/* Rank Tag */}
                      <div className="mt-5">
                        <span className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium">
                          Rank: {trader.rank}
                        </span>
                      </div>
                      
                      {/* Name Tag */}
                      <div className="mt-4 mb-5">
                        <span className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium">
                          {trader.name}
                        </span>
                      </div>
                      
                      {/* Specialty Tag */}
                      <div className="mb-5">
                        <span className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium">
                          {trader.specialty || 'Crypto Expert'}
                        </span>
                      </div>
                      
                      {/* Rating Section */}
                      <div className="flex items-center justify-between w-full mb-3">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-black">Rating</span>
                        </div>
                        <span className="text-lg font-bold text-black">
                          {trader.averageRating ? trader.averageRating.toFixed(1) : '0.0'}
                        </span>
                      </div>
                      
                      {/* Performance Section */}
                      <div className="flex items-center justify-between w-full mb-6">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-black">Performance</span>
                        </div>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          Verified
                        </span>
                      </div>
                      
                      {/* View Profile Button */}
                      <div className="flex justify-center w-full">
                        <Button 
                          onClick={() => setLocation(`/trader/${trader.id}`)}
                          className="w-[168px] h-12 bg-white text-black font-medium text-lg transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#AB9FF2] hover:shadow-lg transform-gpu"
                        >
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Spacer */}
        <div className="h-64"></div>
        
        {/* Footer */}
        <footer className="w-full h-[400px] bg-[#ab9ff2] mt-80" />
      </div>
    </div>
  );
};