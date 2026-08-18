import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PanelsTopLeft } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { homeForRoles, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Vintera Kost Management" },
      {
        name: "description",
        content:
          "Masuk ke dashboard Vintera untuk mengelola properti, tenant, visit, cleaning, dan pembayaran kost.",
      },
      { property: "og:title", content: "Login — Vintera Kost Management" },
      { property: "og:description", content: "Masuk ke dashboard operasional Vintera." },
    ],
  }),
  component: LoginPage,
});

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Format email tidak valid" }).max(255),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }).max(72),
});

const registerSchema = loginSchema.extend({
  full_name: z.string().trim().min(2, { message: "Nama minimal 2 karakter" }).max(100),
});

function LoginPage() {
  const navigate = useNavigate();
  const { session, roles, loading, refresh } = useAuth();
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && session && roles.length > 0) {
      void navigate({ to: homeForRoles(roles) as never, replace: true });
    }
  }, [loading, session, roles, navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setBusy(false);
    if (error) {
      toast.error("Login gagal", { description: "Email atau password tidak sesuai." });
      return;
    }
    await refresh();
    toast.success("Berhasil masuk");
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const parsed = registerSchema.safeParse({ email, password, full_name: fullName });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { full_name: parsed.data.full_name },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    setBusy(false);
    if (error) {
      toast.error("Pendaftaran gagal", { description: error.message });
      return;
    }
    await refresh();
    toast.success("Akun dibuat", {
      description: "Jika konfirmasi email diperlukan, cek inbox Anda lalu masuk kembali.",
    });
  }

  async function handleForgotPassword() {
    const parsed = loginSchema.shape.email.safeParse(email);
    if (!parsed.success) {
      toast.error("Masukkan email Anda terlebih dahulu");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/login`,
    });
    setBusy(false);
    if (error) {
      toast.error("Gagal mengirim email reset", { description: error.message });
      return;
    }
    toast.success("Email reset password terkirim", {
      description: "Silakan cek inbox email Anda.",
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="flex items-center justify-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <PanelsTopLeft className="size-4" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold">Vintera</span>
              <span className="block text-[11px] text-muted-foreground">Manajemen Kost</span>
            </span>
          </Link>

          <div className="panel mt-6 p-6">
            <Tabs value={mode} onValueChange={setMode}>
              <TabsList className="w-full">
                <TabsTrigger value="login" className="flex-1">
                  Masuk
                </TabsTrigger>
                <TabsTrigger value="register" className="flex-1">
                  Daftar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-5">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                    />
                    {errors["email"] ? (
                      <p className="text-xs text-danger">{errors["email"]}</p>
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    {errors["password"] ? (
                      <p className="text-xs text-danger">{errors["password"]}</p>
                    ) : null}
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? "Memproses…" : "Masuk"}
                  </Button>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
                  >
                    Lupa password?
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-5">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="full_name">Nama Lengkap</Label>
                    <Input
                      id="full_name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nama lengkap Anda"
                    />
                    {errors["full_name"] ? (
                      <p className="text-xs text-danger">{errors["full_name"]}</p>
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg_email">Email</Label>
                    <Input
                      id="reg_email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                    />
                    {errors["email"] ? (
                      <p className="text-xs text-danger">{errors["email"]}</p>
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg_password">Password</Label>
                    <Input
                      id="reg_password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                    />
                    {errors["password"] ? (
                      <p className="text-xs text-danger">{errors["password"]}</p>
                    ) : null}
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? "Memproses…" : "Buat Akun"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Akun pertama yang terdaftar otomatis menjadi Admin. Akun berikutnya dibuat oleh
                    Admin melalui menu Users.
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              ← Kembali ke website
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
