import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Transaction, columns } from "@/components/ActivityTable/Columns";
import DataTable from "@/components/ActivityTable";

export default function Wallets({
  balance,
  transactions,
  ethToUSD,
}: {
  balance: number;
  transactions: Transaction[];
  ethToUSD: number;
}) {
  return (
    <div className="mt-5 space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Total Amount</p>
        <p className="text-3xl">
          {balance} ETH ({(balance * ethToUSD).toFixed(2)} USD)
        </p>
        <p>
          <a
            href="https://google.com"
            className="text-sm font-semibold text-primary hover:underline hover:underline-offset-4"
          >
            More details in explorer
          </a>
        </p>
      </div>
      <div className="flex flex-wrap justify-between gap-4 md:flex-nowrap">
        <Card className="w-full bg-primary text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Main</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <p className="text-xs opacity-80">Balance</p>
            <div className="text-2xl font-bold">{balance} ETH</div>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stake</CardTitle>
            {/* Dropdown Menu Here */}
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Balance</p>
            <div className="text-2xl font-bold">0 ETH</div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4">
        <p className="text-md font-bold">Activity</p>
        <DataTable columns={columns} data={transactions} />
      </div>
    </div>
  );
}
