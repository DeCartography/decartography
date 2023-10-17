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


  const [submittedWallets, setSubmittedWallets] = useState<string[][]>([]); // フロント用、一回のタスクに中身が入る

  const [allSelectedWallets, setAllSelectedWallets] = useState<string[][]>([]); // バックエンドに送信する用、セッション内で回答した全てのsubmit履歴が入る

  const maxSubmitCount = 3; // セッションにつき何回タスクを送信させるか。この場合は3回送信すれば1セッション

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

    // 選択されたアドレスが3つ以上あるかチェック
    if (selectedWallets.length < 3) {
      alert("Please select 3 items.");
      return;
    }

    //リファクタリング
    setAllSelectedWallets([...allSelectedWallets, selectedWallets]);
    setSubmittedWallets([...submittedWallets, selectedWallets]);

    const newSubmitCount = submitCount + 1;
    setSubmitCount(newSubmitCount);

    // // 選択状態を解除
    setSelectedWallets([]);

    // 新しいアドレスを取得（swapと同じ処理）
    handleSwap();

    // タスクの上限に達したかどうかをチェック
    if (newSubmitCount >= maxSubmitCount) {
      // 現在ログインしているユーザーのアドレスを取得
      const userAddress = getCookie("address");

      // 送信するデータを作成
      const payload = {
        userAddress,
        allSelectedWallets: [...allSelectedWallets, selectedWallets]
      };

      // コンソールに出力
      console.log("Sending the following data to /api/insert-data:", payload);

      alert("You have reached the submission limit. Returning to the home screen.");



      /*
      POST like this:
      {
          "userAddress": "0xF60fB76e6AD89364Af3ffE72C447882bFe390331",
          "allSelectedWallets": [
              [
                  "0x37260938452373ff950547f30d8b06418d361f43",
                  "0x6d83b5e198ef938d63e1160d127c8c5cd0541944",
                  "0x765e97fb4346bcb08348ad503e1f28896d0a2f60"
              ],
              [
                  "0x37260938452373ff950547f30d8b06418d361f43",
                  "0x6d83b5e198ef938d63e1160d127c8c5cd0541944",
                  "0x765e97fb4346bcb08348ad503e1f28896d0a2f60"
              ],
              [
                  "0x37260938452373ff950547f30d8b06418d361f43",
                  "0x6d83b5e198ef938d63e1160d127c8c5cd0541944",
                  "0x765e97fb4346bcb08348ad503e1f28896d0a2f60"
              ]
          ]
      }
      */
      fetch('https://localhost:1337/api/insert-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

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
    <div className="flex"> {/* 追加: 最外部のflexコンテナ */}

      {/* 追加: サイドバー */}
      <div className="w-1/5 min-h-screen p-4 border-r">

        <div>
          <h3>Current Task Count:</h3>
          <p>{submitCount} / {maxSubmitCount}</p>
        </div>

        <br></br>

        <div>
          <h3>過去に入力したアドレス:</h3>
          <ul>
            {submittedWallets.map((addresses, index) => (
              <li key={index}>
                {index + 1}[{addresses.join(", ")}]
              </li>
            ))}
          </ul>
        </div>

      </div>


      <div className="flex-1 overflow-auto">

        {/* タスク表示部分 */}
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
      {/* ボタン部分 */}
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
  );

}
