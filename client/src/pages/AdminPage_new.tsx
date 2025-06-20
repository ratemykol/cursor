import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/Header";
import { Edit, Plus, Save, X, Upload, Image, Trash2, RefreshCw } from "lucide-react";

export const AdminPage = (): JSX.Element => {
  const { isAuthenticated } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const [view, setView] = useState<"list" | "create" | "edit" | "reviews" | "users" | "kolscan">("list");
  const [editingTrader, setEditingTrader] = useState<any>(null);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [reviewSearch, setReviewSearch] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingUsername, setEditingUsername] = useState("");
  const [userSearch, setUserSearch] = useState("");
  
  const [name, setName] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [bio, setBio] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [verified, setVerified] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: traders, isLoading } = useQuery({
    queryKey: ["/api/traders"],
    enabled: view === "list",
  });

  const { data: reviews } = useQuery({
    queryKey: ["/api/admin/ratings"],
    enabled: view === "reviews",
  });

  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: view === "users",
  });

  // Kolscan data query
  const { data: kolscanData, isLoading: kolscanLoading, refetch: refetchKolscan } = useQuery({
    queryKey: ["/api/admin/kolscan-leaderboard"],
    enabled: view === "kolscan",
    retry: false,
  });

  // Check authentication and admin status
  if (adminLoading) {
    return (
      <div className="bg-white flex flex-row justify-center w-full">
        <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
          <Header currentPage="admin" />
          <div className="flex justify-center items-center min-h-[calc(100vh-200px)] px-20">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-white w-full min-h-screen">
        <div className="bg-white overflow-hidden w-full max-w-[1440px] relative mx-auto">
          <Header currentPage="admin" />
          <div className="flex justify-center items-center min-h-[calc(100vh-200px)] px-20">
            <Card className="w-full max-w-md">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-semibold text-gray-900">Access Denied</h2>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-white w-full min-h-screen">
        <div className="bg-white overflow-hidden w-full max-w-[1440px] relative mx-auto">
          <Header currentPage="admin" />
          <div className="flex justify-center items-center min-h-[calc(100vh-200px)] px-20">
            <Card className="w-full max-w-md">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Access Denied</h2>
                <p className="text-gray-600 mb-6">You don't have permission to access the admin panel.</p>
                <Button onClick={() => window.location.href = "/"} className="bg-[#ab9ff2] text-white">
                  Go to Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Navigation component
  const NavigationTabs = () => (
    <div className="flex gap-6 mb-8">
      <Button 
        variant={view === "list" ? "default" : "outline"}
        onClick={() => setView("list")}
        className="text-lg px-6 py-3"
      >
        Manage Traders
      </Button>
      <Button 
        variant={view === "reviews" ? "default" : "outline"}
        onClick={() => setView("reviews")}
        className="text-lg px-6 py-3"
      >
        Manage Reviews
      </Button>
      <Button 
        variant={view === "users" ? "default" : "outline"}
        onClick={() => setView("users")}
        className="text-lg px-6 py-3"
      >
        Manage Users
      </Button>
      <Button 
        variant={view === "kolscan" ? "default" : "outline"}
        onClick={() => setView("kolscan")}
        className="text-lg px-6 py-3"
      >
        Kolscan Data
      </Button>
    </div>
  );

  // Kolscan Data View
  if (view === "kolscan") {
    return (
      <div className="bg-white w-full min-h-screen">
        <div className="bg-white min-h-screen max-w-[1920px] mx-auto">
          <Header currentPage="admin" />
          <div className="container mx-auto px-16 py-12">
            <NavigationTabs />

            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Kolscan Leaderboard Data</h1>
              <Button 
                onClick={() => refetchKolscan()}
                disabled={kolscanLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw size={16} className={kolscanLoading ? "animate-spin" : ""} />
                {kolscanLoading ? "Loading..." : "Refresh Data"}
              </Button>
            </div>

            {kolscanLoading ? (
              <div className="text-center py-8">Loading kolscan data...</div>
            ) : (kolscanData as any)?.success === false ? (
              <Card className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-red-600 mb-2">Failed to Load Data</h3>
                  <p className="text-gray-600 mb-4">{(kolscanData as any).error || "Unable to fetch kolscan leaderboard data"}</p>
                  <Button onClick={() => refetchKolscan()}>Try Again</Button>
                </div>
              </Card>
            ) : (kolscanData as any)?.traders && (kolscanData as any).traders.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Traders Found: {(kolscanData as any).traders.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Name</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Wallet Address</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Twitter</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(kolscanData as any).traders.map((trader: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3">
                              {trader.name || 'N/A'}
                            </td>
                            <td className="border border-gray-300 px-4 py-3">
                              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                {trader.walletAddress || 'N/A'}
                              </code>
                            </td>
                            <td className="border border-gray-300 px-4 py-3">
                              {trader.twitterUrl ? (
                                <a 
                                  href={trader.twitterUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 underline flex items-center gap-2"
                                >
                                  <img 
                                    src="/twitter-blue.png" 
                                    alt="Twitter"
                                    className="w-4 h-4"
                                  />
                                  View Profile
                                </a>
                              ) : (
                                <span className="text-gray-400">No Twitter</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Data Available</h3>
                  <p className="text-gray-500 mb-4">No trader data found from kolscan leaderboard</p>
                  <Button onClick={() => refetchKolscan()}>Load Data</Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Return simple placeholder for other views
  return (
    <div className="bg-white w-full min-h-screen">
      <div className="bg-white min-h-screen max-w-[1920px] mx-auto">
        <Header currentPage="admin" />
        <div className="container mx-auto px-16 py-12">
          <NavigationTabs />
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
            <p className="text-gray-600">Select a tab to manage different aspects of the platform.</p>
          </div>
        </div>
      </div>
    </div>
  );
};