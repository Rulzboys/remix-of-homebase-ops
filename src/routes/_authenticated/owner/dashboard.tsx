import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, CreditCard, DoorClosed, Users } from "lucide-react";

import { PageHeader, SectionTitle } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatsRow, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { invoicesQuery, propertiesQuery, tenantsQuery, type Row } from "@/lib/queries";
import { formatDateShort, formatRupiah } from "@/lib/format";
import { INVOICE_STATUS, metaFor } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/owner/dashboard")({
  component: OwnerDashboard,
});

function OwnerDashboard() {
  const properties = useQuery(propertiesQuery());
  const tenants = useQuery(tenantsQuery());
  const invoices = useQuery(invoicesQuery());

  const props = (properties.data ?? []) as Row[];
  const tenantRows = (tenants.data ?? []) as Row[];
  const invoiceRows = (invoices.data ?? []) as Row[];

  const allRooms = props.flatMap((p) => (p["rooms"] ?? []) as Row[]);
  const occupied = allRooms.filter((r) => r["status"] === "occupied").length;
  const paidTotal = invoiceRows
    .filter((i) => i["status"] === "paid")
    .reduce((s, i) => s + Number(i["amount"] ?? 0), 0);

  const cols: Column<Row & { id: string }>[] = [
    { key: "tenant", header: "Tenant", cell: (r) => r["tenant"]?.full_name ?? "—" },
    { key: "prop", header: "Kost", cell: (r) => r["property"]?.name ?? "—" },
    { key: "due", header: "Jatuh Tempo", cell: (r) => formatDateShort(r["due_date"]) },
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
        const m = metaFor(INVOICE_STATUS, r["status"]);
        return <StatusBadge label={m.label} tone={m.tone} />;
      },
    },
  ];

  return (
    <div className="space-y-7">
      <PageHeader title="Dashboard Owner" description="Ringkasan properti dan pendapatan Anda." />
      <StatsRow isPending={properties.isPending}>
        <StatCard label="Properti" value={props.length} icon={Building2} />
        <StatCard
          label="Okupansi"
          value={allRooms.length ? `${Math.round((occupied / allRooms.length) * 100)}%` : "0%"}
          hint={`${occupied} dari ${allRooms.length} kamar terisi`}
          icon={DoorClosed}
        />
        <StatCard
          label="Tenant Aktif"
          value={tenantRows.filter((t) => t["status"] === "active").length}
          icon={Users}
        />
        <StatCard label="Pendapatan Tercatat" value={formatRupiah(paidTotal)} icon={CreditCard} />
      </StatsRow>

      <section>
        <SectionTitle title="Pembayaran Terkini" />
        <DataTable
          columns={cols}
          rows={invoiceRows.slice(0, 8) as (Row & { id: string })[]}
          isPending={invoices.isPending}
          isError={invoices.isError}
          error={invoices.error}
          emptyTitle="Belum ada tagihan"
        />
      </section>
    </div>
  );
}
