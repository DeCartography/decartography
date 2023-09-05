import { Metadata } from "next";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { formatTransactions } from "@/lib/helpers";
import { Transaction } from "@/components/ActivityTable/Columns";
import { cookies } from "next/headers";
import AccountView from "./account";
import WalletsView from "./wallets";
import TaskView from "./tasks";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Decartography | Dashboard",
};

interface TransactionData {
  transactions: any;
  balance: any;
  ethToUSD: any;
  wallet: any;
  gitcoinPassportScore: any;
}

async function getTransactions(): Promise<TransactionData> {
  try {
    const wallet = (await cookies().get("address"))?.value;
    if (!wallet)
      return {
        transactions: [],
        balance: 0,
        ethToUSD: 0,
        wallet: "",
        gitcoinPassportScore: 0,
      };

    const ethToUSD = (
      await (
        await fetch("https://api.coinbase.com/v2/exchange-rates?currency=ETH")
      ).json()
    ).data.rates.USD;

    const gitcoinPassportScore = await (
      await (
        await fetch(
          `${process.env.BACKEND_URL}/api/get-passport-score?address=${wallet}`,
        )
      ).json()
    ).score;

    const balanceRes = await fetch(
      `${process.env.BACKEND_URL}/api/get-eth?address=${wallet}`,
    );
    const balance = parseInt((await balanceRes.json()).balance) / 1e18;

    const transactionsRes = await fetch(
      `${process.env.BACKEND_URL}/api/get-txs?address=${wallet}`,
    );
    const transactions = await formatTransactions(
      (await transactionsRes.json()).result,
      wallet,
    );
    return {
      transactions: transactions as Transaction[],
      balance,
      ethToUSD,
      wallet,
      gitcoinPassportScore,
    };
  } catch (e) {
    return {
      transactions: [],
      balance: 0,
      ethToUSD: 0,
      wallet: "",
      gitcoinPassportScore: 0,
    };
  }
}

export default async function DashboardPage() {
  const { transactions, balance, ethToUSD, wallet, gitcoinPassportScore } =
    await getTransactions();

  return (
    <>
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">My Account</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="task">Task</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <AccountView wallet={wallet} passportScore={gitcoinPassportScore} />
        </TabsContent>
        <TabsContent value="wallets">
          <WalletsView
            balance={balance}
            transactions={transactions as Transaction[]}
            ethToUSD={ethToUSD}
          />
        </TabsContent>
        <TabsContent value="task">
          <TaskView />
        </TabsContent>
      </Tabs>
      {/* <div className="flex-col md:flex">
        <div className="md:w-8/12 ml-auto mr-auto md:pt-20">
          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
              <h2 className="text-xl md:text-3xl font-bold tracking-tight graydient">
                Decartography
              </h2>

              <div className="flex items-center space-x-2">
                <Logout />
                <ThemeToggle />
              </div>
            </div>
            <p>Here </p>
          </div>
        </div>
      </div> */}
    </>
  );
}
