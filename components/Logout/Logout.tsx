"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { ExitIcon, UpdateIcon } from "@radix-ui/react-icons";
import { deleteCookie } from "@/lib/actions";
import { useRouter } from "next/navigation";

function Logout({ className, ...props }: { className?: string }) {
  const [loading, setLoading] = React.useState(false);

  const router = useRouter();
  const handleClick = async () => {
    setLoading(true);
    await deleteCookie("_auth");
    setLoading(false);
    return router.push("/");
  };
  return (
    <div {...props}>
      <Button variant={"default"} disabled={loading} onClick={handleClick}>
        {loading ? (
          <UpdateIcon className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ExitIcon className="mr-2 h-4 w-4" />
        )}
        Logout
      </Button>
    </div>
  );
}

export default Logout;
