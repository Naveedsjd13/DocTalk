import { Link } from "react-router-dom";
import { TopBar } from "@/components/top-bar";
import { DocCard } from "@/components/doc-card";
import { mockDocs } from "@/lib/mock-docs";
import { Upload, FileText, HardDrive, MessageSquare, Plus } from "lucide-react";

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-primary">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-lg font-semibold tracking-tight text-foreground">{value}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const docs = mockDocs.filter((d) => !d.trashed).slice(0, 6);

  return (
    <>
      <TopBar title="Dashboard" />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Welcome back, Naveed
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Pick up where you left off or start a new conversation.
            </p>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
          >
            <Upload className="h-4 w-4" />
            Upload a PDF
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard icon={FileText} label="Documents" value="24" />
          <StatCard icon={HardDrive} label="Storage used" value="128 MB" />
          <StatCard icon={MessageSquare} label="Questions this month" value="312" />
        </div>

        {docs.length > 0 ? (
          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">Recent documents</h2>
              <Link to="/recent" className="text-xs font-medium text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {docs.map((d) => (
                <DocCard key={d.id} doc={d} />
              ))}
            </div>
          </section>
        ) : (
          <EmptyDashboard />
        )}
      </main>
    </>
  );
}

function EmptyDashboard() {
  return (
    <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-20 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <FileText className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">No documents yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Upload your first PDF and start asking questions — DocTalk will answer with cited pages.
      </p>
      <Link
        to="/upload"
        className="mt-5 inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow"
      >
        <Plus className="h-4 w-4" /> Upload your first PDF
      </Link>
    </div>
  );
}
