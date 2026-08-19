import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatsRow, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterBar, FormDialog, NONE, RowActions, SelectField, TextField, useCrud } from "@/components/crud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { visitsQuery, type Row } from "@/lib/queries";
import { formatDateShort, formatTime, todayISO, whatsappLink } from "@/lib/format";
import { VISIT_STATUS, metaFor, optionsOf } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/assistant/visits")({
  head: () => ({
    meta: [
      { title: "Jadwal Visit Saya | Assistant KostKu" },
      {
        name: "description",
        content: "Kelola jadwal kunjungan calon tenant yang ditugaskan, perbarui status dan catatan hasil visit.",
      },
      { property: "og:title", content: "Jadwal Visit Saya | Assistant KostKu" },
      { property: "og:description", content: "Daftar dan status kunjungan calon tenant untuk assistant." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AssistantVisits,
});

function AssistantVisits() {
  const { user } = useAuth();
  const visits = useQuery(visitsQuery({ assistantId: user?.id ?? "" }));
  const { save } = useCrud("visits", ["visits", "prospects"]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(NONE);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState({ status: "scheduled", notes: "" });

  const rows = (visits.data ?? []) as Row[];
  const today = todayISO();

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const text = `${r["prospect"]?.full_name ?? ""} ${r["property"]?.name ?? ""}`.toLowerCase();
        return (
          (status === NONE || r["status"] === status) && text.includes(search.trim().toLowerCase())
        );
      }),
    [rows, search, status],
  );

  function openEdit(row: Row) {
    setEditing(row);
    setForm({ status: (row["status"] as string) ?? "scheduled", notes: (row["notes"] as string) ?? "" });
  }

  const columns: Column<Row & { id: string }>[] = [
    {
      key: "prospect",
      header: "Calon Tenant",
      cell: (r) => (
        <div>
          <p className="font-medium">{r["prospect"]?.full_name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{r["prospect"]?.phone ?? "—"}</p>
        </div>
      ),
    },
    {
      key: "prop",
      header: "Kost",
      cell: (r) => (
        <div>
          <p>{r["property"]?.name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">
            {r["room"]?.room_number ? `Kamar ${r["room"].room_number}` : "Belum pilih kamar"}
          </p>
        </div>
      ),
    },
    {
      key: "when",
      header: "Jadwal",
      cell: (r) => (
        <div>
          <p>{formatDateShort(r["visit_date"])}</p>
          <p className="text-xs text-muted-foreground">{formatTime(r["visit_time"])}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => {
        const m = metaFor(VISIT_STATUS, r["status"] as string);
        return <StatusBadge label={m.label} tone={m.tone} />;
      },
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (r) => (
        <RowActions
          onEdit={() => openEdit(r)}
          extra={
            r["prospect"]?.phone ? (
              <Button size="sm" variant="ghost" asChild>
                <a
                  href={whatsappLink(
                    r["prospect"].phone,
                    `Halo ${r["prospect"].full_name}, saya assistant dari ${r["property"]?.name ?? "KostKu"}. Konfirmasi jadwal visit ${formatDateShort(r["visit_date"])} pukul ${formatTime(r["visit_time"])}.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
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
        title="Jadwal Visit"
        description="Kunjungan calon tenant yang ditugaskan kepada Anda."
      />

      <StatsRow isPending={visits.isPending}>
        <StatCard label="Total visit" value={rows.length} icon={CalendarCheck} />
        <StatCard label="Hari ini" value={rows.filter((r) => r["visit_date"] === today).length} />
        <StatCard label="Terjadwal" value={rows.filter((r) => r["status"] === "scheduled").length} />
        <StatCard label="Selesai" value={rows.filter((r) => r["status"] === "completed").length} />
      </StatsRow>

      <FilterBar>
        <Input
          className="h-9 w-56"
          placeholder="Cari nama / kost…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <SelectField
          className="h-9 w-44"
          value={status}
          onChange={setStatus}
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
        emptyDescription="Admin akan menugaskan kunjungan kepada Anda."
      />

      <FormDialog
        open={Boolean(editing)}
        onOpenChange={(o) => !o && setEditing(null)}
        title="Perbarui hasil visit"
        description="Ubah status kunjungan dan tambahkan catatan hasil."
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
          options={optionsOf(VISIT_STATUS)}
        />
        <TextField
          label="Catatan"
          value={form.notes}
          onChange={(v) => setForm((f) => ({ ...f, notes: v }))}
          placeholder="Hasil kunjungan, minat calon tenant, dll."
        />
      </FormDialog>
    </div>
  );
}
