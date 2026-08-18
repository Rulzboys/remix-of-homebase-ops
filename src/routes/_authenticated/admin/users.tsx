import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield, Users } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatsRow, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterBar, NONE, SelectField } from "@/components/crud";
import { supabase } from "@/integrations/supabase/client";
import { usersQuery, type Row } from "@/lib/queries";
import { formatDateShort, initials } from "@/lib/format";
import { ROLE_LABEL } from "@/lib/status";
import type { AppRole } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({
    meta: [
      { title: "Kelola Pengguna & Role | Admin KostKu" },
      {
        name: "description",
        content: "Atur hak akses pengguna aplikasi kost: admin, owner, assistant, helper, dan tenant.",
      },
      { property: "og:title", content: "Kelola Pengguna & Role | Admin KostKu" },
      { property: "og:description", content: "Panel admin untuk manajemen pengguna dan perannya." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminUsers,
});

const ROLES: AppRole[] = ["admin", "owner", "assistant", "helper", "tenant"];
const ROLE_OPTIONS = ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] ?? r }));

function AdminUsers() {
  const qc = useQueryClient();
  const users = useQuery(usersQuery());
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState(NONE);

  const rows = (users.data ?? []) as Row[];

  const filtered = useMemo(
    () =>
      rows.filter((u) => {
        const roles = (u["roles"] as string[]) ?? [];
        if (roleFilter !== NONE && !roles.includes(roleFilter)) return false;
        if (q) {
          const hay = `${u["full_name"] ?? ""} ${u["email"] ?? ""}`.toLowerCase();
          if (!hay.includes(q.toLowerCase())) return false;
        }
        return true;
      }),
    [rows, q, roleFilter],
  );

  const stats = useMemo(() => {
    const count = (role: string) =>
      rows.filter((u) => ((u["roles"] as string[]) ?? []).includes(role)).length;
    return {
      total: rows.length,
      admin: count("admin"),
      owner: count("owner"),
      staff: count("assistant") + count("helper"),
    };
  }, [rows]);

  const toggleRole = useMutation({
    mutationFn: async ({
      userId,
      role,
      enabled,
    }: {
      userId: string;
      role: AppRole;
      enabled: boolean;
    }) => {
      if (enabled) {
        const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", role);
        if (error) throw error;
      }
    },
    onSuccess: (_d, v) => {
      toast.success(v.enabled ? `Role ${ROLE_LABEL[v.role]} ditambahkan.` : `Role ${ROLE_LABEL[v.role]} dicabut.`);
      void qc.invalidateQueries({ queryKey: ["users"] });
      void qc.invalidateQueries({ queryKey: ["profiles-by-role"] });
      void qc.invalidateQueries({ queryKey: ["owners"] });
    },
    onError: (e: Error) => toast.error(e.message || "Gagal mengubah role."),
  });

  const columns: Column<Row & { id: string }>[] = [
    {
      key: "user",
      header: "Pengguna",
      cell: (u) => (
        <div className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
            {initials(u["full_name"] as string)}
          </span>
          <div className="min-w-0">
            <p className="font-medium">{u["full_name"] ?? "—"}</p>
            <p className="truncate text-xs text-muted-foreground">{u["email"] ?? "—"}</p>
          </div>
        </div>
      ),
    },
    { key: "phone", header: "Telepon", cell: (u) => u["phone"] ?? "—" },
    { key: "joined", header: "Bergabung", cell: (u) => formatDateShort(u["created_at"]) },
    {
      key: "roles",
      header: "Role",
      cell: (u) => {
        const roles = ((u["roles"] as string[]) ?? []) as AppRole[];
        return (
          <div className="flex flex-wrap gap-1.5">
            {ROLES.map((role) => {
              const active = roles.includes(role);
              return (
                <Button
                  key={role}
                  size="sm"
                  variant={active ? "default" : "outline"}
                  className="h-7 px-2 text-xs"
                  disabled={toggleRole.isPending}
                  onClick={() =>
                    toggleRole.mutate({
                      userId: u["id"] as string,
                      role,
                      enabled: !active,
                    })
                  }
                >
                  {ROLE_LABEL[role]}
                </Button>
              );
            })}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Akses",
      align: "right",
      cell: (u) => {
        const roles = ((u["roles"] as string[]) ?? []) as AppRole[];
        return roles.length ? (
          <StatusBadge label={`${roles.length} role`} tone="success" />
        ) : (
          <StatusBadge label="Tanpa role" tone="warning" />
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users"
        description="Kelola pengguna aplikasi dan hak aksesnya. Klik role untuk menambah atau mencabut."
      />

      <StatsRow isPending={users.isPending}>
        <StatCard label="Total pengguna" value={stats.total} icon={Users} />
        <StatCard label="Admin" value={stats.admin} icon={Shield} />
        <StatCard label="Owner" value={stats.owner} />
        <StatCard label="Assistant & helper" value={stats.staff} />
      </StatsRow>

      <FilterBar>
        <Input
          className="h-9 w-56"
          placeholder="Cari nama atau email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <SelectField
          className="h-9 w-44"
          value={roleFilter}
          onChange={setRoleFilter}
          options={ROLE_OPTIONS}
          includeNone
          noneLabel="Semua role"
        />
      </FilterBar>

      <DataTable
        columns={columns}
        rows={filtered as (Row & { id: string })[]}
        isPending={users.isPending}
        isError={users.isError}
        error={users.error}
        emptyTitle="Belum ada pengguna"
      />
    </div>
  );
}
