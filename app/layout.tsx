import "./globals.css";
import "./app.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";

import ThemeToggle from "@/components/ThemeToggle";
import Logout from "@/components/Logout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Decartography",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex-col md:flex">
            <div className="ml-auto mr-auto md:w-8/12 md:pt-20">
              <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                  <h2 className="graydient text-xl font-bold tracking-tight md:text-3xl">
                    Decartography
                  </h2>

                  <div className="flex items-center space-x-2">
                    <Logout />
                    <ThemeToggle />
                  </div>
                </div>
                {children}
              </div>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
