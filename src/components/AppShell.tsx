import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, Menu, PanelsTopLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NotificationBell } from "@/components/NotificationBell";
import { NAV_BY_ROLE } from "@/lib/nav";
import type { NavGroup } from "@/lib/nav";
import { useAuth, type AppRole } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/status";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

function NavLinks({ groups, onNavigate }: { groups: NavGroup[]; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-col gap-5">
      {groups.map((group, gi) => (
        <div key={group.heading ?? gi}>
          {group.heading ? (
            <p className="mb-1.5 px-2.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              {group.heading}
            </p>
          ) : null}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to as never}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors duration-150",
                      active
                        ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/85 hover:bg-sidebar-accent/60",
                    )}
                  >
                    <item.icon className="size-4 shrink-0 opacity-80" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-1">
      <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <PanelsTopLeft className="size-4" />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold">Vintera</p>
        <p className="text-[11px] text-muted-foreground">Manajemen Kost</p>
      </div>
    </div>
  );
}

export function AppShell({ role, children }: { role: AppRole; children: React.ReactNode }) {
  const groups = NAV_BY_ROLE[role];
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const notificationsPath = `/${role}/notifications`;

  async function handleSignOut() {
    await signOut();
    await navigate({ to: "/login" });
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop sidebar — tetap fixed di kiri, scroll hanya di dalam menu */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-14 items-center border-b border-sidebar-border px-3">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto px-2.5 py-4">
          <NavLinks groups={groups} />
        </div>
        <div className="border-t border-sidebar-border px-3 py-3">
          <p className="text-[11px] text-muted-foreground">Masuk sebagai</p>
          <p className="truncate text-sm font-medium">{ROLE_LABEL[role] ?? role}</p>
        </div>
      </aside>

      {/* Main area — header tetap, konten halaman yang di-scroll */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-3 sm:px-5">
          <div className="flex items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Buka menu">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigasi</SheetTitle>
                <div className="flex h-14 items-center border-b border-border px-3">
                  <Brand />
                </div>
                <div className="px-2.5 py-4">
                  <NavLinks groups={groups} onNavigate={() => setMobileOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            <p className="text-sm font-medium lg:hidden">Vintera</p>
          </div>

          <div className="flex items-center gap-1.5">
            <NotificationBell notificationsPath={notificationsPath} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-accent">
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                    {initials(profile?.full_name ?? user?.email)}
                  </span>
                  <span className="hidden max-w-32 truncate sm:block">
                    {profile?.full_name || user?.email}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-medium">{profile?.full_name || "Pengguna"}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/">Lihat website publik</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="size-4" /> Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
