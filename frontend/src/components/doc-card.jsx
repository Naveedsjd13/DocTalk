import { Link } from "react-router-dom";
import { FileText, MoreHorizontal, Star, RotateCcw, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function DocCard({ doc, variant = "default" }) {
  const trashed = variant === "trashed";
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft",
        trashed && "opacity-60 grayscale",
      )}
    >
      <Link
        to={`/documents/${doc.id}`}
        className="flex flex-1 flex-col gap-3"
      >
        <div className="flex items-start justify-between">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-5 w-5" strokeWidth={1.8} />
          </div>
          {doc.starred && !trashed && (
            <Star className="h-4 w-4 fill-primary text-primary" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-medium leading-tight text-foreground">
            {doc.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {doc.lastOpened} · {doc.pages} pages · {doc.size}
          </p>
        </div>
      </Link>
      <div className="absolute right-3 top-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="More"
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover:opacity-100"
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {trashed ? (
              <>
                <DropdownMenuItem>
                  <RotateCcw className="mr-2 h-3.5 w-3.5" /> Restore
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete permanently
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem>Open</DropdownMenuItem>
                <DropdownMenuItem>Rename</DropdownMenuItem>
                <DropdownMenuItem>{doc.starred ? "Unstar" : "Star"}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
