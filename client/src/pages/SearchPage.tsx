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
    queryKey: debouncedSearch ? ['/api/traders', { q: debouncedSearch }] : ['/api/traders'],
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
    <div className="bg-white min-h-screen">
      <Header currentPage="search" />

      <div className="container mx-auto px-8 py-8">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Input
              className="h-12 rounded-lg border-2 border-gray-300 pl-4 pr-20 text-lg"
              placeholder="Search by trader name or wallet address..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <div className="absolute right-2 top-2">
              <Button 
                onClick={handleSearch}
                className="h-8 bg-[#ab9ff2] text-[#3c315b] rounded-md hover:bg-[#9b8de2] px-4"
              >
                <Search size={16} className="mr-2" />
                Search
              </Button>
            </div>
          </div>
          <p className="text-center text-gray-600 text-sm mt-2">
            Search examples: "CryptoKing2024" or "0x742d35Cc6634C0532925a3b8D404fA503e8d"
          </p>
        </div>

        {/* Results count */}
        {debouncedSearch && (
          <p className="text-gray-600 mb-6">
            Found {Array.isArray(searchResults) ? searchResults.length : 0} traders matching "{debouncedSearch}"
          </p>
        )}

        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : !Array.isArray(searchResults) || searchResults.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">
              {debouncedSearch ? `No traders found matching "${debouncedSearch}"` : 'Enter a search term to find traders'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {searchResults.map((trader: any) => (
              <Card key={trader.id} className="border border-gray-200 hover:shadow-md transition-shadow">
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
                          <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 font-medium">
                            {trader.name ? trader.name.charAt(0).toUpperCase() : '?'}
                          </div>
                        )}
                      </div>
                      
                      {/* Trader Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {trader.name}
                            </h3>
                            <p className="text-gray-600 text-sm">{trader.specialty || 'Crypto Trader'}</p>
                            
                            {/* Rating Display */}
                            <div className="flex items-center gap-2 mt-1">
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
                              <p className="text-gray-700 mt-2 text-sm leading-relaxed">
                                {trader.bio}
                              </p>
                            )}
                          </div>
                        </div>
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
      </div>
    </div>
  );
};