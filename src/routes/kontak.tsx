import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle } from "lucide-react";

import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/lib/format";

export const Route = createFileRoute("/kontak")({
  head: () => ({
    meta: [
      { title: "Hubungi Kami — Vintera Kost Management" },
      {
        name: "description",
        content:
          "Hubungi admin Vintera melalui WhatsApp atau email untuk menanyakan ketersediaan kamar dan menjadwalkan kunjungan kost.",
      },
      { property: "og:title", content: "Hubungi Kami — Vintera Kost Management" },
      {
        property: "og:description",
        content: "WhatsApp atau email admin Vintera untuk info kamar dan jadwal visit.",
      },
    ],
  }),
  component: KontakPage,
});

function KontakPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Hubungi Kami</h1>
        <p className="mt-3 text-muted-foreground">
          Tim admin kami siap membantu Anda menemukan kamar yang sesuai dan mengatur jadwal
          kunjungan.
        </p>

        <div className="mt-8 divide-y divide-border border-y border-border">
          <div className="flex items-start gap-3 py-4">
            <MessageCircle className="mt-0.5 size-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">WhatsApp Admin</p>
              <p className="text-sm text-muted-foreground">+62 812-3456-789</p>
            </div>
          </div>
          <div className="flex items-start gap-3 py-4">
            <Mail className="mt-0.5 size-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">admin@vintera.id</p>
            </div>
          </div>
          <div className="flex items-start gap-3 py-4">
            <MapPin className="mt-0.5 size-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Alamat kantor</p>
              <p className="text-sm text-muted-foreground">
                Jl. Purwakarta No. 12, Antapani, Bandung
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 py-4">
            <Clock className="mt-0.5 size-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Jam operasional</p>
              <p className="text-sm text-muted-foreground">Senin – Sabtu, 08.00 – 18.00 WIB</p>
            </div>
          </div>
        </div>

        <Button asChild className="mt-8">
          <a
            href={whatsappLink(
              "628123456789",
              "Halo Admin, saya ingin menanyakan informasi kost Vintera.",
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="size-4" /> Chat Admin via WhatsApp
          </a>
        </Button>
      </div>
    </PublicLayout>
  );
}
