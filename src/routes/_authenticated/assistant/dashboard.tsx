import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, CheckCircle2 } from "lucide-react";

import { PageHeader, SectionTitle } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatsRow, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/lib/auth";
import { visitsQuery, type Row } from "@/lib/queries";
import { formatDateShort, formatTime, todayISO } from "@/lib/format";
import { VISIT_STATUS, metaFor } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/assistant/dashboard")({
  component: AssistantDashboard,
});

function AssistantDashboard() {
  const { user } = useAuth();
  const visits = useQuery(visitsQuery({ assistantId: user?.id ?? "" }));
  const rows = (visits.data ?? []) as Row[];
  const today = todayISO();

  const cols: Column<Row & { id: string }>[] = [
    {
      key: "prospect",
      header: "Calon Tenant",
      cell: (r) => <span className="font-medium">{r["prospect"]?.full_name ?? "—"}</span>,
    },
    { key: "prop", header: "Kost", cell: (r) => r["property"]?.name ?? "—" },
    {
      key: "when",
      header: "Jadwal",
      cell: (r) => `${formatDateShort(r["visit_date"])} · ${formatTime(r["visit_time"])}`,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => {
        const m = metaFor(VISIT_STATUS, r["status"]);
        return <StatusBadge label={m.label} tone={m.tone} />;
      },
    },
  ];

  return (
    <div className="space-y-7">
      <PageHeader
        title="Dashboard Assistant"
        description="Jadwal kunjungan dan check-in yang ditugaskan kepada Anda."
      />
      <StatsRow isPending={visits.isPending} count={3}>
        <StatCard
          label="Visit Hari Ini"
          value={rows.filter((v) => v["visit_date"] === today).length}
          icon={CalendarCheck}
        />
        <StatCard
          label="Menunggu Dilaksanakan"
          value={rows.filter((v) => v["status"] === "scheduled").length}
          icon={CalendarCheck}
        />
        <StatCard
          label="Selesai"
          value={rows.filter((v) => v["status"] === "completed").length}
          icon={CheckCircle2}
        />
      </StatsRow>

      <section>
        <SectionTitle title="Jadwal Visit Anda" />
        <DataTable
          columns={cols}
          rows={rows.slice(0, 10) as (Row & { id: string })[]}
          isPending={visits.isPending}
          isError={visits.isError}
          error={visits.error}
          emptyTitle="Belum ada jadwal visit"
          emptyDescription="Admin akan menugaskan jadwal kunjungan kepada Anda."
        />
      </section>
    </div>
  );
}
