import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";

import { PageHeader, SectionTitle } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatsRow, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { DocImage } from "@/components/DocUploader";
import { EmptyState } from "@/components/DataState";
import { FilterBar, NONE, SelectField } from "@/components/crud";
import { useAuth } from "@/lib/auth";
import { cleaningDocsQuery, cleaningQuery, type Row } from "@/lib/queries";
import { formatDateShort, formatDateTime, formatTime } from "@/lib/format";
import { CLEANING_STATUS, metaFor } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/helper/history")({
  head: () => ({
    meta: [
      { title: "Riwayat Cleaning | Helper KostKu" },
      {
        name: "description",
        content: "Riwayat tugas kebersihan yang telah Anda selesaikan lengkap dengan foto dokumentasinya.",
      },
      { property: "og:title", content: "Riwayat Cleaning | Helper KostKu" },
      { property: "og:description", content: "Rekap pekerjaan cleaning yang sudah selesai." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HelperHistory,
});

function HelperHistory() {
  const { user } = useAuth();
  const cleaning = useQuery(cleaningQuery({ helperId: user?.id ?? "" }));
  const all = (cleaning.data ?? []) as Row[];
  const done = useMemo(
    () => all.filter((r) => r["status"] === "completed" || r["status"] === "cancelled"),
    [all],
  );
  const ids = done.map((r) => r["id"] as string);
  const docs = useQuery({ ...cleaningDocsQuery(ids), enabled: ids.length > 0 });
  const docRows = (docs.data ?? []) as Row[];

  const [status, setStatus] = useState(NONE);
  const filtered = useMemo(
    () => done.filter((r) => status === NONE || r["status"] === status),
    [done, status],
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
      key: "docs",
      header: "Foto",
      align: "right",
      cell: (r) => (
        <span className="tabular-nums">
          {docRows.filter((d) => d["cleaning_id"] === r["id"]).length}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => {
        const m = metaFor(CLEANING_STATUS, r["status"] as string);
        return <StatusBadge label={m.label} tone={m.tone} />;
      },
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Riwayat Cleaning"
        description="Rekap tugas kebersihan yang telah selesai atau dibatalkan."
      />

      <StatsRow isPending={cleaning.isPending} count={3}>
        <StatCard label="Total riwayat" value={done.length} icon={ClipboardList} />
        <StatCard label="Selesai" value={done.filter((r) => r["status"] === "completed").length} />
        <StatCard label="Foto dokumentasi" value={docRows.length} />
      </StatsRow>

      <FilterBar>
        <SelectField
          className="h-9 w-44"
          value={status}
          onChange={setStatus}
          options={[
            { value: "completed", label: "Selesai" },
            { value: "cancelled", label: "Dibatalkan" },
          ]}
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
        emptyTitle="Belum ada riwayat"
        emptyDescription="Tugas yang sudah Anda selesaikan akan tercatat di sini."
      />

      <section>
        <SectionTitle title="Dokumentasi terbaru" description="Foto hasil pekerjaan Anda." />
        {docRows.length === 0 ? (
          <div className="panel">
            <EmptyState
              title="Belum ada foto"
              description="Unggah foto lewat halaman Jadwal Cleaning."
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {docRows.slice(0, 9).map((d) => (
              <article key={d["id"] as string} className="panel p-3">
                <DocImage
                  path={d["image_url"] as string}
                  alt={`Dokumentasi cleaning ${d["cleaning"]?.property?.name ?? ""}`}
                />
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-medium">{d["cleaning"]?.property?.name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateShort(d["cleaning"]?.cleaning_date)}
                  </p>
                  {d["notes"] ? <p className="text-sm">{d["notes"]}</p> : null}
                  <p className="text-xs text-muted-foreground">
                    Diunggah {formatDateTime(d["created_at"] as string)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
