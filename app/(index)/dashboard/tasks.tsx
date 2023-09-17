import { Button } from "@/components/ui/button";
import WalletCard from "@/components/WalletCard";

interface NFT {
  address: string;
  links: string[];
}

export default function Tasks({ nfts }: { nfts: NFT[] }) {
  return (
    <>
      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="flex-1 flex-wrap">
          <div className="flex flex-col items-center gap-8 lg:grid lg:grid-cols-3 lg:grid-rows-3">
            {nfts.map((nft) => (
              <div key={nft.address} className="max-w-[300px]">
                {/* <img src={nft.links[0]} style={{ width: "100%" }} /> */}
                <WalletCard images={nft.links} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-shrink-0">
          <div className="ml-auto mr-auto flex gap-4 self-start lg:flex-col">
            <Button size="lg">Submit</Button>
            <Button variant={"outline"} size="lg">
              Swap
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
