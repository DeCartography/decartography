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
            <div className="text-2xl">{balance} ETH</div>
          </CardContent>
        </Card>

        <Card className="w-full relative">
          <div
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 hover:opacity-100"
            style={{ background: 'rgba(255, 255, 255, 0.8)' }}
          >
            <div className="text-black p-2 rounded shadow-md text-center">
              "Stake" function is under the development. You can earn more efficiently by staking before starting a task.

            </div>
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stake</CardTitle>
            {/* Dropdown Menu Here */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="0.8"
              className="h-4 w-4 text-gray-400 hover:text-blue-500 cursor-pointer transition-colors duration-300"
            >
              <path fill="currentColor" d="M19.5,9.5h-.75V6.75a6.75,6.75,0,0,0-13.5,0V9.5H4.5a2,2,0,0,0-2,2V22a2,2,0,0,0,2,2h15a2,2,0,0,0,2-2V11.5A2,2,0,0,0,19.5,9.5Zm-9.5,6a2,2,0,1,1,3,1.723V19.5a1,1,0,0,1-2,0V17.223A1.994,1.994,0,0,1,10,15.5ZM7.75,6.75a4.25,4.25,0,0,1,8.5,0V9a.5.5,0,0,1-.5.5H8.25a.5.5,0,0,1-.5-.5Z"></path>
            </svg>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Balance</p>
              {/* <div className="text-2xl font-bold">0 ETH</div> */}
              <div className="text-2xl">0 ETH</div>
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
