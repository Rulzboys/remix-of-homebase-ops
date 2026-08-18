import type { ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export const NONE = "__none__";

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label {...(htmlFor ? { htmlFor } : {})}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <Field label={label} {...(hint ? { hint } : {})}>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...(placeholder ? { placeholder } : {})}
      />
    </Field>
  );
}

export type Option = { value: string; label: string };

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Pilih",
  includeNone,
  noneLabel = "Belum ditetapkan",
  className,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  includeNone?: boolean;
  noneLabel?: string;
  className?: string;
}) {
  const control = (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className ?? ""}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeNone ? <SelectItem value={NONE}>{noneLabel}</SelectItem> : null}
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
  if (!label) return control;
  return <Field label={label}>{control}</Field>;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  saving,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onSubmit: () => void;
  saving?: boolean;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="grid gap-4">{children}</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={onSubmit} disabled={saving}>
            {saving ? "Menyimpan…" : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ConfirmDelete({
  open,
  onOpenChange,
  onConfirm,
  pending,
  title = "Hapus data ini?",
  description = "Tindakan ini tidak dapat dibatalkan.",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pending?: boolean;
  title?: string;
  description?: string;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={pending}>
            {pending ? "Menghapus…" : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Generic insert/update/delete helpers for a Supabase table. */
export function useCrud(table: string, invalidateKeys: string[]) {
  const qc = useQueryClient();
  const invalidate = () => {
    for (const key of invalidateKeys) void qc.invalidateQueries({ queryKey: [key] });
  };

  const save = useMutation({
    mutationFn: async ({ id, values }: { id?: string | null; values: Record<string, unknown> }) => {
      const client = supabase.from(table as never);
      if (id) {
        const { error } = await client.update(values as never).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await client.insert(values as never);
        if (error) throw error;
      }
    },
    onSuccess: (_d, v) => {
      toast.success(v.id ? "Data diperbarui." : "Data ditambahkan.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menyimpan data."),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(table as never)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Data dihapus.");
      invalidate();
    },
    onError: (e: Error) =>
      toast.error(
        e.message.includes("foreign key")
          ? "Data masih dipakai oleh catatan lain sehingga tidak bisa dihapus."
          : e.message || "Gagal menghapus data.",
      ),
  });

  return { save, remove, invalidate };
}

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="panel flex flex-wrap items-center gap-2 px-3 py-3">{children}</div>
  );
}

export function RowActions({
  onEdit,
  onDelete,
  extra,
}: {
  onEdit?: () => void;
  onDelete?: () => void;
  extra?: ReactNode;
}) {
  return (
    <div className="flex justify-end gap-1">
      {extra}
      {onEdit ? (
        <Button size="sm" variant="ghost" onClick={onEdit}>
          Ubah
        </Button>
      ) : null}
      {onDelete ? (
        <Button size="sm" variant="ghost" className="text-danger" onClick={onDelete}>
          Hapus
        </Button>
      ) : null}
    </div>
  );
}
