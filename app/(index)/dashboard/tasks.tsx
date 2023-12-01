"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import WalletCard from "@/components/WalletCard";
import { getNFTs } from "@/lib/actions";



interface NFT {
  address: string;
  links: string[];
  is_never_selected_address: number; //is_never_selected_addressがtrueな場合は、そのアドレスは最初から選択されている
}



export default function Tasks() {


  const [submittedWallets, setSubmittedWallets] = useState<string[][]>([]); // フロント用、一回のタスクに中身が入る

  const [allSelectedWallets, setAllSelectedWallets] = useState<string[][]>([]); // バックエンドに送信する用、セッション内で回答した全てのsubmit履歴が入る

  const maxSubmitCount:number = 3; // セッションにつき何回タスクを送信させるか。この場合は3回送信すれば1セッション

  const [submitCount, setSubmitCount] = useState(0);

  const [nfts, setNfts] = useState<NFT[] | null>(null);

  // console.log("現在取り組んでいるタスクは" + submitCount + "回目です。& 選択肢に表示するアドレスたち: ", nfts)


  const [selectedWallets, setSelectedWallets] = useState<string[]>([]);
  const [isSwapping, setIsSwapping] = useState(false);
  // swap用だけでなくて送信した際の文も追加する
  const [isLoading, setIsLoding] = useState(false);
  const [loading, setLoading] = useState(true);

  // バックエンドで生成しているタスクがinitial_taskなのか、subsequent_tasksなのかを判断するための関数を追加。
  const [isInitialTask, setIsInitialTask] = useState<boolean | null>(null);



  // useEffect(() => {
  //   const fetchData = async () => {
  //     const { addresses, isInitialTask } = await getNFTs(6);
  //     setNfts(addresses as unknown as NFT[]);
  //     setIsInitialTask(Boolean(isInitialTask));

  //   };
  //   fetchData();
  //   setLoading(false);
  // }, []);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const { addresses, isInitialTask } = await getNFTs(6);
  //     setNfts(addresses as unknown as { address: string; links: string[]; is_never_selected_address: number }[]);
  //     setIsInitialTask(Boolean(isInitialTask));

  //     // unselected_addressesが1のウォレットを選択状態に設定
  //     const initiallySelected = addresses.filter(nft => nft.is_never_selected_address === 1).map(nft => nft.address);
  //     setSelectedWallets(initiallySelected);
  //   };
  //   fetchData();
  //   setLoading(false);
  // }, []);

  useEffect(() => {
    // const fetchData = async () => {
    //   const { addresses, isInitialTask } = await getNFTs(6);
    //   setNfts(addresses as unknown as { address: string; links: string[]; is_never_selected_address: number }[]);
    //   setIsInitialTask(Boolean(isInitialTask));

    //   // unselected_addressesが1のウォレットを選択状態に設定
    //   const initiallySelected = addresses.filter(nft => nft.is_never_selected_address === 1).map(nft => nft.address);
    //   setSelectedWallets(initiallySelected);
    // };
    handleLoad();
    // fetchData();
    setLoading(false);
  }, []);



  // const fetchInitialWallets = async () => {
  //   const initialWallets = await getNFTs(6);
  //   setNfts(initialWallets as unknown as NFT[]);
  //   // await setNfts(initialWallets as NFT[]);
  // };

  // const toggleWallet = (address: string) => {
  //   if (selectedWallets.length >= 3 && !selectedWallets.includes(address)) {
  //     alert("You can only select up to 3 items. To choose another item, please deselect one.");
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

  // クリックした時に発火する
  const toggleWallet = (address: string) => {
    const wallet = nfts?.find(nft => nft.address === address);
    if (!wallet) return;

    // クリックしたウォレットにis_never_selected_address（最初から選択されている）タグがついていた場合の処理:
    if (wallet.is_never_selected_address === 1) {
      alert("このアドレスはシステム上最初から✅されています。クリックしても解除できません。他の選択肢の中から、このアドレスに似ているものを選んでください");
      return;
    }

    // クリックされた時に、すでに選択済みのアドレスが3つ以上ある場合は、アラートを出して処理を終了する
    if (selectedWallets.length >= 3 && !selectedWallets.includes(address)) {
      alert("You can only select up to 3 items. To choose another item, please deselect one.");
      console.log("selectedWallets.length", selectedWallets.length);
      console.log("selectedWallets", selectedWallets);
      return;
    }

    setSelectedWallets((prevSelected) => {
      // prevSelectedは現在選択されているウォレットのアドレスの配列です。
      // addressはクリックされたウォレットのアドレスです。

      // もしクリックされたウォレットが既に選択されている場合
      if (prevSelected.includes(address)) {
        // そのウォレットを選択から外します。新しい配列を返します。
        return prevSelected.filter((wallet) => wallet !== address);
      } else {
        // クリックされたウォレットがまだ選択されていない場合、それを選択に追加します。
        // 既存の選択と新たに選択されたウォレットのアドレスを含む新しい配列を返します。
        return [...prevSelected, address];
      }
    });
  };

  // // 新たに追加: is_initial_task の情報を取得する関数
  // const fetchIsInitialTask = async () => {
  //   const response = await fetch("/api/get-is-initial-task"); // エンドポイントは適当です
  //   const data = await response.json();
  //   setIsInitialTask(data.isInitialTask);
  // };


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

    // payloadとして送信するために、このセッションで選択した全てのアドレスを記憶しておく
    // tips: "..."はスプレット演算子 https://scrapbox.io/tkgshn-private/%22...%22%E3%81%AF%E3%82%B9%E3%83%97%E3%83%AC%E3%83%83%E3%83%89%E6%BC%94%E7%AE%97%E5%AD%90#6541d28538466c001bd841d5
    const newAllSelectedWallets = [...allSelectedWallets, selectedWallets];

    //フロント側に「過去に選択したアドレス」を表示するための関数
    const newSubmittedWallets = [...submittedWallets, selectedWallets];

    setAllSelectedWallets(newAllSelectedWallets);
    setSubmittedWallets(newSubmittedWallets);

    // 何回タスクを解いたかを記憶しておく
    const newSubmitCount = submitCount + 1;
    setSubmitCount(newSubmitCount);


    console.log("selectedWallets", selectedWallets); // 選択したウォレットアドレスがリストに入っている
    ///selectedWallets, 0x4820deb7bbf154739af8e446032b2647f3efcaf9,0xf738a4f3ebb32849240a4b0c71bad5bea8972689,0xaa0bd73e75aeef544d80df25790ba307aeea7c08

    // // 選択状態を解除
    setSelectedWallets([]);

    // タスクの上限に達したかどうかをチェック
    if (newSubmitCount >= maxSubmitCount) {

      // 送信するデータを作成
      const payload = {
        userAddress: getCookie("address"),
        allSelectedWallets: newAllSelectedWallets, // 更新後の allSelectedWallets を使用
        //ここにis_initial_taskのフラグを作る
        is_initial_task: isInitialTask //isInitialTaskはフロントエンドの表示と紐づいている
      };

      // コンソールに出力
      console.log("Payload", payload);

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


      // const claiminfo = {
      //   userAddress: getCookie("address"),
      // };
      // ここでPOSTでAPIを叩く
      console.error("claim_ethを叩きました")
      fetch('https://localhost:1337/api/claim_eth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // body: JSON.stringify(claiminfo)
        body: JSON.stringify({ userAddress: getCookie("address") }) //cookieから取得できるアドレスをuserAddressとしてJSONリクエストに含める
      });
      // fetch(`https://localhost:1337/api/get-latest-task?wallet=${wallet}`);
      // const data = await response.json();

      return; //タスクの上限に達した場合はここで処理を終了する
    }

    // 新しいアドレスを取得（swapと同じ処理）
    // handleSwap();
    // タスクを送信した際にはhandleswapを使うのではなく、新しい選択肢を呼び出して欲しい
    handleLoad();

  };


  // const handleLoad = async () => {
  //   if (!nfts) return;
  //   setIsLoding(true); // Set loading state

  //   const { addresses: newWallets } = await getNFTs(6);

  //   // Check if newWallets is undefined
  //   if (!newWallets) return console.error("Error while fetching new wallets");

  //   // Replace unselected wallets with the new ones
  //   const updatedNfts = nfts.map((nft) => {
  //     if (!selectedWallets.includes(nft.address)) {
  //       const newWallet = newWallets.pop(); // ここも修正
  //       if (newWallet) {
  //         return { address: newWallet.address, links: newWallet.links };
  //       }
  //     }
  //     return nft;
  //   });

  //   // Update the state with the new nfts and selectedWallets
  //   setNfts(updatedNfts);

  //   setIsLoding(false); // Reset loading state
  // };
  // app/(index)/dashboard/tasks.tsx

  // submitされた後に新しいウォレットを取得する関数
  const handleLoad = async () => {
    setIsLoding(true);
    const { addresses, isInitialTask } = await getNFTs(6);
    setNfts(addresses as unknown as { address: string; links: string[]; is_never_selected_address: number }[]);

    setIsInitialTask(Boolean(isInitialTask));

    // unselected_addressesが1のウォレットを選択状態に設定
    const initiallySelected = addresses.filter(nft => nft.is_never_selected_address === 1).map(nft => nft.address);
    setSelectedWallets(initiallySelected);


    setIsLoding(false);
  };

  // const handleSwap = async () => {
  //   if (!nfts) return;
  //   setIsSwapping(true); // Set loading state

  //   const additionalWalletsNeeded = 6 - selectedWallets.length; // 6から選択済みのウォレットの数を引いた数でgetNFTsを叩いている
  //   // もしadditonal taskのStateがtrueな場合は、ここが5になる（それはいい）

  //   if (additionalWalletsNeeded > 0) {
  //     // Fetch additional wallets from your API
  //     const { addresses: newWallets } = await getNFTs(additionalWalletsNeeded);

  //     // Check if newWallets is undefined
  //     if (!newWallets) return console.error("Error while fetching new wallets");

  //     const updatedNfts = nfts.map((nft) => {
  //       if (!selectedWallets.includes(nft.address)) {
  //         const newWallet = newWallets.pop();
  //         if (newWallet) {
  //           return {
  //             address: newWallet.address,
  //             links: newWallet.links,
  //             is_never_selected_address: newWallet.is_never_selected_address
  //           };
  //         }
  //       }
  //       return nft;
  //     });

  //     // Update the state with the new nfts and selectedWallets
  //     setNfts(updatedNfts);
  //     setSelectedWallets((prevSelected) => [
  //       ...prevSelected, // swapボタンを押す前に選択していたアドレスはそのまま残る
  //       ...newWallets.map((wallet: any) => wallet.address),
  //     ]);
  //   }

  //   setIsSwapping(false); // Reset loading state
  // };

  const handleSwap = async () => {
    if (!nfts) return;
    setIsSwapping(true); // Set loading state

    const additionalWalletsNeeded = 6 - selectedWallets.length;
    const is_swap: boolean = true//追加

    if (additionalWalletsNeeded > 0) {
      let newWallets = await fetchNewWallets(additionalWalletsNeeded, is_swap); //　これはswap専用関数にする

      const updatedNfts = nfts.map((nft) => {
        if (!selectedWallets.includes(nft.address)) {
          const newWallet = newWallets.pop();
          if (newWallet) {
            return {
              address: newWallet.address,
              links: newWallet.links,
              is_never_selected_address: newWallet.is_never_selected_address
            };
          }
        }
        return nft;
      });

      setNfts(updatedNfts);
      setSelectedWallets((prevSelected) => [
        ...prevSelected
        // ...newWallets.map((wallet: any) => wallet.address),
      ]);
    }

    setIsSwapping(false); // Reset loading state

    // console.log("Currently selected wallet addresses: ", selectedWallets);
    // console.log("selectedWallets.length", selectedWallets.length);
  };

  // const fetchNewWallets = async (additionalWalletsNeeded) => {
  //   let newWallets = [];
  //   while (newWallets.length < additionalWalletsNeeded) {
  //     const { addresses: fetchedWallets } = await getNFTs(additionalWalletsNeeded);
  //     if (!fetchedWallets) return console.error("Error while fetching new wallets");

  //     // Filter out wallets that are already selected
  //     const uniqueWallets = fetchedWallets.filter((wallet) => !selectedWallets.includes(wallet.address));

  //     newWallets = [...newWallets, ...uniqueWallets];
  //   }
  //   return newWallets;
  // };
  // const fetchNewWallets = async (additionalWalletsNeeded: number): Promise<any[]> => {
  //   let newWallets: any[] = [];
  //   while (newWallets.length < additionalWalletsNeeded) {
  //     const { addresses: fetchedWallets } = await getNFTs(additionalWalletsNeeded);
  //     if (!fetchedWallets) {
  //       console.error("Error while fetching new wallets");
  //       return []; // ここを修正: エラーが発生した場合でも空の配列を返す
  //     }

  //     // Filter out wallets that are already selected
  //     const uniqueWallets = fetchedWallets.filter((wallet: any) => !selectedWallets.includes(wallet.address));

  //     newWallets = [...newWallets, ...uniqueWallets];
  //   }
  //   return newWallets;
  // };
  // const fetchNewWallets = async (additionalWalletsNeeded: number, is_swap: Boolean): Promise<any[]> => {
  //   let newWallets: any[] = [];
  //   while (newWallets.length < additionalWalletsNeeded) {
  //     const { addresses: fetchedWallets } = await getNFTs(additionalWalletsNeeded, false);
  //     if (!fetchedWallets) {
  //       console.error("Error while fetching new wallets");
  //       return []; // ここを修正: エラーが発生した場合でも空の配列を返す
  //     }

  //     // Filter out wallets that are already selected
  //     const uniqueWallets = fetchedWallets.filter((wallet: any) => !selectedWallets.includes(wallet.address));

  //     newWallets = [...newWallets, ...uniqueWallets];
  //   }
  //   return newWallets;
  // };

  // 新しいウォレットを取得する関数
  const fetchNewWallets = async (additionalWalletsNeeded: number, is_swap: boolean): Promise<any[]> => {
    let newWallets: any[] = [];
    // 必要なウォレットが集まるまでループ
    while (newWallets.length < additionalWalletsNeeded) {
      // getNFTs関数を使って新しいウォレットを取得
      const { addresses: fetchedWallets } = await getNFTs(additionalWalletsNeeded, is_swap);
      // ウォレットの取得に失敗した場合はエラーメッセージを出力して空の配列を返す
      if (!fetchedWallets) {
        console.error("Error while fetching new wallets");
        return []; // ここを修正: エラーが発生した場合でも空の配列を返す
      }

      // すでに選択されているウォレットをフィルタリング
      const uniqueWallets = fetchedWallets.filter((wallet: any) => !selectedWallets.includes(wallet.address));

      // 新しいウォレットを追加
      newWallets = [...newWallets, ...uniqueWallets];
    }
    // 新しいウォレットの配列を返す
    return newWallets;
  };


  if (loading || !nfts) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex"> {/* 追加: 最外部のflexコンテナ */}

      {/* 追加: サイドバー */}
      <div className="w-1/5 min-h-screen p-4 border-r">

        <div>
          {/* 新たに追加: is_initial_task の情報を表示 */}
          <h3>Is this an Initial Task?:</h3>
          <p>{isInitialTask !== null ? (isInitialTask ? "Yes" : "No") : "Loading..."}</p>
        </div>

        <div>
          <h3>Current Task Count:</h3>
          <p>{submitCount + 1} / {maxSubmitCount}</p>
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
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Submit"}
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
