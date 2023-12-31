"use client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import TaskView from "./tasks";

export default function SheetView() {
  return (
    <Sheet>
      <div className="flex flex-col gap-4">
        By starting a task as crowd-sourcing, you can earn around ~10$ ETH.
        <div className="flex w-fit flex-col gap-2">
          <SheetTrigger asChild>
            <Button>Start Now</Button>
          </SheetTrigger>
        </div>
      </div>

      <SheetContent
        side={"bottom"}
        className="h-[calc(100vh-100px)] w-screen"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <SheetHeader>
          <SheetTitle>Task View</SheetTitle>
          <SheetDescription>
            {/* View and complete tasks, don't close the window until you're done as
            it will reset your progress. */}
            {/* 表示された選択肢の中から、あなたが直感的に「似ている」と思うもの3つを選択してSubmitしてください */}
            Please select 3 similar addresses based on your intuition.
          </SheetDescription>
        </SheetHeader>
        {/* <div className="w-[80%] py-4"> */}
        <div>
          <br></br>
          <TaskView />
        </div>
      </SheetContent>
    </Sheet>
  );
}
