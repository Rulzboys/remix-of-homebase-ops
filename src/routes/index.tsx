import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";

import { PublicLayout } from "@/components/PublicLayout";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPublicProperties } from "@/lib/public-data";
import { whatsappLink } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vintera Kost — Temukan Kost Nyaman di Bandung" },
      {
        name: "description",
        content:
          "Cari kost terkelola di Bandung dengan fasilitas lengkap, cleaning berkala, dan pendampingan admin. Lihat kamar tersedia dan hubungi admin langsung.",
      },
      { property: "og:title", content: "Vintera Kost — Temukan Kost Nyaman di Bandung" },
      {
        property: "og:description",
        content: "Kost terkelola di Bandung dengan fasilitas lengkap dan cleaning berkala.",
      },
    ],
  }),
  component: HomePage,
});

const BENEFITS = [
  {
    icon: Sparkles,
    title: "Cleaning berkala",
    text: "Setiap properti dibersihkan sesuai jadwal oleh helper kami, dengan dokumentasi foto.",
  },
  {
    icon: CalendarCheck,
    title: "Visit terjadwal",
    text: "Ajukan jadwal kunjungan dan Anda akan didampingi assistant kami saat melihat kamar.",
  },
  {
    icon: ShieldCheck,
    title: "Pembayaran tercatat",
    text: "Tagihan bulanan, riwayat pembayaran, dan status kamar tercatat rapi di dashboard tenant.",
  },
];

function HomePage() {
  const { data, isPending } = useQuery({
    queryKey: ["public-properties", {}],
    queryFn: () => fetchPublicProperties(),
  });

  const featured = (data ?? []).slice(0, 3);

  return (
    <PublicLayout>
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
          <div>
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Kost terkelola di Bandung
            </p>
            <h1 className="mt-3 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
              Temukan Kost yang Nyaman untuk Anda
            </h1>
            <p className="mt-4 max-w-md text-muted-foreground">
              Cari kost yang sesuai dengan kebutuhan Anda. Lihat ketersediaan kamar, fasilitas, dan
              harga sewa secara transparan.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/kost">Lihat Kost</Link>
              </Button>
              <Button asChild variant="outline">
                <a
                  href={whatsappLink(
                    "628123456789",
                    "Halo Admin, saya ingin menanyakan ketersediaan kost Vintera.",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="size-4" /> Hubungi Admin
                </a>
              </Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <img
              src="/images/kost-dago.jpg"
              alt="Bangunan kost Vintera di kawasan Dago Bandung"
              width={1280}
              height={854}
              className="aspect-[3/2] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Pilihan Kost</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Properti aktif yang tersedia untuk disewa saat ini.
            </p>
          </div>
          <Link to="/kost" className="text-sm font-medium text-primary hover:underline">
            Lihat semua
          </Link>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isPending
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="panel overflow-hidden">
                  <Skeleton className="aspect-[3/2] w-full rounded-none" />
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))
            : featured.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-xl font-semibold">Kenapa memilih Vintera</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {BENEFITS.map((b) => (
              <div key={b.title}>
                <b.icon className="size-5 text-primary" />
                <p className="mt-3 font-medium">{b.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="panel flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold">Siap melihat kamar?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Hubungi admin kami untuk menjadwalkan kunjungan ke properti pilihan Anda.
            </p>
          </div>
          <Button asChild>
            <a
              href={whatsappLink(
                "628123456789",
                "Halo Admin, saya ingin menjadwalkan visit ke kost Vintera.",
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="size-4" /> Jadwalkan Visit
            </a>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
