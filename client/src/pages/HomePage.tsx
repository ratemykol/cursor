import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const HomePage = (): JSX.Element => {
  // Data for trader cards
  const traders = [
    { id: 1, rank: 1, bgColor: "bg-[#ffdadc]" },
    { id: 2, rank: 4, bgColor: "bg-[#ffffc4]" },
    { id: 3, rank: 3, bgColor: "bg-[#3c315b]" },
    { id: 4, rank: 2, bgColor: "bg-[#2ec08b]" },
    { id: 5, rank: 5, bgColor: "bg-[#4a87f2]" },
  ];

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
        {/* Header */}
        <header className="flex justify-between items-center px-20 pt-8">
          <h1 className="font-medium text-[#3c315b] text-[22px]">RateMyKOL</h1>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="rounded-full font-semibold text-[#3c315b]"
            >
              Home
            </Button>
            <Button
              variant="ghost"
              className="rounded-full font-medium text-[#3c315b]"
            >
              SearchIcon
            </Button>
            <Button className="bg-[#ab9ff2] text-[#3c315b] rounded-full hover:bg-[#9b8de2]">
              Sign In
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative mt-16 px-20 overflow-hidden">
          {/* Background decorative shapes matching Figma design */}
          
          {/* Top right area - large gray shape */}
          <div className="absolute w-[400px] h-[300px] -top-[100px] -right-[150px] bg-gray-300 rounded-[200px/150px] rotate-[20deg] opacity-30" />
          
          {/* Upper left star */}
          <img
            className="w-[60px] h-[60px] absolute left-[280px] top-[40px] opacity-40"
            alt="Star"
            src="/figmaAssets/star-2.svg"
          />
          
          {/* Small dark circle */}
          <div className="absolute w-[15px] h-[15px] top-[60px] left-[380px] bg-[#3c315b] rounded-full" />
          
          {/* Yellow circle behind title */}
          <div className="absolute w-[120px] h-[120px] top-[80px] left-[380px] bg-[#ffd13f] rounded-full opacity-90" />
          
          {/* Blue oval */}
          <div className="absolute w-[140px] h-[100px] top-[60px] left-[480px] bg-[#4a87f2] rounded-[70px/50px] opacity-90" />
          
          {/* Right diamond shape */}
          <div className="absolute w-[80px] h-[80px] top-[120px] right-[200px] bg-gray-400 transform rotate-45 opacity-40" />
          
          {/* Large left star */}
          <img
            className="w-[120px] h-[120px] absolute left-[50px] top-[180px] opacity-30"
            alt="Large Star"
            src="/figmaAssets/star-1.svg"
          />
          
          {/* Pink oval */}
          <div className="absolute w-[180px] h-[100px] top-[280px] left-[280px] bg-[#ffdadc] rounded-[90px/50px] opacity-80" />
          
          {/* Light purple oval */}
          <div className="absolute w-[200px] h-[140px] top-[320px] left-[580px] bg-[#e2dffd] rounded-[100px/70px] opacity-80" />
          
          {/* Small yellow circle */}
          <div className="absolute w-[40px] h-[40px] top-[400px] left-[580px] bg-[#ffffc4] rounded-full opacity-90" />
          
          {/* Right orange oval */}
          <div className="absolute w-[200px] h-[160px] top-[240px] right-[50px] bg-[#ff7243] rounded-[100px/80px] opacity-85" />

          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-medium text-[#3c315b] text-[69px] leading-tight">
              Rate Your Crypto KOLs
            </h2>
            <p className="font-medium text-[#9f98b3] text-[22px] mt-4">
              Find and review KOLs based on their performance, reliability, and
              trading strategies
            </p>
          </div>

          {/* SearchIcon Bar */}
          <div className="mt-16 relative max-w-3xl mx-auto">
            <div className="relative">
              <Input
                className="h-11 rounded-[5px] border-2 border-[#9f98b3] pl-4 pr-28"
                placeholder="SearchIcon..."
              />
              <div className="absolute right-0 top-0 h-full">
                <Button className="h-full bg-transparent hover:bg-transparent p-0">
                  <img
                    className="w-[104px] h-10"
                    alt="SearchIcon button"
                    src="/figmaAssets/search-button.svg"
                  />
                </Button>
              </div>
            </div>
            <p className="text-center font-medium text-[#9f98b3] text-base mt-4">
              SearchIcon examples: &#34;crypto_expert_2024&#34; or
              &#34;0x742d35Cc6634C0532925a3b8D404fA503e8d&#34;
            </p>
          </div>
        </section>

        {/* Top Traders Section */}
        <section className="mt-32 relative overflow-hidden">
          {/* Background shapes matching Figma design for bottom section */}
          
          {/* Large purple shape on left */}
          <div className="absolute w-[300px] h-[400px] -left-[100px] top-[100px] bg-[#ab9ff2] rounded-[150px/200px] opacity-90" />
          
          {/* Black oval overlapping purple */}
          <div className="absolute w-[120px] h-[160px] left-[80px] top-[180px] bg-black rounded-[60px/80px] opacity-90" />
          
          {/* Large green shape on right */}
          <div className="absolute w-[400px] h-[500px] -right-[150px] top-[150px] bg-[#2ec08b] rounded-[200px/250px] opacity-90" />

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
                className={`w-[234px] h-[348px] ${trader.bgColor} rounded-[15px] border-none shadow-none`}
              >
                <CardContent className="p-0 flex flex-col items-center">
                  <div className="w-[91px] h-[97px] mt-[30px] bg-white rounded-[45.5px/48.5px]" />
                  <div className="font-medium text-black text-sm text-center mt-4">
                    Rank: {trader.rank}
                  </div>
                  <div className="mt-auto mb-6">
                    <Button className="w-[168px] h-12 bg-[#ab9ff2] text-black hover:bg-[#9b8de2] font-medium text-lg">
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full h-[457px] bg-[#ab9ff2] mt-32" />
      </div>
    </div>
  );
};
