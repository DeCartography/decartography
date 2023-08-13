"use client";
import { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import {
  CheckCircledIcon,
  DotsHorizontalIcon,
  DoubleArrowUpIcon,
  DoubleArrowDownIcon,
} from "@radix-ui/react-icons";

export type Transaction = {
  id: string;
  type: "sent" | "received" | "invitation_activated";
  address: string;
  amount: number;
  fee: number;
  date: string;
  blockchain_transaction_id: string;
  blockchain_transaction_status: "pending" | "confirmed";
};

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "type",
    header: "Transaction",
    cell: ({ row }) => {
      const type = row.getValue("type");

      if (type == "sent") {
        return (
          <div className="flex gap-4 font-medium items-center">
            <DoubleArrowUpIcon stroke="red" /> Sent
          </div>
        );
      }
      if (type == "received") {
        return (
          <div className="flex gap-4 font-medium items-center">
            <DoubleArrowDownIcon /> Received
          </div>
        );
      }
      if (type == "invitation_activated") {
        return (
          <div className="flex gap-4 font-medium items-center">
            <DoubleArrowDownIcon /> Invitation Activated
          </div>
        );
      }
    },
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => {
      const truncatedAddress =
        (row.getValue("address") as string).slice(0, 14) +
        "..." +
        (row.getValue("address") as string).slice(-4);

      return (
        <div className="font-medium">
          {row.original.type === "sent" ? "to" : "from"} {truncatedAddress}
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount, ETH</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));

      return (
        <div
          className={cn("text-right font-medium", amount < 0 && "text-red-500")}
        >
          {amount}
        </div>
      );
    },
  },
  {
    accessorKey: "fee",
    header: () => <div className="text-right">Fee, ETH</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("fee"));

      return <div className={cn("text-right font-medium")}>{amount}</div>;
    },
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "blockchain_transaction_id",
    header: "Blockchain Transaction ID",
    cell: ({ row }) => {
      const truncatedAddress =
        (row.getValue("address") as string).slice(0, 14) +
        "..." +
        (row.getValue("address") as string).slice(-4);

      const status = row.original.blockchain_transaction_status;

      return (
        <div className="font-medium flex gap-2 items-center">
          {status === "confirmed" ? (
            <CheckCircledIcon stroke="green" />
          ) : (
            <DotsHorizontalIcon />
          )}{" "}
          {truncatedAddress}
        </div>
      );
    },
  },
];

export const transactions: Transaction[] = [
  {
    id: "1",
    type: "sent",
    address: "0x98D16d7021930b76d702133e4",
    amount: -0.2,
    fee: 0.0014,
    date: "1/15/2022, 8:34:05 PM",
    blockchain_transaction_id: "0x0ac2d45cb1b0b37c45cb1b0e93",
    blockchain_transaction_status: "confirmed",
  },
  {
    id: "2",
    type: "received",
    address: "0xE7A8Bc1A5F21dC7519bFa2C4E5",
    amount: 1.5,
    fee: 0.002,
    date: "2/5/2022, 10:15:30 AM",
    blockchain_transaction_id: "0x8f27a14d590c813d592c813d59",
    blockchain_transaction_status: "pending",
  },
  {
    id: "3",
    type: "invitation_activated",
    address: "0xF43B9eC5D6a7Ea820A7Df90c3C",
    amount: 0.5,
    fee: 0.001,
    date: "3/20/2022, 3:22:45 PM",
    blockchain_transaction_id: "0x57b8e6f14a9b0e6f14a9b0e6f1",
    blockchain_transaction_status: "confirmed",
  },
];
