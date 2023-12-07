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
          <div className="flex items-center gap-4 font-medium">
            <DoubleArrowUpIcon stroke="red" /> Sent
          </div>
        );
      }
      if (type == "received") {
        return (
          <div className="flex items-center gap-4 font-medium">
            <DoubleArrowDownIcon /> Received
          </div>
        );
      }
      if (type == "invitation_activated") {
        return (
          <div className="flex items-center gap-4 font-medium">
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
        <div className="flex items-center gap-2 font-medium">
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
