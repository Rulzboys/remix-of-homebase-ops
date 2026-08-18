import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { relativeTime } from "@/lib/format";

export type NotificationRow = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export function useNotifications(limit = 30) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notifications", user?.id, limit],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<NotificationRow[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, message, type, is_read, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as NotificationRow[];
    },
  });
}

export function NotificationBell({ notificationsPath }: { notificationsPath: string }) {
  const { data } = useNotifications(8);
  const queryClient = useQueryClient();
  const unread = (data ?? []).filter((n) => !n.is_read).length;

  async function markAllRead() {
    await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
    await queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifikasi">
          <Bell className="size-4" />
          {unread > 0 ? (
            <span className="absolute top-1.5 right-1.5 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] leading-4 font-semibold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <p className="text-sm font-semibold">Notifikasi</p>
          {unread > 0 ? (
            <button
              onClick={markAllRead}
              className="text-xs font-medium text-primary hover:underline"
            >
              Tandai dibaca
            </button>
          ) : null}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {(data ?? []).length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Belum ada notifikasi.
            </p>
          ) : (
            (data ?? []).map((n) => (
              <div
                key={n.id}
                className="border-b border-border px-3 py-2.5 last:border-0 hover:bg-accent/60"
              >
                <div className="flex items-start gap-2">
                  {!n.is_read ? <span className="mt-1.5 size-1.5 rounded-full bg-primary" /> : null}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {relativeTime(n.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="border-t border-border px-3 py-2">
          <Link to={notificationsPath} className="text-xs font-medium text-primary hover:underline">
            Lihat semua notifikasi
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
