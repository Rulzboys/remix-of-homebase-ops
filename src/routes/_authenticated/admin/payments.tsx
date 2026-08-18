import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader, SectionTitle } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatsRow, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  ConfirmDelete,
  FilterBar,
  FormDialog,
  NONE,
  RowActions,
  SelectField,
  TextField,
  useCrud,
} from "@/components/crud";
import { supabase } from "@/integrations/supabase/client";
import { invoicesQuery, paymentsQuery, tenantsQuery, type Row } from "@/lib/queries";
import { formatBillingMonth, formatDateShort, formatRupiah, todayISO } from "@/lib/format";
import { INVOICE_STATUS, metaFor, optionsOf } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  head: () => ({
    meta: [
      { title: "Tagihan & Pembayaran | Admin KostKu" },
      {
        name: "description",
        content: "Kelola tagihan sewa kost, catat pembayaran tenant, dan pantau tunggakan.",
      },
      { property: "og:title", content: "Tagihan & Pembayaran | Admin KostKu" },
      { property: "og:description", content: "Panel admin untuk tagihan dan pembayaran sewa kost." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPayments,
});

type InvoiceForm = {
  invoice_number: string;
  tenant_id: string;
  billing_month: string;
  amount: string;
  due_date: string;
  status: string;
};

type PayForm = { amount: string; payment_method: string; paid_at: string; notes: string };

const today = todayISO();

function firstOfMonth() {
  return `${today.slice(0, 7)}-01`;
}

const EMPTY_INVOICE: InvoiceForm = {
  invoice_number: "",
  tenant_id: "",
  billing_month: firstOfMonth(),
  amount: "",
  due_date: today,
  status: "unpaid",
};

const EMPTY_PAY: PayForm = { amount: "", payment_method: "Transfer", paid_at: today, notes: "" };

function AdminPayments() {
  const qc = useQueryClient();
  const invoices = useQuery(invoicesQuery());
  const payments = useQuery(paymentsQuery());
  const tenants = useQuery(tenantsQuery());
  const { save, remove } = useCrud("invoices", ["invoices", "payments"]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<InvoiceForm>(EMPTY_INVOICE);
  const [target, setTarget] = useState<Row | null>(null);
  const [payTarget, setPayTarget] = useState<Row | null>(null);
  const [payForm, setPayForm] = useState<PayForm>(EMPTY_PAY);
  const [statusFilter, setStatusFilter] = useState(NONE);

  const rows = (invoices.data ?? []) as Row[];
  const paymentRows = (payments.data ?? []) as Row[];
  const tenantRows = (tenants.data ?? []) as Row[];
  const tenantOptions = tenantRows.map((t) => ({
    value: t["id"] as string,
    label: `${t["full_name"]}${t["room"]?.room_number ? ` · Kamar ${t["room"].room_number}` : ""}`,
  }));

  const filtered = useMemo(
    () => rows.filter((r) => statusFilter === NONE || r["status"] === statusFilter),
    [rows, statusFilter],
  );

  const stats = useMemo(() => {
    const paid = rows.filter((r) => r["status"] === "paid");
    const unpaid = rows.filter((r) => r["status"] !== "paid");
    return {
      total: rows.length,
      paid: paid.reduce((s, r) => s + Number(r["amount"] ?? 0), 0),
      unpaid: unpaid.reduce((s, r) => s + Number(r["amount"] ?? 0), 0),
      overdue: rows.filter((r) => r["status"] === "overdue").length,
    };
  }, [rows]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...EMPTY_INVOICE,
      tenant_id: tenantOptions[0]?.value ?? "",
      invoice_number: `INV-${today.replace(/-/g, "")}-${Math.floor(Math.random() * 900 + 100)}`,
    });
    setOpen(true);
  };

  const openEdit = (r: Row) => {
    setEditing(r);
    setForm({
      invoice_number: (r["invoice_number"] as string) ?? "",
      tenant_id: (r["tenant_id"] as string) ?? "",
      billing_month: String(r["billing_month"] ?? firstOfMonth()).slice(0, 10),
      amount: String(r["amount"] ?? ""),
      due_date: (r["due_date"] as string) ?? today,
      status: (r["status"] as string) ?? "unpaid",
    });
    setOpen(true);
  };

  const submit = () => {
    if (!form.tenant_id || !form.invoice_number.trim()) return;
    const tenant = tenantRows.find((t) => t["id"] === form.tenant_id);
    save.mutate(
      {
        id: (editing?.["id"] as string) ?? null,
        values: {
          invoice_number: form.invoice_number.trim(),
          tenant_id: form.tenant_id,
          property_id: tenant?.["property_id"] ?? null,
          room_id: tenant?.["room_id"] ?? null,
          billing_month: form.billing_month,
          amount: Number(form.amount || 0),
          due_date: form.due_date,
          status: form.status,
        },
      },
      { onSuccess: () => setOpen(false) },
    );
  };

  const recordPayment = useMutation({
    mutationFn: async () => {
      if (!payTarget) throw new Error("Tagihan tidak ditemukan.");
      const { error } = await supabase.from("payments").insert({
        invoice_id: payTarget["id"] as string,
        tenant_id: payTarget["tenant_id"] as string,
        amount: Number(payForm.amount || 0),
        payment_method: payForm.payment_method || null,
        paid_at: payForm.paid_at,
        notes: payForm.notes.trim() || null,
      });
      if (error) throw error;
      const { error: updateError } = await supabase
        .from("invoices")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", payTarget["id"] as string);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast.success("Pembayaran dicatat.");
      setPayTarget(null);
      void qc.invalidateQueries({ queryKey: ["invoices"] });
      void qc.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (e: Error) => toast.error(e.message || "Gagal mencatat pembayaran."),
  });

  const invoiceCols: Column<Row & { id: string }>[] = [
    {
      key: "inv",
      header: "Tagihan",
      cell: (r) => (
        <div>
          <p className="font-medium">{r["invoice_number"]}</p>
          <p className="text-xs text-muted-foreground">{formatBillingMonth(r["billing_month"])}</p>
        </div>
      ),
    },
    {
      key: "tenant",
      header: "Tenant",
      cell: (r) => (
        <div className="text-sm">
          <p>{r["tenant"]?.full_name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{r["property"]?.name ?? "—"}</p>
        </div>
      ),
    },
    { key: "amount", header: "Nominal", cell: (r) => formatRupiah(r["amount"]) },
    { key: "due", header: "Jatuh tempo", cell: (r) => formatDateShort(r["due_date"]) },
    {
      key: "status",
      header: "Status",
      cell: (r) => {
        const m = metaFor(INVOICE_STATUS, r["status"]);
        return <StatusBadge label={m.label} tone={m.tone} />;
      },
    },
    {
      key: "actions",
      header: "Aksi",
      align: "right",
      cell: (r) => (
        <RowActions
          onEdit={() => openEdit(r)}
          onDelete={() => setTarget(r)}
          extra={
            r["status"] !== "paid" ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setPayTarget(r);
                  setPayForm({ ...EMPTY_PAY, amount: String(r["amount"] ?? "") });
                }}
              >
                Catat bayar
              </Button>
            ) : null
          }
        />
      ),
    },
  ];

  const paymentCols: Column<Row & { id: string }>[] = [
    { key: "tenant", header: "Tenant", cell: (r) => r["tenant"]?.full_name ?? "—" },
    { key: "inv", header: "Tagihan", cell: (r) => r["invoice"]?.invoice_number ?? "—" },
    { key: "amount", header: "Nominal", cell: (r) => formatRupiah(r["amount"]) },
    { key: "method", header: "Metode", cell: (r) => r["payment_method"] ?? "—" },
    { key: "paid", header: "Tanggal", cell: (r) => formatDateShort(r["paid_at"]) },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Payment"
        description="Tagihan sewa dan riwayat pembayaran tenant."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Buat tagihan
          </Button>
        }
      />

      <StatsRow isPending={invoices.isPending}>
        <StatCard label="Total tagihan" value={stats.total} icon={CreditCard} />
        <StatCard label="Sudah dibayar" value={formatRupiah(stats.paid)} />
        <StatCard label="Belum dibayar" value={formatRupiah(stats.unpaid)} />
        <StatCard label="Terlambat" value={stats.overdue} />
      </StatsRow>

      <FilterBar>
        <SelectField
          className="h-9 w-48"
          value={statusFilter}
          onChange={setStatusFilter}
          options={optionsOf(INVOICE_STATUS)}
          includeNone
          noneLabel="Semua status"
        />
      </FilterBar>

      <DataTable
        columns={invoiceCols}
        rows={filtered as (Row & { id: string })[]}
        isPending={invoices.isPending}
        isError={invoices.isError}
        error={invoices.error}
        emptyTitle="Belum ada tagihan"
      />

      <div>
        <SectionTitle title="Riwayat pembayaran" description="Pembayaran yang sudah tercatat." />
        <DataTable
          columns={paymentCols}
          rows={paymentRows as (Row & { id: string })[]}
          isPending={payments.isPending}
          isError={payments.isError}
          error={payments.error}
          emptyTitle="Belum ada pembayaran"
        />
      </div>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Ubah tagihan" : "Buat tagihan"}
        onSubmit={submit}
        saving={save.isPending}
      >
        <TextField
          label="Nomor tagihan *"
          value={form.invoice_number}
          onChange={(v) => setForm({ ...form, invoice_number: v })}
        />
        <SelectField
          label="Tenant *"
          value={form.tenant_id}
          onChange={(v) => {
            const t = tenantRows.find((x) => x["id"] === v);
            setForm({
              ...form,
              tenant_id: v,
              amount: form.amount || String(t?.["monthly_price"] ?? ""),
            });
          }}
          options={tenantOptions}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Bulan tagihan"
            type="date"
            value={form.billing_month}
            onChange={(v) => setForm({ ...form, billing_month: v })}
          />
          <TextField
            label="Jatuh tempo"
            type="date"
            value={form.due_date}
            onChange={(v) => setForm({ ...form, due_date: v })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Nominal"
            type="number"
            value={form.amount}
            onChange={(v) => setForm({ ...form, amount: v })}
          />
          <SelectField
            label="Status"
            value={form.status}
            onChange={(v) => setForm({ ...form, status: v })}
            options={optionsOf(INVOICE_STATUS)}
          />
        </div>
      </FormDialog>

      <FormDialog
        open={Boolean(payTarget)}
        onOpenChange={(o) => !o && setPayTarget(null)}
        title="Catat pembayaran"
        description={payTarget ? `Tagihan ${payTarget["invoice_number"]}` : ""}
        onSubmit={() => recordPayment.mutate()}
        saving={recordPayment.isPending}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Nominal"
            type="number"
            value={payForm.amount}
            onChange={(v) => setPayForm({ ...payForm, amount: v })}
          />
          <TextField
            label="Tanggal bayar"
            type="date"
            value={payForm.paid_at}
            onChange={(v) => setPayForm({ ...payForm, paid_at: v })}
          />
        </div>
        <TextField
          label="Metode pembayaran"
          value={payForm.payment_method}
          onChange={(v) => setPayForm({ ...payForm, payment_method: v })}
          placeholder="Transfer BCA"
        />
        <TextField
          label="Catatan"
          value={payForm.notes}
          onChange={(v) => setPayForm({ ...payForm, notes: v })}
        />
      </FormDialog>

      <ConfirmDelete
        open={Boolean(target)}
        onOpenChange={(o) => !o && setTarget(null)}
        pending={remove.isPending}
        onConfirm={() =>
          target && remove.mutate(target["id"] as string, { onSuccess: () => setTarget(null) })
        }
        title="Hapus tagihan ini?"
        description="Pembayaran yang sudah tercatat dapat mencegah penghapusan."
      />
    </div>
  );
}
