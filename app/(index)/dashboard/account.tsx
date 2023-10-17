"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import ProfilePicture from "@/components/ProfilePicture";
import SheetView from "./sheet-view";

import { useState, useEffect } from "react";

export default function Account({
  wallet,
  passportScore,
}: {
  wallet: string;
  passportScore: number;
}) {

  const [currentTime, setCurrentTime] = useState("");
  const [nextTaskDate, setNextTaskDate] = useState("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const nextTaskTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +1 day in milliseconds

      const currentTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      const nextTaskDateStr = `${nextTaskTime.getMonth() + 1}/${nextTaskTime.getDate()}/${nextTaskTime.getFullYear()}`;

      setCurrentTime(currentTimeStr);
      setNextTaskDate(nextTaskDateStr);
    };

    updateDateTime();
    const timerID = setInterval(updateDateTime, 60000); // Update every 1 minute

    return () => clearInterval(timerID);
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col items-center justify-center gap-4">
          <div className="pb-2" />
          {/* <ProfilePicture walletAddress="0xF60fB76e6AD847882bFe390331" /> */}
          <ProfilePicture walletAddress={wallet} />
          <p className="truncate text-[10px] text-muted-foreground">{wallet}</p>
          <div className="pb-2" />
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Humanity Score
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            {/* provided by Gitcoin Passport, Increase score from here */}
            <div className="text-2xl font-bold">{passportScore}</div>
            <p className="text-xs text-muted-foreground">
              Provided by Gitcoin Passport, Increase score from {" "}
              <a
                className="font-bold hover:text-gray-400"
                href="https://passport.gitcoin.co/#/dashboard"
                target={"_blank"}
              >
                here
              </a>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Previous Task</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">None</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Next Task Available At
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentTime}</div>
            <p className="text-xs text-muted-foreground">Tomorrow ({nextTaskDate})</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="text-2xl">Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <SheetView />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
