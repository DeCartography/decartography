"use client";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import Image from "next/image";

function WalletCard() {
  const [active, setActive] = useState(true);

  const imageURL = encodeURIComponent(
    "https://images.pexels.com/photos/13689631/pexels-photo-13689631.jpeg",
  );
  return (
    <div className={cn(active === false && "opacity-60")}>
      <Card className="w-fit">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>0xF60fBe393jd93djk</CardTitle>
            <Checkbox id="ok" onClick={() => setActive(!active)} />
            {active}
          </div>
        </CardHeader>
        <CardContent className="relative ml-auto mr-auto">
          {/* <p className="absolute left-0 top-1/3">left</p>
          <p className="absolute right-0 top-1/3">right</p> */}

          <Suspense
            fallback={
              <Skeleton className="absolute left-0 top-0 h-[250px] w-[250px]" />
            }
          >
            <Image
              src={`https://res.cloudinary.com/dfaxbpkgx/image/fetch/q_auto,f_auto,h_500,w_500/${imageURL}`}
              alt="your mom"
              width={500}
              height={500}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

export default WalletCard;
