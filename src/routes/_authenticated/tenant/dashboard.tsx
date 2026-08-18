import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, DoorClosed, Home } from "lucide-react";

import { PageHeader, SectionTitle } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatsRow, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/lib/auth";
import { invoicesQuery, myTenantQuery, type Row } from "@/lib/queries";
import { formatDateShort, formatRupiah } from "@/lib/format";
import { INVOICE_STATUS, metaFor } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/tenant/dashboard")({
  component: TenantDashboard,
});

function TenantDashboard() {
  const { user, profile } = useAuth();
  const tenant = useQuery(myTenantQuery(user?.id));
  const record = tenant.data as Row | null | undefined;
  const invoices = useQuery({
    ...invoicesQuery({ tenantId: record?.["id"] ?? "" }),
    enabled: Boolean(record?.["id"]),
  });
  const rows = (invoices.data ?? []) as Row[];
  const unpaid = rows.filter((i) => i["status"] !== "paid");

  const cols: Column<Row & { id: string }>[] = [
    { key: "period", header: "Periode", cell: (r) => formatDateShort(r["billing_month"]) },
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
      <PageHeader
        title={`Halo, ${profile?.full_name ?? "Penghuni"}`}
        description="Ringkasan kost dan tagihan Anda."
      />
      <StatsRow isPending={tenant.isPending} count={3}>
        <StatCard label="Kost" value={record?.["property"]?.name ?? "—"} icon={Home} />
        <StatCard
          label="Kamar"
          value={record?.["room"]?.room_number ?? "—"}
          hint={
            record?.["room"]?.price ? `${formatRupiah(record["room"].price)} / bulan` : "Belum ada"
          }
          icon={DoorClosed}
        />
        <StatCard label="Tagihan Belum Lunas" value={unpaid.length} icon={CreditCard} />
      </StatsRow>

      <section>
        <SectionTitle title="Tagihan Anda" />
        <DataTable
          columns={cols}
          rows={rows as (Row & { id: string })[]}
          isPending={invoices.isPending && Boolean(record?.["id"])}
          isError={invoices.isError}
          error={invoices.error}
          emptyTitle="Belum ada tagihan"
          emptyDescription="Tagihan bulanan akan muncul di sini setelah diterbitkan admin."
        />
      </section>
    </div>
  );
}
