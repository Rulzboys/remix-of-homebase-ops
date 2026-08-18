import { supabase } from "@/integrations/supabase/client";

export type PublicRoom = {
  id: string;
  room_number: string;
  price: number;
  description: string | null;
  facilities: string[];
  status: string;
};

export type PublicProperty = {
  id: string;
  name: string;
  address: string;
  city: string | null;
  description: string | null;
  image_url: string | null;
  facilities: string[];
  whatsapp_number: string | null;
  rooms: PublicRoom[];
};

const SELECT =
  "id, name, address, city, description, image_url, facilities, whatsapp_number, rooms(id, room_number, price, description, facilities, status)";

export async function fetchPublicProperties(): Promise<PublicProperty[]> {
  const { data, error } = await supabase
    .from("properties")
    .select(SELECT)
    .eq("status", "active")
    .order("name");
  if (error) throw error;
  return (data ?? []) as unknown as PublicProperty[];
}

export async function fetchPublicProperty(id: string): Promise<PublicProperty | null> {
  const { data, error } = await supabase
    .from("properties")
    .select(SELECT)
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as PublicProperty | null) ?? null;
}

export function minPrice(rooms: PublicRoom[]): number {
  const prices = rooms.map((r) => Number(r.price)).filter((n) => n > 0);
  return prices.length ? Math.min(...prices) : 0;
}

export function availableCount(rooms: PublicRoom[]): number {
  return rooms.filter((r) => r.status === "available").length;
}
