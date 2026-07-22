import { Link } from "react-router-dom";
import { FileText, Star, Trash2, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

function timeAgo(dateStr) {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function DocCard({ doc, variant = "default", selected, onToggleSelect, onToggleStar, onTrash, onRestore }) {
  const trashed = variant === "trashed";

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft",
        trashed && "opacity-60 grayscale",
      )}
    >
      {trashed && onToggleSelect && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(doc._id);
          }}
          className={cn(
            "absolute left-2 top-2 z-10 grid h-5 w-5 place-items-center rounded border transition-colors",
            selected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background/80 text-muted-foreground hover:border-primary/60 hover:text-foreground",
          )}
          aria-label={selected ? "Deselect" : "Select"}
        >
          {selected && <Check className="h-3 w-3" strokeWidth={3} />}
        </button>
      )}

      <Link
        to={`/documents/${doc._id}`}
        className="flex flex-1 flex-col gap-3"
      >
        <div className="flex items-start justify-between">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div className="flex items-center gap-1">
            {doc.isStarred && !trashed && (
              <Star className="h-4 w-4 fill-primary text-primary" />
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-medium leading-tight text-foreground">
            {doc.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {timeAgo(doc.lastOpenedAt)} · {doc.pageCount ?? "?"} pages
          </p>
        </div>
      </Link>

      {!trashed && (
        <div className="absolute right-2 top-2 z-10 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 max-sm:opacity-100">
          {onToggleStar && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(doc._id);
              }}
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full bg-background/80 p-1.5 transition-colors hover:bg-muted",
                doc.isStarred ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
              aria-label={doc.isStarred ? "Unstar" : "Star"}
            >
              <Star className={cn("h-4 w-4", doc.isStarred && "fill-current")} />
            </button>
          )}
          {onTrash && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTrash(doc._id);
              }}
              className="grid h-7 w-7 place-items-center rounded-full bg-background/80 p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Trash"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {trashed && (
        <div className="absolute right-2 top-2 z-10">
          {onRestore && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRestore(doc._id);
              }}
              className="grid h-7 w-7 place-items-center rounded-full bg-background/80 p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground max-sm:opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100"
              aria-label="Restore"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
