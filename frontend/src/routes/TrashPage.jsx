import { TopBar } from "@/components/top-bar";
import { DocCard } from "@/components/doc-card";
import { mockDocs } from "@/lib/mock-docs";
import { Trash2, AlertCircle } from "lucide-react";

export default function TrashPage() {
  const docs = mockDocs.filter((d) => d.trashed);
  return (
    <>
      <TopBar title="Trash" />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-10">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Trash</h1>

        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-border bg-card/60 px-4 py-3 text-xs text-muted-foreground">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          Items in trash are automatically deleted after 30 days.
        </div>

        {docs.length === 0 ? (
          <div className="mt-12 flex flex-col items-center rounded-2xl border border-dashed border-border py-20 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">Trash is empty</h3>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {docs.map((d) => (
              <DocCard key={d.id} doc={d} variant="trashed" />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
