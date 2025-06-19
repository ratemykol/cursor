import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Star, Image, Search, TrendingUp } from "lucide-react";

export const HomePage = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
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

  // Data for trader cards
  const traders = [
    { 
      id: 1, 
      rank: 1, 
      name: "Sarah Kim",
      specialty: "NFT Expert",
      rating: 5.0,
      performance: "Verified",
      bgColor: "bg-white",
      profileImage: "/figmaAssets/trader-1.jpg"
    },
    { 
      id: 2, 
      rank: 2, 
      name: "Mike Chen",
      specialty: "DeFi Specialist",
      rating: 4.8,
      performance: "Verified",
      bgColor: "bg-white",
      profileImage: "/figmaAssets/trader-2.jpg"
    },
    { 
      id: 3, 
      rank: 3, 
      name: "Alex Rivera",
      specialty: "Crypto Analyst",
      rating: 4.9,
      performance: "Verified",
      bgColor: "bg-white",
      profileImage: "/figmaAssets/trader-3.jpg"
    },
    { 
      id: 4, 
      rank: 4, 
      name: "Emma Davis",
      specialty: "Trading Expert",
      rating: 4.7,
      performance: "Verified",
      bgColor: "bg-white",
      profileImage: "/figmaAssets/trader-4.jpg"
    },
    { 
      id: 5, 
      rank: 5, 
      name: "John Smith",
      specialty: "Meme Coin Pro",
      rating: 4.6,
      performance: "Verified",
      bgColor: "bg-white",
      profileImage: "/figmaAssets/trader-5.jpg"
    },
  ];

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
      <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
        <Header currentPage="home" />

        {/* Hero Section */}
        <section className="relative px-20 mt-[99px] mb-[99px]">
          {/* Decorative elements */}
          <img
            className="w-[73px] h-[74px] absolute left-[360px] top-[146px] mt-[-231px] mb-[-231px] ml-[-61px] mr-[-61px]"
            alt="Star"
            src="/figmaAssets/star-2.svg"
          />
          <div className="absolute w-[27px] h-[35px] top-[173px] left-[522px] bg-[#3c315b] rounded-[13.26px/17.32px] rotate-[96deg] ml-[-26px] mr-[-26px] mt-[-256px] mb-[-256px]" />
          <div className="absolute w-[73px] h-[97px] top-[265px] left-[517.08px] bg-[#ffd13f] rounded-[36.36px/48.44px] rotate-[15deg] mt-[-296px] mb-[-296px] ml-[-26px] mr-[-26px] z-[1]" />
          <div className="absolute w-[92px] h-[71px] top-[217px] left-[603px] bg-[#4a87f2] rounded-[45.85px/35.6px] rotate-[-15deg] ml-[-26px] mr-[-26px] mt-[-296px] mb-[-296px]" />
          <img
            className="absolute w-[76px] h-[61px] top-[329px] left-[1216px] mt-[-300px] mb-[-300px]"
            alt="Polygon"
            src="/figmaAssets/polygon-1.svg"
          />

          <div className="max-w-3xl mx-auto text-center relative z-[5]">
            <h2 className="font-medium text-[#3c315b] text-[69px] leading-tight">
              Rate Your Crypto KOLs
            </h2>
            <p className="font-medium text-[#9f98b3] text-[22px] mt-4">
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
                  className="absolute right-[2px] top-[2px] h-[calc(100%-4px)] w-[108px] bg-[#ab9ff2] text-[#3c315b] rounded-r-[3px] rounded-l-none font-medium transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#DCDAF0] hover:shadow-lg transform-gpu flex items-center justify-center border-0"
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
            {traders.map((trader) => (
              <Card
                key={trader.id}
                className="w-[280px] h-[400px] bg-white rounded-[20px] border border-gray-200 shadow-lg"
              >
                <CardContent className="p-6 flex flex-col h-full">
                  {/* Profile Picture */}
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-2 border-blue-200">
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-600">
                          {trader.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-bold text-blue-600 text-center mb-1">
                    {trader.name}
                  </h3>

                  {/* Specialty */}
                  <p className="text-sm text-blue-500 text-center mb-6">
                    {trader.specialty}
                  </p>

                  {/* Rating Section */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-700">Rating</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {trader.rating}
                      </span>
                    </div>
                  </div>

                  {/* Performance Section */}
                  <div className="bg-purple-50 rounded-lg p-3 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">Performance</span>
                      </div>
                      <span className="text-sm font-semibold text-green-600">
                        {trader.performance}
                      </span>
                    </div>
                  </div>

                  {/* View Profile Button */}
                  <div className="mt-auto">
                    <Button 
                      className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium text-base rounded-lg transition-all duration-300"
                      onClick={() => setLocation(`/trader/${trader.id}`)}
                    >
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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