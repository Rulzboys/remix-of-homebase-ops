import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatsRow, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
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
  TextField,
  useCrud,
} from "@/components/crud";
import { cleaningQuery, profilesByRoleQuery, propertiesQuery, type Row } from "@/lib/queries";
import { formatDateShort, formatTime, todayISO } from "@/lib/format";
import { CLEANING_STATUS, metaFor, optionsOf } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/admin/cleaning")({
  head: () => ({
    meta: [
      { title: "Jadwal Cleaning Kost | Admin KostKu" },
      {
        name: "description",
        content: "Atur jadwal kebersihan properti kost dan tetapkan helper yang bertugas.",
      },
      { property: "og:title", content: "Jadwal Cleaning Kost | Admin KostKu" },
      { property: "og:description", content: "Panel admin untuk penjadwalan cleaning properti." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminCleaning,
});

type FormState = {
  property_id: string;
  helper_id: string;
  cleaning_date: string;
  cleaning_time: string;
  status: string;
  notes: string;
};

const EMPTY: FormState = {
  property_id: "",
  helper_id: NONE,
  cleaning_date: todayISO(),
  cleaning_time: "09:00",
  status: "scheduled",
  notes: "",
};

function AdminCleaning() {
  const cleaning = useQuery(cleaningQuery());
  const properties = useQuery(propertiesQuery());
  const helpers = useQuery(profilesByRoleQuery("helper"));
  const { save, remove } = useCrud("cleaning_schedules", ["cleaning"]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [target, setTarget] = useState<Row | null>(null);
  const [statusFilter, setStatusFilter] = useState(NONE);

  const rows = (cleaning.data ?? []) as Row[];
  const propOptions = ((properties.data ?? []) as Row[]).map((p) => ({
    value: p["id"] as string,
    label: p["name"] as string,
  }));
  const helperOptions = ((helpers.data ?? []) as Row[]).map((h) => ({
    value: h["id"] as string,
    label: (h["full_name"] as string) ?? (h["email"] as string),
  }));

  const filtered = useMemo(
    () => rows.filter((r) => statusFilter === NONE || r["status"] === statusFilter),
    [rows, statusFilter],
  );

  const stats = useMemo(() => {
    const today = todayISO();
    return {
      total: rows.length,
      today: rows.filter((r) => r["cleaning_date"] === today).length,
      progress: rows.filter((r) => r["status"] === "in_progress").length,
      completed: rows.filter((r) => r["status"] === "completed").length,
    };
  }, [rows]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, property_id: propOptions[0]?.value ?? "" });
    setOpen(true);
  };

  const openEdit = (r: Row) => {
    setEditing(r);
    setForm({
      property_id: (r["property_id"] as string) ?? "",
      helper_id: (r["helper_id"] as string) ?? NONE,
      cleaning_date: (r["cleaning_date"] as string) ?? todayISO(),
      cleaning_time: String(r["cleaning_time"] ?? "09:00").slice(0, 5),
      status: (r["status"] as string) ?? "scheduled",
      notes: (r["notes"] as string) ?? "",
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
          helper_id: form.helper_id === NONE ? null : form.helper_id,
          cleaning_date: form.cleaning_date,
          cleaning_time: form.cleaning_time,
          status: form.status,
          notes: form.notes.trim() || null,
        },
      },
      { onSuccess: () => setOpen(false) },
    );
  };

  const columns: Column<Row & { id: string }>[] = [
    {
      key: "prop",
      header: "Properti",
      cell: (r) => <span className="font-medium">{r["property"]?.name ?? "—"}</span>,
    },
    {
      key: "jadwal",
      header: "Jadwal",
      cell: (r) => (
        <div className="text-sm">
          <p>{formatDateShort(r["cleaning_date"])}</p>
          <p className="text-xs text-muted-foreground">{formatTime(r["cleaning_time"])}</p>
        </div>
      ),
    },
    { key: "helper", header: "Helper", cell: (r) => r["helper"]?.full_name ?? "—" },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <SelectField
          className="h-9 w-[11rem]"
          value={(r["status"] as string) ?? "scheduled"}
          onChange={(v) => save.mutate({ id: r["id"] as string, values: { status: v } })}
          options={optionsOf(CLEANING_STATUS)}
        />
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
        title="Cleaning"
        description="Jadwal kebersihan properti dan penugasan helper."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Jadwalkan cleaning
          </Button>
        }
      />

      <StatsRow isPending={cleaning.isPending}>
        <StatCard label="Total jadwal" value={stats.total} icon={Sparkles} />
        <StatCard label="Hari ini" value={stats.today} />
        <StatCard label="Berjalan" value={stats.progress} />
        <StatCard label="Selesai" value={stats.completed} />
      </StatsRow>

      <FilterBar>
        <SelectField
          className="h-9 w-48"
          value={statusFilter}
          onChange={setStatusFilter}
          options={optionsOf(CLEANING_STATUS)}
          includeNone
          noneLabel="Semua status"
        />
      </FilterBar>

      <DataTable
        columns={columns}
        rows={filtered as (Row & { id: string })[]}
        isPending={cleaning.isPending}
        isError={cleaning.isError}
        error={cleaning.error}
        emptyTitle="Belum ada jadwal cleaning"
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Ubah jadwal cleaning" : "Jadwalkan cleaning"}
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
          <TextField
            label="Tanggal"
            type="date"
            value={form.cleaning_date}
            onChange={(v) => setForm({ ...form, cleaning_date: v })}
          />
          <TextField
            label="Jam"
            type="time"
            value={form.cleaning_time}
            onChange={(v) => setForm({ ...form, cleaning_time: v })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Helper"
            value={form.helper_id}
            onChange={(v) => setForm({ ...form, helper_id: v })}
            options={helperOptions}
            includeNone
          />
          <SelectField
            label="Status"
            value={form.status}
            onChange={(v) => setForm({ ...form, status: v })}
            options={optionsOf(CLEANING_STATUS)}
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
        title="Hapus jadwal cleaning ini?"
      />
    </div>
  );
}
