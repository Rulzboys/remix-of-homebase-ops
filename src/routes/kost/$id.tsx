import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, MessageCircle } from "lucide-react";

import { PublicLayout } from "@/components/PublicLayout";
import { ErrorState } from "@/components/DataState";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPublicProperty, minPrice } from "@/lib/public-data";
import { formatRupiah, whatsappLink } from "@/lib/format";
import { metaFor, ROOM_STATUS } from "@/lib/status";

export const Route = createFileRoute("/kost/$id")({
  head: () => ({
    meta: [
      { title: "Detail Kost — Vintera Kost Management" },
      {
        name: "description",
        content:
          "Lihat detail properti kost Vintera: alamat, fasilitas, daftar kamar, harga sewa, dan status ketersediaan.",
      },
      { property: "og:title", content: "Detail Kost — Vintera Kost Management" },
      {
        property: "og:description",
        content: "Alamat, fasilitas, daftar kamar, harga sewa, dan ketersediaan.",
      },
    ],
  }),
  component: KostDetailPage,
});

function KostDetailPage() {
  const { id } = Route.useParams();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["public-property", id],
    queryFn: () => fetchPublicProperty(id),
  });

  if (isPending) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-5xl space-y-4 px-4 py-10 sm:px-6">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="aspect-[16/7] w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </PublicLayout>
    );
  }

  if (isError) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <ErrorState message={(error as Error)?.message} />
        </div>
      </PublicLayout>
    );
  }

  if (!data) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6">
          <h1 className="text-xl font-semibold">Kost tidak ditemukan</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Properti ini mungkin sudah tidak aktif.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/kost">Kembali ke Daftar Kost</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const rooms = data.rooms ?? [];
  const waMessage = `Halo Admin, saya tertarik dengan ${data.name}. Saya ingin mengetahui informasi lebih lanjut.`;

  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link
          to="/kost"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Kembali ke Daftar Kost
        </Link>

        <div className="mt-5 overflow-hidden rounded-lg border border-border">
          <img
            src={data.image_url || "/images/kost-antapani.jpg"}
            alt={`Bangunan ${data.name}`}
            width={1280}
            height={854}
            className="aspect-[16/7] w-full object-cover"
          />
        </div>

        <div className="mt-6 flex flex-col gap-6 md:flex-row">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">{data.name}</h1>
            <p className="mt-1.5 flex items-start gap-1.5 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0" /> {data.address}
            </p>
            {data.description ? (
              <p className="mt-4 text-sm leading-relaxed">{data.description}</p>
            ) : null}

            {data.facilities?.length ? (
              <div className="mt-6">
                <h2 className="text-base font-semibold">Fasilitas</h2>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {data.facilities.map((f) => (
                    <li
                      key={f}
                      className="rounded-md border border-border bg-card px-2.5 py-1 text-sm"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-8">
              <h2 className="text-base font-semibold">Daftar Kamar</h2>
              <div className="panel mt-3 divide-y divide-border">
                {rooms.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-muted-foreground">
                    Belum ada kamar terdaftar untuk properti ini.
                  </p>
                ) : (
                  rooms.map((room) => {
                    const meta = metaFor(ROOM_STATUS, room.status);
                    return (
                      <div
                        key={room.id}
                        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium">Kamar {room.room_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {room.description || (room.facilities ?? []).join(" · ") || "—"}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-sm font-medium tabular-nums">
                            {formatRupiah(room.price)}
                            <span className="font-normal text-muted-foreground"> /bln</span>
                          </p>
                          <StatusBadge label={meta.label} tone={meta.tone} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <aside className="md:w-72 md:shrink-0">
            <div className="panel p-4 md:sticky md:top-20">
              <p className="text-xs text-muted-foreground">Mulai dari</p>
              <p className="text-xl font-semibold">
                {formatRupiah(minPrice(rooms))}
                <span className="text-sm font-normal text-muted-foreground"> / bulan</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {rooms.filter((r) => r.status === "available").length} kamar tersedia dari{" "}
                {rooms.length} kamar
              </p>
              <Button asChild className="mt-4 w-full">
                <a
                  href={whatsappLink(data.whatsapp_number || "628123456789", waMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="size-4" /> Hubungi Admin
                </a>
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                Admin akan membantu menjadwalkan kunjungan Anda.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
