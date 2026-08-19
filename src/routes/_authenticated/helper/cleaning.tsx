import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatsRow, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { DocUploadButton } from "@/components/DocUploader";
import { FilterBar, FormDialog, NONE, RowActions, SelectField, TextField, useCrud } from "@/components/crud";
import { useAuth } from "@/lib/auth";
import { cleaningQuery, type Row } from "@/lib/queries";
import { formatDateShort, formatTime, todayISO } from "@/lib/format";
import { CLEANING_STATUS, metaFor, optionsOf } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/helper/cleaning")({
  head: () => ({
    meta: [
      { title: "Jadwal Cleaning Saya | Helper KostKu" },
      {
        name: "description",
        content: "Lihat tugas kebersihan yang ditugaskan, perbarui status pengerjaan, dan unggah foto dokumentasi.",
      },
      { property: "og:title", content: "Jadwal Cleaning Saya | Helper KostKu" },
      { property: "og:description", content: "Tugas cleaning aktif untuk petugas helper." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HelperCleaning,
});

function HelperCleaning() {
  const { user } = useAuth();
  const cleaning = useQuery(cleaningQuery({ helperId: user?.id ?? "" }));
  const { save } = useCrud("cleaning_schedules", ["cleaning"]);

  const [status, setStatus] = useState(NONE);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState({ status: "scheduled", notes: "" });

  const all = (cleaning.data ?? []) as Row[];
  const rows = useMemo(() => all.filter((r) => r["status"] !== "cancelled"), [all]);
  const today = todayISO();

  const filtered = useMemo(
    () => rows.filter((r) => status === NONE || r["status"] === status),
    [rows, status],
  );

  const columns: Column<Row & { id: string }>[] = [
    {
      key: "prop",
      header: "Kost",
      cell: (r) => <span className="font-medium">{r["property"]?.name ?? "—"}</span>,
    },
    {
      key: "when",
      header: "Jadwal",
      cell: (r) => (
        <div>
          <p>{formatDateShort(r["cleaning_date"])}</p>
          <p className="text-xs text-muted-foreground">{formatTime(r["cleaning_time"])}</p>
        </div>
      ),
    },
    {
      key: "notes",
      header: "Catatan",
      cell: (r) => <span className="text-sm text-muted-foreground">{r["notes"] ?? "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => {
        const m = metaFor(CLEANING_STATUS, r["status"] as string);
        return <StatusBadge label={m.label} tone={m.tone} />;
      },
    },
    {
      key: "doc",
      header: "Dokumentasi",
      cell: (r) => (
        <DocUploadButton
          table="cleaning_documentations"
          refField="cleaning_id"
          refId={r["id"] as string}
          label="Foto"
        />
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (r) => (
        <RowActions
          onEdit={() => {
            setEditing(r);
            setForm({
              status: (r["status"] as string) ?? "scheduled",
              notes: (r["notes"] as string) ?? "",
            });
          }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Jadwal Cleaning"
        description="Tugas kebersihan aktif yang ditugaskan kepada Anda."
      />

      <StatsRow isPending={cleaning.isPending}>
        <StatCard label="Total tugas" value={rows.length} icon={Sparkles} />
        <StatCard label="Hari ini" value={rows.filter((r) => r["cleaning_date"] === today).length} />
        <StatCard label="Terjadwal" value={rows.filter((r) => r["status"] === "scheduled").length} />
        <StatCard label="Berlangsung" value={rows.filter((r) => r["status"] === "in_progress").length} />
      </StatsRow>

      <FilterBar>
        <SelectField
          className="h-9 w-44"
          value={status}
          onChange={setStatus}
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
        emptyTitle="Belum ada tugas cleaning"
        emptyDescription="Admin akan menugaskan jadwal kebersihan kepada Anda."
      />

      <FormDialog
        open={Boolean(editing)}
        onOpenChange={(o) => !o && setEditing(null)}
        title="Perbarui tugas cleaning"
        description="Ubah status pengerjaan dan tambahkan catatan."
        saving={save.isPending}
        onSubmit={() => {
          if (!editing) return;
          save.mutate(
            {
              id: editing["id"] as string,
              values: { status: form.status, notes: form.notes.trim() || null },
            },
            { onSuccess: () => setEditing(null) },
          );
        }}
      >
        <SelectField
          label="Status"
          value={form.status}
          onChange={(v) => setForm((f) => ({ ...f, status: v }))}
          options={optionsOf(CLEANING_STATUS)}
        />
        <TextField
          label="Catatan"
          value={form.notes}
          onChange={(v) => setForm((f) => ({ ...f, notes: v }))}
          placeholder="Kendala, area yang dibersihkan, dll."
        />
      </FormDialog>
    </div>
  );
}
