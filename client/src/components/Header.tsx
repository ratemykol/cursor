import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  currentPage?: string;
}

export const Header = ({ currentPage }: HeaderProps): JSX.Element => {
  const [, setLocation] = useLocation();
  const [showCAOverlay, setShowCAOverlay] = useState(false);
  const { toast } = useToast();

  return (
    <>
      <header className="flex justify-between items-center px-20 pt-8 mt-[37px] mb-[37px]">
        <div className="flex items-center gap-4">
          <h1 
            className="font-medium text-[#3c315b] text-[22px] cursor-pointer" 
            onClick={() => setLocation("/")}
          >
            RateMyKOL
          </h1>
          <Button 
            className="bg-[#ab9ff2] text-[#3c315b] rounded-full transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#DCDAF0] hover:shadow-lg transform-gpu"
            onClick={() => setShowCAOverlay(true)}
          >
            CA
          </Button>
        </div>

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

      {/* CA Overlay */}
      {showCAOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => setShowCAOverlay(false)}
          />
          
          {/* Modal content */}
          <div className="relative bg-white rounded-3xl w-full max-w-md mx-4 p-8 transform transition-all duration-300 scale-100">
            <div className="text-center">
              <p 
                className="text-2xl font-semibold text-gray-800 cursor-pointer hover:text-[#ab9ff2] transition-colors duration-200"
                onClick={() => {
                  navigator.clipboard.writeText("CLICK ME FOR CA");
                  toast({
                    title: "Copied to clipboard",
                    description: "CA text copied successfully",
                  });
                }}
                title="Click to copy CA text"
              >
                CLICK ME FOR CA
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};