import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/Header";

export const AdminPage = (): JSX.Element => {
  const [name, setName] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [bio, setBio] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [verified, setVerified] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
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
      // Reset form
      setName("");
      setWalletAddress("");
      setBio("");
      setSpecialty("");
      setVerified(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create trader. Please try again.",
        variant: "destructive",
      });
    },
  });

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
    };

    mutation.mutate(traderData);
  };

  const createSampleTraders = () => {
    const sampleTraders = [
      {
        name: "CryptoKing2024",
        walletAddress: "0x742d35Cc6634C0532925a3b8D404fA503e8d4125",
        bio: "Professional crypto trader with 5+ years experience in DeFi and NFT markets. Specializing in meme coins and high-risk/high-reward strategies.",
        specialty: "Meme Coins & DeFi",
        verified: true,
      },
      {
        name: "BlockchainExpert",
        walletAddress: "0x8ba1f109551bD432803012645Hac136c22C501e8",
        bio: "Experienced trader focusing on fundamental analysis and long-term investments in blockchain technology.",
        specialty: "Fundamental Analysis",
        verified: true,
      },
      {
        name: "NFTWhale",
        walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
        bio: "NFT collector and trader with expertise in digital art markets and gaming tokens.",
        specialty: "NFT Trading",
        verified: false,
      },
    ];

    sampleTraders.forEach((trader) => {
      mutation.mutate(trader);
    });
  };

  return (
    <div className="bg-white min-h-screen">
      <Header currentPage="admin" />
      <div className="container mx-auto px-8 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Admin Panel - Create Trader Profile</CardTitle>
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
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Enter trader biography..."
                  rows={4}
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
                  disabled={mutation.isPending}
                  className="flex-1"
                >
                  {mutation.isPending ? "Creating..." : "Create Trader"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={createSampleTraders}
                  disabled={mutation.isPending}
                >
                  Add Sample Data
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};