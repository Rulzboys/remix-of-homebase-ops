import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, Image as ImageIcon, Plus } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatsRow, type Column } from "@/components/DataTable";
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
import { contentsQuery, propertiesQuery, type Row } from "@/lib/queries";
import { formatDateShort, todayISO } from "@/lib/format";
import { PLATFORM_LABEL } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/admin/content")({
  head: () => ({
    meta: [
      { title: "Konten Sosial Media | Admin KostKu" },
      {
        name: "description",
        content: "Catat performa konten promosi kost di Instagram, TikTok, dan Facebook.",
      },
      { property: "og:title", content: "Konten Sosial Media | Admin KostKu" },
      { property: "og:description", content: "Panel admin untuk memantau konten promosi kost." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminContent,
});

const PLATFORM_OPTIONS = Object.entries(PLATFORM_LABEL).map(([value, label]) => ({ value, label }));

type FormState = {
  title: string;
  platform: string;
  url: string;
  property_id: string;
  viewer_count: string;
  like_count: string;
  posted_at: string;
};

const EMPTY: FormState = {
  title: "",
  platform: "instagram",
  url: "",
  property_id: NONE,
  viewer_count: "0",
  like_count: "0",
  posted_at: todayISO(),
};

function AdminContent() {
  const contents = useQuery(contentsQuery());
  const properties = useQuery(propertiesQuery());
  const { save, remove } = useCrud("contents", ["contents"]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [target, setTarget] = useState<Row | null>(null);
  const [platformFilter, setPlatformFilter] = useState(NONE);

  const rows = (contents.data ?? []) as Row[];
  const propOptions = ((properties.data ?? []) as Row[]).map((p) => ({
    value: p["id"] as string,
    label: p["name"] as string,
  }));

  const filtered = useMemo(
    () => rows.filter((r) => platformFilter === NONE || r["platform"] === platformFilter),
    [rows, platformFilter],
  );

  const stats = useMemo(
    () => ({
      total: rows.length,
      views: rows.reduce((s, r) => s + Number(r["viewer_count"] ?? 0), 0),
      likes: rows.reduce((s, r) => s + Number(r["like_count"] ?? 0), 0),
      platforms: new Set(rows.map((r) => r["platform"])).size,
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
      title: (r["title"] as string) ?? "",
      platform: (r["platform"] as string) ?? "instagram",
      url: (r["url"] as string) ?? "",
      property_id: (r["property_id"] as string) ?? NONE,
      viewer_count: String(r["viewer_count"] ?? 0),
      like_count: String(r["like_count"] ?? 0),
      posted_at: (r["posted_at"] as string) ?? todayISO(),
    });
    setOpen(true);
  };

  const submit = () => {
    if (!form.title.trim()) return;
    save.mutate(
      {
        id: (editing?.["id"] as string) ?? null,
        values: {
          title: form.title.trim(),
          platform: form.platform,
          url: form.url.trim() || null,
          property_id: form.property_id === NONE ? null : form.property_id,
          viewer_count: Number(form.viewer_count || 0),
          like_count: Number(form.like_count || 0),
          posted_at: form.posted_at,
        },
      },
      { onSuccess: () => setOpen(false) },
    );
  };

  const columns: Column<Row & { id: string }>[] = [
    {
      key: "title",
      header: "Konten",
      cell: (r) => (
        <div className="min-w-0">
          <p className="font-medium">{r["title"]}</p>
          <p className="truncate text-xs text-muted-foreground">
            {r["property"]?.name ?? "Umum"}
          </p>
        </div>
      ),
    },
    {
      key: "platform",
      header: "Platform",
      cell: (r) => PLATFORM_LABEL[String(r["platform"])] ?? r["platform"],
    },
    { key: "posted", header: "Tayang", cell: (r) => formatDateShort(r["posted_at"]) },
    {
      key: "perf",
      header: "Performa",
      cell: (r) => (
        <span className="text-sm tabular-nums">
          {Number(r["viewer_count"] ?? 0).toLocaleString("id-ID")} views ·{" "}
          {Number(r["like_count"] ?? 0).toLocaleString("id-ID")} likes
        </span>
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
            r["url"] ? (
              <Button size="sm" variant="ghost" asChild>
                <a href={r["url"] as string} target="_blank" rel="noreferrer">
                  Buka
                </a>
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
        title="Content"
        description="Catatan konten promosi kost di media sosial."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Tambah konten
          </Button>
        }
      />

      <StatsRow isPending={contents.isPending}>
        <StatCard label="Total konten" value={stats.total} icon={ImageIcon} />
        <StatCard label="Total views" value={stats.views.toLocaleString("id-ID")} />
        <StatCard label="Total likes" value={stats.likes.toLocaleString("id-ID")} icon={Heart} />
        <StatCard label="Platform aktif" value={stats.platforms} />
      </StatsRow>

      <FilterBar>
        <SelectField
          className="h-9 w-48"
          value={platformFilter}
          onChange={setPlatformFilter}
          options={PLATFORM_OPTIONS}
          includeNone
          noneLabel="Semua platform"
        />
      </FilterBar>

      <DataTable
        columns={columns}
        rows={filtered as (Row & { id: string })[]}
        isPending={contents.isPending}
        isError={contents.isError}
        error={contents.error}
        emptyTitle="Belum ada konten"
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Ubah konten" : "Tambah konten"}
        onSubmit={submit}
        saving={save.isPending}
      >
        <TextField
          label="Judul *"
          value={form.title}
          onChange={(v) => setForm({ ...form, title: v })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Platform"
            value={form.platform}
            onChange={(v) => setForm({ ...form, platform: v })}
            options={PLATFORM_OPTIONS}
          />
          <SelectField
            label="Properti"
            value={form.property_id}
            onChange={(v) => setForm({ ...form, property_id: v })}
            options={propOptions}
            includeNone
            noneLabel="Umum"
          />
        </div>
        <TextField label="URL" value={form.url} onChange={(v) => setForm({ ...form, url: v })} />
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField
            label="Views"
            type="number"
            value={form.viewer_count}
            onChange={(v) => setForm({ ...form, viewer_count: v })}
          />
          <TextField
            label="Likes"
            type="number"
            value={form.like_count}
            onChange={(v) => setForm({ ...form, like_count: v })}
          />
          <TextField
            label="Tanggal tayang"
            type="date"
            value={form.posted_at}
            onChange={(v) => setForm({ ...form, posted_at: v })}
          />
        </div>
      </FormDialog>

      <ConfirmDelete
        open={Boolean(target)}
        onOpenChange={(o) => !o && setTarget(null)}
        pending={remove.isPending}
        onConfirm={() =>
          target && remove.mutate(target["id"] as string, { onSuccess: () => setTarget(null) })
        }
        title="Hapus konten ini?"
      />
    </div>
  );
}
