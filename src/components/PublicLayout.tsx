import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, PanelsTopLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth, homeForRoles } from "@/lib/auth";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/kost", label: "Daftar Kost" },
  { to: "/tentang", label: "Tentang Kami" },
  { to: "/kontak", label: "Hubungi Kami" },
];

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { session, roles } = useAuth();

  const dashboardHref = session ? homeForRoles(roles) : "/login";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <PanelsTopLeft className="size-4" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold">Vintera</span>
              <span className="block text-[11px] text-muted-foreground">Kost Management</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to as never}
                activeOptions={{ exact: l.to === "/" }}
                className="rounded-md px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                activeProps={{ className: "bg-accent font-medium text-foreground" }}
              >
                {l.label}
              </Link>
            ))}
            <Button asChild size="sm" className="ml-2">
              <Link to={dashboardHref as never}>{session ? "Dashboard" : "Login"}</Link>
            </Button>
          </nav>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Buka menu">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetTitle className="text-base">Menu</SheetTitle>
              <div className="mt-4 flex flex-col gap-1">
                {LINKS.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to as never}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2 text-sm hover:bg-accent"
                  >
                    {l.label}
                  </Link>
                ))}
                <Button asChild className="mt-2">
                  <Link to={dashboardHref as never} onClick={() => setOpen(false)}>
                    {session ? "Dashboard" : "Login"}
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
          <div>
            <p className="text-sm font-semibold">Vintera Kost</p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Jaringan kost terkelola di Bandung dengan layanan cleaning berkala dan pendampingan
              penuh untuk penghuni.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Navigasi</p>
            <ul className="mt-2 space-y-1.5">
              {LINKS.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to as never}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Kontak</p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li>WhatsApp: +62 812-3456-789</li>
              <li>Email: admin@vintera.id</li>
              <li>Bandung, Jawa Barat</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Vintera Kost Management.
        </div>
      </footer>
    </div>
  );
}
