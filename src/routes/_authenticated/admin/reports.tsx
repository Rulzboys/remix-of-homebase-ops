import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileBarChart, Plus } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatsRow, type Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ConfirmDelete,
  Field,
  FilterBar,
  FormDialog,
  NONE,
  RowActions,
  SelectField,
  useCrud,
} from "@/components/crud";
import { invoicesQuery, propertiesQuery, reportsQuery, tenantsQuery, type Row } from "@/lib/queries";
import { MONTHS_ID, formatMonthYear, formatRupiah } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  head: () => ({
    meta: [
      { title: "Laporan Bulanan Kost | Admin KostKu" },
      {
        name: "description",
        content: "Ringkasan okupansi, pendapatan, dan catatan maintenance bulanan tiap properti kost.",
      },
      { property: "og:title", content: "Laporan Bulanan Kost | Admin KostKu" },
      { property: "og:description", content: "Panel admin untuk laporan operasional bulanan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminReports,
});

const now = new Date();

const MONTH_OPTIONS = MONTHS_ID.map((label, i) => ({ value: String(i + 1), label }));
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => {
  const y = now.getFullYear() - 2 + i;
  return { value: String(y), label: String(y) };
});

type FormState = {
  property_id: string;
  month: string;
  year: string;
  maintenance_notes: string;
};

const EMPTY: FormState = {
  property_id: "",
  month: String(now.getMonth() + 1),
  year: String(now.getFullYear()),
  maintenance_notes: "",
};

function AdminReports() {
  const reports = useQuery(reportsQuery());
  const properties = useQuery(propertiesQuery());
  const tenants = useQuery(tenantsQuery());
  const invoices = useQuery(invoicesQuery());
  const { save, remove } = useCrud("monthly_reports", ["monthly_reports"]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [target, setTarget] = useState<Row | null>(null);
  const [yearFilter, setYearFilter] = useState(NONE);

  const rows = (reports.data ?? []) as Row[];
  const tenantRows = (tenants.data ?? []) as Row[];
  const invoiceRows = (invoices.data ?? []) as Row[];
  const propOptions = ((properties.data ?? []) as Row[]).map((p) => ({
    value: p["id"] as string,
    label: p["name"] as string,
  }));

  const filtered = useMemo(
    () => rows.filter((r) => yearFilter === NONE || String(r["year"]) === yearFilter),
    [rows, yearFilter],
  );

  const paidTotal = invoiceRows
    .filter((i) => i["status"] === "paid")
    .reduce((s, i) => s + Number(i["amount"] ?? 0), 0);
  const unpaidTotal = invoiceRows
    .filter((i) => i["status"] !== "paid")
    .reduce((s, i) => s + Number(i["amount"] ?? 0), 0);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, property_id: propOptions[0]?.value ?? "" });
    setOpen(true);
  };

  const openEdit = (r: Row) => {
    setEditing(r);
    setForm({
      property_id: (r["property_id"] as string) ?? "",
      month: String(r["month"] ?? now.getMonth() + 1),
      year: String(r["year"] ?? now.getFullYear()),
      maintenance_notes: (r["maintenance_notes"] as string) ?? "",
    });
    setOpen(true);
  };

  const submit = () => {
    if (!form.property_id) return;
    save.mutate(
      {
        id: (editing?.["id"] as string) ?? null,
        values: {
          property_id: form.property_id,
          month: Number(form.month),
          year: Number(form.year),
          maintenance_notes: form.maintenance_notes.trim() || null,
        },
      },
      { onSuccess: () => setOpen(false) },
    );
  };

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
    {
      key: "actions",
      header: "Aksi",
      align: "right",
      cell: (r) => <RowActions onEdit={() => openEdit(r)} onDelete={() => setTarget(r)} />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports"
        description="Ringkasan operasional dan laporan bulanan per properti."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Tambah laporan
          </Button>
        }
      />

      <StatsRow isPending={reports.isPending || invoices.isPending}>
        <StatCard label="Laporan tersimpan" value={rows.length} icon={FileBarChart} />
        <StatCard label="Tenant aktif" value={tenantRows.filter((t) => t["status"] === "active").length} />
        <StatCard label="Tagihan lunas" value={formatRupiah(paidTotal)} />
        <StatCard label="Tagihan tertunggak" value={formatRupiah(unpaidTotal)} />
      </StatsRow>

      <FilterBar>
        <SelectField
          className="h-9 w-40"
          value={yearFilter}
          onChange={setYearFilter}
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
        emptyDescription="Buat laporan bulanan untuk mencatat kondisi properti."
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Ubah laporan" : "Tambah laporan"}
        onSubmit={submit}
        saving={save.isPending}
      >
        <SelectField
          label="Properti *"
          value={form.property_id}
          onChange={(v) => setForm({ ...form, property_id: v })}
          options={propOptions}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Bulan"
            value={form.month}
            onChange={(v) => setForm({ ...form, month: v })}
            options={MONTH_OPTIONS}
          />
          <SelectField
            label="Tahun"
            value={form.year}
            onChange={(v) => setForm({ ...form, year: v })}
            options={YEAR_OPTIONS}
          />
        </div>
        <Field label="Catatan maintenance">
          <Textarea
            rows={4}
            value={form.maintenance_notes}
            onChange={(e) => setForm({ ...form, maintenance_notes: e.target.value })}
            placeholder="Perbaikan pompa air, cat ulang koridor…"
          />
        </Field>
      </FormDialog>

      <ConfirmDelete
        open={Boolean(target)}
        onOpenChange={(o) => !o && setTarget(null)}
        pending={remove.isPending}
        onConfirm={() =>
          target && remove.mutate(target["id"] as string, { onSuccess: () => setTarget(null) })
        }
        title="Hapus laporan ini?"
      />
    </div>
  );
}
