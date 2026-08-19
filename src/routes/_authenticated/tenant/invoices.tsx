import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Wallet } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatsRow, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/DataState";
import { FilterBar, NONE, SelectField } from "@/components/crud";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { invoicesQuery, myTenantQuery, type Row } from "@/lib/queries";
import { formatBillingMonth, formatDateShort, formatRupiah, whatsappLink } from "@/lib/format";
import { INVOICE_STATUS, metaFor, optionsOf } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/tenant/invoices")({
  head: () => ({
    meta: [
      { title: "Tagihan Saya | Tenant KostKu" },
      {
        name: "description",
        content:
          "Daftar tagihan sewa kost Anda: periode, jatuh tempo, nominal, status pembayaran, dan riwayat pembayaran.",
      },
      { property: "og:title", content: "Tagihan Saya | Tenant KostKu" },
      { property: "og:description", content: "Pantau tagihan sewa kost dan status pembayarannya." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TenantInvoices,
});

function TenantInvoices() {
  const { user } = useAuth();
  const tenant = useQuery(myTenantQuery(user?.id));
  const record = tenant.data as Row | null | undefined;
  const tenantId = (record?.["id"] as string | undefined) ?? "";

  const invoices = useQuery({
    ...invoicesQuery({ tenantId }),
    enabled: Boolean(tenantId),
  });

  const [status, setStatus] = useState(NONE);
  const rows = (invoices.data ?? []) as Row[];

  const filtered = useMemo(
    () => rows.filter((r) => status === NONE || r["status"] === status),
    [rows, status],
  );

  const unpaid = rows.filter((r) => r["status"] !== "paid");
  const totalUnpaid = unpaid.reduce((sum, r) => sum + Number(r["amount"] ?? 0), 0);
  const overdue = rows.filter((r) => r["status"] === "overdue");

  const columns: Column<Row & { id: string }>[] = [
    {
      key: "invoice",
      header: "No. Tagihan",
      cell: (r) => (
        <div>
          <p className="font-medium">{r["invoice_number"] ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{formatBillingMonth(r["billing_month"])}</p>
        </div>
      ),
    },
    {
      key: "room",
      header: "Kamar",
      cell: (r) => r["room"]?.room_number ?? "—",
    },
    {
      key: "due",
      header: "Jatuh Tempo",
      cell: (r) => formatDateShort(r["due_date"]),
    },
    {
      key: "amount",
      header: "Nominal",
      align: "right",
      cell: (r) => <span className="tabular-nums">{formatRupiah(r["amount"])}</span>,
    },
    {
      key: "paid",
      header: "Pembayaran",
      cell: (r) => {
        const payments = (r["payments"] ?? []) as Row[];
        if (payments.length === 0) return <span className="text-sm text-muted-foreground">—</span>;
        return (
          <div className="text-xs text-muted-foreground">
            {payments.map((p) => (
              <p key={p["id"] as string}>
                {formatDateShort(p["paid_at"])} · {formatRupiah(p["amount"])}
                {p["payment_method"] ? ` · ${p["payment_method"]}` : ""}
              </p>
            ))}
          </div>
        );
      },
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

  const whatsapp = record?.["property"]?.whatsapp_number as string | undefined;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tagihan Saya"
        description="Riwayat tagihan sewa kost beserta status pembayarannya."
        {...(whatsapp
          ? {
              actions: (
                <Button asChild variant="outline">
                  <a
                    href={whatsappLink(
                      whatsapp,
                      `Halo pengelola, saya ingin konfirmasi pembayaran tagihan kamar ${
                        record?.["room"]?.room_number ?? "-"
                      }.`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Konfirmasi pembayaran
                  </a>
                </Button>
              ),
            }
          : {})}
      />

      {!tenant.isPending && !record ? (
        <div className="panel">
          <EmptyState
            title="Data penghuni belum tersedia"
            description="Hubungi admin untuk menghubungkan akun Anda dengan data kamar agar tagihan muncul."
          />
        </div>
      ) : (
        <>
          <StatsRow isPending={invoices.isPending && Boolean(tenantId)} count={4}>
            <StatCard label="Total tagihan" value={rows.length} icon={CreditCard} />
            <StatCard label="Belum lunas" value={unpaid.length} />
            <StatCard label="Terlambat" value={overdue.length} />
            <StatCard label="Nilai belum lunas" value={formatRupiah(totalUnpaid)} icon={Wallet} />
          </StatsRow>

          <FilterBar>
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
            isPending={invoices.isPending && Boolean(tenantId)}
            isError={invoices.isError}
            error={invoices.error}
            emptyTitle="Belum ada tagihan"
            emptyDescription="Tagihan bulanan akan muncul di sini setelah diterbitkan oleh admin."
          />
        </>
      )}
    </div>
  );
}
