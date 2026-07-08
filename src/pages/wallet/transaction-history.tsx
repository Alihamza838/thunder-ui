"use client";

import {
  IconArrowNarrowUp,
  IconArrowDownDashed,
  IconRepeat,
  IconCreditCardPay,
} from "@tabler/icons-react";
import type { ComponentType } from "react";

export type Transaction = {
  id: string;
  type: "send" | "deposit" | "swap" | "buy";
  title: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  status: "completed" | "pending" | "failed";
};

const TYPE_ICONS: Record<Transaction["type"], ComponentType<{ className?: string }>> = {
  send: IconArrowNarrowUp,
  deposit: IconArrowDownDashed,
  swap: IconRepeat,
  buy: IconCreditCardPay,
};

const STATUS_STYLES: Record<Transaction["status"], string> = {
  completed: "text-emerald-500",
  pending: "text-amber-500",
  failed: "text-red-500",
};

const STATIC_TRANSACTIONS: Transaction[] = [
  // {
  //   id: "1",
  //   type: "send",
  //   title: "Sent DZE",
  //   description: "To 0x8f3a...b2c1",
  //   amount: -50.00,
  //   currency: "DZE",
  //   date: "2026-07-08T10:30:00",
  //   status: "completed",
  // },
  // {
  //   id: "2",
  //   type: "deposit",
  //   title: "Deposit",
  //   description: "From bank account",
  //   amount: 200.00,
  //   currency: "DZE",
  //   date: "2026-07-07T14:15:00",
  //   status: "completed",
  // },
  // {
  //   id: "3",
  //   type: "buy",
  //   title: "Bought DZE",
  //   description: "Via credit card",
  //   amount: 150.00,
  //   currency: "DZE",
  //   date: "2026-07-06T09:45:00",
  //   status: "completed",
  // },
  // {
  //   id: "4",
  //   type: "swap",
  //   title: "Swapped ETH → DZE",
  //   description: "0.05 ETH",
  //   amount: 85.50,
  //   currency: "DZE",
  //   date: "2026-07-05T18:20:00",
  //   status: "completed",
  // },
  // {
  //   id: "5",
  //   type: "send",
  //   title: "Sent DZE",
  //   description: "To 0x2d4e...a8f3",
  //   amount: -25.00,
  //   currency: "DZE",
  //   date: "2026-07-04T11:00:00",
  //   status: "pending",
  // },
  // {
  //   id: "6",
  //   type: "deposit",
  //   title: "Deposit",
  //   description: "From external wallet",
  //   amount: 300.00,
  //   currency: "DZE",
  //   date: "2026-07-03T16:30:00",
  //   status: "completed",
  // },
  // {
  //   id: "7",
  //   type: "buy",
  //   title: "Bought DZE",
  //   description: "Via Apple Pay",
  //   amount: 75.00,
  //   currency: "DZE",
  //   date: "2026-07-02T08:10:00",
  //   status: "failed",
  // },
];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatAmount(amount: number, currency: string) {
  const sign = amount >= 0 ? "+" : "";
  return `${sign}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

export function TransactionHistory() {
  return (
    
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Transactions</h3>
        <button
          type="button"
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
        </button>
      </div>
      {STATIC_TRANSACTIONS.length === 0 && (
        <div className="py-6 text-center">
          <p className="text-sm text-muted-foreground">
            No transactions to display
          </p>
        </div>
      )}  
      
      <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
        {STATIC_TRANSACTIONS.map((tx) => {
          const Icon = TYPE_ICONS[tx.type];
          return (
            <div
              key={tx.id}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                <Icon className="h-4 w-4" />
              </span>

              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-foreground">
                  {tx.title}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {tx.description}
                </span>
              </div>

              <div className="flex shrink-0 flex-col items-end">
                <span
                  className={`text-sm font-medium ${tx.amount >= 0 ? "text-green" : "text-foreground"}`}
                >
                  {formatAmount(tx.amount, tx.currency)}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs ${STATUS_STYLES[tx.status]}`}>
                    {tx.status === "completed" ? "✓" : tx.status === "pending" ? "◷" : "✕"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(tx.date)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
