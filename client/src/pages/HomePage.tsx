import React, { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Star, Image, Search } from "lucide-react";

export const HomePage = (): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [, setLocation] = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search for traders based on query
  const { data: searchResults = [] } = useQuery({
    queryKey: ["/api/traders", { search: searchQuery }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }
      return fetch(`/api/traders?${params}`).then((res) => res.json());
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
    return sorted.slice(0, 5).map((trader: any, index: number) => ({
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

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      <Header currentPage="home" />
      
      {/* Background Elements */}
      <div className="absolute w-[283px] h-[396px] top-[20px] left-[-174px] bg-[#ab9ff2] rounded-[141.4px/198.1px] rotate-[-76deg] z-10" />
      <div className="absolute w-[126px] h-[186px] top-[83px] left-[78px] bg-black rounded-[62.9px/92.76px] rotate-[15deg] z-10" />
      <div className="absolute w-[95px] h-[165px] top-[-73px] left-[382px] bg-[#ffdadc] rounded-[47.63px/82.54px] rotate-[96deg] ml-[-28px] mr-[-28px] z-10" />
      <div className="absolute w-[126px] h-[186px] top-[-219px] left-[1285px] bg-[#ff7243] rounded-[62.9px/92.76px] rotate-[15deg] ml-[-230px] mr-[-230px] z-10" />
      <div className="absolute w-[283px] h-[396px] top-[5px] left-[1256px] bg-[#2ec08b] rounded-[141.4px/198.1px] rotate-[-76deg] z-10" />
      <div className="absolute w-[126px] h-[186px] top-[-86px] left-[1031px] bg-[#e2dffd] rounded-[62.9px/92.76px] rotate-[-18deg] ml-[-258px] mr-[-258px] z-10" />
      <div className="absolute w-[52px] h-[73px] top-[33px] left-[1009px] bg-[#ffffc4] rounded-[25.91px/36.35px] rotate-[32deg] ml-[-249px] mr-[-249px] z-10" />
      <div className="absolute w-[401.66px] h-[259.47px] top-[-20px] left-[1100px] bg-[#d9d9d9] rounded-[200.83px/129.735px] rotate-[-15deg] z-[1]" />

      <div className="relative z-20">
        {/* Hero Section */}
        <section className="px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold text-black mb-6">
              Rate My KOL
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              Discover and rate the best Key Opinion Leaders in crypto
            </p>

            {/* Search Bar with Dropdown */}
            <div className="relative max-w-2xl mx-auto" ref={dropdownRef}>
              <div className="flex">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search traders by name or wallet address..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyPress}
                  className="flex-1 h-14 text-lg px-6 rounded-l-lg border-r-0 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Button 
                  onClick={handleSearchSubmit}
                  className="h-14 px-6 bg-white text-black border border-l-0 rounded-r-lg rounded-l-none hover:bg-[#AB9FF2] transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg transform-gpu"
                >
                  <Search size={20} />
                </Button>
              </div>

              {/* Dropdown Results */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-80 overflow-y-auto z-50">
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
                </div>
              )}

            <p className="text-center font-medium text-[#9f98b3] text-base mt-4">
              Search examples: "crypto_expert_2024" or
              "0x742d35Cc6634C0532925a3b8D404fA503e8d"
            </p>
            </div>
          </div>
        </section>

        {/* Top Traders Section */}
        <section className="mt-96 relative">
          {/* Decorative elements */}
          <img
            className="w-[175px] h-44 absolute left-[39px] top-[392px] mt-[-1013px] mb-[-1013px]"
            alt="Star"
            src="/figmaAssets/star-1.svg"
          />
          <div className="absolute w-[283px] h-[396px] top-[693px] left-[-174px] bg-[#ab9ff2] rounded-[141.4px/198.1px] rotate-[-76deg] mt-[-1000px] mb-[-1000px]" />
          <div className="absolute w-[126px] h-[186px] top-[756px] left-[78px] bg-black rounded-[62.9px/92.76px] rotate-[15deg] mt-[-932px] mb-[-932px]" />
          <div className="absolute w-[95px] h-[165px] top-[600px] left-[382px] bg-[#ffdadc] rounded-[47.63px/82.54px] rotate-[96deg] mt-[-959px] mb-[-959px] ml-[-28px] mr-[-28px]" />
          <div className="absolute w-[126px] h-[186px] top-[454px] left-[1285px] bg-[#ff7243] rounded-[62.9px/92.76px] rotate-[15deg] mt-[-938px] mb-[-938px] ml-[-230px] mr-[-230px] z-[1]" />
          <div className="absolute w-[283px] h-[396px] top-[678px] left-[1256px] bg-[#2ec08b] rounded-[141.4px/198.1px] rotate-[-76deg] mt-[-827px] mb-[-827px]" />
          <div className="absolute w-[126px] h-[186px] top-[587px] left-[1031px] bg-[#e2dffd] rounded-[62.9px/92.76px] rotate-[-18deg] mt-[-838px] mb-[-838px] ml-[-258px] mr-[-258px]" />
          <div className="absolute w-[52px] h-[73px] top-[706px] left-[1009px] bg-[#ffffc4] rounded-[25.91px/36.35px] rotate-[32deg] ml-[-249px] mr-[-249px] mt-[-834px] mb-[-834px]" />
          <div className="absolute w-[401.66px] h-[259.47px] top-[-20px] left-[1100px] bg-[#d9d9d9] rounded-[200.83px/129.735px] rotate-[-15deg] z-[-1]" />

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
          <div className="flex justify-center gap-6 px-4">
            {isLoadingTraders ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <Card
                  key={index}
                  className={`w-[234px] h-[420px] ${cardColors[index]} rounded-[15px] border-none shadow-none animate-pulse`}
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
              rankedTraders.map((trader) => (
                <Card
                  key={trader.id}
                  className={`w-[234px] h-[420px] ${trader.bgColor} rounded-[15px] border-none shadow-none`}
                >
                  <CardContent className="p-0 flex flex-col items-center px-4">
                    {/* Profile Image */}
                    <div className="w-[91px] h-[97px] mt-[30px] bg-white rounded-[45.5px/48.5px] overflow-hidden flex items-center justify-center">
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
                        <span className="text-green-500 text-sm">📈</span>
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
        </section>

        {/* Spacer */}
        <div className="h-64"></div>
        
        {/* Footer */}
        <footer className="w-full h-[800px] bg-[#ab9ff2] mt-80" />
      </div>
    </div>
  );
};