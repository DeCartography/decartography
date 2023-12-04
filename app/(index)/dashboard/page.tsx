import { Metadata } from "next";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { formatTransactions } from "@/lib/helpers";
import { Transaction } from "@/components/ActivityTable/Columns";
import { cookies } from "next/headers";

import AccountView from "./account";
import WalletsView from "./wallets";

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

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function getTransactions(): Promise<TransactionData> {
  try {
    // console.log("getTransactions function is triggered"); // debug
    const _auth = await (await cookies().get("_auth"))?.value;
    // console.log("_auth is " + _auth) // debug
    const wallet = await (await cookies().get("address"))?.value;
    // console.log("wallet is " + wallet) // debug

    if (!wallet)
      return {
        transactions: [],
        balance: 0,
        ethToUSD: 0,
        wallet: "",
        gitcoinPassportScore: 0,
      };

    const ethToUSD = (
      // console.log("ethToUSD"),
      await (
        await fetch("https://api.coinbase.com/v2/exchange-rates?currency=ETH")
      ).json()
    ).data.rates.USD;

    const gitcoinPassportScore = await (
      // console.log("gitcoinPassporeScore"),
      await (
        await fetch(
          // `${process.env.BACKEND_URL}/api/get-passport-score?address=${wallet}`,
          `https://localhost:1337/api/get-passport-score?address=${wallet}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${_auth}`,
            },
          },
        )
      ).json()
    ).score;

    const balanceRes = await fetch(
      // `${process.env.BACKEND_URL}/api/get-eth?address=${wallet}`,
      `https://localhost:1337/api/get-eth?address=${wallet}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${_auth}`,
        },
      },
    );
    const balance = parseInt((await balanceRes.json()).balance) / 1e18;

    const transactionsRes = await fetch(
      // `${process.env.BACKEND_URL}/api/get-txs?address=${wallet}`,
      `https://localhost:1337/api/get-txs?address=${wallet}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${_auth}`,
        },
      },
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

    console.error("An error occurred:", e); // debug

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


  //todo: redirect to dashboard?tab=wallets as directly

  const { transactions, balance, ethToUSD, wallet, gitcoinPassportScore } =
    await getTransactions();

    // console.log("gitcoinPassportScore: " + gitcoinPassportScore) // debug
    // console.log(wallet+"'s balance: " + balance + "(" + (balance * ethToUSD).toFixed(2) + " USD)")

  return (
    <>
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">My Account</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
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
      </Tabs>
    </>
  );
}
