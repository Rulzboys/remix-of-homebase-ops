import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Plus } from "lucide-react";

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
import {
  profilesByRoleQuery,
  propertiesQuery,
  prospectsQuery,
  roomsQuery,
  visitsQuery,
  type Row,
} from "@/lib/queries";
import { formatDateShort, formatTime, todayISO } from "@/lib/format";
import { VISIT_STATUS, metaFor, optionsOf } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/admin/visits")({
  head: () => ({
    meta: [
      { title: "Jadwal Visit Kost | Admin KostKu" },
      {
        name: "description",
        content: "Atur jadwal kunjungan calon tenant, tetapkan asisten pendamping, dan pantau statusnya.",
      },
      { property: "og:title", content: "Jadwal Visit Kost | Admin KostKu" },
      { property: "og:description", content: "Panel admin untuk penjadwalan visit calon penghuni." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminVisits,
});

type FormState = {
  prospect_id: string;
  property_id: string;
  room_id: string;
  assistant_id: string;
  visit_date: string;
  visit_time: string;
  status: string;
  notes: string;
};

const EMPTY: FormState = {
  prospect_id: "",
  property_id: NONE,
  room_id: NONE,
  assistant_id: NONE,
  visit_date: todayISO(),
  visit_time: "10:00",
  status: "scheduled",
  notes: "",
};

function AdminVisits() {
  const visits = useQuery(visitsQuery());
  const prospects = useQuery(prospectsQuery());
  const properties = useQuery(propertiesQuery());
  const rooms = useQuery(roomsQuery());
  const assistants = useQuery(profilesByRoleQuery("assistant"));
  const { save, remove } = useCrud("visits", ["visits"]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [target, setTarget] = useState<Row | null>(null);
  const [statusFilter, setStatusFilter] = useState(NONE);

  const rows = (visits.data ?? []) as Row[];
  const prospectOptions = ((prospects.data ?? []) as Row[]).map((p) => ({
    value: p["id"] as string,
    label: `${p["full_name"]} · ${p["phone"]}`,
  }));
  const propOptions = ((properties.data ?? []) as Row[]).map((p) => ({
    value: p["id"] as string,
    label: p["name"] as string,
  }));
  const roomOptions = ((rooms.data ?? []) as Row[])
    .filter((r) => form.property_id === NONE || r["property_id"] === form.property_id)
    .map((r) => ({ value: r["id"] as string, label: `Kamar ${r["room_number"]}` }));
  const assistantOptions = ((assistants.data ?? []) as Row[]).map((a) => ({
    value: a["id"] as string,
    label: (a["full_name"] as string) ?? (a["email"] as string),
  }));

  const filtered = useMemo(
    () => rows.filter((r) => statusFilter === NONE || r["status"] === statusFilter),
    [rows, statusFilter],
  );

  const stats = useMemo(() => {
    const today = todayISO();
    return {
      total: rows.length,
      today: rows.filter((r) => r["visit_date"] === today).length,
      scheduled: rows.filter((r) => r["status"] === "scheduled").length,
      completed: rows.filter((r) => r["status"] === "completed").length,
    };
  }, [rows]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, prospect_id: prospectOptions[0]?.value ?? "" });
    setOpen(true);
  };

  const openEdit = (r: Row) => {
    setEditing(r);
    setForm({
      prospect_id: (r["prospect_id"] as string) ?? "",
      property_id: (r["property_id"] as string) ?? NONE,
      room_id: (r["room_id"] as string) ?? NONE,
      assistant_id: (r["assistant_id"] as string) ?? NONE,
      visit_date: (r["visit_date"] as string) ?? todayISO(),
      visit_time: String(r["visit_time"] ?? "10:00").slice(0, 5),
      status: (r["status"] as string) ?? "scheduled",
      notes: (r["notes"] as string) ?? "",
    });
    setOpen(true);
  };

  const submit = () => {
    if (!form.prospect_id) return;
    save.mutate(
      {
        id: (editing?.["id"] as string) ?? null,
        values: {
          prospect_id: form.prospect_id,
          property_id: form.property_id === NONE ? null : form.property_id,
          room_id: form.room_id === NONE ? null : form.room_id,
          assistant_id: form.assistant_id === NONE ? null : form.assistant_id,
          visit_date: form.visit_date,
          visit_time: form.visit_time,
          status: form.status,
          notes: form.notes.trim() || null,
        },
      },
      { onSuccess: () => setOpen(false) },
    );
  };

  const columns: Column<Row & { id: string }>[] = [
    {
      key: "prospect",
      header: "Calon tenant",
      cell: (r) => (
        <div>
          <p className="font-medium">{r["prospect"]?.full_name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{r["prospect"]?.phone ?? "—"}</p>
        </div>
      ),
    },
    {
      key: "jadwal",
      header: "Jadwal",
      cell: (r) => (
        <div className="text-sm">
          <p>{formatDateShort(r["visit_date"])}</p>
          <p className="text-xs text-muted-foreground">{formatTime(r["visit_time"])}</p>
        </div>
      ),
    },
    {
      key: "kost",
      header: "Kost",
      cell: (r) => (
        <span className="text-sm">
          {r["property"]?.name ?? "—"}
          {r["room"]?.room_number ? ` · Kamar ${r["room"].room_number}` : ""}
        </span>
      ),
    },
    { key: "assistant", header: "Asisten", cell: (r) => r["assistant"]?.full_name ?? "—" },
    {
      key: "status",
      header: "Status",
      cell: (r) => {
        const m = metaFor(VISIT_STATUS, r["status"]);
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
            r["status"] === "scheduled" ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  save.mutate({ id: r["id"] as string, values: { status: "completed" } })
                }
              >
                Selesai
              </Button>
            ) : null
          }
        />
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Visit"
        description="Jadwal kunjungan calon tenant ke properti kost."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Jadwalkan visit
          </Button>
        }
      />

      <StatsRow isPending={visits.isPending}>
        <StatCard label="Total visit" value={stats.total} icon={CalendarCheck} />
        <StatCard label="Hari ini" value={stats.today} />
        <StatCard label="Terjadwal" value={stats.scheduled} />
        <StatCard label="Selesai" value={stats.completed} />
      </StatsRow>

      <FilterBar>
        <SelectField
          className="h-9 w-48"
          value={statusFilter}
          onChange={setStatusFilter}
          options={optionsOf(VISIT_STATUS)}
          includeNone
          noneLabel="Semua status"
        />
      </FilterBar>

      <DataTable
        columns={columns}
        rows={filtered as (Row & { id: string })[]}
        isPending={visits.isPending}
        isError={visits.isError}
        error={visits.error}
        emptyTitle="Belum ada jadwal visit"
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Ubah jadwal visit" : "Jadwalkan visit"}
        onSubmit={submit}
        saving={save.isPending}
      >
        <SelectField
          label="Calon tenant *"
          value={form.prospect_id}
          onChange={(v) => setForm({ ...form, prospect_id: v })}
          options={prospectOptions}
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
            label="Tanggal"
            type="date"
            value={form.visit_date}
            onChange={(v) => setForm({ ...form, visit_date: v })}
          />
          <TextField
            label="Jam"
            type="time"
            value={form.visit_time}
            onChange={(v) => setForm({ ...form, visit_time: v })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Asisten pendamping"
            value={form.assistant_id}
            onChange={(v) => setForm({ ...form, assistant_id: v })}
            options={assistantOptions}
            includeNone
          />
          <SelectField
            label="Status"
            value={form.status}
            onChange={(v) => setForm({ ...form, status: v })}
            options={optionsOf(VISIT_STATUS)}
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
        title="Hapus jadwal visit ini?"
      />
    </div>
  );
}
