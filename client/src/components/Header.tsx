import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface HeaderProps {
  currentPage?: string;
}

export const Header = ({ currentPage }: HeaderProps): JSX.Element => {
  const [, setLocation] = useLocation();
  const [showCAOverlay, setShowCAOverlay] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { isAdmin } = useAdmin();
  
  // Debug logging
  console.log('Header user object:', user);
  console.log('User type:', user?.userType);
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all queries to ensure fresh data after logout
      queryClient.invalidateQueries();
      toast({
        title: "Logged out successfully",
        description: "You have been signed out",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Logout failed",
        description: "Failed to sign out",
        variant: "destructive",
      });
    },
  });

  return (
    <>
      <header className="flex justify-between items-center px-32 pt-10 mt-[44px] mb-[44px]">
        <div className="flex items-center gap-6">
          <h1 
            className="font-medium text-[#3c315b] text-[28px] cursor-pointer" 
            onClick={() => setLocation("/")}
          >
            RateMyKOL
          </h1>
          <Button 
            className="bg-[#ab9ff2] text-[#3c315b] rounded-full transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#DCDAF0] hover:shadow-lg transform-gpu px-6 py-2 text-base"
            onClick={() => setShowCAOverlay(true)}
          >
            CA
          </Button>
        </div>

        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            className={`rounded-full font-medium text-[#3c315b] text-base px-6 py-2 transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#DCDAF0] hover:shadow-md ${
              currentPage === "home" ? "font-semibold bg-[#f3f1ff] shadow-sm" : ""
            }`}
            onClick={() => setLocation("/")}
          >
            Home
          </Button>
          <Button
            variant="ghost"
            className={`rounded-full font-medium text-[#3c315b] text-base px-6 py-2 transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#DCDAF0] hover:shadow-md ${
              currentPage === "search" ? "font-semibold bg-[#f3f1ff] shadow-sm" : ""
            }`}
            onClick={() => setLocation("/search")}
          >
            Search
          </Button>
          {isAdmin && (
            <Button
              variant="ghost"
              className={`rounded-full font-medium text-[#3c315b] text-base px-6 py-2 transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#DCDAF0] hover:shadow-md ${
                currentPage === "admin" ? "font-semibold bg-[#f3f1ff] shadow-sm" : ""
              }`}
              onClick={() => setLocation("/admin")}
            >
              Admin
            </Button>
          )}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-[#ab9ff2] text-[#3c315b] rounded-full transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#DCDAF0] hover:shadow-lg transform-gpu flex items-center gap-3 px-6 py-2 text-base">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.profileImageUrl} />
                    <AvatarFallback className="text-sm">
                      {user?.username?.charAt(0).toUpperCase() || user?.firstName?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {user?.username || user?.firstName || "Profile"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLocation("/profile")}>
                  My Profile
                </DropdownMenuItem>
                {user?.userType === "trader" && (
                  <DropdownMenuItem onClick={() => setLocation("/manage-trader-profile")}>
                    Manage Trader Profile
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              className="bg-[#ab9ff2] text-[#3c315b] rounded-full transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#DCDAF0] hover:shadow-lg transform-gpu"
              onClick={() => setLocation("/signin")}
            >
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* CA Overlay */}
      {showCAOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-75 transition-opacity duration-300"
            onClick={() => setShowCAOverlay(false)}
          />
          
          {/* Modal content */}
          <div className="relative bg-[#AB9FF2] rounded-3xl w-full max-w-md mx-4 p-8 transform transition-transform duration-500 ease-out animate-slide-up-center">
            <div className="text-center">
              <p 
                className="text-2xl font-semibold text-gray-800 cursor-pointer hover:text-white transition-colors duration-200"
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