import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DoorClosed, Plus } from "lucide-react";

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
import { propertiesQuery, roomsQuery, type Row } from "@/lib/queries";
import { formatRupiah } from "@/lib/format";
import { ROOM_STATUS, metaFor, optionsOf } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/admin/rooms")({
  head: () => ({
    meta: [
      { title: "Kelola Kamar Kost | Admin KostKu" },
      {
        name: "description",
        content: "Tambah, ubah, dan pantau status ketersediaan setiap kamar di seluruh properti kost.",
      },
      { property: "og:title", content: "Kelola Kamar Kost | Admin KostKu" },
      { property: "og:description", content: "Panel admin untuk data kamar, harga, dan statusnya." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminRooms,
});

type FormState = {
  property_id: string;
  room_number: string;
  price: string;
  description: string;
  facilities: string;
  image_url: string;
  status: string;
};

const EMPTY: FormState = {
  property_id: "",
  room_number: "",
  price: "",
  description: "",
  facilities: "",
  image_url: "",
  status: "available",
};

function AdminRooms() {
  const rooms = useQuery(roomsQuery());
  const properties = useQuery(propertiesQuery());
  const { save, remove } = useCrud("rooms", ["rooms", "properties"]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [target, setTarget] = useState<Row | null>(null);
  const [q, setQ] = useState("");
  const [propFilter, setPropFilter] = useState(NONE);
  const [statusFilter, setStatusFilter] = useState(NONE);

  const rows = (rooms.data ?? []) as Row[];
  const propRows = (properties.data ?? []) as Row[];
  const propOptions = propRows.map((p) => ({
    value: p["id"] as string,
    label: p["name"] as string,
  }));

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (propFilter !== NONE && r["property_id"] !== propFilter) return false;
        if (statusFilter !== NONE && r["status"] !== statusFilter) return false;
        if (q && !String(r["room_number"] ?? "").toLowerCase().includes(q.toLowerCase()))
          return false;
        return true;
      }),
    [rows, q, propFilter, statusFilter],
  );

  const stats = useMemo(
    () => ({
      total: rows.length,
      available: rows.filter((r) => r["status"] === "available").length,
      occupied: rows.filter((r) => r["status"] === "occupied").length,
      maintenance: rows.filter((r) => r["status"] === "maintenance").length,
    }),
    [rows],
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, property_id: propOptions[0]?.value ?? "" });
    setOpen(true);
  };

  const openEdit = (r: Row) => {
    setEditing(r);
    setForm({
      property_id: (r["property_id"] as string) ?? "",
      room_number: (r["room_number"] as string) ?? "",
      price: String(r["price"] ?? ""),
      description: (r["description"] as string) ?? "",
      facilities: Array.isArray(r["facilities"]) ? (r["facilities"] as string[]).join(", ") : "",
      image_url: (r["image_url"] as string) ?? "",
      status: (r["status"] as string) ?? "available",
    });
    setOpen(true);
  };

  const submit = () => {
    if (!form.property_id || !form.room_number.trim()) return;
    save.mutate(
      {
        id: (editing?.["id"] as string) ?? null,
        values: {
          property_id: form.property_id,
          room_number: form.room_number.trim(),
          price: Number(form.price || 0),
          description: form.description.trim() || null,
          image_url: form.image_url.trim() || null,
          facilities: form.facilities
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          status: form.status,
        },
      },
      { onSuccess: () => setOpen(false) },
    );
  };

  const columns: Column<Row & { id: string }>[] = [
    {
      key: "room",
      header: "Kamar",
      cell: (r) => (
        <div>
          <p className="font-medium">Kamar {r["room_number"]}</p>
          <p className="text-xs text-muted-foreground">{r["property"]?.name ?? "—"}</p>
        </div>
      ),
    },
    { key: "price", header: "Harga", cell: (r) => formatRupiah(r["price"]) },
    {
      key: "facilities",
      header: "Fasilitas",
      cell: (r) => (
        <span className="text-xs text-muted-foreground">
          {Array.isArray(r["facilities"]) && r["facilities"].length
            ? (r["facilities"] as string[]).join(", ")
            : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => {
        const m = metaFor(ROOM_STATUS, r["status"]);
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
        title="Kamar"
        description="Kelola seluruh kamar beserta harga dan ketersediaannya."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Tambah kamar
          </Button>
        }
      />

      <StatsRow isPending={rooms.isPending}>
        <StatCard label="Total kamar" value={stats.total} icon={DoorClosed} />
        <StatCard label="Tersedia" value={stats.available} />
        <StatCard label="Terisi" value={stats.occupied} />
        <StatCard label="Maintenance" value={stats.maintenance} />
      </StatsRow>

      <FilterBar>
        <Input
          className="h-9 w-48"
          placeholder="Cari nomor kamar…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <SelectField
          className="h-9 w-52"
          value={propFilter}
          onChange={setPropFilter}
          options={propOptions}
          includeNone
          noneLabel="Semua properti"
        />
        <SelectField
          className="h-9 w-44"
          value={statusFilter}
          onChange={setStatusFilter}
          options={optionsOf(ROOM_STATUS)}
          includeNone
          noneLabel="Semua status"
        />
      </FilterBar>

      <DataTable
        columns={columns}
        rows={filtered as (Row & { id: string })[]}
        isPending={rooms.isPending}
        isError={rooms.isError}
        error={rooms.error}
        emptyTitle="Belum ada kamar"
        emptyDescription="Tambahkan kamar untuk properti yang sudah terdaftar."
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Ubah kamar" : "Tambah kamar"}
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
            label="Nomor kamar *"
            value={form.room_number}
            onChange={(v) => setForm({ ...form, room_number: v })}
            placeholder="A1"
          />
          <TextField
            label="Harga per bulan"
            type="number"
            value={form.price}
            onChange={(v) => setForm({ ...form, price: v })}
            placeholder="1500000"
          />
        </div>
        <TextField
          label="Fasilitas (pisahkan dengan koma)"
          value={form.facilities}
          onChange={(v) => setForm({ ...form, facilities: v })}
          placeholder="AC, Kamar mandi dalam"
        />
        <TextField
          label="URL foto"
          value={form.image_url}
          onChange={(v) => setForm({ ...form, image_url: v })}
        />
        <Field label="Deskripsi">
          <Textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>
        <SelectField
          label="Status"
          value={form.status}
          onChange={(v) => setForm({ ...form, status: v })}
          options={optionsOf(ROOM_STATUS)}
        />
      </FormDialog>

      <ConfirmDelete
        open={Boolean(target)}
        onOpenChange={(o) => !o && setTarget(null)}
        pending={remove.isPending}
        onConfirm={() =>
          target &&
          remove.mutate(target["id"] as string, { onSuccess: () => setTarget(null) })
        }
        title="Hapus kamar ini?"
        description="Kamar yang masih dipakai tenant tidak dapat dihapus."
      />
    </div>
  );
}
