"use client";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Carousel from "flat-carousel";
import { cn } from "@/lib/utils";

function WalletCard({ images }: { images: string[] }) {
  const [active, setActive] = useState(true);
  const carouselItems = images.map((image, index) => ({
    id: image + index, // Unique identifier for each item
    url: image, // Image URL
  }));

  return (
    <div className={cn(active === false && "opacity-60")}>
      <Card className="relative h-[300px] w-[300px] overflow-hidden p-4">
        <div className="absolute right-3 top-2 z-40">
          <Checkbox id="ok" onClick={() => setActive(!active)} />
        </div>
        <div className="relative flex min-h-full items-center justify-center">
          {images.length > 1 ? (
            <Carousel>
              {carouselItems.map((image) => (
                <div
                  key={image.id}
                  style={{
                    height: "250px",
                    backgroundImage: `url('${image.url}')`,
                  }}
                />
              ))}
            </Carousel>
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

export default WalletCard;
