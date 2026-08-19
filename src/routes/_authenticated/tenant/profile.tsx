import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader, SectionTitle } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Field, TextField, useCrud } from "@/components/crud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { myTenantQuery, type Row } from "@/lib/queries";
import { formatDate, formatRupiah, initials } from "@/lib/format";
import { ROLE_LABEL, TENANT_STATUS, metaFor } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/tenant/profile")({
  head: () => ({
    meta: [
      { title: "Profil Saya | Tenant KostKu" },
      {
        name: "description",
        content: "Kelola data profil penghuni: nama lengkap, nomor telepon, dan foto profil akun Anda.",
      },
      { property: "og:title", content: "Profil Saya | Tenant KostKu" },
      { property: "og:description", content: "Pengaturan profil akun penghuni kost." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TenantProfile,
});

function TenantProfile() {
  const { user, profile, roles, refresh } = useAuth();
  const tenant = useQuery(myTenantQuery(user?.id));
  const record = tenant.data as Row | null | undefined;
  const { save } = useCrud("profiles", ["my-tenant"]);

  const [form, setForm] = useState({ full_name: "", phone: "", avatar_url: "" });

  useEffect(() => {
    setForm({
      full_name: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      avatar_url: profile?.avatar_url ?? "",
    });
  }, [profile?.full_name, profile?.phone, profile?.avatar_url]);

  const statusMeta = metaFor(TENANT_STATUS, record?.["status"] as string);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (!form.full_name.trim()) {
      toast.error("Nama lengkap wajib diisi.");
      return;
    }
    save.mutate(
      {
        id: user.id,
        values: {
          full_name: form.full_name.trim(),
          phone: form.phone.trim() || null,
          avatar_url: form.avatar_url.trim() || null,
        },
      },
      { onSuccess: () => void refresh() },
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Profil Saya" description="Perbarui data akun dan lihat informasi penghuni." />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel p-5">
          <SectionTitle title="Data akun" description="Informasi ini terlihat oleh pengelola kost." />
          <div className="mb-5 flex items-center gap-3">
            <Avatar className="size-14">
              {form.avatar_url ? <AvatarImage src={form.avatar_url} alt={form.full_name} /> : null}
              <AvatarFallback>{initials(form.full_name || profile?.full_name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium">{profile?.full_name ?? "—"}</p>
              <p className="truncate text-sm text-muted-foreground">{profile?.email ?? user?.email ?? "—"}</p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <TextField
              label="Nama lengkap"
              value={form.full_name}
              onChange={(v) => setForm((f) => ({ ...f, full_name: v }))}
              placeholder="Nama sesuai identitas"
            />
            <TextField
              label="Nomor telepon"
              value={form.phone}
              onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
              placeholder="08xxxxxxxxxx"
            />
            <TextField
              label="URL foto profil"
              value={form.avatar_url}
              onChange={(v) => setForm((f) => ({ ...f, avatar_url: v }))}
              placeholder="https://..."
            />
            <Field label="Email">
              <Input value={profile?.email ?? user?.email ?? ""} readOnly disabled />
            </Field>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Menyimpan..." : "Simpan perubahan"}
            </Button>
          </form>
        </section>

        <section className="panel p-5">
          <SectionTitle title="Informasi penghuni" description="Data ini dikelola oleh admin kost." />
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Peran akun</dt>
              <dd className="font-medium">
                {roles.map((r) => ROLE_LABEL[r] ?? r).join(", ") || "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Kost</dt>
              <dd className="font-medium">{record?.["property"]?.name ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Kamar</dt>
              <dd className="font-medium">{record?.["room"]?.room_number ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Sewa bulanan</dt>
              <dd className="font-medium tabular-nums">{formatRupiah(record?.["monthly_price"])}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Tanggal check-in</dt>
              <dd className="font-medium">{formatDate(record?.["check_in_date"])}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Status penghuni</dt>
              <dd>
                <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Institusi</dt>
              <dd className="font-medium">{record?.["institution"] ?? "—"}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
