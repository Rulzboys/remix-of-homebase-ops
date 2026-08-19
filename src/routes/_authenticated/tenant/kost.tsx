import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, DoorClosed, MapPin } from "lucide-react";

import { PageHeader, SectionTitle } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatsRow } from "@/components/DataTable";
import { EmptyState, ErrorState } from "@/components/DataState";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { myTenantQuery, type Row } from "@/lib/queries";
import { formatDate, formatRupiah, whatsappLink } from "@/lib/format";
import { TENANT_STATUS, metaFor } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/tenant/kost")({
  head: () => ({
    meta: [
      { title: "Kost Saya | Tenant KostKu" },
      {
        name: "description",
        content: "Detail kost dan kamar yang Anda tempati: alamat, fasilitas, harga sewa, dan kontak pengelola.",
      },
      { property: "og:title", content: "Kost Saya | Tenant KostKu" },
      { property: "og:description", content: "Informasi lengkap kost dan kamar penghuni." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TenantKost,
});

function FacilityList({ items }: { items: unknown }) {
  const list = Array.isArray(items) ? (items as string[]) : [];
  if (list.length === 0) return <p className="text-sm text-muted-foreground">Belum ada data fasilitas.</p>;
  return (
    <ul className="flex flex-wrap gap-2">
      {list.map((f) => (
        <li key={f} className="rounded-md bg-muted px-2 py-1 text-xs">
          {f}
        </li>
      ))}
    </ul>
  );
}

function TenantKost() {
  const { user } = useAuth();
  const tenant = useQuery(myTenantQuery(user?.id));
  const record = tenant.data as Row | null | undefined;

  if (tenant.isError) {
    return (
      <div className="panel">
        <ErrorState message={(tenant.error as Error)?.message} />
      </div>
    );
  }

  const property = record?.["property"] as Row | undefined;
  const room = record?.["room"] as Row | undefined;
  const statusMeta = metaFor(TENANT_STATUS, record?.["status"] as string);

  return (
    <div className="space-y-5">
      <PageHeader title="Kost Saya" description="Informasi kost dan kamar yang Anda tempati." />

      {!tenant.isPending && !record ? (
        <div className="panel">
          <EmptyState
            title="Data penghuni belum tersedia"
            description="Hubungi admin untuk menghubungkan akun Anda dengan data kamar."
          />
        </div>
      ) : (
        <>
          <StatsRow isPending={tenant.isPending} count={3}>
            <StatCard label="Kost" value={property?.["name"] ?? "—"} icon={Building2} />
            <StatCard
              label="Kamar"
              value={room?.["room_number"] ?? "—"}
              hint={room?.["price"] ? `${formatRupiah(room["price"])} / bulan` : ""}
              icon={DoorClosed}
            />
            <StatCard
              label="Sewa bulanan"
              value={formatRupiah(record?.["monthly_price"])}
              hint={record?.["check_in_date"] ? `Check-in ${formatDate(record["check_in_date"])}` : ""}
            />
          </StatsRow>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="panel p-5">
              <SectionTitle title="Detail kost" />
              {property?.["image_url"] ? (
                <img
                  src={property["image_url"] as string}
                  alt={`Foto ${property["name"]}`}
                  loading="lazy"
                  className="mb-4 h-48 w-full rounded-md object-cover"
                />
              ) : null}
              <div className="space-y-2 text-sm">
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span>
                    {property?.["address"] ?? "—"}
                    {property?.["city"] ? `, ${property["city"]}` : ""}
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Status penghuni:</span>
                  <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />
                </div>
              </div>
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium">Fasilitas kost</p>
                <FacilityList items={property?.["facilities"]} />
              </div>
              {property?.["whatsapp_number"] ? (
                <Button className="mt-4" asChild>
                  <a
                    href={whatsappLink(
                      property["whatsapp_number"] as string,
                      `Halo pengelola ${property["name"]}, saya penghuni kamar ${room?.["room_number"] ?? "-"}.`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Hubungi pengelola
                  </a>
                </Button>
              ) : null}
            </section>

            <section className="panel p-5">
              <SectionTitle title="Detail kamar" />
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Nomor kamar</dt>
                  <dd className="font-medium">{room?.["room_number"] ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Harga kamar</dt>
                  <dd className="font-medium tabular-nums">{formatRupiah(room?.["price"])}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Tanggal check-in</dt>
                  <dd className="font-medium">{formatDate(record?.["check_in_date"])}</dd>
                </div>
              </dl>
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium">Fasilitas kamar</p>
                <FacilityList items={room?.["facilities"]} />
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
