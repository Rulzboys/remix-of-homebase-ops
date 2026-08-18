import { Navigate, Outlet } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { homeForRoles, useAuth, type AppRole } from "@/lib/auth";

export function RoleLayout({ role }: { role: AppRole }) {
  const { loading, roles } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <Skeleton className="h-8 w-56" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="mt-6 h-64" />
      </div>
    );
  }

  if (!roles.includes(role)) {
    return <Navigate to={homeForRoles(roles) as never} replace />;
  }

  return (
    <AppShell role={role}>
      <Outlet />
    </AppShell>
  );
}
