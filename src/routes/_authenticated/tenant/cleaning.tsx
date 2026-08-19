import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatsRow, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/DataState";
import { FilterBar, NONE, SelectField } from "@/components/crud";
import { useAuth } from "@/lib/auth";
import { cleaningQuery, myTenantQuery, type Row } from "@/lib/queries";
import { formatDateShort, formatTime, todayISO } from "@/lib/format";
import { CLEANING_STATUS, metaFor, optionsOf } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/tenant/cleaning")({
  head: () => ({
    meta: [
      { title: "Jadwal Cleaning | Tenant KostKu" },
      {
        name: "description",
        content:
          "Lihat jadwal kebersihan kost yang Anda tempati beserta status pengerjaan dan petugas yang bertugas.",
      },
      { property: "og:title", content: "Jadwal Cleaning | Tenant KostKu" },
      { property: "og:description", content: "Jadwal kebersihan kost penghuni." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TenantCleaning,
});

function TenantCleaning() {
  const { user } = useAuth();
  const tenant = useQuery(myTenantQuery(user?.id));
  const record = tenant.data as Row | null | undefined;
  const propertyId = (record?.["property_id"] as string | undefined) ?? "";

  const cleaning = useQuery({ ...cleaningQuery(), enabled: Boolean(propertyId) });
  const [status, setStatus] = useState(NONE);

  const rows = useMemo(
    () => ((cleaning.data ?? []) as Row[]).filter((r) => r["property_id"] === propertyId),
    [cleaning.data, propertyId],
  );

  const filtered = useMemo(
    () => rows.filter((r) => status === NONE || r["status"] === status),
    [rows, status],
  );

  const today = todayISO();
  const upcoming = rows.filter((r) => (r["cleaning_date"] as string) >= today && r["status"] !== "cancelled");

  const columns: Column<Row & { id: string }>[] = [
    {
      key: "when",
      header: "Jadwal",
      cell: (r) => (
        <div>
          <p className="font-medium">{formatDateShort(r["cleaning_date"])}</p>
          <p className="text-xs text-muted-foreground">{formatTime(r["cleaning_time"])}</p>
        </div>
      ),
    },
    {
      key: "prop",
      header: "Kost",
      cell: (r) => r["property"]?.name ?? "—",
    },
    {
      key: "helper",
      header: "Petugas",
      cell: (r) => (
        <span className="text-sm text-muted-foreground">{r["helper"]?.full_name ?? "Belum ditugaskan"}</span>
      ),
    },
    {
      key: "notes",
      header: "Catatan",
      cell: (r) => <span className="text-sm text-muted-foreground">{r["notes"] ?? "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => {
        const m = metaFor(CLEANING_STATUS, r["status"] as string);
        return <StatusBadge label={m.label} tone={m.tone} />;
      },
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Jadwal Cleaning"
        description="Jadwal kebersihan di kost yang Anda tempati."
      />

      {!tenant.isPending && !record ? (
        <div className="panel">
          <EmptyState
            title="Data penghuni belum tersedia"
            description="Hubungi admin untuk menghubungkan akun Anda dengan data kamar."
          />
        </div>
      ) : (
        <>
          <StatsRow isPending={cleaning.isPending && Boolean(propertyId)} count={3}>
            <StatCard label="Total jadwal" value={rows.length} icon={Sparkles} />
            <StatCard
              label="Hari ini"
              value={rows.filter((r) => r["cleaning_date"] === today).length}
              icon={CalendarCheck}
            />
            <StatCard label="Akan datang" value={upcoming.length} />
          </StatsRow>

          <FilterBar>
            <SelectField
              className="h-9 w-44"
              value={status}
              onChange={setStatus}
              options={optionsOf(CLEANING_STATUS)}
              includeNone
              noneLabel="Semua status"
            />
          </FilterBar>

          <DataTable
            columns={columns}
            rows={filtered as (Row & { id: string })[]}
            isPending={cleaning.isPending && Boolean(propertyId)}
            isError={cleaning.isError}
            error={cleaning.error}
            emptyTitle="Belum ada jadwal cleaning"
            emptyDescription="Jadwal kebersihan kost Anda akan tampil di sini."
          />
        </>
      )}
    </div>
  );
}
