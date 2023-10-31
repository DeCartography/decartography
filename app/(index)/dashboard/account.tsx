"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import ProfilePicture from "@/components/ProfilePicture";
import SheetView from "./sheet-view";

import { useState, useEffect } from "react";

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

// Initialize the TimeAgo library
TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');


// APIを経由してDBから取得する「最後のタスク」の型
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

  const [formattedTimeAgo, setFormattedTimeAgo] = useState<string | null>(null);

  // time




  // useEffect(() => {
  //   const updateDateTime = () => {
  //     const now = new Date();
  //     const nextTaskTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +1 day in milliseconds

  //     // Format the time until the next task is available
  //     let formattedTimeUntilNextTask;
  //     if (!latestTask || now.getTime() - new Date(latestTask.created_at).getTime() >= 24 * 60 * 60 * 1000) {
  //       formattedTimeUntilNextTask = "Now Available";
  //     } else {
  //       formattedTimeUntilNextTask = timeAgo.format(nextTaskTime);
  //     }

  //     // Update state or wherever you need it
  //     setNextTaskDate(formattedTimeUntilNextTask);


  //     const currentTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  //     const nextTaskDateStr = `${nextTaskTime.getMonth() + 1}/${nextTaskTime.getDate()}/${nextTaskTime.getFullYear()}`;

  //     setCurrentTime(currentTimeStr);
  //     setNextTaskDate(nextTaskDateStr);

  //     // fetch latest task
  //     fetch(`https://localhost:1337/api/get-latest-task?wallet=${wallet}`)
  //       .then(response => response.json())
  //       // .then(data => {
  //       //   if (data.created_at) {
  //       //     setLatestTask(data);
  //       //   }
  //       // })
  //       .then(data => {
  //         if (data.created_at) {
  //           setLatestTask(data);
  //           const previousTask_date = new Date(data.created_at);
  //           const formattedTimeAgo = timeAgo.format(previousTask_date);
  //           // Store this formattedTimeAgo in the state or wherever you need it
  //           setFormattedTimeAgo(formattedTimeAgo);
  //         }
  //         else{
  //           console.log(`${wallet}のタスクはありません`)
  //         }
  //       })
  //       .catch(error => {
  //         console.error("Error fetching latest task:", error);
  //       });
  //   };

  //   updateDateTime();
  //   const timerID = setInterval(updateDateTime, 60000); // Update every 1 minute

  //   return () => clearInterval(timerID);



  // }, []);


  // useEffect(() => {
  //   const updateDateTime = () => {
  //     const now = new Date();
  //     const currentTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  //     setCurrentTime(currentTimeStr);

  //     fetch(`https://localhost:1337/api/get-latest-task?wallet=${wallet}`)
  //       .then(response => response.json())
  //       .then(data => {
  //         if (data.created_at) {
  //           setLatestTask(data);
  //         }
  //       })
  //       .catch(error => {
  //         console.error("Error fetching latest task:", error);
  //       });
  //   };

  //   updateDateTime();
  //   const timerID = setInterval(updateDateTime, 60000); // Update every 1 minute

  //   return () => clearInterval(timerID);
  // }, []);

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
            const hoursUntilNextTask = (nextTaskTime.getTime() - now.getTime()) / (1000 * 60 * 60);
            setNextTaskDate(`${hoursUntilNextTask.toFixed(2)} hours later`);

          // 差分が24時間以上の場合は今すぐタスクに取り組めるので"Now"をセット
          } else {
            setNextTaskDate("Now");
          }
        } else {
          // 過去に取り組んだデータが存在しない場合、"Now"をセット
          setNextTaskDate("Now");
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
            {/* provided by Gitcoin Passport, Increase score from here */}
            <div className="text-2xl font-bold">{passportScore}</div>
            <p className="text-xs text-muted-foreground">
              Provided by Gitcoin Passport, Increase score from {" "}
              <a
                className="font-bold hover:text-gray-400"
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
                    className="font-bold hover:text-gray-400"
                    href="https://etherscan.io/tx/0x137c6812dc363ed5f48a2135814dfcfbd6c214fc3d5e291479e9efbcd4ed4ad9"
                    target={"_blank"}
                  >
                    3.5 USD
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

            {/* latesttaskが存在すれば、直近のタスク終了時間を表示。存在しない場合は「すぐにタスクを開始できる」と表示する */}
            {/* <div className="text-2xl font-bold">
              {latestTask ? new Date(latestTask.created_at).toLocaleString() : "Now Available"}
            </div> */}

            {/* <p className="text-xs text-muted-foreground">{nextTaskAgo}</p> */}
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
