import { Link } from "react-router-dom";
import { TopBar } from "@/components/top-bar";
import { useState } from "react";
import { UploadCloud, CheckCircle2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UploadPage() {
  const [state, setState] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("Q4 Financial Report 2025.pdf");

  const startUpload = (name) => {
    if (name) setFileName(name);
    setState("uploading");
    setProgress(0);
    let p = 0;
    const t = setInterval(() => {
      p += Math.random() * 18 + 6;
      if (p >= 100) {
        p = 100;
        clearInterval(t);
        setProgress(100);
        setTimeout(() => setState("done"), 250);
      } else {
        setProgress(p);
      }
    }, 220);
  };

  return (
    <>
      <TopBar title="Upload PDF" />
      <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-10 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Upload a PDF</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Drop a file to start a conversation. Files stay private to your workspace.
        </p>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            startUpload(f?.name);
          }}
          className={cn(
            "mt-8 rounded-2xl border-2 border-dashed bg-card/40 p-10 transition-colors sm:p-16",
            dragOver ? "border-primary bg-primary/5" : "border-border",
          )}
        >
          {state === "idle" && (
            <div className="flex flex-col items-center text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <UploadCloud className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                Drag & drop your PDF here
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                or{" "}
                <button
                  onClick={() => startUpload()}
                  className="font-medium text-primary hover:underline"
                >
                  click to browse
                </button>
              </p>
              <p className="mt-4 text-xs text-muted-foreground">PDF only · up to 50 MB</p>
            </div>
          )}

          {state === "uploading" && (
            <div className="mx-auto max-w-md">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">{fileName}</div>
                  <div className="text-xs text-muted-foreground">Uploading… {Math.round(progress)}%</div>
                </div>
              </div>
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full gradient-primary transition-[width] duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {state === "done" && (
            <div className="flex flex-col items-center text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">Upload complete</h3>
              <p className="mt-1 text-sm text-muted-foreground">{fileName}</p>
              <Link
                to="/documents/1"
                className="mt-5 inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow"
              >
                Open document
              </Link>
              <button
                onClick={() => setState("idle")}
                className="mt-3 text-xs text-muted-foreground hover:text-foreground"
              >
                Upload another
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
