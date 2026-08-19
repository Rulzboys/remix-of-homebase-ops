import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Image as ImageIcon } from "lucide-react";

import { PageHeader, SectionTitle } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatsRow } from "@/components/DataTable";
import { EmptyState, ErrorState, CardsSkeleton } from "@/components/DataState";
import { DocImage, DocUploadButton } from "@/components/DocUploader";
import { FilterBar, NONE, SelectField } from "@/components/crud";
import { useAuth } from "@/lib/auth";
import { visitDocsQuery, visitsQuery, type Row } from "@/lib/queries";
import { formatDateShort, formatDateTime, formatTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/assistant/documentation")({
  head: () => ({
    meta: [
      { title: "Dokumentasi Visit | Assistant KostKu" },
      {
        name: "description",
        content: "Unggah dan lihat foto dokumentasi setiap kunjungan calon tenant yang Anda dampingi.",
      },
      { property: "og:title", content: "Dokumentasi Visit | Assistant KostKu" },
      { property: "og:description", content: "Galeri foto dokumentasi kunjungan calon tenant." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AssistantDocumentation,
});

function AssistantDocumentation() {
  const { user } = useAuth();
  const visits = useQuery(visitsQuery({ assistantId: user?.id ?? "" }));
  const visitRows = (visits.data ?? []) as Row[];
  const ids = visitRows.map((v) => v["id"] as string);

  const docs = useQuery({
    ...visitDocsQuery(ids),
    enabled: ids.length > 0,
  });

  const [visitId, setVisitId] = useState(NONE);

  const visitOptions = visitRows.map((v) => ({
    value: v["id"] as string,
    label: `${v["prospect"]?.full_name ?? "Calon tenant"} · ${formatDateShort(v["visit_date"])} ${formatTime(v["visit_time"])}`,
  }));

  const docRows = (docs.data ?? []) as Row[];
  const filtered = useMemo(
    () => docRows.filter((d) => visitId === NONE || d["visit_id"] === visitId),
    [docRows, visitId],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dokumentasi Visit"
        description="Unggah foto bukti kunjungan agar admin dan owner dapat memantau."
      />

      <StatsRow isPending={visits.isPending} count={3}>
        <StatCard label="Total visit" value={visitRows.length} icon={ImageIcon} />
        <StatCard label="Foto terunggah" value={docRows.length} />
        <StatCard
          label="Visit tanpa foto"
          value={
            visitRows.filter((v) => !docRows.some((d) => d["visit_id"] === v["id"])).length
          }
        />
      </StatsRow>

      <div className="panel space-y-3 p-4">
        <SectionTitle title="Unggah dokumentasi" description="Pilih visit lalu unggah fotonya." />
        <div className="flex flex-wrap items-center gap-2">
          <SelectField
            className="h-9 w-72"
            value={visitId}
            onChange={setVisitId}
            options={visitOptions}
            includeNone
            noneLabel="Pilih visit"
            placeholder="Pilih visit"
          />
          <DocUploadButton
            table="visit_documentations"
            refField="visit_id"
            refId={visitId === NONE ? "" : visitId}
            disabled={visitId === NONE}
          />
        </div>
        {visitId === NONE ? (
          <p className="text-xs text-muted-foreground">Pilih salah satu visit untuk mengaktifkan unggahan.</p>
        ) : null}
      </div>

      <FilterBar>
        <SelectField
          className="h-9 w-72"
          value={visitId}
          onChange={setVisitId}
          options={visitOptions}
          includeNone
          noneLabel="Semua visit"
        />
      </FilterBar>

      {docs.isError ? (
        <div className="panel">
          <ErrorState message={(docs.error as Error)?.message} />
        </div>
      ) : docs.isPending && ids.length > 0 ? (
        <CardsSkeleton count={3} />
      ) : filtered.length === 0 ? (
        <div className="panel">
          <EmptyState
            title="Belum ada dokumentasi"
            description="Foto yang Anda unggah akan muncul di sini."
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <article key={d["id"] as string} className="panel overflow-hidden p-3">
              <DocImage
                path={d["image_url"] as string}
                alt={`Dokumentasi visit ${d["visit"]?.property?.name ?? ""}`}
              />
              <div className="mt-3 space-y-1">
                <p className="text-sm font-medium">
                  {d["visit"]?.prospect?.full_name ?? "Calon tenant"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {d["visit"]?.property?.name ?? "—"} · {formatDateShort(d["visit"]?.visit_date)}
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
    </div>
  );
}
