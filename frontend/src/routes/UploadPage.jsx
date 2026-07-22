import { Link } from "react-router-dom";
import { TopBar } from "@/components/top-bar";
import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UploadCloud, CheckCircle2, FileText, Loader2 } from "lucide-react";
import { documentsApi } from "@/lib/documents";
import { cn } from "@/lib/utils";

export default function UploadPage() {
  const queryClient = useQueryClient();
  const [state, setState] = useState("idle");
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [docId, setDocId] = useState(null);
  const [docStatus, setDocStatus] = useState(null);
  const pollRef = useRef(null);
  const pollStartRef = useRef(null);

  const uploadMutation = useMutation({
    mutationFn: (formData) => documentsApi.upload(formData),
    onSuccess: (doc) => {
      setState("processing");
      setDocId(doc.documentId);
      setDocStatus(doc.status);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (err) => {
      setState("idle");
      if (err.status === 403) {
        toast.error("Document limit reached for your plan.");
      } else {
        toast.error("Upload failed. Try again.");
      }
    },
  });

  const pollDocument = useCallback(async (id) => {
    try {
      const doc = await documentsApi.get(id);
      setDocStatus(doc.status);
      if (doc.status === "ready" || doc.status === "failed") {
        clearInterval(pollRef.current);
        pollRef.current = null;
        if (doc.status === "failed") {
          setState("idle");
          toast.error("Document processing failed.");
        } else {
          setState("done");
        }
      } else if (Date.now() - pollStartRef.current > 60000) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    } catch {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (state === "processing" && docId) {
      pollStartRef.current = Date.now();
      pollRef.current = setInterval(() => pollDocument(docId), 2000);
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [state, docId, pollDocument]);

  const startUpload = (file) => {
    if (!file) return;
    setFileName(file.name);
    setState("uploading");
    const formData = new FormData();
    formData.append("file", file);
    uploadMutation.mutate(formData);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    startUpload(f);
  };

  const reset = () => {
    setState("idle");
    setDocId(null);
    setDocStatus(null);
    setFileName("");
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
          onDrop={handleDrop}
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
                <label className="cursor-pointer font-medium text-primary hover:underline">
                  click to browse
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => startUpload(e.target.files?.[0])}
                  />
                </label>
              </p>
              <p className="mt-4 text-xs text-muted-foreground">PDF only · up to 20 MB</p>
            </div>
          )}

          {(state === "uploading" || state === "processing") && (
            <div className="mx-auto max-w-md">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  {state === "uploading" ? (
                    <FileText className="h-5 w-5" />
                  ) : (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">{fileName}</div>
                  <div className="text-xs text-muted-foreground">
                    {state === "uploading" ? "Uploading…" : "Processing document…"}
                  </div>
                </div>
              </div>
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    "h-full rounded-full gradient-primary transition-[width] duration-500",
                    state === "processing" ? "animate-pulse" : "",
                  )}
                  style={{ width: state === "processing" ? "100%" : "80%" }}
                />
              </div>
              {state === "processing" && Date.now() - (pollStartRef.current || 0) > 60000 && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Still processing — this may take a few more minutes.
                </p>
              )}
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
                to={`/documents/${docId}`}
                className="mt-5 inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow"
              >
                Open document
              </Link>
              <button
                onClick={reset}
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
