import { TopBar } from "@/components/top-bar";
import { DocCard } from "@/components/doc-card";
import { documentsApi } from "@/lib/documents";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, LayoutGrid, List } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function RecentPage() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("recent");
  const [view, setView] = useState("grid");
  const queryClient = useQueryClient();

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["documents", "recent"],
    queryFn: () => documentsApi.list("recent"),
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

  const filteredDocs = useMemo(() => {
    let list = docs.filter((d) => !d.isTrashed);
    if (q) list = list.filter((d) => d.title.toLowerCase().includes(q.toLowerCase()));
    if (sort === "name") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [docs, q, sort]);

  return (
    <>
      <TopBar title="Recent" />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="mr-auto text-2xl font-semibold tracking-tight text-foreground">Recent</h1>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search documents…"
              className="h-9 w-56 rounded-md border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-9 w-40 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Last opened</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex overflow-hidden rounded-md border border-border">
            <button
              onClick={() => setView("grid")}
              className={cn("grid h-9 w-9 place-items-center", view === "grid" ? "bg-accent text-primary" : "text-muted-foreground hover:text-foreground")}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn("grid h-9 w-9 place-items-center", view === "list" ? "bg-accent text-primary" : "text-muted-foreground hover:text-foreground")}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-40 animate-pulse rounded-xl border border-border bg-card" />
            ))}
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-dashed border-border p-16 text-center text-sm text-muted-foreground">
            No documents match your search.
          </div>
        ) : view === "grid" ? (
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDocs.map((d) => (
              <DocCard
                key={d._id}
                doc={d}
                onToggleStar={(id) => toggleStar.mutate(id)}
                onTrash={(id) => trashDoc.mutate(id)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
            <div className="grid grid-cols-[1fr_120px_100px_60px] gap-4 border-b border-border px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <div>Name</div>
              <div className="hidden sm:block">Last opened</div>
              <div className="hidden sm:block">Pages</div>
              <div />
            </div>
            {filteredDocs.map((d) => (
              <div
                key={d._id}
                className="grid grid-cols-[1fr_120px_100px_60px] items-center gap-4 border-b border-border px-4 py-3 last:border-b-0 hover:bg-accent/40"
              >
                <div className="min-w-0 truncate text-sm font-medium text-foreground">{d.title}</div>
                <div className="hidden text-xs text-muted-foreground sm:block">
                  {d.lastOpenedAt ? new Date(d.lastOpenedAt).toLocaleDateString() : "—"}
                </div>
                <div className="hidden text-xs text-muted-foreground sm:block">{d.pageCount ?? "—"} pages</div>
                <div />
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
