import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, DoorClosed } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatsRow, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterBar, NONE, SelectField } from "@/components/crud";
import { Input } from "@/components/ui/input";
import { propertiesQuery, type Row } from "@/lib/queries";
import { formatRupiah } from "@/lib/format";
import { PROPERTY_STATUS, metaFor, optionsOf } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/owner/properties")({
  head: () => ({
    meta: [
      { title: "Properti Saya | Owner KostKu" },
      {
        name: "description",
        content: "Daftar properti kost milik Anda beserta jumlah kamar, okupansi, dan potensi pendapatan.",
      },
      { property: "og:title", content: "Properti Saya | Owner KostKu" },
      { property: "og:description", content: "Pantau properti kost Anda dalam satu halaman." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OwnerProperties,
});

function OwnerProperties() {
  const properties = useQuery(propertiesQuery());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(NONE);

  const rows = (properties.data ?? []) as Row[];

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const q = search.trim().toLowerCase();
        const matchQ =
          !q ||
          String(r["name"] ?? "").toLowerCase().includes(q) ||
          String(r["address"] ?? "").toLowerCase().includes(q) ||
          String(r["city"] ?? "").toLowerCase().includes(q);
        const matchS = status === NONE || r["status"] === status;
        return matchQ && matchS;
      }),
    [rows, search, status],
  );

  const allRooms = rows.flatMap((p) => (p["rooms"] ?? []) as Row[]);
  const occupied = allRooms.filter((r) => r["status"] === "occupied").length;
  const potensi = allRooms.reduce((s, r) => s + Number(r["price"] ?? 0), 0);

  const columns: Column<Row & { id: string }>[] = [
    {
      key: "name",
      header: "Properti",
      cell: (r) => (
        <div className="min-w-0">
          <p className="font-medium">{r["name"]}</p>
          <p className="truncate text-xs text-muted-foreground">{r["address"] ?? "—"}</p>
        </div>
      ),
    },
    { key: "city", header: "Kota", cell: (r) => r["city"] ?? "—" },
    {
      key: "rooms",
      header: "Kamar",
      cell: (r) => {
        const list = (r["rooms"] ?? []) as Row[];
        const occ = list.filter((x) => x["status"] === "occupied").length;
        return (
          <span className="tabular-nums">
            {occ}/{list.length} terisi
          </span>
        );
      },
    },
    {
      key: "price",
      header: "Potensi / bulan",
      align: "right",
      cell: (r) => (
        <span className="tabular-nums">
          {formatRupiah(((r["rooms"] ?? []) as Row[]).reduce((s, x) => s + Number(x["price"] ?? 0), 0))}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => {
        const m = metaFor(PROPERTY_STATUS, r["status"] as string);
        return <StatusBadge label={m.label} tone={m.tone} />;
      },
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Properti Saya" description="Daftar properti kost yang Anda miliki." />

      <StatsRow isPending={properties.isPending}>
        <StatCard label="Total properti" value={rows.length} icon={Building2} />
        <StatCard label="Total kamar" value={allRooms.length} icon={DoorClosed} />
        <StatCard
          label="Okupansi"
          value={allRooms.length ? `${Math.round((occupied / allRooms.length) * 100)}%` : "0%"}
          hint={`${occupied} kamar terisi`}
        />
        <StatCard label="Potensi pendapatan" value={formatRupiah(potensi)} />
      </StatsRow>

      <FilterBar>
        <Input
          className="h-9 w-56"
          placeholder="Cari nama atau alamat…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <SelectField
          className="h-9 w-40"
          value={status}
          onChange={setStatus}
          options={optionsOf(PROPERTY_STATUS)}
          includeNone
          noneLabel="Semua status"
        />
      </FilterBar>

      <DataTable
        columns={columns}
        rows={filtered as (Row & { id: string })[]}
        isPending={properties.isPending}
        isError={properties.isError}
        error={properties.error}
        emptyTitle="Belum ada properti"
        emptyDescription="Properti yang terhubung dengan akun Anda akan muncul di sini."
      />
    </div>
  );
}
