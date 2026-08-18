import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Users } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatsRow, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { propertiesQuery, roomsQuery, tenantsQuery, type Row } from "@/lib/queries";
import { formatDateShort, formatRupiah } from "@/lib/format";
import { TENANT_STATUS, metaFor, optionsOf } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/admin/tenants")({
  head: () => ({
    meta: [
      { title: "Kelola Tenant | Admin KostKu" },
      {
        name: "description",
        content: "Data penghuni kost: kamar yang ditempati, harga sewa, tanggal masuk, dan status.",
      },
      { property: "og:title", content: "Kelola Tenant | Admin KostKu" },
      { property: "og:description", content: "Panel admin untuk mengelola seluruh penghuni kost." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminTenants,
});

type FormState = {
  full_name: string;
  phone: string;
  email: string;
  institution: string;
  property_id: string;
  room_id: string;
  check_in_date: string;
  monthly_price: string;
  status: string;
};

const EMPTY: FormState = {
  full_name: "",
  phone: "",
  email: "",
  institution: "",
  property_id: NONE,
  room_id: NONE,
  check_in_date: "",
  monthly_price: "",
  status: "active",
};

function AdminTenants() {
  const tenants = useQuery(tenantsQuery());
  const properties = useQuery(propertiesQuery());
  const rooms = useQuery(roomsQuery());
  const { save, remove } = useCrud("tenants", ["tenants", "rooms"]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [target, setTarget] = useState<Row | null>(null);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState(NONE);

  const rows = (tenants.data ?? []) as Row[];
  const propOptions = ((properties.data ?? []) as Row[]).map((p) => ({
    value: p["id"] as string,
    label: p["name"] as string,
  }));
  const roomOptions = ((rooms.data ?? []) as Row[])
    .filter((r) => form.property_id === NONE || r["property_id"] === form.property_id)
    .map((r) => ({
      value: r["id"] as string,
      label: `Kamar ${r["room_number"]} — ${r["property"]?.name ?? ""}`,
    }));

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (statusFilter !== NONE && r["status"] !== statusFilter) return false;
        if (q && !String(r["full_name"] ?? "").toLowerCase().includes(q.toLowerCase()))
          return false;
        return true;
      }),
    [rows, q, statusFilter],
  );

  const stats = useMemo(() => {
    const active = rows.filter((r) => r["status"] === "active");
    return {
      total: rows.length,
      active: active.length,
      inactive: rows.length - active.length,
      revenue: active.reduce((s, r) => s + Number(r["monthly_price"] ?? 0), 0),
    };
  }, [rows]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (r: Row) => {
    setEditing(r);
    setForm({
      full_name: (r["full_name"] as string) ?? "",
      phone: (r["phone"] as string) ?? "",
      email: (r["email"] as string) ?? "",
      institution: (r["institution"] as string) ?? "",
      property_id: (r["property_id"] as string) ?? NONE,
      room_id: (r["room_id"] as string) ?? NONE,
      check_in_date: (r["check_in_date"] as string) ?? "",
      monthly_price: String(r["monthly_price"] ?? ""),
      status: (r["status"] as string) ?? "active",
    });
    setOpen(true);
  };

  const submit = () => {
    if (!form.full_name.trim()) return;
    save.mutate(
      {
        id: editing?.["id"] as string | undefined,
        values: {
          full_name: form.full_name.trim(),
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          institution: form.institution.trim() || null,
          property_id: form.property_id === NONE ? null : form.property_id,
          room_id: form.room_id === NONE ? null : form.room_id,
          check_in_date: form.check_in_date || null,
          monthly_price: Number(form.monthly_price || 0),
          status: form.status,
        },
      },
      { onSuccess: () => setOpen(false) },
    );
  };

  const columns: Column<Row & { id: string }>[] = [
    {
      key: "tenant",
      header: "Tenant",
      cell: (r) => (
        <div>
          <p className="font-medium">{r["full_name"]}</p>
          <p className="text-xs text-muted-foreground">{r["phone"] ?? "—"}</p>
        </div>
      ),
    },
    {
      key: "kost",
      header: "Kost / Kamar",
      cell: (r) => (
        <div className="text-sm">
          <p>{r["property"]?.name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">
            {r["room"]?.room_number ? `Kamar ${r["room"].room_number}` : "belum ada kamar"}
          </p>
        </div>
      ),
    },
    { key: "price", header: "Sewa/bulan", cell: (r) => formatRupiah(r["monthly_price"]) },
    { key: "checkin", header: "Check-in", cell: (r) => formatDateShort(r["check_in_date"]) },
    {
      key: "status",
      header: "Status",
      cell: (r) => {
        const m = metaFor(TENANT_STATUS, r["status"]);
        return <StatusBadge label={m.label} tone={m.tone} />;
      },
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
        title="Tenant"
        description="Kelola data penghuni kost dan penempatan kamarnya."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Tambah tenant
          </Button>
        }
      />

      <StatsRow isPending={tenants.isPending}>
        <StatCard label="Total tenant" value={stats.total} icon={Users} />
        <StatCard label="Aktif" value={stats.active} />
        <StatCard label="Nonaktif" value={stats.inactive} />
        <StatCard label="Potensi sewa/bulan" value={formatRupiah(stats.revenue)} />
      </StatsRow>

      <FilterBar>
        <Input
          className="h-9 w-52"
          placeholder="Cari nama tenant…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <SelectField
          className="h-9 w-44"
          value={statusFilter}
          onChange={setStatusFilter}
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
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Ubah tenant" : "Tambah tenant"}
        onSubmit={submit}
        saving={save.isPending}
      >
        <TextField
          label="Nama lengkap *"
          value={form.full_name}
          onChange={(v) => setForm({ ...form, full_name: v })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Telepon"
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
          />
        </div>
        <TextField
          label="Institusi / kampus"
          value={form.institution}
          onChange={(v) => setForm({ ...form, institution: v })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Properti"
            value={form.property_id}
            onChange={(v) => setForm({ ...form, property_id: v, room_id: NONE })}
            options={propOptions}
            includeNone
          />
          <SelectField
            label="Kamar"
            value={form.room_id}
            onChange={(v) => setForm({ ...form, room_id: v })}
            options={roomOptions}
            includeNone
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Tanggal check-in"
            type="date"
            value={form.check_in_date}
            onChange={(v) => setForm({ ...form, check_in_date: v })}
          />
          <TextField
            label="Sewa per bulan"
            type="number"
            value={form.monthly_price}
            onChange={(v) => setForm({ ...form, monthly_price: v })}
          />
        </div>
        <SelectField
          label="Status"
          value={form.status}
          onChange={(v) => setForm({ ...form, status: v })}
          options={optionsOf(TENANT_STATUS)}
        />
      </FormDialog>

      <ConfirmDelete
        open={Boolean(target)}
        onOpenChange={(o) => !o && setTarget(null)}
        pending={remove.isPending}
        onConfirm={() =>
          target && remove.mutate(target["id"] as string, { onSuccess: () => setTarget(null) })
        }
        title="Hapus tenant ini?"
        description="Tagihan dan pembayaran terkait dapat mencegah penghapusan."
      />
    </div>
  );
}
