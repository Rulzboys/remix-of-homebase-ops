import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileBarChart } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatsRow, type Column } from "@/components/DataTable";
import { FilterBar, NONE, SelectField } from "@/components/crud";
import { invoicesQuery, propertiesQuery, reportsQuery, tenantsQuery, type Row } from "@/lib/queries";
import { formatMonthYear, formatRupiah } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/owner/reports")({
  head: () => ({
    meta: [
      { title: "Laporan Bulanan Properti | Owner KostKu" },
      {
        name: "description",
        content: "Laporan bulanan properti kost Anda: okupansi, pendapatan tercatat, dan catatan maintenance.",
      },
      { property: "og:title", content: "Laporan Bulanan Properti | Owner KostKu" },
      { property: "og:description", content: "Ringkasan performa bulanan properti kost Anda." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OwnerReports,
});

const now = new Date();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => {
  const y = now.getFullYear() - 2 + i;
  return { value: String(y), label: String(y) };
});

function OwnerReports() {
  const reports = useQuery(reportsQuery());
  const properties = useQuery(propertiesQuery());
  const tenants = useQuery(tenantsQuery());
  const invoices = useQuery(invoicesQuery());

  const [year, setYear] = useState(NONE);
  const [propertyId, setPropertyId] = useState(NONE);

  const rows = (reports.data ?? []) as Row[];
  const propRows = (properties.data ?? []) as Row[];
  const invoiceRows = (invoices.data ?? []) as Row[];
  const tenantRows = (tenants.data ?? []) as Row[];

  const propOptions = propRows.map((p) => ({ value: p["id"] as string, label: p["name"] as string }));

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (year === NONE || String(r["year"]) === year) &&
          (propertyId === NONE || r["property_id"] === propertyId),
      ),
    [rows, year, propertyId],
  );

  const allRooms = propRows.flatMap((p) => (p["rooms"] ?? []) as Row[]);
  const occupied = allRooms.filter((r) => r["status"] === "occupied").length;
  const paidTotal = invoiceRows
    .filter((i) => i["status"] === "paid")
    .reduce((s, i) => s + Number(i["amount"] ?? 0), 0);
  const unpaidTotal = invoiceRows
    .filter((i) => i["status"] !== "paid")
    .reduce((s, i) => s + Number(i["amount"] ?? 0), 0);

  const columns: Column<Row & { id: string }>[] = [
    {
      key: "period",
      header: "Periode",
      cell: (r) => (
        <span className="font-medium">
          {formatMonthYear(Number(r["month"] ?? 1), Number(r["year"] ?? now.getFullYear()))}
        </span>
      ),
    },
    { key: "prop", header: "Properti", cell: (r) => r["property"]?.name ?? "—" },
    {
      key: "notes",
      header: "Catatan maintenance",
      cell: (r) => (
        <span className="text-sm text-muted-foreground">{r["maintenance_notes"] ?? "—"}</span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Reports" description="Laporan bulanan dan ringkasan performa properti Anda." />

      <StatsRow isPending={reports.isPending || invoices.isPending}>
        <StatCard label="Laporan tersimpan" value={rows.length} icon={FileBarChart} />
        <StatCard
          label="Okupansi"
          value={allRooms.length ? `${Math.round((occupied / allRooms.length) * 100)}%` : "0%"}
          hint={`${occupied} dari ${allRooms.length} kamar`}
        />
        <StatCard label="Pendapatan tercatat" value={formatRupiah(paidTotal)} />
        <StatCard
          label="Tagihan tertunggak"
          value={formatRupiah(unpaidTotal)}
          hint={`${tenantRows.filter((t) => t["status"] === "active").length} tenant aktif`}
        />
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
          className="h-9 w-40"
          value={year}
          onChange={setYear}
          options={YEAR_OPTIONS}
          includeNone
          noneLabel="Semua tahun"
        />
      </FilterBar>

      <DataTable
        columns={columns}
        rows={filtered as (Row & { id: string })[]}
        isPending={reports.isPending}
        isError={reports.isError}
        error={reports.error}
        emptyTitle="Belum ada laporan"
        emptyDescription="Laporan bulanan dari admin akan tampil di sini."
      />
    </div>
  );
}
