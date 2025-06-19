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
        <header className="flex justify-between items-center px-20 pt-8 mt-[37px] mb-[37px]">
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
        <section className="relative px-20 mt-[99px] mb-[99px]">
          {/* Decorative elements */}
          <img
            className="w-[73px] h-[74px] absolute left-[360px] top-[146px] mt-[-231px] mb-[-231px] ml-[-61px] mr-[-61px]"
            alt="Star"
            src="/figmaAssets/star-2.svg"
          />
          <div className="absolute w-[27px] h-[35px] top-[173px] left-[522px] bg-[#3c315b] rounded-[13.26px/17.32px] rotate-[96deg] ml-[-26px] mr-[-26px] mt-[-256px] mb-[-256px]" />
          <div className="absolute w-[73px] h-[97px] top-[265px] left-[517.08px] bg-[#ffd13f] rounded-[36.36px/48.44px] rotate-[15deg] mt-[-296px] mb-[-296px] ml-[-26px] mr-[-26px]" />
          <div className="absolute w-[92px] h-[71px] top-[217px] left-[603px] bg-[#4a87f2] rounded-[45.85px/35.6px] rotate-[-15deg] ml-[-26px] mr-[-26px] mt-[-296px] mb-[-296px]" />
          <img
            className="absolute w-[76px] h-[61px] top-[329px] left-[1216px] mt-[-300px] mb-[-300px]"
            alt="Polygon"
            src="/figmaAssets/polygon-1.svg"
          />

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
          <div className="absolute w-[126px] h-[186px] top-[454px] left-[1285px] bg-[#ff7243] rounded-[62.9px/92.76px] rotate-[15deg] mt-[-938px] mb-[-938px] ml-[-230px] mr-[-230px]" />
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

        {/* Spacer */}
        <div className="h-64"></div>
        
        {/* Footer */}
        <footer className="w-full h-[800px] bg-[#ab9ff2] mt-80" />
      </div>
    </div>
  );
};
