import React, { useState } from "react";
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
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: query ? ['/api/traders', { q: query }] : ['/api/traders'],
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

        <h2 className="text-2xl font-bold mb-6">
          {query ? `Search results for "${query}"` : 'All Crypto Traders'}
        </h2>

        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : !Array.isArray(searchResults) || searchResults.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No traders found matching your search.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {Array.isArray(searchResults) && searchResults.map((trader: any) => (
              <Card key={trader.id} className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {trader.profileImage ? (
                          <img 
                            src={trader.profileImage} 
                            alt={trader.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-300">
                            <div className="w-8 h-8 bg-gray-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <Link href={`/trader/${trader.id}`}>
                          <h3 className="text-xl font-bold text-blue-600 hover:underline">
                            {trader.name}
                          </h3>
                        </Link>
                        <p className="text-gray-600">{trader.specialty || 'Crypto Trading'}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Wallet: {trader.walletAddress}
                        </p>
                        {trader.bio && (
                          <p className="text-gray-700 mt-2">{trader.bio}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 ml-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold">N/A</div>
                        <div className="text-sm text-gray-600">Overall Quality</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold">N/A</div>
                        <div className="text-sm text-gray-600">Level of Difficulty</div>
                      </div>
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