import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Star } from "lucide-react";
import { Header } from "@/components/Header";

export const SearchPage = (): JSX.Element => {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const query = searchParams.get('q') || '';

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['/api/traders', { q: query }],
    enabled: !!query,
  });

  return (
    <div className="bg-white min-h-screen">
      <Header currentPage="search" />

      <div className="container mx-auto px-8 py-8">
        <h2 className="text-2xl font-bold mb-6">
          {query ? `Search results for "${query}"` : 'All Crypto Traders'}
        </h2>

        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : !searchResults || searchResults.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No traders found matching your search.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {searchResults.map((trader: any) => (
              <Card key={trader.id} className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-start justify-between">
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