import type { ReactNode } from "react";

import { CardsSkeleton, EmptyState, ErrorState, TableSkeleton } from "@/components/DataState";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  header: string;
  align?: "left" | "right";
  className?: string;
  cell: (row: T) => ReactNode;
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  isPending,
  isError,
  error,
  emptyTitle = "Belum ada data",
  emptyDescription,
  emptyAction,
}: {
  columns: Column<T>[];
  rows: T[] | undefined;
  isPending?: boolean;
  isError?: boolean;
  error?: unknown;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
}) {
  if (isError) {
    return (
      <div className="panel">
        <ErrorState message={(error as Error)?.message} />
      </div>
    );
  }
  if (isPending) {
    return (
      <div className="panel">
        <TableSkeleton cols={Math.min(columns.length, 5)} />
      </div>
    );
  }
  if (!rows || rows.length === 0) {
    return (
      <div className="panel">
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      </div>
    );
  }

  return (
    <div className="panel overflow-x-auto">
      <table className="w-full min-w-[42rem] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left">
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  "px-4 py-2.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase",
                  c.align === "right" && "text-right",
                  c.className,
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-muted/40">
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "px-4 py-3 align-middle",
                    c.align === "right" && "text-right",
                    c.className,
                  )}
                >
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatsRow({
  isPending,
  count = 4,
  children,
}: {
  isPending?: boolean;
  count?: number;
  children: ReactNode;
}) {
  if (isPending) return <CardsSkeleton count={count} />;
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>;
}
