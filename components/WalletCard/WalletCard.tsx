"use client";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function WalletCard({
  images,
  selected,
  toggleSelected,
}: {
  images: string[];
  selected: boolean;
  toggleSelected: (x: any) => void;
}) {
  return (
    <div className={cn(selected === true && "opacity-60")}>
      <Card className="relative h-[300px] w-[300px] overflow-hidden p-4">
        <div className="absolute right-3 top-2 z-40">
          <Checkbox onClick={toggleSelected} checked={selected} />
        </div>
        <div className="relative flex min-h-full items-center justify-center">
          {images.length > 1 ? (
            <BoxGrid images={images} />
          ) : (
            <div className="flex min-h-full items-center justify-center">
              No NFTs for this wallet
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

const BoxGrid = ({ images }: { images: string[] }) => {
  console.log(images);
  return (
    <div
      id="box-container"
      className="custom-toolbar box-content grid h-48 grid-cols-2 gap-4 overflow-y-scroll"
    >
      {images.map((image, index) => (
        <div key={index} className="box border-2 border-black p-2">
          <div className="">
            <img
              src={image}
              alt={`Image ${index}`}
              className="mx-auto h-32 w-32"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default WalletCard;
