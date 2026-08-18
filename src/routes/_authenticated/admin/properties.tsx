import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, DoorClosed, Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatsRow, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ownersQuery, propertiesQuery, type Row } from "@/lib/queries";
import { formatRupiah } from "@/lib/format";
import { PROPERTY_STATUS, metaFor } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/admin/properties")({
  head: () => ({
    meta: [
      { title: "Kelola Properti Kost | Admin KostKu" },
      {
        name: "description",
        content:
          "Kelola data properti kost: tambah, ubah, hapus, atur status aktif, dan tetapkan pemilik kost.",
      },
      { property: "og:title", content: "Kelola Properti Kost | Admin KostKu" },
      {
        property: "og:description",
        content: "Panel admin untuk mengelola seluruh properti kost dan pemiliknya.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminProperties,
});

const NO_OWNER = "__none__";

type FormState = {
  name: string;
  address: string;
  city: string;
  description: string;
  image_url: string;
  whatsapp_number: string;
  facilities: string;
  owner_id: string;
  status: "active" | "inactive";
};

const EMPTY_FORM: FormState = {
  name: "",
  address: "",
  city: "",
  description: "",
  image_url: "",
  whatsapp_number: "",
  facilities: "",
  owner_id: NO_OWNER,
  status: "active",
};

function toForm(row: Row): FormState {
  return {
    name: (row["name"] as string) ?? "",
    address: (row["address"] as string) ?? "",
    city: (row["city"] as string) ?? "",
    description: (row["description"] as string) ?? "",
    image_url: (row["image_url"] as string) ?? "",
    whatsapp_number: (row["whatsapp_number"] as string) ?? "",
    facilities: Array.isArray(row["facilities"]) ? (row["facilities"] as string[]).join(", ") : "",
    owner_id: (row["owner_id"] as string) ?? NO_OWNER,
    status: row["status"] === "inactive" ? "inactive" : "active",
  };
}

function AdminProperties() {
  const qc = useQueryClient();
  const properties = useQuery(propertiesQuery());
  const owners = useQuery(ownersQuery());

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);

  const rows = (properties.data ?? []) as Row[];
  const ownerRows = (owners.data ?? []) as Row[];

  const stats = useMemo(() => {
    const totalRooms = rows.reduce(
      (sum, p) => sum + ((p["rooms"] as Row[] | null)?.length ?? 0),
      0,
    );
    const available = rows.reduce(
      (sum, p) =>
        sum + ((p["rooms"] as Row[] | null)?.filter((r) => r["status"] === "available").length ?? 0),
      0,
    );
    return {
      total: rows.length,
      active: rows.filter((p) => p["status"] === "active").length,
      totalRooms,
      available,
    };
  }, [rows]);

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["properties"] });
    void qc.invalidateQueries({ queryKey: ["rooms"] });
  };

  const payloadOf = (f: FormState) => ({
    name: f.name.trim(),
    address: f.address.trim(),
    city: f.city.trim() || null,
    description: f.description.trim() || null,
    image_url: f.image_url.trim() || null,
    whatsapp_number: f.whatsapp_number.trim() || null,
    facilities: f.facilities
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    owner_id: f.owner_id === NO_OWNER ? null : f.owner_id,
    status: f.status,
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = payloadOf(form);
      if (!payload.name || !payload.address) throw new Error("Nama dan alamat wajib diisi.");
      if (editing) {
        const { error } = await supabase
          .from("properties")
          .update(payload)
          .eq("id", editing["id"] as string);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("properties").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Properti diperbarui." : "Properti ditambahkan.");
      setDialogOpen(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menyimpan properti."),
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ row, active }: { row: Row; active: boolean }) => {
      const { error } = await supabase
        .from("properties")
        .update({ status: active ? "active" : "inactive" })
        .eq("id", row["id"] as string);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(v.active ? "Properti diaktifkan." : "Properti dinonaktifkan.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Gagal mengubah status."),
  });

  const assignOwner = useMutation({
    mutationFn: async ({ row, ownerId }: { row: Row; ownerId: string }) => {
      const { error } = await supabase
        .from("properties")
        .update({ owner_id: ownerId === NO_OWNER ? null : ownerId })
        .eq("id", row["id"] as string);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pemilik kost diperbarui.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menetapkan pemilik."),
  });

  const remove = useMutation({
    mutationFn: async (row: Row) => {
      const { error } = await supabase.from("properties").delete().eq("id", row["id"] as string);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Properti dihapus.");
      setDeleteTarget(null);
      invalidate();
    },
    onError: (e: Error) =>
      toast.error(
        e.message.includes("foreign key")
          ? "Properti masih memiliki kamar/tenant terkait sehingga tidak bisa dihapus."
          : e.message || "Gagal menghapus properti.",
      ),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (row: Row) => {
    setEditing(row);
    setForm(toForm(row));
    setDialogOpen(true);
  };

  const columns: Column<Row & { id: string }>[] = [
    {
      key: "name",
      header: "Kost",
      cell: (r) => (
        <div className="min-w-0">
          <p className="font-medium">{r["name"]}</p>
          <p className="truncate text-xs text-muted-foreground">
            {[r["address"], r["city"]].filter(Boolean).join(", ") || "—"}
          </p>
        </div>
      ),
    },
    {
      key: "rooms",
      header: "Kamar",
      cell: (r) => {
        const list = (r["rooms"] as Row[] | null) ?? [];
        const avail = list.filter((x) => x["status"] === "available").length;
        const min = list.length ? Math.min(...list.map((x) => Number(x["price"] ?? 0))) : 0;
        return (
          <div className="text-sm">
            <p>
              {avail}/{list.length} tersedia
            </p>
            <p className="text-xs text-muted-foreground">
              {list.length ? `mulai ${formatRupiah(min)}` : "belum ada kamar"}
            </p>
          </div>
        );
      },
    },
    {
      key: "owner",
      header: "Pemilik",
      cell: (r) => (
        <Select
          value={(r["owner_id"] as string) ?? NO_OWNER}
          onValueChange={(v) => assignOwner.mutate({ row: r, ownerId: v })}
        >
          <SelectTrigger className="h-9 w-[11rem]">
            <SelectValue placeholder="Pilih pemilik" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_OWNER}>Belum ditetapkan</SelectItem>
            {ownerRows.map((o) => (
              <SelectItem key={o["id"] as string} value={o["id"] as string}>
                {(o["full_name"] as string) ?? (o["email"] as string)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => {
        const m = metaFor(PROPERTY_STATUS, r["status"]);
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={r["status"] === "active"}
              onCheckedChange={(v) => toggleStatus.mutate({ row: r, active: v })}
              aria-label={`Aktifkan ${r["name"]}`}
            />
            <StatusBadge label={m.label} tone={m.tone} />
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Aksi",
      align: "right",
      cell: (r) => (
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" aria-label="Ubah" onClick={() => openEdit(r)}>
            <Pencil className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Hapus"
            className="text-danger"
            onClick={() => setDeleteTarget(r)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-7">
      <PageHeader
        title="Properti Kost"
        description="Kelola data kost, status publikasi, dan penugasan pemilik."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Tambah Kost
          </Button>
        }
      />

      <StatsRow isPending={properties.isPending}>
        <StatCard label="Total Kost" value={stats.total} icon={Building2} />
        <StatCard label="Kost Aktif" value={stats.active} hint="tampil di situs publik" icon={Building2} />
        <StatCard label="Total Kamar" value={stats.totalRooms} icon={DoorClosed} />
        <StatCard label="Kamar Tersedia" value={stats.available} icon={Users} />
      </StatsRow>

      <DataTable
        columns={columns}
        rows={rows as (Row & { id: string })[]}
        isPending={properties.isPending}
        isError={properties.isError}
        error={properties.error}
        emptyTitle="Belum ada properti kost"
        emptyDescription="Tambahkan properti pertama untuk mulai mengelola kamar dan tenant."
        emptyAction={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Tambah Kost
          </Button>
        }
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Ubah Properti" : "Tambah Properti"}</DialogTitle>
            <DialogDescription>
              Lengkapi informasi kost. Kost berstatus aktif akan tampil di situs publik.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama kost *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Kost Dago Asri"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Alamat *</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Jl. Ir. H. Juanda No. 100"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="city">Kota</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Bandung"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="wa">Nomor WhatsApp</Label>
                <Input
                  id="wa"
                  value={form.whatsapp_number}
                  onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                  placeholder="6281234567890"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">URL foto</Label>
              <Input
                id="image"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="/images/kost-dago.jpg"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="facilities">Fasilitas (pisahkan dengan koma)</Label>
              <Input
                id="facilities"
                value={form.facilities}
                onChange={(e) => setForm({ ...form, facilities: e.target.value })}
                placeholder="WiFi, AC, Dapur Bersama"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Deskripsi</Label>
              <Textarea
                id="desc"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Kost nyaman dekat kampus…"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Pemilik kost</Label>
                <Select
                  value={form.owner_id}
                  onValueChange={(v) => setForm({ ...form, owner_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih pemilik" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_OWNER}>Belum ditetapkan</SelectItem>
                    {ownerRows.map((o) => (
                      <SelectItem key={o["id"] as string} value={o["id"] as string}>
                        {(o["full_name"] as string) ?? (o["email"] as string)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <div className="flex h-9 items-center gap-2">
                  <Switch
                    checked={form.status === "active"}
                    onCheckedChange={(v) => setForm({ ...form, status: v ? "active" : "inactive" })}
                    aria-label="Status aktif"
                  />
                  <span className="text-sm text-muted-foreground">
                    {form.status === "active" ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus properti ini?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.["name"] as string} akan dihapus permanen. Kamar dan data terkait yang
              masih aktif dapat mencegah penghapusan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && remove.mutate(deleteTarget)}
              disabled={remove.isPending}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
