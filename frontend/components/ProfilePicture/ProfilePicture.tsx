"use client";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function ProfilePicture({ walletAddress }: { walletAddress: string }) {
  const svg = `https://api.dicebear.com/6.x/pixel-art/svg?seed=${walletAddress}`;
  return (
    <Avatar>
      <AvatarImage src={svg} alt="Profile Picture" />
      <AvatarFallback>PFP</AvatarFallback>
    </Avatar>
  );
}

export default ProfilePicture;
