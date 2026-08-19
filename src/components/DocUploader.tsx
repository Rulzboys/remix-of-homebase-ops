import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

const BUCKET = "documentation";

type DocTable = "visit_documentations" | "cleaning_documentations";

/** Upload a photo to the private documentation bucket and record it. */
export function DocUploadButton({
  table,
  refField,
  refId,
  disabled,
  label = "Upload foto",
}: {
  table: DocTable;
  refField: "visit_id" | "cleaning_id";
  refId: string;
  disabled?: boolean;
  label?: string;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState("");

  async function handleFile(file: File) {
    if (!user) return;
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${refField}/${refId}/${Date.now()}.${ext}`;
      const up = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
      if (up.error) throw up.error;
      const { error } = await supabase.from(table).insert({
        [refField]: refId,
        uploaded_by: user.id,
        image_url: path,
        notes: notes.trim() || null,
      } as never);
      if (error) throw error;
      toast.success("Dokumentasi diunggah.");
      setNotes("");
      void qc.invalidateQueries({ queryKey: [table] });
    } catch (e) {
      toast.error((e as Error).message || "Gagal mengunggah dokumentasi.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        className="h-9 w-48"
        placeholder="Catatan (opsional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />
      <Button
        size="sm"
        variant="outline"
        disabled={busy || disabled}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="mr-1.5 size-4" />
        {busy ? "Mengunggah…" : label}
      </Button>
    </div>
  );
}

/** Renders a stored documentation image (private bucket -> signed URL). */
export function DocImage({ path, alt }: { path: string; alt: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (/^https?:\/\//.test(path)) {
      setUrl(path);
      return;
    }
    void supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 3600)
      .then(({ data }) => {
        if (active) setUrl(data?.signedUrl ?? null);
      });
    return () => {
      active = false;
    };
  }, [path]);

  if (!url) return <div className="h-40 w-full animate-pulse rounded-md bg-muted" />;
  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      className="h-40 w-full rounded-md object-cover"
    />
  );
}
