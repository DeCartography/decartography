"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import WalletCard from "@/components/WalletCard";
import { getNFTs } from "@/lib/actions";


interface NFT {
  address: string;
  links: string[];
}



export default function Tasks() {

  //added
  const [submittedWallets, setSubmittedWallets] = useState<string[]>([]);
  const [submitCount, setSubmitCount] = useState(0);

  const [nfts, setNfts] = useState<NFT[] | null>(null);
  const [selectedWallets, setSelectedWallets] = useState<string[]>([]);
  const [isSwapping, setIsSwapping] = useState(false);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    fetchInitialWallets();
    setLoading(false);
  }, []);

  const fetchInitialWallets = async () => {
    const initialWallets = await getNFTs(6);
    await setNfts(initialWallets as NFT[]);
  };

  // const toggleWallet = (address: string) => {
  //   if (selectedWallets.length === 3 && !selectedWallets.includes(address)) {
  //     return;
  //   }
  //   setSelectedWallets((prevSelected) => {
  //     if (prevSelected.includes(address)) {
  //       return prevSelected.filter((wallet) => wallet !== address);
  //     } else {
  //       return [...prevSelected, address];
  //     }
  //   });
  // };

  // ここはChatGPTと書き換えていく
  const toggleWallet = (address: string) => {
    if (selectedWallets.length >= 3 && !selectedWallets.includes(address)) {
      alert("You can only select up to 3 items. To choose another item, please deselect one.");
      return;
    }
    setSelectedWallets((prevSelected) => {
      if (prevSelected.includes(address)) {
        return prevSelected.filter((wallet) => wallet !== address);
      } else {
        return [...prevSelected, address];
      }
    });
  };

  // import { cookies } from "next/headers";ができないので自作しちゃう
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
  };


  const handleSubmit = async () => {
    if (selectedWallets.length < 3) {
      alert("Please select 3 items.");
      return;
    }

    // 現在ログインしているユーザーのアドレスを取得
    const userAddress = getCookie("address");

    // 選択されたウォレットアドレスとユーザーアドレスをconsole.logで出力
    console.log("User Address:", userAddress);
    console.log("Selected Wallet Addresses:", selectedWallets);

    // ページに描画する
    setSubmittedWallets([...submittedWallets, ...selectedWallets]);

    // Submit回数をカウントアップ
    setSubmitCount(prevCount => prevCount + 1);

    // 選択状態を解除
    setSelectedWallets([]);

    // 新しいアドレスを取得（swapと同じ処理）
    handleSwap();

    // タスク上限に達した場合
    if (submitCount >= 2) {
      alert("You have reached the submission limit. Returning to the home screen.");
      // ホーム画面へリダイレクト（具体的な方法はプロジェクトに依存）
      window.location.href = "/dashboard?tab=wallets";

    }

  };


  const handleSwap = async () => {
    if (!nfts) return;
    setIsSwapping(true); // Set loading state

    const additionalWalletsNeeded = 6 - selectedWallets.length;

    if (additionalWalletsNeeded > 0) {
      // Fetch additional wallets from your API
      const newWallets = await getNFTs(additionalWalletsNeeded);

      // Check if newWallets is undefined
      if (!newWallets) return console.error("Error while fetching new wallets");

      // Replace unselected wallets with the new ones
      const updatedNfts = nfts.map((nft) => {
        if (!selectedWallets.includes(nft.address)) {
          const newWallet = newWallets.pop();
          if (newWallet) {
            return { address: newWallet.address, links: newWallet.links };
          }
        }
        return nft;
      });

      // Update the state with the new nfts and selectedWallets
      setNfts(updatedNfts);
      setSelectedWallets((prevSelected) => [
        ...prevSelected,
        ...newWallets.map((wallet: any) => wallet.address),
      ]);
    }

    setIsSwapping(false); // Reset loading state
  };

  if (loading || !nfts) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="flex-1 flex-wrap">

          <div className="submitted-section">
            <h3>Previously Submitted Wallet Addresses:</h3>
            <ul>
              {submittedWallets.map((address, index) => (
                <li key={index}>{address}</li>
              ))}
            </ul>
          </div>


          <div className="flex flex-col items-center gap-8 lg:grid lg:grid-cols-3 lg:grid-rows-3">
            {nfts.map((nft) => (
              <div key={nft.address} className="max-w-[300px]">
                <WalletCard
                  images={nft.links}
                  selected={selectedWallets.includes(nft.address)}
                  toggleSelected={() => toggleWallet(nft.address)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-shrink-0">
          <div className="ml-auto mr-auto flex gap-4 self-start lg:flex-col">
            <Button
              size="lg"
              onClick={handleSubmit}
            >
              Submit
            </Button>

            <Button
              variant={"outline"}
              size="lg"
              onClick={handleSwap}
              disabled={isSwapping}
            >
              {isSwapping ? "Swapping..." : "Swap"}
            </Button>
          </div>
        </div>

      </div>
    </>
  );
}
