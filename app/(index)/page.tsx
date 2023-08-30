import { Metadata } from "next";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { transactions } from "@/components/ActivityTable/Columns";
import AccountView from "./account";
import WalletsView from "./wallets";
import TaskView from "./tasks";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Example dashboard app using the components.",
};

async function getTransactions() {
  return transactions;
}

export default function DashboardPage() {
  return (
    <>
      <Tabs defaultValue="task" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">My Account</TabsTrigger>
          <TabsTrigger value="wallets">Wlallets</TabsTrigger>
          <TabsTrigger value="task">Task</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <AccountView />
        </TabsContent>
        <TabsContent value="wallets">
          <WalletsView transactions={transactions} />
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
