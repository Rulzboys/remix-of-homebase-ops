import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatsRow, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterBar, NONE, SelectField } from "@/components/crud";
import { cleaningQuery, propertiesQuery, type Row } from "@/lib/queries";
import { formatDateShort, formatTime } from "@/lib/format";
import { CLEANING_STATUS, metaFor, optionsOf } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/owner/cleaning")({
  head: () => ({
    meta: [
      { title: "Jadwal Cleaning Properti | Owner KostKu" },
      {
        name: "description",
        content: "Pantau jadwal dan status kebersihan setiap properti kost Anda beserta petugas yang bertugas.",
      },
      { property: "og:title", content: "Jadwal Cleaning Properti | Owner KostKu" },
      { property: "og:description", content: "Riwayat dan jadwal cleaning properti kost Anda." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OwnerCleaning;
});

function OwnerCleaning() {
  const cleaning = useQuery(cleaningQuery());
  const properties = useQuery(propertiesQuery());
  const [status, setStatus] = useState(NONE);
  const [propertyId, setPropertyId] = useState(NONE);

  const rows = (cleaning.data ?? []) as Row[];
  const propOptions = ((properties.data ?? []) as Row[]).map((p) => ({
    value: p["id"] as string,
    label: p["name"] as string,
  }));

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (status === NONE || r["status"] === status) &&
          (propertyId === NONE || r["property_id"] === propertyId),
      ),
    [rows, status, propertyId],
  );

  const columns: Column<Row & { id: string }>[] = [
    {
      key: "date",
      header: "Jadwal",
      cell: (r) => (
        <div>
          <p className="font-medium">{formatDateShort(r["cleaning_date"])}</p>
          <p className="text-xs text-muted-foreground">{formatTime(r["cleaning_time"])}</p>
        </div>
      ),
    },
    { key: "prop", header: "Properti", cell: (r) => r["property"]?.name ?? "—" },
    { key: "helper", header: "Petugas", cell: (r) => r["helper"]?.full_name ?? "Belum ditugaskan" },
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
      <PageHeader title="Cleaning" description="Jadwal dan riwayat kebersihan properti Anda." />

      <StatsRow isPending={cleaning.isPending}>
        <StatCard label="Total jadwal" value={rows.length} icon={Sparkles} />
        <StatCard label="Terjadwal" value={rows.filter((r) => r["status"] === "scheduled").length} />
        <StatCard label="Berlangsung" value={rows.filter((r) => r["status"] === "in_progress").length} />
        <StatCard label="Selesai" value={rows.filter((r) => r["status"] === "completed").length} />
      </StatsRow>

      <FilterBar>
        <SelectField
          className="h-9 w-48"
          value={propertyId}
          onChange={setPropertyId}
          options={propOptions}
          includeNone
          noneLabel="Semua properti"
        />
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
        isPending={cleaning.isPending}
        isError={cleaning.isError}
        error={cleaning.error}
        emptyTitle="Belum ada jadwal cleaning"
        emptyDescription="Jadwal cleaning untuk properti Anda akan tampil di sini."
      />
    </div>
  );
}
