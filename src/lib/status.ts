export type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral";

type StatusMeta = { label: string; tone: BadgeTone };

export const ROOM_STATUS: Record<string, StatusMeta> = {
  available: { label: "Tersedia", tone: "success" },
  occupied: { label: "Terisi", tone: "info" },
  maintenance: { label: "Maintenance", tone: "warning" },
};

export const PROPERTY_STATUS: Record<string, StatusMeta> = {
  active: { label: "Aktif", tone: "success" },
  inactive: { label: "Nonaktif", tone: "neutral" },
};

export const PROSPECT_STATUS: Record<string, StatusMeta> = {
  new_lead: { label: "New Lead", tone: "neutral" },
  contacted: { label: "Contacted", tone: "info" },
  visit_scheduled: { label: "Visit Scheduled", tone: "info" },
  visited: { label: "Visited", tone: "info" },
  follow_up: { label: "Follow Up", tone: "warning" },
  deal: { label: "Deal", tone: "success" },
  not_deal: { label: "Not Deal", tone: "danger" },
};

export const VISIT_STATUS: Record<string, StatusMeta> = {
  scheduled: { label: "Scheduled", tone: "info" },
  completed: { label: "Completed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

export const CLEANING_STATUS: Record<string, StatusMeta> = {
  scheduled: { label: "Scheduled", tone: "info" },
  in_progress: { label: "In Progress", tone: "warning" },
  completed: { label: "Completed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

export const INVOICE_STATUS: Record<string, StatusMeta> = {
  unpaid: { label: "Belum Dibayar", tone: "warning" },
  paid: { label: "Sudah Dibayar", tone: "success" },
  overdue: { label: "Terlambat", tone: "danger" },
};

export const PAYMENT_STATE: Record<string, StatusMeta> = {
  unpaid: { label: "Belum Dibayar", tone: "warning" },
  paid: { label: "Sudah Dibayar", tone: "success" },
};

export const TENANT_STATUS: Record<string, StatusMeta> = {
  active: { label: "Aktif", tone: "success" },
  inactive: { label: "Nonaktif", tone: "neutral" },
};

export const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  owner: "Owner",
  assistant: "Assistant",
  helper: "Helper",
  tenant: "Tenant",
};

export const PLATFORM_LABEL: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
};

export function metaFor(map: Record<string, StatusMeta>, key: string | null | undefined): StatusMeta {
  if (!key) return { label: "—", tone: "neutral" };
  return map[key] ?? { label: key, tone: "neutral" };
}

export function optionsOf(map: Record<string, StatusMeta>) {
  return Object.entries(map).map(([value, meta]) => ({ value, label: meta.label }));
}
