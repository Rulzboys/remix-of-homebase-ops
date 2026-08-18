const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function monthName(i: number): string {
  return MONTHS_ID[i] ?? "";
}

export function formatRupiah(value: number | string | null | undefined): string {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return "Rp0";
  return "Rp" + Math.round(num).toLocaleString("id-ID");
}

/** "2026-08-18" -> "18 Agustus 2026" */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getDate()} ${monthName(d.getMonth())} ${d.getFullYear()}`;
}

/** "2026-08-18" -> "18 Ags 2026" */
export function formatDateShort(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getDate()} ${monthName(d.getMonth()).slice(0, 3)} ${d.getFullYear()}`;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return `${formatDateShort(value)} · ${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

/** "10:00:00" -> "10:00 WIB" */
export function formatTime(value: string | null | undefined): string {
  if (!value) return "—";
  return `${value.slice(0, 5)} WIB`;
}

export function formatMonthYear(month: number, year: number): string {
  return `${monthName(Math.max(0, Math.min(11, month - 1)))} ${year}`;
}

/** "2026-09-01" -> "September 2026" */
export function formatBillingMonth(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  return `${monthName(d.getMonth())} ${d.getFullYear()}`;
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function relativeTime(value: string): string {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return formatDateShort(value);
}

export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** Builds a wa.me deep link with a prefilled message. */
export function whatsappLink(phone: string | null | undefined, message: string): string {
  const digits = (phone ?? "").replace(/[^0-9]/g, "");
  const normalized = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export { MONTHS_ID };
