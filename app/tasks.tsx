import { Button } from "@/components/ui/button";
import WalletCard from "@/components/WalletCard";

export default function Tasks() {
  return (
    <>
      <div className="flex flex-col gap-5 xl:flex-row xl:justify-between xl:gap-0">
        <div className="flex flex-col gap-6 xl:grid xl:max-w-4xl xl:auto-cols-min xl:auto-rows-min xl:grid-cols-3 xl:grid-rows-2">
          <WalletCard />
          <WalletCard />
          <WalletCard />
          <WalletCard />
          <WalletCard />
          <WalletCard />
        </div>
        <div className="order-first flex gap-4 self-start xl:order-last xl:ml-auto xl:mr-auto xl:flex-col xl:gap-8 xl:self-center">
          <Button size="lg">Submit</Button>
          <Button variant={"outline"} size="lg">
            Swap
          </Button>
        </div>
      </div>
    </>
  );
}
