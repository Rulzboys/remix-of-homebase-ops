import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CreditCard } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatsRow, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterBar, NONE, SelectField } from "@/components/crud";
import { Input } from "@/components/ui/input";
import { invoicesQuery, propertiesQuery, type Row } from "@/lib/queries";
import { formatBillingMonth, formatDateShort, formatRupiah } from "@/lib/format";
import { INVOICE_STATUS, metaFor, optionsOf } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/owner/payments")({
  head: () => ({
    meta: [
      { title: "Pembayaran & Tagihan | Owner KostKu" },
      {
        name: "description",
        content: "Rekap tagihan sewa kost: nominal lunas, tertunggak, dan riwayat pembayaran tenant Anda.",
      },
      { property: "og:title", content: "Pembayaran & Tagihan | Owner KostKu" },
      { property: "og:description", content: "Pantau arus pembayaran sewa properti kost Anda." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OwnerPayments,
});

function OwnerPayments() {
  const invoices = useQuery(invoicesQuery());
  const properties = useQuery(propertiesQuery());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(NONE);
  const [propertyId, setPropertyId] = useState(NONE);

  const rows = (invoices.data ?? []) as Row[];
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
          String(r["invoice_number"] ?? "").toLowerCase().includes(q) ||
          String(r["tenant"]?.full_name ?? "").toLowerCase().includes(q);
        const matchS = status === NONE || r["status"] === status;
        const matchP = propertyId === NONE || r["property_id"] === propertyId;
        return matchQ && matchS && matchP;
      }),
    [rows, search, status, propertyId],
  );

  const sum = (list: Row[]) => list.reduce((s, r) => s + Number(r["amount"] ?? 0), 0);
  const paid = rows.filter((r) => r["status"] === "paid");
  const unpaid = rows.filter((r) => r["status"] === "unpaid");
  const overdue = rows.filter((r) => r["status"] === "overdue");

  const columns: Column<Row & { id: string }>[] = [
    {
      key: "inv",
      header: "Invoice",
      cell: (r) => (
        <div className="min-w-0">
          <p className="font-medium">{r["invoice_number"]}</p>
          <p className="text-xs text-muted-foreground">{formatBillingMonth(r["billing_month"])}</p>
        </div>
      ),
    },
    { key: "tenant", header: "Tenant", cell: (r) => r["tenant"]?.full_name ?? "—" },
    { key: "prop", header: "Kost", cell: (r) => r["property"]?.name ?? "—" },
    { key: "room", header: "Kamar", cell: (r) => r["room"]?.room_number ?? "—" },
    { key: "due", header: "Jatuh tempo", cell: (r) => formatDateShort(r["due_date"]) },
    {
      key: "amount",
      header: "Nominal",
      align: "right",
      cell: (r) => <span className="tabular-nums">{formatRupiah(r["amount"])}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => {
        const m = metaFor(INVOICE_STATUS, r["status"] as string);
        return <StatusBadge label={m.label} tone={m.tone} />;
      },
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Payment" description="Tagihan sewa dan status pembayaran tenant Anda." />

      <StatsRow isPending={invoices.isPending}>
        <StatCard label="Total tagihan" value={rows.length} icon={CreditCard} />
        <StatCard label="Sudah dibayar" value={formatRupiah(sum(paid))} hint={`${paid.length} invoice`} />
        <StatCard label="Belum dibayar" value={formatRupiah(sum(unpaid))} hint={`${unpaid.length} invoice`} />
        <StatCard label="Terlambat" value={formatRupiah(sum(overdue))} hint={`${overdue.length} invoice`} />
      </StatsRow>

      <FilterBar>
        <Input
          className="h-9 w-56"
          placeholder="Cari invoice atau tenant…"
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
          className="h-9 w-44"
          value={status}
          onChange={setStatus}
          options={optionsOf(INVOICE_STATUS)}
          includeNone
          noneLabel="Semua status"
        />
      </FilterBar>

      <DataTable
        columns={columns}
        rows={filtered as (Row & { id: string })[]}
        isPending={invoices.isPending}
        isError={invoices.isError}
        error={invoices.error}
        emptyTitle="Belum ada tagihan"
        emptyDescription="Tagihan sewa untuk properti Anda akan tampil di sini."
      />
    </div>
  );
}
