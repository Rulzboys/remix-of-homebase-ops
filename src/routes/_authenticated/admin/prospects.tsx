import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Plus, UserPlus } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatsRow, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ConfirmDelete,
  Field,
  FilterBar,
  FormDialog,
  NONE,
  RowActions,
  SelectField,
  TextField,
  useCrud,
} from "@/components/crud";
import { propertiesQuery, prospectsQuery, roomsQuery, type Row } from "@/lib/queries";
import { formatDateShort, todayISO, whatsappLink } from "@/lib/format";
import { PROSPECT_STATUS, metaFor, optionsOf } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/admin/prospects")({
  head: () => ({
    meta: [
      { title: "Calon Tenant (Leads) | Admin KostKu" },
      {
        name: "description",
        content: "Pantau calon penghuni kost dari kontak pertama hingga deal, lengkap dengan status follow up.",
      },
      { property: "og:title", content: "Calon Tenant (Leads) | Admin KostKu" },
      { property: "og:description", content: "Panel admin untuk pipeline calon tenant kost." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminProspects,
});

type FormState = {
  full_name: string;
  phone: string;
  institution: string;
  property_id: string;
  room_id: string;
  status: string;
  first_contact_date: string;
  notes: string;
};

const EMPTY: FormState = {
  full_name: "",
  phone: "",
  institution: "",
  property_id: NONE,
  room_id: NONE,
  status: "new_lead",
  first_contact_date: todayISO(),
  notes: "",
};

function AdminProspects() {
  const prospects = useQuery(prospectsQuery());
  const properties = useQuery(propertiesQuery());
  const rooms = useQuery(roomsQuery());
  const { save, remove } = useCrud("prospects", ["prospects"]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [target, setTarget] = useState<Row | null>(null);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState(NONE);

  const rows = (prospects.data ?? []) as Row[];
  const propOptions = ((properties.data ?? []) as Row[]).map((p) => ({
    value: p["id"] as string,
    label: p["name"] as string,
  }));
  const roomOptions = ((rooms.data ?? []) as Row[])
    .filter((r) => form.property_id === NONE || r["property_id"] === form.property_id)
    .map((r) => ({ value: r["id"] as string, label: `Kamar ${r["room_number"]}` }));

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

  const stats = useMemo(
    () => ({
      total: rows.length,
      baru: rows.filter((r) => r["status"] === "new_lead").length,
      followUp: rows.filter((r) => ["contacted", "visit_scheduled", "visited", "follow_up"].includes(String(r["status"]))).length,
      deal: rows.filter((r) => r["status"] === "deal").length,
    }),
    [rows],
  );

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
      institution: (r["institution"] as string) ?? "",
      property_id: (r["property_id"] as string) ?? NONE,
      room_id: (r["room_id"] as string) ?? NONE,
      status: (r["status"] as string) ?? "new_lead",
      first_contact_date: (r["first_contact_date"] as string) ?? todayISO(),
      notes: (r["notes"] as string) ?? "",
    });
    setOpen(true);
  };

  const submit = () => {
    if (!form.full_name.trim() || !form.phone.trim()) return;
    save.mutate(
      {
        id: editing?.["id"] as string | undefined,
        values: {
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
          institution: form.institution.trim() || null,
          property_id: form.property_id === NONE ? null : form.property_id,
          room_id: form.room_id === NONE ? null : form.room_id,
          status: form.status,
          first_contact_date: form.first_contact_date || todayISO(),
          notes: form.notes.trim() || null,
        },
      },
      { onSuccess: () => setOpen(false) },
    );
  };

  const quickStatus = (r: Row, status: string) =>
    save.mutate({ id: r["id"] as string, values: { status } });

  const columns: Column<Row & { id: string }>[] = [
    {
      key: "name",
      header: "Calon tenant",
      cell: (r) => (
        <div>
          <p className="font-medium">{r["full_name"]}</p>
          <p className="text-xs text-muted-foreground">{r["institution"] ?? "—"}</p>
        </div>
      ),
    },
    { key: "phone", header: "Telepon", cell: (r) => r["phone"] ?? "—" },
    {
      key: "kost",
      header: "Minat",
      cell: (r) => (
        <span className="text-sm">
          {r["property"]?.name ?? "—"}
          {r["room"]?.room_number ? ` · Kamar ${r["room"].room_number}` : ""}
        </span>
      ),
    },
    { key: "first", header: "Kontak pertama", cell: (r) => formatDateShort(r["first_contact_date"]) },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <SelectField
          className="h-9 w-[11rem]"
          value={(r["status"] as string) ?? "new_lead"}
          onChange={(v) => quickStatus(r, v)}
          options={optionsOf(PROSPECT_STATUS)}
        />
      ),
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
            <Button size="icon" variant="ghost" asChild aria-label="Chat WhatsApp">
              <a
                href={whatsappLink(r["phone"] as string, `Halo ${r["full_name"]}, terima kasih sudah menghubungi kami.`)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="size-4" />
              </a>
            </Button>
          }
        />
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Calon Tenant"
        description="Pipeline leads dari kontak pertama hingga deal."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Tambah lead
          </Button>
        }
      />

      <StatsRow isPending={prospects.isPending}>
        <StatCard label="Total lead" value={stats.total} icon={UserPlus} />
        <StatCard label="Lead baru" value={stats.baru} />
        <StatCard label="Dalam proses" value={stats.followUp} />
        <StatCard label="Deal" value={stats.deal} />
      </StatsRow>

      <FilterBar>
        <Input
          className="h-9 w-52"
          placeholder="Cari nama…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <SelectField
          className="h-9 w-48"
          value={statusFilter}
          onChange={setStatusFilter}
          options={optionsOf(PROSPECT_STATUS)}
          includeNone
          noneLabel="Semua status"
        />
      </FilterBar>

      <DataTable
        columns={columns}
        rows={filtered as (Row & { id: string })[]}
        isPending={prospects.isPending}
        isError={prospects.isError}
        error={prospects.error}
        emptyTitle="Belum ada calon tenant"
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Ubah lead" : "Tambah lead"}
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
            label="Telepon *"
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
            placeholder="081234567890"
          />
          <TextField
            label="Institusi"
            value={form.institution}
            onChange={(v) => setForm({ ...form, institution: v })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Properti diminati"
            value={form.property_id}
            onChange={(v) => setForm({ ...form, property_id: v, room_id: NONE })}
            options={propOptions}
            includeNone
          />
          <SelectField
            label="Kamar diminati"
            value={form.room_id}
            onChange={(v) => setForm({ ...form, room_id: v })}
            options={roomOptions}
            includeNone
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Tanggal kontak pertama"
            type="date"
            value={form.first_contact_date}
            onChange={(v) => setForm({ ...form, first_contact_date: v })}
          />
          <SelectField
            label="Status"
            value={form.status}
            onChange={(v) => setForm({ ...form, status: v })}
            options={optionsOf(PROSPECT_STATUS)}
          />
        </div>
        <Field label="Catatan">
          <Textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
        title="Hapus lead ini?"
      />
    </div>
  );
}
