import { TopBar } from "@/components/top-bar";
import { DocCard } from "@/components/doc-card";
import { documentsApi } from "@/lib/documents";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Star } from "lucide-react";

export default function StarredPage() {
  const queryClient = useQueryClient();

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["documents", "starred"],
    queryFn: () => documentsApi.list("starred"),
  });

  const toggleStar = useMutation({
    mutationFn: (id) => {
      const doc = docs.find((d) => d._id === id);
      return documentsApi.update(id, { isStarred: !doc.isStarred });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });

  const trashDoc = useMutation({
    mutationFn: (id) => documentsApi.trash(id),
    onSuccess: () => {
      toast.success("Moved to trash");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  const starredDocs = docs.filter((d) => d.isStarred && !d.isTrashed);

  return (
    <>
      <TopBar title="Starred" />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-10">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Starred</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Documents you want to keep close.</p>

        {isLoading ? (
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-40 animate-pulse rounded-xl border border-border bg-card" />
            ))}
          </div>
        ) : starredDocs.length === 0 ? (
          <div className="mt-16 flex flex-col items-center rounded-2xl border border-dashed border-border py-20 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Star className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">No starred documents</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Star a document to pin it here for quick access.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {starredDocs.map((d) => (
              <DocCard
                key={d._id}
                doc={d}
                onToggleStar={(id) => toggleStar.mutate(id)}
                onTrash={(id) => trashDoc.mutate(id)}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
