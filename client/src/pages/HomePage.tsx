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
    <div className="bg-white w-full min-h-screen">
      <div className="bg-white overflow-hidden w-full relative">
        <Header currentPage="home" />

        {/* Hero Section */}
        <section className="relative px-4 sm:px-8 md:px-12 lg:px-20 mt-16 sm:mt-20 md:mt-24 lg:mt-[99px] mb-16 sm:mb-20 md:mb-24 lg:mb-[99px] overflow-hidden">
          {/* Decorative elements with zoom-responsive positioning */}
          <img
            className="absolute left-[25%] top-[20%] z-[1]"
            style={{
              width: '4.5625rem',
              height: '4.625rem'
            }}
            alt="Star"
            src="/figmaAssets/star-2.svg"
          />
          <div 
            className="absolute top-[24%] left-[36%] bg-[#3c315b] rotate-[96deg] z-[1]"
            style={{
              width: '1.6875rem',
              height: '2.1875rem',
              borderRadius: '0.8288rem/1.0825rem'
            }}
          />
          <div 
            className="absolute top-[36%] left-[36%] bg-[#ffd13f] rotate-[15deg] z-[1]"
            style={{
              width: '4.5625rem',
              height: '6.0625rem',
              borderRadius: '2.2725rem/3.0275rem'
            }}
          />
          <div 
            className="absolute top-[30%] left-[42%] bg-[#4a87f2] rotate-[-15deg] z-[1]"
            style={{
              width: '5.75rem',
              height: '4.4375rem',
              borderRadius: '2.8656rem/2.225rem'
            }}
          />
          <img
            className="absolute top-[45%] right-[15%] z-[1]"
            style={{
              width: '4.75rem',
              height: '3.8125rem'
            }}
            alt="Polygon"
            src="/figmaAssets/polygon-1.svg"
          />

          <div className="max-w-3xl mx-auto text-center relative z-[5]">
            <h2 className="font-medium text-[#3c315b] text-3xl sm:text-4xl md:text-5xl lg:text-[69px] leading-tight">
              Rate Your Crypto KOLs
            </h2>
            <p className="font-medium text-[#9f98b3] text-base sm:text-lg md:text-xl lg:text-[22px] mt-4">
              Find and review KOLs based on their performance, reliability, and
              trading strategies
            </p>
          </div>

          {/* Search Bar with Dropdown */}
          <div className="mt-16 relative max-w-3xl mx-auto z-[10]" ref={dropdownRef}>
            <div className="relative">
              <div className="relative">
                <Input
                  ref={inputRef}
                  className="h-11 rounded-[5px] border-2 border-[#9f98b3] pl-4 pr-28 w-full"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyPress={handleKeyPress}
                />
                <Button 
                  className="absolute right-0 top-0 h-full w-[108px] bg-[#ab9ff2] text-[#3c315b] rounded-r-[5px] rounded-l-none font-medium transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#DCDAF0] hover:shadow-lg transform-gpu flex items-center justify-center border-2 border-[#9f98b3] border-l-0"
                  onClick={() => {
                    if (searchQuery.trim()) {
                      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }}
                >
                  <Search size={20} />
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
        <section className="mt-96 relative">
          {/* Decorative elements - moved 400px upward */}
          <img
            className="absolute left-[2.5%] z-[1]"
            style={{
              width: '10.9375rem',
              height: '11rem',
              top: 'calc(6% - 25rem)'
            }}
            alt="Star"
            src="/figmaAssets/star-1.svg"
          />
          <div 
            className="absolute left-[-12%] bg-[#ab9ff2] rotate-[-76deg] z-[0]"
            style={{
              width: '17.6875rem',
              height: '24.75rem',
              borderRadius: '8.8375rem/12.38125rem',
              top: 'calc(10% - 25rem)'
            }}
          />
          <div 
            className="absolute left-[5%] bg-black rotate-[15deg] z-[1]"
            style={{
              width: '7.875rem',
              height: '11.625rem',
              borderRadius: '3.93125rem/5.7975rem',
              top: 'calc(12% - 25rem)'
            }}
          />
          <div 
            className="absolute left-[26%] bg-[#ffdadc] rotate-[96deg] z-[1]"
            style={{
              width: '5.9375rem',
              height: '10.3125rem',
              borderRadius: '2.976875rem/5.15875rem',
              top: 'calc(9% - 25rem)'
            }}
          />
          <div 
            className="absolute right-[11%] bg-[#ff7243] rotate-[15deg] z-[1]"
            style={{
              width: '7.875rem',
              height: '11.625rem',
              borderRadius: '3.93125rem/5.7975rem',
              top: 'calc(7% - 25rem)'
            }}
          />
          <div 
            className="absolute right-[12%] bg-[#2ec08b] rotate-[-76deg] z-[0]"
            style={{
              width: '17.6875rem',
              height: '24.75rem',
              borderRadius: '8.8375rem/12.38125rem',
              top: 'calc(10% - 25rem)'
            }}
          />
          <div 
            className="absolute right-[19%] bg-[#e2dffd] rotate-[-18deg] z-[1]"
            style={{
              width: '7.875rem',
              height: '11.625rem',
              borderRadius: '3.93125rem/5.7975rem',
              top: 'calc(9% - 25rem)'
            }}
          />
          <div 
            className="absolute right-[20%] bg-[#ffffc4] rotate-[32deg] z-[1]"
            style={{
              width: '3.25rem',
              height: '4.5625rem',
              borderRadius: '1.619375rem/2.271875rem',
              top: 'calc(11% - 25rem)'
            }}
          />
          <div 
            className="absolute right-[20%] bg-[#d9d9d9] rotate-[-15deg] z-[-1]"
            style={{
              width: '25.104rem',
              height: '16.217rem',
              borderRadius: '12.552rem/8.1085rem',
              top: 'calc(-1% - 25rem)'
            }}
          />

          <div className="text-center mb-16">
            <h2 className="font-medium text-[#3c315b] text-[69px]">
              Top Traders
            </h2>
            <p className="font-medium text-[#9f98b3] text-[22px] mt-4">
              Discover top performing meme coin traders with verified track
              records
            </p>
          </div>

          {/* Trader Cards */}
          <div className="relative w-full overflow-hidden py-8">
            <div 
              className={`trader-scroll-container flex gap-6 will-change-transform animate-scroll ${scrollPaused ? 'paused' : ''}`}
              style={{ 
                width: `${rankedTraders.length * 3 * 250}px`,
                minWidth: '100vw',
                paddingTop: '40px',
                paddingBottom: '40px'
              }}
            >
              {isLoadingTraders ? (
                // Loading skeleton
                Array.from({ length: 10 }).map((_, index) => (
                  <Card
                    key={index}
                    className={`flex-shrink-0 w-[234px] h-[420px] ${cardColors[index]} rounded-[15px] border-none shadow-none animate-pulse ml-6`}
                  >
                    <CardContent className="p-0 flex flex-col items-center px-4">
                      <div className="w-[91px] h-[97px] mt-[30px] bg-white/50 rounded-[45.5px/48.5px]" />
                      <div className="mt-4 bg-white/50 rounded-full w-16 h-6" />
                      <div className="mt-3 mb-4 bg-white/50 rounded-full w-20 h-6" />
                      <div className="mt-3 mb-4 bg-white/50 rounded-full w-24 h-6" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                // Duplicate cards for seamless scrolling
                [...rankedTraders, ...rankedTraders, ...rankedTraders].map((trader, index) => (
                  <Card
                    key={`${trader.id}-${index}`}
                    className={`flex-shrink-0 w-[234px] h-[420px] ${trader.rank === 1 ? 'diamond-background golden-shine' : trader.bgColor} rounded-[15px] border-none shadow-none relative cursor-pointer trader-card ml-6`}
                    onMouseEnter={() => setScrollPaused(true)}
                    onMouseLeave={() => setScrollPaused(false)}
                  >
                    <CardContent className="p-0 flex flex-col items-center px-4">
                      {/* Profile Image with Crown for Rank 1 */}
                      <div className="relative w-[91px] h-[97px] mt-[30px]">
                        <div className="w-full h-full bg-white rounded-[45.5px/48.5px] overflow-hidden flex items-center justify-center">
                          {trader.profileImage ? (
                            <img 
                              src={trader.profileImage} 
                              alt={trader.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image size={32} className="text-gray-400" />
                          )}
                        </div>
                        {/* Crown for Rank 1 only */}
                        {trader.rank === 1 && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <Crown className="w-8 h-8 text-yellow-500 fill-yellow-400 drop-shadow-lg" />
                          </div>
                        )}
                      </div>
                      
                      {/* Rank Tag */}
                      <div className="mt-4">
                        <span className="bg-white text-black px-3 py-1 rounded-full text-xs font-medium">
                          Rank: {trader.rank}
                        </span>
                      </div>
                      
                      {/* Name Tag */}
                      <div className="mt-3 mb-4">
                        <span className="bg-white text-black px-3 py-1 rounded-full text-xs font-medium">
                          {trader.name}
                        </span>
                      </div>
                      
                      {/* Specialty Tag */}
                      <div className="mb-4">
                        <span className="bg-white text-black px-3 py-1 rounded-full text-xs font-medium">
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