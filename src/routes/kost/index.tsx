import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { PublicLayout } from "@/components/PublicLayout";
import { PropertyCard } from "@/components/PropertyCard";
import { EmptyState, ErrorState } from "@/components/DataState";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { availableCount, fetchPublicProperties, minPrice } from "@/lib/public-data";

export const Route = createFileRoute("/kost/")({
  head: () => ({
    meta: [
      { title: "Daftar Kost Vintera — Kamar Tersedia di Bandung" },
      {
        name: "description",
        content:
          "Daftar properti kost Vintera di Bandung. Filter berdasarkan lokasi, harga, dan ketersediaan kamar.",
      },
      { property: "og:title", content: "Daftar Kost Vintera — Kamar Tersedia di Bandung" },
      {
        property: "og:description",
        content: "Filter kost berdasarkan lokasi, harga, dan ketersediaan kamar.",
      },
    ],
  }),
  component: KostListPage,
});

function KostListPage() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["public-properties", {}],
    queryFn: () => fetchPublicProperties(),
  });
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [price, setPrice] = useState("all");
  const [availability, setAvailability] = useState("all");

  const cities = useMemo(
    () => Array.from(new Set((data ?? []).map((p) => p.city).filter(Boolean))) as string[],
    [data],
  );

  const filtered = useMemo(() => {
    return (data ?? []).filter((p) => {
      const rooms = p.rooms ?? [];
      if (search && !`${p.name} ${p.address}`.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (city !== "all" && p.city !== city) return false;
      const from = minPrice(rooms);
      if (price === "low" && !(from > 0 && from < 1500000)) return false;
      if (price === "mid" && !(from >= 1500000 && from <= 2000000)) return false;
      if (price === "high" && !(from > 2000000)) return false;
      if (availability === "available" && availableCount(rooms) === 0) return false;
      return true;
    });
  }, [data, search, city, price, availability]);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Daftar Kost</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isPending ? "Memuat properti…" : `${filtered.length} properti ditemukan`}
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau alamat kost..."
              className="pl-9"
            />
          </div>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="sm:w-40">
              <SelectValue placeholder="Lokasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua lokasi</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={price} onValueChange={setPrice}>
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="Harga" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua harga</SelectItem>
              <SelectItem value="low">&lt; Rp1.500.000</SelectItem>
              <SelectItem value="mid">Rp1.500.000 – Rp2.000.000</SelectItem>
              <SelectItem value="high">&gt; Rp2.000.000</SelectItem>
            </SelectContent>
          </Select>
          <Select value={availability} onValueChange={setAvailability}>
            <SelectTrigger className="sm:w-40">
              <SelectValue placeholder="Status kamar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua status</SelectItem>
              <SelectItem value="available">Ada kamar tersedia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-7">
          {isError ? (
            <ErrorState message={(error as Error)?.message} />
          ) : isPending ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="panel overflow-hidden">
                  <Skeleton className="aspect-[3/2] w-full rounded-none" />
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="panel">
              <EmptyState
                title="Tidak ada kost yang cocok"
                description="Coba ubah kata kunci atau filter pencarian Anda."
              />
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
