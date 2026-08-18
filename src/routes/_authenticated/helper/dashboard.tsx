import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Sparkles } from "lucide-react";

import { PageHeader, SectionTitle } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { DataTable, StatsRow, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/lib/auth";
import { cleaningQuery, type Row } from "@/lib/queries";
import { formatDateShort, todayISO } from "@/lib/format";
import { CLEANING_STATUS, metaFor } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/helper/dashboard")({
  component: HelperDashboard,
});

function HelperDashboard() {
  const { user } = useAuth();
  const cleaning = useQuery(cleaningQuery({ helperId: user?.id ?? "" }));
  const rows = (cleaning.data ?? []) as Row[];
  const today = todayISO();

  const cols: Column<Row & { id: string }>[] = [
    {
      key: "prop",
      header: "Kost",
      cell: (r) => <span className="font-medium">{r["property"]?.name ?? "—"}</span>,
    },
    { key: "room", header: "Kamar", cell: (r) => r["room"]?.room_number ?? "Area umum" },
    { key: "date", header: "Jadwal", cell: (r) => formatDateShort(r["cleaning_date"]) },
    {
      key: "status",
      header: "Status",
      cell: (r) => {
        const m = metaFor(CLEANING_STATUS, r["status"]);
        return <StatusBadge label={m.label} tone={m.tone} />;
      },
    },
  ];

  return (
    <div className="space-y-7">
      <PageHeader
        title="Dashboard Helper"
        description="Tugas cleaning yang ditugaskan kepada Anda."
      />
      <StatsRow isPending={cleaning.isPending} count={3}>
        <StatCard
          label="Tugas Hari Ini"
          value={rows.filter((c) => c["cleaning_date"] === today).length}
          icon={Sparkles}
        />
        <StatCard
          label="Belum Selesai"
          value={rows.filter((c) => c["status"] !== "completed" && c["status"] !== "cancelled").length}
          icon={Sparkles}
        />
        <StatCard
          label="Selesai"
          value={rows.filter((c) => c["status"] === "completed").length}
          icon={CheckCircle2}
        />
      </StatsRow>

      <section>
        <SectionTitle title="Jadwal Cleaning Anda" />
        <DataTable
          columns={cols}
          rows={rows.slice(0, 10) as (Row & { id: string })[]}
          isPending={cleaning.isPending}
          isError={cleaning.isError}
          error={cleaning.error}
          emptyTitle="Belum ada tugas cleaning"
        />
      </section>
    </div>
  );
}
