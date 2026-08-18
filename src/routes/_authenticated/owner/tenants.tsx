import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Users } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatsRow, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterBar, NONE, SelectField } from "@/components/crud";
import { Input } from "@/components/ui/input";
import { propertiesQuery, tenantsQuery, type Row } from "@/lib/queries";
import { formatDateShort, formatRupiah, whatsappLink } from "@/lib/format";
import { TENANT_STATUS, metaFor, optionsOf } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/owner/tenants")({
  head: () => ({
    meta: [
      { title: "Tenant Kost Saya | Owner KostKu" },
      {
        name: "description",
        content: "Daftar penghuni aktif di properti kost Anda lengkap dengan kamar, harga sewa, dan tanggal check-in.",
      },
      { property: "og:title", content: "Tenant Kost Saya | Owner KostKu" },
      { property: "og:description", content: "Pantau penghuni kost Anda dan hubungi lewat WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OwnerTenants,
});

function OwnerTenants() {
  const tenants = useQuery(tenantsQuery());
  const properties = useQuery(propertiesQuery());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(NONE);
  const [propertyId, setPropertyId] = useState(NONE);

  const rows = (tenants.data ?? []) as Row[];
  const propOptions = ((properties.data ?? []) as Row[]).map((p) => ({
    value: p["id"] as string,
    label: p["name"] as string,
  }));

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const q = search.trim().toLowerCase();
        const matchQ =
          !q ||
          String(r["full_name"] ?? "").toLowerCase().includes(q) ||
          String(r["phone"] ?? "").toLowerCase().includes(q);
        const matchS = status === NONE || r["status"] === status;
        const matchP = propertyId === NONE || r["property_id"] === propertyId;
        return matchQ && matchS && matchP;
      }),
    [rows, search, status, propertyId],
  );

  const active = rows.filter((r) => r["status"] === "active");
  const monthly = active.reduce((s, r) => s + Number(r["monthly_price"] ?? 0), 0);

  const columns: Column<Row & { id: string }>[] = [
    {
      key: "name",
      header: "Tenant",
      cell: (r) => (
        <div className="min-w-0">
          <p className="font-medium">{r["full_name"]}</p>
          <p className="truncate text-xs text-muted-foreground">{r["phone"] ?? "—"}</p>
        </div>
      ),
    },
    { key: "prop", header: "Kost", cell: (r) => r["property"]?.name ?? "—" },
    { key: "room", header: "Kamar", cell: (r) => r["room"]?.room_number ?? "—" },
    { key: "checkin", header: "Check-in", cell: (r) => formatDateShort(r["check_in_date"]) },
    {
      key: "price",
      header: "Sewa / bulan",
      align: "right",
      cell: (r) => <span className="tabular-nums">{formatRupiah(r["monthly_price"])}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => {
        const m = metaFor(TENANT_STATUS, r["status"] as string);
        return <StatusBadge label={m.label} tone={m.tone} />;
      },
    },
    {
      key: "wa",
      header: "Kontak",
      align: "right",
      cell: (r) =>
        r["phone"] ? (
          <a
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            href={whatsappLink(r["phone"] as string, `Halo ${r["full_name"]}, `)}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle className="size-4" /> WhatsApp
          </a>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Tenant" description="Penghuni yang tinggal di properti Anda." />

      <StatsRow isPending={tenants.isPending}>
        <StatCard label="Total tenant" value={rows.length} icon={Users} />
        <StatCard label="Tenant aktif" value={active.length} />
        <StatCard label="Tenant nonaktif" value={rows.length - active.length} />
        <StatCard label="Sewa aktif / bulan" value={formatRupiah(monthly)} />
      </StatsRow>

      <FilterBar>
        <Input
          className="h-9 w-56"
          placeholder="Cari nama atau nomor…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <SelectField
          className="h-9 w-48"
          value={propertyId}
          onChange={setPropertyId}
          options={propOptions}
          includeNone
          noneLabel="Semua properti"
        />
        <SelectField
          className="h-9 w-40"
          value={status}
          onChange={setStatus}
          options={optionsOf(TENANT_STATUS)}
          includeNone
          noneLabel="Semua status"
        />
      </FilterBar>

      <DataTable
        columns={columns}
        rows={filtered as (Row & { id: string })[]}
        isPending={tenants.isPending}
        isError={tenants.isError}
        error={tenants.error}
        emptyTitle="Belum ada tenant"
        emptyDescription="Tenant di properti Anda akan tampil di sini."
      />
    </div>
  );
}
