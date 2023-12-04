"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import ProfilePicture from "@/components/ProfilePicture";
import SheetView from "./sheet-view";

import { useState, useEffect } from "react";

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');


type LatestTaskType = {
  created_at: Date;
};


export default function Account({
  wallet,
  passportScore,
}: {
  wallet: string;
  passportScore: number;
}) {

  const [latestTask, setLatestTask] = useState<LatestTaskType | null>(null);
  const [currentTime, setCurrentTime] = useState("");

  const [nextTaskDate, setNextTaskDate] = useState("");
  const [nextTaskTime, setNextTaskTime] = useState<Date | null>(null);



  useEffect(() => {
    const updateDateTime = async () => {
      const now = new Date();

      try {
        // まずはlatesttaskを取得する
        const response = await fetch(`https://localhost:1337/api/get-latest-task?wallet=${wallet}`);
        const data = await response.json();

        // 過去に取り組んだデータがある場合:
        if (data && data.created_at) {
          setLatestTask(data);
          const latestTaskDate = new Date(data.created_at);
          const timeDifference = now.getTime() - latestTaskDate.getTime();

          // "created_at"と現在の日時の差が24時間以内の場合
          if (timeDifference < 24 * 60 * 60 * 1000) {
            // 次のタスクの時間を計算
            const nextTaskTime = new Date(latestTaskDate.getTime() + 24 * 60 * 60 * 1000);
            setNextTaskTime(nextTaskTime); //あとでフロントにも表示したいので、Stateとして保存しておく

            // 次のタスクが利用可能になるまでの時間を「23h 30min later」のような形式で表示する
            const hoursUntilNextTask = Math.floor((nextTaskTime.getTime() - now.getTime()) / (1000 * 60 * 60));
            const minutesUntilNextTask = Math.floor(((nextTaskTime.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
            setNextTaskDate(`${hoursUntilNextTask}h ${minutesUntilNextTask}min later`);

            // 差分が24時間以上の場合は今すぐタスクに取り組めるので"Now"をセット
          } else {
            setNextTaskDate("Now Available");
          }
        } else {
          // 過去に取り組んだデータが存在しない場合、"Now"をセット
          setNextTaskDate("Now Available");
        }
      } catch (error) {
        console.error("Error fetching latest task:", error);
        setNextTaskDate("Error");
      }

      const currentTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      setCurrentTime(currentTimeStr);
    };

    updateDateTime();
    const timerID = setInterval(updateDateTime, 60000); // Update every 1 minute

    return () => clearInterval(timerID);
  }, []);


  const lastTaskDate = new Date(latestTask ? latestTask.created_at : '');

  const previousTaskAgo = lastTaskDate instanceof Date && !isNaN(lastTaskDate.valueOf()) ? timeAgo.format(lastTaskDate) : 'None';


  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col items-center justify-center gap-4">
          <div className="pb-2" />
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
            <div className="text-2xl font-bold">{passportScore}</div>
            <p className="text-xs text-muted-foreground">
              Provided by Gitcoin Passport, Increase score from {" "}
              <a
                className="hover:text-gray-400"
                href="https://passport.gitcoin.co/#/dashboard"
                target={"_blank"}
              >
                <u>here</u>
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
            <div className="text-2xl font-bold">
              {previousTaskAgo}
            </div>
            <p className="text-xs text-muted-foreground">
              {/* latesttaskが存在すれば、直近のタスク終了時間を表示。存在しない場合は「すぐにタスクを開始できる」と表示する */}
              {latestTask ? new Date(latestTask.created_at).toLocaleString() : "No previous task history, you can start task from now!"}
              {/* latesttaskが存在すれば↓ */}
              {latestTask && (
                <>
                  . You've earned: {" "}
                  <a
                    className="hover:text-gray-400"
                    href="https://etherscan.io/tx/0x137c6812dc363ed5f48a2135814dfcfbd6c214fc3d5e291479e9efbcd4ed4ad9"
                    target={"_blank"}
                  >
                    <u>3.5 USD</u>
                  </a>
                </>
              )}
            </p>
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
            {/* ここは、「（次のタスクを始められるまで）何時間後」 という表示にしたい*/}
            <div className="text-2xl font-bold">{nextTaskDate}</div>
            {nextTaskDate !== "Now Available" && nextTaskTime && (
              <p className="text-xs text-muted-foreground">You can start next task at {nextTaskTime.toLocaleString()}, <a href="https://example.com"><u>Remind me when available</u></a></p>
            )}
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
