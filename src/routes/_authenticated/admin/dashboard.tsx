import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, DoorClosed, Sparkles, UserPlus, Users } from "lucide-react";

import { PageHeader, SectionTitle } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatsRow, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import {
  cleaningQuery,
  invoicesQuery,
  prospectsQuery,
  roomsQuery,
  tenantsQuery,
  type Row,
} from "@/lib/queries";
import { formatDateShort, formatRupiah } from "@/lib/format";
import { CLEANING_STATUS, INVOICE_STATUS, PROSPECT_STATUS, metaFor } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const rooms = useQuery(roomsQuery());
  const tenants = useQuery(tenantsQuery());
  const prospects = useQuery(prospectsQuery());
  const invoices = useQuery(invoicesQuery());
  const cleaning = useQuery(cleaningQuery());

  const roomRows = (rooms.data ?? []) as Row[];
  const tenantRows = (tenants.data ?? []) as Row[];
  const prospectRows = (prospects.data ?? []) as Row[];
  const invoiceRows = (invoices.data ?? []) as Row[];
  const cleaningRows = (cleaning.data ?? []) as Row[];

  const available = roomRows.filter((r) => r["status"] === "available").length;
  const unpaid = invoiceRows.filter((i) => i["status"] !== "paid");
  const unpaidTotal = unpaid.reduce((sum, i) => sum + Number(i["amount"] ?? 0), 0);

  const prospectCols: Column<Row & { id: string }>[] = [
    { key: "name", header: "Nama", cell: (r) => <span className="font-medium">{r["full_name"]}</span> },
    { key: "prop", header: "Kost", cell: (r) => r["property"]?.name ?? "—" },
    { key: "phone", header: "Telepon", cell: (r) => r["phone"] ?? "—" },
    {
      key: "status",
      header: "Status",
      cell: (r) => {
        const m = metaFor(PROSPECT_STATUS, r["status"]);
        return <StatusBadge label={m.label} tone={m.tone} />;
      },
    },
  ];

  const invoiceCols: Column<Row & { id: string }>[] = [
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

  const cleaningCols: Column<Row & { id: string }>[] = [
    { key: "prop", header: "Kost", cell: (r) => r["property"]?.name ?? "—" },
    { key: "helper", header: "Helper", cell: (r) => r["helper"]?.full_name ?? "Belum ditugaskan" },
    { key: "date", header: "Jadwal", cell: (r) => formatDateShort(r["cleaning_date"]) },
    {
      key: "status",
      header: "Status",
      cell: (r) => {
        const m = metaFor(CLEANING_STATUS, r["status"]);
        return <StatusBadge label={m.label} tone={m.tone} />;
      },
    },
  ];

  return (
    <div className="space-y-7">
      <PageHeader
        title="Dashboard Admin"
        description="Ringkasan operasional seluruh properti kost."
      />

      <StatsRow isPending={rooms.isPending || tenants.isPending}>
        <StatCard label="Kamar Tersedia" value={available} hint={`dari ${roomRows.length} kamar`} icon={DoorClosed} />
        <StatCard label="Tenant Aktif" value={tenantRows.filter((t) => t["status"] === "active").length} icon={Users} />
        <StatCard label="Calon Tenant" value={prospectRows.length} hint="total lead masuk" icon={UserPlus} />
        <StatCard label="Tagihan Belum Lunas" value={formatRupiah(unpaidTotal)} hint={`${unpaid.length} invoice`} icon={CreditCard} />
      </StatsRow>

      <section>
        <SectionTitle title="Calon Tenant Terbaru" description="Lead yang perlu ditindaklanjuti." />
        <DataTable
          columns={prospectCols}
          rows={prospectRows.slice(0, 5) as (Row & { id: string })[]}
          isPending={prospects.isPending}
          isError={prospects.isError}
          error={prospects.error}
          emptyTitle="Belum ada calon tenant"
          emptyDescription="Lead baru akan muncul di sini setelah dicatat."
        />
      </section>

      <section>
        <SectionTitle title="Tagihan Belum Lunas" description="Invoice yang menunggu pembayaran." />
        <DataTable
          columns={invoiceCols}
          rows={unpaid.slice(0, 5) as (Row & { id: string })[]}
          isPending={invoices.isPending}
          isError={invoices.isError}
          error={invoices.error}
          emptyTitle="Semua tagihan sudah lunas"
        />
      </section>

      <section>
        <SectionTitle title="Jadwal Cleaning" description="Aktivitas kebersihan terkini." />
        <DataTable
          columns={cleaningCols}
          rows={cleaningRows.slice(0, 5) as (Row & { id: string })[]}
          isPending={cleaning.isPending}
          isError={cleaning.isError}
          error={cleaning.error}
          emptyTitle="Belum ada jadwal cleaning"
          emptyAction={<Sparkles className="size-4" />}
        />
      </section>
    </div>
  );
}
