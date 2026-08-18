import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BellRing, Check } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/DataState";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { notificationsQuery, type Row } from "@/lib/queries";
import { formatDateTime, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function NotificationsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data, isPending, isError, error } = useQuery(notificationsQuery(user?.id));
  const rows = (data ?? []) as Row[];
  const unread = rows.filter((n) => !n["is_read"]);

  async function markAll() {
    if (!user?.id || unread.length === 0) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    await qc.invalidateQueries({ queryKey: ["notifications"] });
  }

  async function markOne(id: string) {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    await qc.invalidateQueries({ queryKey: ["notifications"] });
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifikasi"
        description={
          unread.length > 0
            ? `${unread.length} notifikasi belum dibaca`
            : "Semua notifikasi sudah dibaca"
        }
        actions={
          unread.length > 0 ? (
            <Button variant="outline" size="sm" onClick={markAll}>
              <Check className="size-4" /> Tandai semua dibaca
            </Button>
          ) : undefined
        }
      />

      {isError ? (
        <div className="panel">
          <ErrorState message={(error as Error)?.message} />
        </div>
      ) : isPending ? (
        <div className="panel">
          <TableSkeleton cols={2} />
        </div>
      ) : rows.length === 0 ? (
        <div className="panel">
          <EmptyState
            title="Belum ada notifikasi"
            description="Notifikasi akan muncul saat ada aktivitas baru yang berkaitan dengan Anda."
            icon={<BellRing className="size-4" />}
          />
        </div>
      ) : (
        <div className="panel divide-y divide-border">
          {rows.map((n) => (
            <div
              key={n["id"]}
              className={cn(
                "flex items-start gap-3 px-4 py-3.5",
                !n["is_read"] && "bg-primary-soft/40",
              )}
            >
              <span
                className={cn(
                  "mt-1.5 size-2 shrink-0 rounded-full",
                  n["is_read"] ? "bg-border" : "bg-primary",
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{n["title"]}</p>
                {n["body"] ? (
                  <p className="mt-0.5 text-sm text-muted-foreground">{n["body"]}</p>
                ) : null}
                <p className="mt-1 text-xs text-muted-foreground">
                  {relativeTime(n["created_at"])} · {formatDateTime(n["created_at"])}
                </p>
              </div>
              {!n["is_read"] ? (
                <Button variant="ghost" size="sm" onClick={() => markOne(n["id"])}>
                  Tandai
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
