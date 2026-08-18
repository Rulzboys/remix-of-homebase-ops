import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/format";
import { availableCount, minPrice, type PublicProperty } from "@/lib/public-data";

export function PropertyCard({ property }: { property: PublicProperty }) {
  const rooms = property.rooms ?? [];
  const available = availableCount(rooms);
  const from = minPrice(rooms);

  return (
    <article className="panel flex flex-col overflow-hidden">
      <img
        src={property.image_url || "/images/kost-antapani.jpg"}
        alt={`Bangunan ${property.name}`}
        loading="lazy"
        width={1280}
        height={854}
        className="aspect-[3/2] w-full object-cover"
      />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold">{property.name}</h3>
        <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-3.5 shrink-0" />
          <span className="line-clamp-2">{property.address}</span>
        </p>

        <div className="mt-3">
          <p className="text-xs text-muted-foreground">Mulai dari</p>
          <p className="text-lg font-semibold">
            {formatRupiah(from)}
            <span className="text-sm font-normal text-muted-foreground"> / bulan</span>
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {available > 0 ? `${available} kamar tersedia` : "Tidak ada kamar tersedia"}
          </p>
        </div>

        {property.facilities?.length ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {property.facilities.slice(0, 4).map((f) => (
              <li
                key={f}
                className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground"
              >
                {f}
              </li>
            ))}
          </ul>
        ) : null}

        <Button asChild variant="outline" className="mt-4 w-full">
          <Link to="/kost/$id" params={{ id: property.id }}>
            Lihat Detail
          </Link>
        </Button>
      </div>
    </article>
  );
}
