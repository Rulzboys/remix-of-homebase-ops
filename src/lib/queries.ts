import { supabase } from "@/integrations/supabase/client";

export type Row = Record<string, any>;

async function run<T = Row[]>(promise: PromiseLike<{ data: unknown; error: unknown }>): Promise<T> {
  const { data, error } = await promise;
  if (error) throw error as Error;
  return (data ?? []) as T;
}

/**
 * Profile FKs point at auth.users, so PostgREST cannot embed them.
 * Attach profile names client-side instead.
 */
async function attachProfiles(rows: Row[], field: string, alias: string): Promise<Row[]> {
  const ids = Array.from(
    new Set(rows.map((r) => r[field]).filter((v): v is string => typeof v === "string")),
  );
  if (ids.length === 0) return rows.map((r) => ({ ...r, [alias]: null }));
  const profiles = await run(
    supabase.from("profiles").select("id, full_name, email").in("id", ids),
  );
  const byId = new Map((profiles as Row[]).map((p) => [p["id"] as string, p]));
  return rows.map((r) => ({ ...r, [alias]: byId.get(r[field] as string) ?? null }));
}

/* ---------- properties & rooms ---------- */

export function propertiesQuery() {
  return {
    queryKey: ["properties"],
    queryFn: async () => {
      const rows = await run(
        supabase.from("properties").select("*, rooms(id, status, price)").order("name"),
      );
      return attachProfiles(rows as Row[], "owner_id", "owner");
    },
  };
}

export function roomsQuery() {
  return {
    queryKey: ["rooms"],
    queryFn: () =>
      run(
        supabase
          .from("rooms")
          .select("*, property:properties(id, name)")
          .order("room_number"),
      ),
  };
}

/* ---------- prospects & visits ---------- */

export function prospectsQuery() {
  return {
    queryKey: ["prospects"],
    queryFn: () =>
      run(
        supabase
          .from("prospects")
          .select("*, property:properties(id, name), room:rooms(id, room_number)")
          .order("created_at", { ascending: false }),
      ),
  };
}

export function visitsQuery(filters?: { assistantId?: string }) {
  return {
    queryKey: ["visits", filters ?? {}],
    queryFn: async () => {
      let q = supabase
        .from("visits")
        .select(
          "*, prospect:prospects(id, full_name, phone), property:properties(id, name), room:rooms(id, room_number)",
        )
        .order("visit_date", { ascending: false });
      if (filters?.assistantId) q = q.eq("assistant_id", filters.assistantId);
      const rows = await run(q);
      return attachProfiles(rows as Row[], "assistant_id", "assistant");
    },
  };
}

/* ---------- tenants ---------- */

export function tenantsQuery() {
  return {
    queryKey: ["tenants"],
    queryFn: () =>
      run(
        supabase
          .from("tenants")
          .select("*, property:properties(id, name), room:rooms(id, room_number, price)")
          .order("created_at", { ascending: false }),
      ),
  };
}

/* ---------- cleaning ---------- */

export function cleaningQuery(filters?: { helperId?: string; status?: string[] }) {
  return {
    queryKey: ["cleaning", filters ?? {}],
    queryFn: () => {
      let q = supabase
        .from("cleaning_schedules")
        .select(
          "*, property:properties(id, name), helper:profiles!cleaning_schedules_helper_id_fkey(full_name)",
        )
        .order("cleaning_date", { ascending: false });
      if (filters?.helperId) q = q.eq("helper_id", filters.helperId);
      if (filters?.status?.length) q = q.in("status", filters.status as never[]);
      return run(q);
    },
  };
}

/* ---------- invoices & payments ---------- */

export function invoicesQuery(filters?: { tenantId?: string }) {
  return {
    queryKey: ["invoices", filters ?? {}],
    queryFn: () => {
      let q = supabase
        .from("invoices")
        .select(
          "*, tenant:tenants(id, full_name, phone, property_id), property:properties(id, name), room:rooms(id, room_number), payments(id, amount, paid_at, payment_method, notes)",
        )
        .order("due_date", { ascending: false });
      if (filters?.tenantId) q = q.eq("tenant_id", filters.tenantId);
      return run(q);
    },
  };
}

/* ---------- content ---------- */

export function contentsQuery() {
  return {
    queryKey: ["contents"],
    queryFn: () =>
      run(
        supabase
          .from("contents")
          .select("*, property:properties(id, name)")
          .order("created_at", { ascending: false }),
      ),
  };
}

/* ---------- reports ---------- */

export function reportsQuery() {
  return {
    queryKey: ["monthly_reports"],
    queryFn: () =>
      run(
        supabase
          .from("monthly_reports")
          .select("*, property:properties(id, name)")
          .order("year", { ascending: false })
          .order("month", { ascending: false }),
      ),
  };
}

/* ---------- notifications ---------- */

export function notificationsQuery(userId: string | undefined) {
  return {
    queryKey: ["notifications", userId],
    queryFn: () =>
      run(
        supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId!)
          .order("created_at", { ascending: false })
          .limit(100),
      ),
    enabled: Boolean(userId),
  };
}

/* ---------- users ---------- */

export function usersQuery() {
  return {
    queryKey: ["users"],
    queryFn: async () => {
      const profiles = await run(
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      );
      const roles = await run(supabase.from("user_roles").select("user_id, role"));
      return (profiles as Row[]).map((p) => ({
        ...p,
        roles: (roles as Row[]).filter((r) => r["user_id"] === p["id"]).map((r) => r["role"]),
      }));
    },
  };
}

/** current tenant record of the signed-in user */
export function myTenantQuery(userId: string | undefined) {
  return {
    queryKey: ["my-tenant", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select(
          "*, property:properties(id, name, address, city, image_url, facilities, whatsapp_number), room:rooms(id, room_number, price, facilities)",
        )
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data as Row | null;
    },
    enabled: Boolean(userId),
  };
}

/* ---------- owners (profiles with role = owner) ---------- */

export function ownersQuery() {
  return {
    queryKey: ["owners"],
    queryFn: async () => {
      const roles = await run(
        supabase.from("user_roles").select("user_id").eq("role", "owner"),
      );
      const ids = (roles as Row[]).map((r) => r["user_id"] as string);
      if (ids.length === 0) return [] as Row[];
      const profiles = await run(
        supabase.from("profiles").select("id, full_name, email").in("id", ids).order("full_name"),
      );
      return profiles as Row[];
    },
  };
}

/* ---------- profiles by role ---------- */

export function profilesByRoleQuery(role: "admin" | "owner" | "assistant" | "helper" | "tenant") {
  return {
    queryKey: ["profiles-by-role", role],
    queryFn: async () => {
      const roles = await run(supabase.from("user_roles").select("user_id").eq("role", role));
      const ids = (roles as Row[]).map((r) => r["user_id"] as string);
      if (ids.length === 0) return [] as Row[];
      const profiles = await run(
        supabase.from("profiles").select("id, full_name, email").in("id", ids).order("full_name"),
      );
      return profiles as Row[];
    },
  };
}

/* ---------- deals ---------- */

export function dealsQuery() {
  return {
    queryKey: ["deals"],
    queryFn: () =>
      run(
        supabase
          .from("deals")
          .select(
            "*, prospect:prospects(id, full_name, phone), property:properties(id, name), room:rooms(id, room_number)",
          )
          .order("created_at", { ascending: false }),
      ),
  };
}

/* ---------- payments (flat list) ---------- */

export function paymentsQuery() {
  return {
    queryKey: ["payments"],
    queryFn: () =>
      run(
        supabase
          .from("payments")
          .select("*, tenant:tenants(id, full_name), invoice:invoices(id, invoice_number, billing_month, amount)")
          .order("paid_at", { ascending: false }),
      ),
  };
}
