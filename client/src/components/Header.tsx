import React from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface HeaderProps {
  currentPage?: string;
}

export const Header = ({ currentPage }: HeaderProps): JSX.Element => {
  const [, setLocation] = useLocation();

  return (
    <header className="flex justify-between items-center px-20 pt-8 mt-[37px] mb-[37px]">
      <h1 
        className="font-medium text-[#3c315b] text-[22px] cursor-pointer" 
        onClick={() => setLocation("/")}
      >
        RateMyKOL
      </h1>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          className={`rounded-full font-medium text-[#3c315b] transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#DCDAF0] hover:shadow-md ${
            currentPage === "home" ? "font-semibold bg-[#f3f1ff] shadow-sm" : ""
          }`}
          onClick={() => setLocation("/")}
        >
          Home
        </Button>
        <Button
          variant="ghost"
          className={`rounded-full font-medium text-[#3c315b] transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#DCDAF0] hover:shadow-md ${
            currentPage === "search" ? "font-semibold bg-[#f3f1ff] shadow-sm" : ""
          }`}
          onClick={() => setLocation("/search")}
        >
          Search
        </Button>
        <Button
          variant="ghost"
          className={`rounded-full font-medium text-[#3c315b] transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#DCDAF0] hover:shadow-md ${
            currentPage === "admin" ? "font-semibold bg-[#f3f1ff] shadow-sm" : ""
          }`}
          onClick={() => setLocation("/admin")}
        >
          Admin
        </Button>
        <Button className="bg-[#ab9ff2] text-[#3c315b] rounded-full transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#DCDAF0] hover:shadow-lg transform-gpu">
          Sign In
        </Button>
      </div>
    </header>
  );
};