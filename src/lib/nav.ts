import {
  Bell,
  Building2,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  DoorClosed,
  FileBarChart,
  Home,
  Image,
  LayoutDashboard,
  LogIn,
  Settings,
  Sparkles,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { AppRole } from "@/lib/auth";

export type NavItem = { to: string; label: string; icon: LucideIcon };
export type NavGroup = { heading?: string; items: NavItem[] };

export const NAV_BY_ROLE: Record<AppRole, NavGroup[]> = {
  admin: [
    {
      heading: "Operasional",
      items: [
        { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/admin/properties", label: "Properti Kost", icon: Building2 },
        { to: "/admin/rooms", label: "Kamar", icon: DoorClosed },
        { to: "/admin/tenants", label: "Tenant", icon: Users },
      ],
    },
    {
      heading: "Aktivitas",
      items: [
        { to: "/admin/prospects", label: "Calon Tenant", icon: UserPlus },
        { to: "/admin/visits", label: "Visit", icon: CalendarCheck },
        { to: "/admin/cleaning", label: "Cleaning", icon: Sparkles },
        { to: "/admin/payments", label: "Payment", icon: CreditCard },
      ],
    },
    {
      heading: "Lainnya",
      items: [
        { to: "/admin/content", label: "Content", icon: Image },
        { to: "/admin/reports", label: "Reports", icon: FileBarChart },
        { to: "/admin/users", label: "Users", icon: Users },
        { to: "/admin/notifications", label: "Notifications", icon: Bell },
        { to: "/admin/settings", label: "Settings", icon: Settings },
      ],
    },
  ],
  owner: [
    {
      items: [
        { to: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/owner/properties", label: "Properti Saya", icon: Building2 },
        { to: "/owner/tenants", label: "Tenant", icon: Users },
        { to: "/owner/cleaning", label: "Cleaning", icon: Sparkles },
        { to: "/owner/payments", label: "Payment", icon: CreditCard },
        { to: "/owner/reports", label: "Reports", icon: FileBarChart },
        { to: "/owner/notifications", label: "Notifications", icon: Bell },
      ],
    },
  ],
  assistant: [
    {
      items: [
        { to: "/assistant/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/assistant/visits", label: "Jadwal Visit", icon: CalendarCheck },
        { to: "/assistant/documentation", label: "Dokumentasi Visit", icon: Image },
        { to: "/assistant/checkin", label: "Check-in", icon: ClipboardList },
        { to: "/assistant/notifications", label: "Notifications", icon: Bell },
      ],
    },
  ],
  helper: [
    {
      items: [
        { to: "/helper/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/helper/cleaning", label: "Jadwal Cleaning", icon: Sparkles },
        { to: "/helper/history", label: "Riwayat Cleaning", icon: ClipboardList },
        { to: "/helper/notifications", label: "Notifications", icon: Bell },
      ],
    },
  ],
  tenant: [
    {
      items: [
        { to: "/tenant/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/tenant/kost", label: "Kost Saya", icon: Home },
        { to: "/tenant/invoices", label: "Tagihan", icon: CreditCard },
        { to: "/tenant/cleaning", label: "Cleaning", icon: Sparkles },
        { to: "/tenant/notifications", label: "Notifications", icon: Bell },
        { to: "/tenant/profile", label: "Profile", icon: User },
      ],
    },
  ],
};

export const PUBLIC_NAV: NavItem[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/kost", label: "Daftar Kost", icon: Building2 },
  { to: "/tentang", label: "Tentang Kami", icon: Users },
  { to: "/kontak", label: "Hubungi Kami", icon: Bell },
  { to: "/login", label: "Login", icon: LogIn },
];
