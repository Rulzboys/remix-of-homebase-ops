import { createFileRoute, Link } from "@tanstack/react-router";

import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/tentang")({
  head: () => ({
    meta: [
      { title: "Tentang Kami — Vintera Kost Management" },
      {
        name: "description",
        content:
          "Vintera mengelola jaringan kost di Bandung dengan tim admin, assistant, dan helper yang menangani visit, cleaning, serta pembayaran penghuni.",
      },
      { property: "og:title", content: "Tentang Kami — Vintera Kost Management" },
      {
        property: "og:description",
        content: "Tim yang mengelola operasional kost Vintera setiap hari.",
      },
    ],
  }),
  component: TentangPage,
});

const TEAM = [
  {
    role: "Admin",
    text: "Mencatat calon tenant, menjadwalkan visit dan check-in, mengelola tagihan serta konfirmasi pembayaran.",
  },
  {
    role: "Assistant",
    text: "Mendampingi calon tenant saat visit dan mendampingi proses check-in, termasuk dokumentasi foto.",
  },
  {
    role: "Helper",
    text: "Melakukan cleaning berkala pada setiap properti dan mengunggah dokumentasi hasil pekerjaan.",
  },
  {
    role: "Owner",
    text: "Memantau okupansi, income, cleaning, dan laporan bulanan properti miliknya.",
  },
];

function TentangPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Tentang Kami</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Vintera adalah pengelola kost di Bandung yang menjalankan operasional harian secara
          terstruktur: mulai dari melayani calon penghuni, menjadwalkan kunjungan, mendampingi
          check-in, menjaga kebersihan bangunan, hingga mengelola tagihan bulanan. Seluruh proses
          tercatat dalam satu sistem sehingga pemilik properti dan penghuni mendapat informasi yang
          sama.
        </p>

        <h2 className="mt-10 text-lg font-semibold">Tim yang menangani operasional</h2>
        <div className="mt-4 divide-y divide-border">
          {TEAM.map((t) => (
            <div key={t.role} className="py-4">
              <p className="font-medium">{t.role}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/kost">Lihat Daftar Kost</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/kontak">Hubungi Kami</Link>
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
