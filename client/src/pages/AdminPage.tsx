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
  const [view, setView] = useState<"list" | "create" | "edit" | "reviews" | "users">("list");
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

  // File upload mutation for trader profile pictures
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await fetch("/api/upload/trader-profile-picture", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "File upload failed");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setProfileImage(data.profileImageUrl);
      toast({
        title: "Profile picture uploaded",
        description: "Trader profile picture has been uploaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
    },
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

  // Fetch all traders
  const { data: traders = [], isLoading } = useQuery({
    queryKey: ["/api/traders"],
  });

  // Fetch all reviews for admin management
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["/api/admin/ratings"],
  });

  // Fetch all users for admin management
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  // Type the data arrays to avoid unknown type errors
  const typedTraders = traders as any[];
  const typedReviews = reviews as any[];
  const typedUsers = users as any[];

  const createMutation = useMutation({
    mutationFn: async (traderData: any) => {
      const response = await fetch("/api/traders", {
        method: "POST",
        body: JSON.stringify(traderData),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error('Failed to create trader');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Trader created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/traders"] });
      resetForm();
      setView("list");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create trader. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...traderData }: any) => {
      const response = await fetch(`/api/traders/${id}`, {
        method: "PUT",
        body: JSON.stringify(traderData),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error('Failed to update trader');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Trader updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/traders"] });
      resetForm();
      setView("list");
      setEditingTrader(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update trader. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (traderId: number) => {
      const response = await fetch(`/api/traders/${traderId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error('Failed to delete trader');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Trader deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/traders"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete trader. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Review management mutations
  const updateReviewMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/admin/ratings/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error('Failed to update review');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Review updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ratings"] });
      setEditingReview(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      const response = await fetch(`/api/admin/ratings/${reviewId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error('Failed to delete review');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Review deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ratings"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Twitter profile image refresh mutation
  const refreshTwitterImageMutation = useMutation({
    mutationFn: async (traderId: number) => {
      const response = await fetch(`/api/traders/${traderId}/refresh-twitter-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error('Failed to refresh Twitter image');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Twitter profile image updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/traders"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to fetch Twitter profile image. Please check the Twitter URL.",
        variant: "destructive",
      });
    },
  });

  // User management mutations
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, username }: { userId: string; username: string }) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify({ username }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Username updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditingUser(null);
      setEditingUsername("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update username. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setName("");
    setWalletAddress("");
    setBio("");
    setSpecialty("");
    setVerified(false);
    setProfileImage("");
    setTwitterUrl("");
  };

  const startEdit = (trader: any) => {
    setEditingTrader(trader);
    setName(trader.name);
    setWalletAddress(trader.walletAddress);
    setBio(trader.bio || "");
    setSpecialty(trader.specialty || "");
    setVerified(trader.verified);
    setProfileImage(trader.profileImage || "");
    setTwitterUrl(trader.twitterUrl || "");
    setView("edit");
  };

  const startCreate = () => {
    resetForm();
    setEditingTrader(null);
    setView("create");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.includes('png') && !file.type.includes('jpeg') && !file.type.includes('jpg')) {
        toast({
          title: "Invalid file type",
          description: "Please select a PNG or JPEG file",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      uploadFileMutation.mutate(file);
    }
  };

  const handleDelete = (trader: any) => {
    if (window.confirm(`Are you sure you want to delete ${trader.name}? This action cannot be undone.`)) {
      deleteMutation.mutate(trader.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !walletAddress.trim()) {
      toast({
        title: "Required Fields",
        description: "Name and wallet address are required.",
        variant: "destructive",
      });
      return;
    }

    const traderData = {
      name: name.trim(),
      walletAddress: walletAddress.trim(),
      bio: bio.trim() || null,
      specialty: specialty.trim() || null,
      verified,
      profileImage: profileImage.trim() || null,
      twitterUrl: twitterUrl.trim() || null,
    };

    if (view === "edit" && editingTrader) {
      updateMutation.mutate({ id: editingTrader.id, ...traderData });
    } else {
      createMutation.mutate(traderData);
    }
  };

  const createKOLTraders = () => {
    const kolTraders = [
      { name: "N'o", twitterUrl: "https://x.com/Nosa1x", walletAddress: "Di75xbVUg3u1qcmZci3NcZ8rjFMj7tsnYEoFdEMjS4ow" },
      { name: "Latuche", twitterUrl: "https://x.com/Latuche95", walletAddress: "GJA1HEbxGnqBhBifH9uQauzXSB53to5rhDrzmKxhSU65" },
      { name: "Jijo", twitterUrl: "https://x.com/jijo_exe", walletAddress: "4BdKaxN8G6ka4GYtQQWk4G4dZRUTX2vQH9GcXdBREFUk" },
      { name: "Kadenox", twitterUrl: "https://x.com/kadenox", walletAddress: "3pZ59YENxDAcjaKa3sahZJBcgER4rGYi4v6BpPurmsGj" },
      { name: "Pandora", twitterUrl: "https://x.com/pandoraflips", walletAddress: "UxuuMeyX2pZPHmGZ2w3Q8MysvExCAquMtvEfqp2etvm" },
      { name: "Heyitsyolo", twitterUrl: "https://x.com/Heyitsyolotv", walletAddress: "Av3xWHJ5EsoLZag6pr7LKbrGgLRTaykXomDD5kBhL9YQ" },
      { name: "Beaver", twitterUrl: "https://x.com/beaverd", walletAddress: "GM7Hrz2bDq33ezMtL6KGidSWZXMWgZ6qBuugkb5H8NvN" },
      { name: "Sebastian", twitterUrl: "https://x.com/Saint_pablo123", walletAddress: "3BLjRcxWGtR7WRshJ3hL25U3RjWr5Ud98wMcczQqk4Ei" },
      { name: "0xSevere", twitterUrl: "https://x.com/0xSevere", walletAddress: "9FNz4MjPUmnJqTf6yEDbL1D4SsHVh7uA8zRHhR5K138r" },
      { name: "YOUNIZ", twitterUrl: "https://x.com/YOUNIZ_XLZ", walletAddress: "EKDDjxzJ39Bjkr47NiARGJDKFVxiiV9WNJ5XbtEhPEXP" },
      { name: "West", twitterUrl: "https://x.com/ratwizardx", walletAddress: "JDd3hy3gQn2V982mi1zqhNqUw1GfV2UL6g76STojCJPN" },
      { name: "Letterbomb", twitterUrl: "https://x.com/ihateoop", walletAddress: "BtMBMPkoNbnLF9Xn552guQq528KKXcsNBNNBre3oaQtr" },
      { name: "Bandit", twitterUrl: "https://x.com/bandeeeez", walletAddress: "5B79fMkcFeRTiwm7ehsZsFiKsC7m7n1Bgv9yLxPp9q2X" },
      { name: "The Doc", twitterUrl: "https://x.com/KayTheDoc", walletAddress: "DYAn4XpAkN5mhiXkRB7dGq4Jadnx6XYgu8L5b3WGhbrt" },
      { name: "Boogie", twitterUrl: "https://x.com/boogiepnl", walletAddress: "2m8Mc2ngJCmpbEEoYhwT9U929z6C4CPKLatWnR775u9a" },
      { name: "Smokez", twitterUrl: "https://x.com/SmokezXBT", walletAddress: "5t9xBNuDdGTGpjaPTx6hKd7sdRJbvtKS8Mhq6qVbo8Qz" },
      { name: "Ozark", twitterUrl: "https://x.com/ohzarke", walletAddress: "DZAa55HwXgv5hStwaTEJGXZz1DhHejvpb7Yr762urXam" },
      { name: "Groovy", twitterUrl: "https://x.com/0xGroovy", walletAddress: "34ZEH778zL8ctkLwxxERLX5ZnUu6MuFyX9CWrs8kucMw" },
      { name: "Mr Frog", twitterUrl: "https://x.com/TheMisterFrog", walletAddress: "4DdrfiDHpmx55i4SPssxVzS9ZaKLb8qr45NKY9Er9nNh" },
      { name: "Classic", twitterUrl: "https://x.com/simplyclassic69", walletAddress: "DsqRyTUh1R37asYcVf1KdX4CNnz5DKEFmnXvgT4NfTPE" },
      { name: "Hail", twitterUrl: "https://x.com/ignHail", walletAddress: "HA1L7GhQfypSRdfBi3tCkkCVEdEcBVYqBSQCENCrwPuB" },
      { name: "Meechie", twitterUrl: "https://x.com/973Meech", walletAddress: "EkdbN4v1v88Z8LjxhXWgLc8m1iZUqxUMS6vzNvEdTJkU" },
      { name: "Orange", twitterUrl: "https://x.com/OrangeSBS", walletAddress: "96sErVjEN7LNJ6Uvj63bdRWZxNuBngj56fnT9biHLKBf" },
      { name: "Mitch", twitterUrl: "https://x.com/idrawline", walletAddress: "4Be9CvxqHW6BYiRAxW9Q3xu1ycTMWaL5z8NX4HR3ha7t" },
      { name: "TIL", twitterUrl: "https://x.com/tilcrypto", walletAddress: "EHg5YkU2SZBTvuT87rUsvxArGp3HLeye1fXaSDfuMyaf" },
      { name: "Goob", twitterUrl: "https://x.com/ifullclipp", walletAddress: "9BkauJdFYUyBkNBZwV4mNNyfeVKhHvjULb7cL4gFQaLt" },
      { name: "Fashr", twitterUrl: "https://x.com/FASHRCrypto", walletAddress: "719sfKUjiMThumTt2u39VMGn612BZyCcwbM5Pe8SqFYz" },
      { name: "Idontpaytaxes", twitterUrl: "https://x.com/untaxxable", walletAddress: "2T5NgDDidkvhJQg8AHDi74uCFwgp25pYFMRZXBaCUNBH" },
      { name: "Xander", twitterUrl: "https://x.com/xandereef", walletAddress: "B3wagQZiZU2hKa5pUCj6rrdhWsX3Q6WfTTnki9PjwzMh" },
      { name: "Qtdegen", twitterUrl: "https://x.com/qtdegen", walletAddress: "7tiRXPM4wwBMRMYzmywRAE6jveS3gDbNyxgRrEoU6RLA" },
      { name: "Oura", twitterUrl: "https://x.com/Oura456", walletAddress: "4WPTQA7BB4iRdrPhgNpJihGcxKh8T43gLjMn5PbEVfQw" },
      { name: "Insentos", twitterUrl: "https://x.com/insentos", walletAddress: "7SDs3PjT2mswKQ7Zo4FTucn9gJdtuW4jaacPA65BseHS" },
      { name: "Lynk", twitterUrl: "https://x.com/lynk0x", walletAddress: "CkPFGv2Wv1vwdWjtXioEgb8jhZQfs3eVZez3QCetu7xD" },
      { name: "Issa", twitterUrl: "https://x.com/issathecooker", walletAddress: "2BU3NAzgRA2gg2MpzwwXpA8X4CCRaLgrf6TY1FKfJPX2" },
      { name: "ShockedJS", twitterUrl: "https://x.com/ShockedJS", walletAddress: "6m5sW6EAPAHncxnzapi1ZVJNRb9RZHQ3Bj7FD84X9rAF" },
      { name: "Leens", twitterUrl: "https://x.com/leensx100", walletAddress: "7iabBMwmSvS4CFPcjW2XYZY53bUCHzXjCFEFhxeYP4CY" },
      { name: "Henn100x", twitterUrl: "https://x.com/henn100x", walletAddress: "FRbUNvGxYNC1eFngpn7AD3f14aKKTJVC6zSMtvj2dyCS" },
      { name: "Saif", twitterUrl: "https://x.com/degensaif", walletAddress: "BuhkHhM3j4viF71pMTd23ywxPhF35LUnc2QCLAvUxCdW" },
      { name: "Red", twitterUrl: "https://x.com/redwithbag", walletAddress: "7ABz8qEFZTHPkovMDsmQkm64DZWN5wRtU7LEtD2ShkQ6" },
      { name: "CartiTheMenace", twitterUrl: "https://x.com/CartiTheMenace", walletAddress: "A6fVPXt9bqon1LQoJi4HQ5xkhavLKEo77N5CZef2jpmR" }
    ];

    // Add profiles with automatic Twitter image fetching and crypto trader specialties
    kolTraders.forEach((trader, index) => {
      setTimeout(() => {
        const traderData = {
          name: trader.name,
          walletAddress: trader.walletAddress,
          twitterUrl: trader.twitterUrl,
          specialty: "Crypto Trading",
          verified: true,
          bio: `Professional crypto trader and KOL with expertise in Solana ecosystem trading.`,
          profileImage: null // Will be auto-fetched from Twitter
        };
        createMutation.mutate(traderData);
      }, index * 1000); // Stagger requests by 1 second to avoid rate limiting
    });
  };

  if (view === "list") {
    return (
      <div className="bg-white w-full min-h-screen">
        <div className="bg-white min-h-screen max-w-[1920px] mx-auto">
        <Header currentPage="admin" />
        <div className="container mx-auto px-16 py-12">
          {/* Navigation Tabs */}
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
          </div>

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Admin Panel - Manage Traders</h1>
            <Button onClick={startCreate} className="flex items-center gap-3 text-lg px-6 py-3">
              <Plus size={20} />
              Create New Trader
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading traders...</div>
          ) : (
            <div className="grid gap-4">
              {typedTraders.map((trader: any) => (
                <Card key={trader.id} className="p-4">
                  <div className="flex justify-between items-start">
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
                            <Image size={20} className="text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{trader.name}</h3>
                          {trader.twitterUrl && (
                            <button
                              onClick={() => window.open(trader.twitterUrl, '_blank')}
                              className="w-6 h-6 rounded-full overflow-hidden hover:scale-110 transition-transform duration-200 flex-shrink-0"
                              title="View Twitter Profile"
                            >
                              <img 
                                src="/twitter-blue.png" 
                                alt="Twitter"
                                className="w-full h-full object-cover"
                              />
                            </button>
                          )}
                          {trader.verified && (
                            <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-1">{trader.specialty || 'No specialty'}</p>
                        <p className="text-sm text-gray-500 mb-1">Wallet: {trader.walletAddress}</p>
                        <p className="text-sm text-blue-600 font-medium mb-2">
                          Reviews: {trader.totalRatings || 0}
                        </p>
                        {trader.bio && (
                          <p className="text-sm text-gray-700 line-clamp-2">{trader.bio}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(trader)}
                        className="flex items-center gap-2"
                      >
                        <Edit size={14} />
                        Edit
                      </Button>
                      {trader.twitterUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => refreshTwitterImageMutation.mutate(trader.id)}
                          className="flex items-center gap-2"
                          disabled={refreshTwitterImageMutation.isPending}
                          title="Refresh Twitter profile image"
                        >
                          <RefreshCw size={14} className={refreshTwitterImageMutation.isPending ? "animate-spin" : ""} />
                          Refresh
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(trader)}
                        className="flex items-center gap-2"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 size={14} />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              
              {typedTraders.length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-gray-600 mb-4">No traders found. Create your first trader profile!</p>
                  <Button onClick={createKOLTraders} variant="outline">
                    Import KOL Traders (40)
                  </Button>
                </Card>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    );
  }

  if (view === "users") {
    return (
      <div className="bg-white w-full min-h-screen">
        <div className="bg-white min-h-screen max-w-[1920px] mx-auto">
        <Header currentPage="admin" />
        <div className="container mx-auto px-8 py-8">
          {/* Navigation Tabs */}
          <div className="flex gap-4 mb-6">
            <Button 
              variant={view === "list" ? "default" : "outline"}
              onClick={() => setView("list")}
            >
              Manage Traders
            </Button>
            <Button 
              variant={view === "reviews" ? "default" : "outline"}
              onClick={() => setView("reviews")}
            >
              Manage Reviews
            </Button>
            <Button 
              variant={view === "users" ? "default" : "outline"}
              onClick={() => setView("users")}
            >
              Manage Users
            </Button>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Admin Panel - Manage Users</h1>
          </div>

          {/* User Search */}
          <div className="mb-6">
            <div className="max-w-md">
              <Label htmlFor="userSearch" className="block text-sm font-medium text-gray-700 mb-2">
                Search Users by Username
              </Label>
              <Input
                id="userSearch"
                type="text"
                placeholder="Enter username to search..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {usersLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <div className="space-y-4">
              {typedUsers
                .filter((user: any) => 
                  !userSearch || 
                  user.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
                  user.email?.toLowerCase().includes(userSearch.toLowerCase())
                )
                .map((user: any) => (
                <Card key={user.id} className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Profile Image */}
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          {user.profileImage ? (
                            <img 
                              src={user.profileImage} 
                              alt={user.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-300">
                              <Image size={20} className="text-gray-500" />
                            </div>
                          )}
                        </div>
                        
                        {/* User Info */}
                        <div className="flex-1">
                          {editingUser?.id === user.id ? (
                            <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                <div>
                                  <Label htmlFor="editUsername" className="text-sm font-medium">Username</Label>
                                  <Input
                                    id="editUsername"
                                    value={editingUsername}
                                    onChange={(e) => setEditingUsername(e.target.value)}
                                    className="w-64"
                                    placeholder="Enter new username"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm"
                                    onClick={() => {
                                      if (editingUsername.trim()) {
                                        updateUserMutation.mutate({
                                          userId: user.id,
                                          username: editingUsername.trim()
                                        });
                                      }
                                    }}
                                    disabled={updateUserMutation.isPending || !editingUsername.trim()}
                                  >
                                    {updateUserMutation.isPending ? "Saving..." : "Save"}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setEditingUser(null);
                                      setEditingUsername("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold">{user.username}</h3>
                                {user.role === 'admin' && (
                                  <Badge className="bg-red-100 text-red-800">Admin</Badge>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm mb-1">Email: {user.email || 'Not provided'}</p>
                              <p className="text-gray-500 text-sm">
                                User ID: {user.id}
                              </p>
                              <p className="text-gray-500 text-sm">
                                Joined: {new Date(user.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {editingUser?.id !== user.id && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingUser(user);
                              setEditingUsername(user.username);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Edit size={14} />
                            Edit Username
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Empty state messages */}
              {typedUsers.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-600">No users found.</p>
                </Card>
              ) : typedUsers
                .filter((user: any) => 
                  !userSearch || 
                  user.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
                  user.email?.toLowerCase().includes(userSearch.toLowerCase())
                ).length === 0 && userSearch && (
                <Card className="p-8 text-center">
                  <p className="text-gray-600">No users found matching "{userSearch}".</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setUserSearch("")}
                    className="mt-4"
                  >
                    Clear Search
                  </Button>
                </Card>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    );
  }

  if (view === "reviews") {
    return (
      <div className="bg-white w-full min-h-screen">
        <div className="bg-white min-h-screen max-w-[1920px] mx-auto">
        <Header currentPage="admin" />
        <div className="container mx-auto px-8 py-8">
          {/* Navigation Tabs */}
          <div className="flex gap-4 mb-6">
            <Button 
              variant={view === "list" ? "default" : "outline"}
              onClick={() => setView("list")}
            >
              Manage Traders
            </Button>
            <Button 
              variant={view === "reviews" ? "default" : "outline"}
              onClick={() => setView("reviews")}
            >
              Manage Reviews
            </Button>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Admin Panel - Manage Reviews</h1>
          </div>

          {/* Review Search */}
          <div className="mb-6">
            <div className="max-w-md">
              <Label htmlFor="reviewSearch" className="block text-sm font-medium text-gray-700 mb-2">
                Search Reviews by Username
              </Label>
              <Input
                id="reviewSearch"
                type="text"
                placeholder="Enter username to search..."
                value={reviewSearch}
                onChange={(e) => setReviewSearch(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {reviewsLoading ? (
            <div className="text-center py-8">Loading reviews...</div>
          ) : (
            <div className="space-y-4">
              {typedReviews
                .filter((review: any) => 
                  !reviewSearch || 
                  review.reviewerName?.toLowerCase().includes(reviewSearch.toLowerCase())
                )
                .map((review: any) => (
                <Card key={review.id} className="border border-gray-200">
                  <CardContent className="p-6">
                    {editingReview?.id === review.id ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold">Editing Review #{review.id}</h3>
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              onClick={() => {
                                updateReviewMutation.mutate({
                                  id: review.id,
                                  data: {
                                    comment: editingReview.comment,
                                    overallRating: editingReview.overallRating,
                                    profitabilityRating: editingReview.profitabilityRating,
                                    communicationRating: editingReview.communicationRating,
                                    reliabilityRating: editingReview.reliabilityRating,
                                  }
                                });
                              }}
                            >
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingReview(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Overall Rating</Label>
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              value={editingReview.overallRating}
                              onChange={(e) => setEditingReview({
                                ...editingReview,
                                overallRating: parseInt(e.target.value)
                              })}
                            />
                          </div>
                          <div>
                            <Label>Profitability Rating</Label>
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              value={editingReview.profitabilityRating}
                              onChange={(e) => setEditingReview({
                                ...editingReview,
                                profitabilityRating: parseInt(e.target.value)
                              })}
                            />
                          </div>
                          <div>
                            <Label>Trade Activity Rating</Label>
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              value={editingReview.communicationRating}
                              onChange={(e) => setEditingReview({
                                ...editingReview,
                                communicationRating: parseInt(e.target.value)
                              })}
                            />
                          </div>
                          <div>
                            <Label>Reliability Rating</Label>
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              value={editingReview.reliabilityRating}
                              onChange={(e) => setEditingReview({
                                ...editingReview,
                                reliabilityRating: parseInt(e.target.value)
                              })}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Comment</Label>
                          <Textarea
                            value={editingReview.comment}
                            onChange={(e) => setEditingReview({
                              ...editingReview,
                              comment: e.target.value
                            })}
                            className="min-h-[100px]"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-medium">Review #{review.id}</p>
                            <p className="text-sm text-gray-600">
                              Trader ID: {review.traderId} | Reviewer: {review.reviewerName || 'Anonymous'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingReview(review)}
                              className="flex items-center gap-2"
                            >
                              <Edit size={16} />
                              Edit Review
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this review?')) {
                                  deleteReviewMutation.mutate(review.id);
                                }
                              }}
                              className="flex items-center gap-2"
                            >
                              <Trash2 size={16} />
                              Delete
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Overall</p>
                            <p className="font-medium">{review.overallRating}/5</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Profitability</p>
                            <p className="font-medium">{review.profitabilityRating}/5</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Trade Activity</p>
                            <p className="font-medium">{review.communicationRating}/5</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Reliability</p>
                            <p className="font-medium">{review.reliabilityRating}/5</p>
                          </div>
                        </div>
                        
                        {review.comment && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Comment:</p>
                            <p className="text-gray-800">{review.comment}</p>
                          </div>
                        )}
                        
                        {review.tags && review.tags.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-2">Tags:</p>
                            <div className="flex flex-wrap gap-2">
                              {review.tags.map((tag: string, index: number) => (
                                <Badge key={index} variant="secondary">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {/* Empty state messages */}
              {reviews.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-600">No reviews found.</p>
                </Card>
              ) : reviews
                .filter((review: any) => 
                  !reviewSearch || 
                  review.reviewerName?.toLowerCase().includes(reviewSearch.toLowerCase())
                ).length === 0 && reviewSearch && (
                <Card className="p-8 text-center">
                  <p className="text-gray-600">No reviews found matching "{reviewSearch}".</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setReviewSearch("")}
                    className="mt-4"
                  >
                    Clear Search
                  </Button>
                </Card>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white w-full min-h-screen">
      <div className="bg-white min-h-screen max-w-[1920px] mx-auto">
        <Header currentPage="admin" />
        <div className="container mx-auto px-8 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {view === "edit" ? "Edit Trader Profile" : "Create Trader Profile"}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("list")}
                className="flex items-center gap-2"
              >
                <X size={16} />
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Trader Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter trader name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="walletAddress">Wallet Address *</Label>
                <Input
                  id="walletAddress"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="specialty">Specialty</Label>
                <Input
                  id="specialty"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="e.g., DeFi, NFTs, Meme Coins"
                />
              </div>

              <div>
                <Label htmlFor="profilePicture">Profile Picture (PNG or JPEG)</Label>
                <Input
                  id="profilePicture"
                  name="profilePicture"
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="border-2 border-[#9f98b3]"
                />
                {profileImage && (
                  <div className="mt-2">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                      <img 
                        src={profileImage} 
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center text-gray-500 text-sm">
                — OR —
              </div>

              <div>
                <Label htmlFor="profileImageUrl">Profile Image URL</Label>
                <Input
                  id="profileImageUrl"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  placeholder="https://example.com/profile-image.jpg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter a direct link to an image file (JPG, PNG, GIF)
                </p>
                {profileImage && profileImage.startsWith('http') && (
                  <div className="mt-2">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                      <img 
                        src={profileImage} 
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Enter trader biography..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="twitterUrl">Twitter URL</Label>
                <Input
                  id="twitterUrl"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  placeholder="https://twitter.com/username"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={verified}
                  onCheckedChange={(checked) => setVerified(!!checked)}
                />
                <Label htmlFor="verified">Verified Trader</Label>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 flex items-center gap-2"
                >
                  <Save size={16} />
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : view === "edit"
                    ? "Update Trader"
                    : "Create Trader"}
                </Button>
                {view === "create" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={createKOLTraders}
                    disabled={createMutation.isPending}
                  >
                    Import KOL Traders (40)
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};