import { TopBar } from "@/components/top-bar";
import { DocCard } from "@/components/doc-card";
import { mockDocs } from "@/lib/mock-docs";
import { Star } from "lucide-react";

export default function StarredPage() {
  const docs = mockDocs.filter((d) => d.starred && !d.trashed);
  return (
    <>
      <TopBar title="Starred" />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-10">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Starred</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Documents you want to keep close.</p>

        {docs.length === 0 ? (
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
            {docs.map((d) => (
              <DocCard key={d.id} doc={d} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
