import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Star, Search } from "lucide-react";
import { Header } from "@/components/Header";

export const SearchPage = (): JSX.Element => {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const initialQuery = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(initialQuery);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['/api/traders/search-by-name', debouncedSearch],
    queryFn: async () => {
      const query = debouncedSearch.trim();
      if (!query) return [];
      
      const url = new URL('/api/traders/search-by-name', window.location.origin);
      url.searchParams.set('q', query);
      
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: true
  });

  const handleSearch = () => {
    if (searchInput.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    } else {
      setLocation('/search');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating 
            ? "fill-yellow-400 text-yellow-400" 
            : "fill-gray-200 text-gray-200"
        }`}
      />
    ));
  };

  return (
    <div className="bg-gray-50 min-h-screen relative">
      <Header currentPage="search" />
      {/* Decorative background elements */}
      <img
        className="w-[73px] h-[74px] absolute left-[360px] top-[200px] z-[1]"
        alt="Star"
        src="/figmaAssets/star-2.svg"
      />
      <div className="absolute w-[27px] h-[35px] top-[250px] left-[520px] bg-[#3c315b] rounded-[13.26px/17.32px] rotate-[96deg] z-[1]" />
      <div className="absolute w-[73px] h-[97px] top-[300px] left-[480px] bg-[#ffd13f] rounded-[36.36px/48.44px] rotate-[15deg] z-[1]" />
      <div className="absolute w-[92px] h-[71px] top-[180px] left-[1100px] bg-[#4a87f2] rounded-[45.85px/35.6px] rotate-[-15deg] z-[1]" />
      <img
        className="absolute w-[76px] h-[61px] top-[350px] left-[1200px] z-[1]"
        alt="Polygon"
        src="/figmaAssets/polygon-1.svg"
      />
      <div className="absolute w-[45px] h-[60px] top-[400px] left-[200px] bg-[#ab9ff2] rounded-[22.5px/30px] rotate-[45deg] z-[1]" />
      <div className="absolute w-[35px] h-[45px] top-[180px] left-[150px] bg-[#ff7243] rounded-[17.5px/22.5px] rotate-[-30deg] z-[1]" />
      <div className="absolute w-[282px] h-[396px] top-[500px] left-[1150px] bg-[#2ec08b] rounded-[141px/198px] rotate-[-76deg] z-[1] ml-[-1280px] mr-[-1280px]" />
      <div className="absolute w-[125.7px] h-[185.51px] top-[300px] left-[800px] rounded-[62.85px/92.755px] rotate-[15deg] z-[1] ml-[-864px] mr-[-864px] bg-[#000000] mt-[-31px] mb-[-31px]" />
      <div className="absolute w-[282px] h-[396px] top-[200px] left-[50px] bg-[#ab9ff2] rounded-[141px/198px] rotate-[-76deg] z-[1] ml-[1200px] mr-[1200px] mt-[441px] mb-[441px]" />
      <div className="container mx-auto px-8 py-8 relative z-[5]">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Input
              className="h-11 rounded-[5px] border-2 border-[#9f98b3] pl-4 pr-28 w-full"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button 
              className="absolute right-0 top-0 h-full w-[108px] bg-[#ab9ff2] text-[#3c315b] rounded-r-[5px] rounded-l-none font-medium transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#DCDAF0] hover:shadow-lg transform-gpu flex items-center justify-center border-2 border-[#9f98b3] border-l-0"
              onClick={handleSearch}
            >
              <Search size={20} />
            </Button>
          </div>
        </div>

        {/* Empty State - Show when no search input */}
        {!debouncedSearch && (
          <div className="max-w-2xl mx-auto">
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-12 text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Search for Crypto Traders
                </h2>
                <p className="text-gray-600">
                  Enter a trader name or wallet address to find reviews and ratings.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search Results State */}
        {debouncedSearch && (
          <>
            {/* Results count */}
            <p className="text-gray-600 mb-6">
              Found {Array.isArray(searchResults) ? searchResults.length : 0} traders matching "{debouncedSearch}"
            </p>

            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : !Array.isArray(searchResults) || searchResults.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  No traders found matching "{debouncedSearch}"
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((trader: any) => (
                  <Card key={trader.id} className="border border-gray-200 hover:shadow-md transition-shadow bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Profile Image */}
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                            {trader.profileImage ? (
                              <img 
                                src={trader.profileImage} 
                                alt={trader.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 font-medium text-xl">
                                {trader.name ? trader.name.charAt(0).toUpperCase() : '?'}
                              </div>
                            )}
                          </div>
                          
                          {/* Trader Info */}
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                              {trader.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">{trader.specialty || 'Crypto Trader'}</p>
                            
                            {/* Rating Display */}
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex">
                                {renderStars(Math.round(trader.averageRating || 0))}
                              </div>
                              <span className="text-lg font-semibold">{trader.averageRating?.toFixed(1) || '0.0'}</span>
                              <span className="text-gray-500 text-sm">{trader.totalRatings || 0} reviews</span>
                              {trader.featured && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Featured</span>
                              )}
                            </div>
                            
                            {/* Bio/Description */}
                            {trader.bio && (
                              <p className="text-gray-700 text-sm leading-relaxed">
                                {trader.bio}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* View Profile Button */}
                        <div className="ml-6">
                          <Link href={`/trader/${trader.id}`}>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
                              View Profile
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};