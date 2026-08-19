import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "owner" | "assistant" | "helper" | "tenant";

export type Profile = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
};

type AuthState = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  primaryRole: AppRole | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const ROLE_PRIORITY: AppRole[] = ["admin", "owner", "assistant", "helper", "tenant"];

export const ROLE_HOME: Record<AppRole, string> = {
  admin: "/admin/dashboard",
  owner: "/owner/dashboard",
  assistant: "/assistant/dashboard",
  helper: "/helper/dashboard",
  tenant: "/tenant/dashboard",
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const loadIdentity = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null);
      setRoles([]);
      return;
    }
    const [profileRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, phone, avatar_url").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    let profileRow = (profileRes.data as Profile | null) ?? null;

    if (!profileRow) {
      const { data: userData } = await supabase.auth.getUser();
      const authUser = userData.user;
      if (authUser && authUser.id === userId) {
        const meta = (authUser.user_metadata ?? {}) as Record<string, string | undefined>;
        const fallbackName = (authUser.email ?? "Pengguna").split("@")[0] ?? "Pengguna";
        const { data: created } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            full_name: meta["full_name"] ?? fallbackName,
            email: authUser.email ?? null,
            phone: meta["phone"] ?? null,
          })
          .select("id, full_name, email, phone, avatar_url")
          .maybeSingle();
        profileRow = (created as Profile | null) ?? null;
      }
    }

    setProfile(profileRow);
    setRoles(((rolesRes.data ?? []) as { role: AppRole }[]).map((r) => r.role));
  }, []);


  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      if (event === "SIGNED_OUT") {
        setProfile(null);
        setRoles([]);
      }
    });

    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
      await loadIdentity(data.session?.user.id);
      if (active) setLoading(false);
    })();

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadIdentity]);

  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) return;
    void loadIdentity(userId);
  }, [userId, loadIdentity]);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    await loadIdentity(data.session?.user.id);
  }, [loadIdentity]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setRoles([]);
  }, []);

  const value = useMemo<AuthState>(() => {
    const primaryRole = ROLE_PRIORITY.find((r) => roles.includes(r)) ?? null;
    return {
      session,
      user: session?.user ?? null,
      profile,
      roles,
      primaryRole,
      loading,
      refresh,
      signOut,
    };
  }, [session, profile, roles, loading, refresh, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function homeForRoles(roles: AppRole[]): string {
  const role = ROLE_PRIORITY.find((r) => roles.includes(r));
  return role ? ROLE_HOME[role] : "/";
}
