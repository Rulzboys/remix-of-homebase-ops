import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatsRow, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterBar, FormDialog, NONE, RowActions, SelectField, TextField, useCrud } from "@/components/crud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { dealsQuery, type Row } from "@/lib/queries";
import { formatDateShort, formatRupiah, formatTime, todayISO, whatsappLink } from "@/lib/format";
import { PAYMENT_STATE, metaFor } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/assistant/checkin")({
  head: () => ({
    meta: [
      { title: "Check-in Tenant Baru | Assistant KostKu" },
      {
        name: "description",
        content: "Dampingi proses check-in tenant baru: cek jadwal, status pembayaran DP dan pelunasan, lalu tandai selesai.",
      },
      { property: "og:title", content: "Check-in Tenant Baru | Assistant KostKu" },
      { property: "og:description", content: "Daftar check-in tenant baru yang ditugaskan kepada assistant." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AssistantCheckin,
});

function AssistantCheckin() {
  const { user } = useAuth();
  const deals = useQuery(dealsQuery());
  const { save } = useCrud("deals", ["deals", "tenants", "rooms"]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(NONE);
  const [editing, setEditing] = useState<Row | null>(null);
  const [notes, setNotes] = useState("");

  const all = (deals.data ?? []) as Row[];
  const rows = useMemo(
    () => all.filter((d) => !user?.id || !d["assistant_id"] || d["assistant_id"] === user.id),
    [all, user?.id],
  );
  const today = todayISO();

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const text = `${r["prospect"]?.full_name ?? ""} ${r["property"]?.name ?? ""}`.toLowerCase();
        const matchFilter =
          filter === NONE ||
          (filter === "done" ? r["check_in_done"] === true : r["check_in_done"] !== true);
        return matchFilter && text.includes(search.trim().toLowerCase());
      }),
    [rows, search, filter],
  );

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
      key: "unit",
      header: "Unit",
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
      key: "schedule",
      header: "Jadwal Check-in",
      cell: (r) =>
        r["check_in_date"] ? (
          <div>
            <p>{formatDateShort(r["check_in_date"])}</p>
            <p className="text-xs text-muted-foreground">
              {r["check_in_time"] ? formatTime(r["check_in_time"]) : "—"}
            </p>
          </div>
        ) : (
          <span className="text-muted-foreground">Belum dijadwalkan</span>
        ),
    },
    {
      key: "payment",
      header: "Pembayaran",
      cell: (r) => {
        const dp = metaFor(PAYMENT_STATE, r["dp_status"] as string);
        const st = metaFor(PAYMENT_STATE, r["settlement_status"] as string);
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground">DP {formatRupiah(r["dp_amount"])}</span>
              <StatusBadge label={dp.label} tone={dp.tone} dot={false} />
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground">
                Pelunasan {formatRupiah(r["settlement_amount"])}
              </span>
              <StatusBadge label={st.label} tone={st.tone} dot={false} />
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (r) =>
        r["check_in_done"] ? (
          <StatusBadge label="Check-in selesai" tone="success" />
        ) : (
          <StatusBadge label="Menunggu check-in" tone="warning" />
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
            setNotes((r["notes"] as string) ?? "");
          }}
          extra={
            r["prospect"]?.phone ? (
              <Button size="sm" variant="ghost" asChild>
                <a
                  href={whatsappLink(
                    r["prospect"].phone,
                    `Halo ${r["prospect"].full_name}, konfirmasi check-in di ${r["property"]?.name ?? "kost"}${r["check_in_date"] ? ` pada ${formatDateShort(r["check_in_date"])}` : ""}.`,
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
        title="Check-in"
        description="Dampingi proses check-in tenant baru sampai selesai."
      />

      <StatsRow isPending={deals.isPending}>
        <StatCard label="Total deal" value={rows.length} icon={ClipboardList} />
        <StatCard label="Check-in hari ini" value={rows.filter((r) => r["check_in_date"] === today).length} />
        <StatCard label="Menunggu" value={rows.filter((r) => r["check_in_done"] !== true).length} />
        <StatCard label="Selesai" value={rows.filter((r) => r["check_in_done"] === true).length} />
      </StatsRow>

      <FilterBar>
        <Input
          className="h-9 w-56"
          placeholder="Cari nama / kost…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <SelectField
          className="h-9 w-48"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "pending", label: "Menunggu check-in" },
            { value: "done", label: "Sudah check-in" },
          ]}
          includeNone
          noneLabel="Semua status"
        />
      </FilterBar>

      <DataTable
        columns={columns}
        rows={filtered as (Row & { id: string })[]}
        isPending={deals.isPending}
        isError={deals.isError}
        error={deals.error}
        emptyTitle="Belum ada deal check-in"
        emptyDescription="Deal yang ditugaskan kepada Anda akan muncul di sini."
      />

      <FormDialog
        open={Boolean(editing)}
        onOpenChange={(o) => !o && setEditing(null)}
        title="Perbarui check-in"
        description="Tandai check-in selesai dan simpan catatan pendampingan."
        saving={save.isPending}
        onSubmit={() => {
          if (!editing) return;
          save.mutate(
            {
              id: editing["id"] as string,
              values: { check_in_done: true, notes: notes.trim() || null },
            },
            { onSuccess: () => setEditing(null) },
          );
        }}
      >
        <TextField
          label="Catatan check-in"
          value={notes}
          onChange={setNotes}
          placeholder="Serah terima kunci, kondisi kamar, dll."
          hint="Menyimpan akan menandai check-in sebagai selesai."
        />
      </FormDialog>
    </div>
  );
}
