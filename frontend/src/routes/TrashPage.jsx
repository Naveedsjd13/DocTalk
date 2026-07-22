import { TopBar } from "@/components/top-bar";
import { DocCard } from "@/components/doc-card";
import { documentsApi } from "@/lib/documents";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, AlertCircle } from "lucide-react";
import { useState } from "react";
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

export default function TrashPage() {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["documents", "trash"],
    queryFn: () => documentsApi.list("trash"),
  });

  const restoreMutation = useMutation({
    mutationFn: (id) => documentsApi.restore(id),
    onSuccess: () => {
      toast.success("Restored");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error("Document limit reached — upgrade to restore this file.");
      } else {
        toast.error("Failed to restore document.");
      }
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (ids) => Promise.all(ids.map((id) => documentsApi.permanentDelete(id))),
    onSuccess: () => {
      toast.success("Documents permanently deleted");
      setSelectedIds(new Set());
      setShowDeleteDialog(false);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: () => {
      toast.error("Failed to delete some documents.");
    },
  });

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const trashDocs = docs.filter((d) => d.isTrashed);

  return (
    <>
      <TopBar title="Trash" />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-10">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Trash</h1>

        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-border bg-card/60 px-4 py-3 text-xs text-muted-foreground">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          Items in trash are automatically deleted after 30 days.
        </div>

        {selectedIds.size > 0 && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
            <span className="text-sm font-medium text-foreground">{selectedIds.size} selected</span>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
            >
              Delete permanently
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-40 animate-pulse rounded-xl border border-border bg-card" />
            ))}
          </div>
        ) : trashDocs.length === 0 ? (
          <div className="mt-12 flex flex-col items-center rounded-2xl border border-dashed border-border py-20 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">Trash is empty</h3>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {trashDocs.map((d) => (
              <DocCard
                key={d._id}
                doc={d}
                variant="trashed"
                selected={selectedIds.has(d._id)}
                onToggleSelect={toggleSelect}
                onRestore={(id) => restoreMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete?</AlertDialogTitle>
            <AlertDialogDescription>
              This can't be undone. Permanently delete {selectedIds.size} document(s)?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => permanentDeleteMutation.mutate(Array.from(selectedIds))}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
