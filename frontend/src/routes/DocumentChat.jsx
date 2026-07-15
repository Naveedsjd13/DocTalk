import { Link, useNavigate, useParams } from "react-router-dom";
import { docById, mockDocs } from "@/lib/mock-docs";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  MoreHorizontal,
  Send,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
  Plus,
  X,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const starters = [
  "Summarize this document in 5 bullets",
  "What are the key financial figures?",
  "List every action item mentioned",
];

export default function DocumentChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const doc = docById(id) ?? mockDocs[0];

  const [title, setTitle] = useState(doc.title);
  const [chatOpen, setChatOpen] = useState(true);
  const [chatWidth, setChatWidth] = useState(400);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [contextDocs, setContextDocs] = useState([
    { id: doc.id, title: doc.title },
  ]);
  const containerRef = useRef(null);
  const dragging = useRef(false);
  const chatEndRef = useRef(null);
  const highlightPageRef = useRef(null);
  const [flashPage, setFlashPage] = useState(null);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const w = rect.right - e.clientX;
      setChatWidth(Math.max(320, Math.min(720, w)));
    };
    const onUp = () => (dragging.current = false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, thinking]);

  const ask = (q) => {
    if (!q.trim()) return;
    const userMsg = { id: crypto.randomUUID(), role: "user", text: q };
    const asstId = crypto.randomUUID();
    setMsgs((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);

    const answer =
      "Based on the document, the key points are outlined across the executive summary and the financial breakdown. Revenue grew steadily quarter over quarter, driven by expansion in enterprise accounts, and operating margins improved by roughly 3 percentage points versus the prior period.";
    const pages = [3, 12, 27];

    setTimeout(() => {
      setThinking(false);
      setMsgs((m) => [...m, { id: asstId, role: "assistant", text: "", streaming: true, pages }]);
      let i = 0;
      const t = setInterval(() => {
        i += 3;
        setMsgs((m) =>
          m.map((msg) =>
            msg.id === asstId ? { ...msg, text: answer.slice(0, i) } : msg,
          ),
        );
        if (i >= answer.length) {
          clearInterval(t);
          setMsgs((m) =>
            m.map((msg) => (msg.id === asstId ? { ...msg, streaming: false } : msg)),
          );
        }
      }, 22);
    }, 700);
  };

  const jumpToPage = (p) => {
    setPage(p);
    setFlashPage(p);
    setTimeout(() => setFlashPage(null), 900);
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Doc top bar */}
      <div className="flex h-14 items-center gap-2 border-b border-border bg-background/80 pl-14 pr-3 backdrop-blur-md sm:pl-4">
        <button
          onClick={() => navigate("/recent")}
          className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="min-w-0 flex-1 truncate rounded-md bg-transparent px-2 py-1 text-sm font-medium text-foreground hover:bg-accent focus:bg-accent focus:outline-none"
        />
        <button
          onClick={() => setChatOpen((v) => !v)}
          aria-label={chatOpen ? "Hide chat" : "Show chat"}
          className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          {chatOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Star</DropdownMenuItem>
            <DropdownMenuItem>Download</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div ref={containerRef} className="flex min-h-0 flex-1">
        {/* PDF viewer */}
        <div className="flex min-w-0 flex-1 flex-col bg-background">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-xs text-muted-foreground">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="grid h-7 w-7 place-items-center rounded hover:bg-accent hover:text-foreground"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="tabular-nums">
              Page {page} / {doc.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(doc.pages, p + 1))}
              className="grid h-7 w-7 place-items-center rounded hover:bg-accent hover:text-foreground"
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <div className="mx-2 h-4 w-px bg-border" />
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="grid h-7 w-7 place-items-center rounded hover:bg-accent hover:text-foreground"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="tabular-nums">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              className="grid h-7 w-7 place-items-center rounded hover:bg-accent hover:text-foreground"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-auto bg-muted/30 p-6">
            <div
              ref={highlightPageRef}
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
              className={cn(
                "mx-auto max-w-2xl rounded-md border border-border bg-white p-10 shadow-soft transition-all",
                flashPage === page && "ring-4 ring-primary/60",
              )}
            >
              <div className="mb-6 text-xs uppercase tracking-widest text-neutral-400">
                {doc.title} — Page {page}
              </div>
              <h1 className="text-2xl font-bold text-neutral-900">Executive Summary</h1>
              <div className="mt-4 space-y-3 text-[13px] leading-relaxed text-neutral-700">
                <p>
                  This document presents a comprehensive overview of performance across the reporting period.
                  Revenue, operating margin, and headcount trends are broken down by segment on the following pages.
                </p>
                <p>
                  Key highlights include steady quarter-over-quarter growth in enterprise accounts, improved gross
                  margins driven by pricing power, and continued investment in R&D at approximately 18% of revenue.
                </p>
                <p>
                  The remainder of this report is organized into three sections: financial performance, product and
                  market updates, and forward-looking initiatives for the next four quarters.
                </p>
                <p className="pt-4 text-neutral-500">
                  Turn the page to continue reading, or ask a question in the chat to get instant answers with
                  citations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        {chatOpen && (
          <div
            onMouseDown={() => (dragging.current = true)}
            className="hidden w-1 shrink-0 cursor-col-resize bg-border transition-colors hover:bg-primary/60 md:block"
            aria-label="Resize chat panel"
            role="separator"
          />
        )}

        {/* Chat panel */}
        {chatOpen && (
          <aside
            style={{ width: chatWidth }}
            className="hidden shrink-0 flex-col border-l border-border bg-surface md:flex"
          >
            <ChatPanel
              msgs={msgs}
              thinking={thinking}
              contextDocs={contextDocs}
              onRemoveDoc={(id) => setContextDocs((c) => (c.length > 1 ? c.filter((d) => d.id !== id) : c))}
              input={input}
              setInput={setInput}
              ask={ask}
              jumpToPage={jumpToPage}
              chatEndRef={chatEndRef}
            />
          </aside>
        )}
      </div>

      {/* Mobile chat overlay */}
      {chatOpen && (
        <div className="fixed inset-x-0 bottom-0 top-14 z-20 flex flex-col border-t border-border bg-surface md:hidden">
          <ChatPanel
            msgs={msgs}
            thinking={thinking}
            contextDocs={contextDocs}
            onRemoveDoc={(id) => setContextDocs((c) => (c.length > 1 ? c.filter((d) => d.id !== id) : c))}
            input={input}
            setInput={setInput}
            ask={ask}
            jumpToPage={jumpToPage}
            chatEndRef={chatEndRef}
          />
        </div>
      )}
    </div>
  );
}

function ChatPanel({
  msgs,
  thinking,
  contextDocs,
  onRemoveDoc,
  input,
  setInput,
  ask,
  jumpToPage,
  chatEndRef,
}) {
  return (
    <>
      {/* Context strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border px-3 py-2">
        {contextDocs.map((d) => (
          <span
            key={d.id}
            className="inline-flex max-w-[180px] shrink-0 items-center gap-1.5 rounded-full border border-border bg-accent/50 py-1 pl-2 pr-1 text-xs text-foreground"
          >
            <FileText className="h-3 w-3 text-primary" />
            <span className="truncate">{d.title}</span>
            {contextDocs.length > 1 && (
              <button
                onClick={() => onRemoveDoc(d.id)}
                className="grid h-4 w-4 place-items-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
                aria-label="Remove from context"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
        <button className="inline-flex shrink-0 items-center gap-1 rounded-full border border-dashed border-border px-2 py-1 text-xs text-muted-foreground hover:border-primary/60 hover:text-primary">
          <Plus className="h-3 w-3" /> Add document
        </button>
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
        {msgs.length === 0 && !thinking ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">Ask anything about this document</h3>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Answers come back with cited pages you can click.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              {starters.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs text-foreground transition-colors hover:border-primary/50 hover:text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {msgs.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex gap-2.5">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {m.text}
                      {m.streaming && (
                        <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-primary" />
                      )}
                    </div>
                    {!m.streaming && m.pages && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {m.pages.map((p) => (
                          <button
                            key={p}
                            onClick={() => jumpToPage(p)}
                            className="rounded-md border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                          >
                            p. {p}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ),
            )}
            {thinking && (
              <div className="flex gap-2.5">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-1 pt-2">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="border-t border-border p-3"
      >
        <div className="flex items-end gap-2 rounded-xl border border-border bg-card p-2 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                ask(input);
              }
            }}
            placeholder="Ask a question about this document…"
            rows={1}
            className="max-h-40 min-h-[24px] flex-1 resize-none bg-transparent px-1.5 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label="Send"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg gradient-primary text-primary-foreground shadow-glow transition-opacity disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </>
  );
}
