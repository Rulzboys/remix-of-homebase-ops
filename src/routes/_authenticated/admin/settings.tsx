import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader, SectionTitle } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TextField } from "@/components/crud";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({
    meta: [
      { title: "Pengaturan Akun Admin | Admin KostKu" },
      {
        name: "description",
        content: "Perbarui profil admin, ubah kata sandi, dan lihat informasi akses akun Anda.",
      },
      { property: "og:title", content: "Pengaturan Akun Admin | Admin KostKu" },
      { property: "og:description", content: "Panel pengaturan akun untuk admin KostKu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminSettings,
});

function AdminSettings() {
  const { profile, user, roles, refresh, signOut } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
    setAvatarUrl(profile?.avatar_url ?? "");
  }, [profile]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sesi tidak ditemukan.");
      if (!fullName.trim()) throw new Error("Nama lengkap wajib diisi.");
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          avatar_url: avatarUrl.trim() || null,
        })
        .eq("id", user.id);
      if (error) throw error;
      await refresh();
    },
    onSuccess: () => toast.success("Profil diperbarui."),
    onError: (e: Error) => toast.error(e.message || "Gagal memperbarui profil."),
  });

  const changePassword = useMutation({
    mutationFn: async () => {
      if (password.length < 8) throw new Error("Kata sandi minimal 8 karakter.");
      if (password !== confirmPassword) throw new Error("Konfirmasi kata sandi tidak cocok.");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Kata sandi diperbarui.");
      setPassword("");
      setConfirmPassword("");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal mengubah kata sandi."),
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" description="Pengaturan akun dan preferensi admin." />

      <div className="panel p-5">
        <SectionTitle title="Profil" description="Informasi yang tampil di aplikasi." />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Nama lengkap" value={fullName} onChange={setFullName} />
          <TextField label="Telepon" value={phone} onChange={setPhone} placeholder="081234567890" />
        </div>
        <div className="mt-4">
          <TextField label="URL foto profil" value={avatarUrl} onChange={setAvatarUrl} />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending}>
            {saveProfile.isPending ? "Menyimpan…" : "Simpan profil"}
          </Button>
        </div>
      </div>

      <div className="panel p-5">
        <SectionTitle title="Keamanan" description="Ubah kata sandi akun Anda." />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Kata sandi baru"
            type="password"
            value={password}
            onChange={setPassword}
          />
          <TextField
            label="Konfirmasi kata sandi"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            onClick={() => changePassword.mutate()}
            disabled={changePassword.isPending}
          >
            {changePassword.isPending ? "Memproses…" : "Ubah kata sandi"}
          </Button>
        </div>
      </div>

      <div className="panel p-5">
        <SectionTitle title="Akun" description="Informasi akses akun." />
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground uppercase">Email</dt>
            <dd className="mt-0.5">{user?.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground uppercase">Role</dt>
            <dd className="mt-0.5">
              {roles.length ? roles.map((r) => ROLE_LABEL[r] ?? r).join(", ") : "—"}
            </dd>
          </div>
        </dl>
        <Separator className="my-4" />
        <Button variant="outline" className="text-danger" onClick={() => void signOut()}>
          Keluar dari akun
        </Button>
      </div>
    </div>
  );
}
