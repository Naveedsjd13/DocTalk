import { Link } from "react-router-dom";
import { Zap, Quote, Sun, Moon, GraduationCap, Search, Briefcase } from "lucide-react";
import { useTheme } from "@/lib/theme";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <PullQuote />
        <Walkthrough />
        <CitationsFeature />
        <FeatureGrid />
        <UseCases />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

/* ---------- Nav ---------- */

function Nav() {
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="font-serif text-[16px] font-medium tracking-tight">DocTalk</span>
        </Link>
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 text-[13px] text-muted-foreground md:flex">
          <a href="#how" className="transition-colors hover:text-foreground">
            Walkthrough
          </a>
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#use-cases" className="transition-colors hover:text-foreground">
            Use cases
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/70 text-muted-foreground transition-colors hover:text-foreground hover:bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link
            to="/login"
            className="text-[13px] text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="inline-flex h-9 items-center rounded-md bg-primary px-3.5 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
/* ---------- Hero ---------- */

function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center md:pt-28">
      <div className="mx-auto inline-block rounded-md border border-primary/25 bg-primary/10 px-3 py-1.5 font-mono text-[10.5px] tracking-[0.14em] text-primary uppercase">
        For readers who check the footnote
      </div>
      <h1 className="mx-auto mt-6 max-w-[640px] font-serif text-[40px] font-medium leading-[1.1] tracking-tight text-foreground md:text-[54px]">
        Every answer, <span className="italic text-primary">traceable</span> to its source.
      </h1>
      <p className="mx-auto mt-5 max-w-[460px] text-[15px] leading-relaxed text-muted-foreground md:text-base">
        Upload a PDF, ask questions, and get answers with the exact page they came from — no more
        hunting for the receipt.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/signup"
          className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-[14px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Get started
        </Link>
        <a
          href="#how"
          className="inline-flex h-10 items-center rounded-md border border-border px-5 text-[14px] text-foreground transition-colors hover:border-foreground/30 hover:bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          See how it works
        </a>
      </div>

      <CitationDemo />
    </section>
  );
}

function CitationDemo() {
  return (
    <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 overflow-hidden rounded-xl border border-border text-left md:grid-cols-2">
      <div className="border-b border-border p-6 md:border-b-0 md:border-r">
        <div className="mb-4 flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground/80">
          <span>climate-report.pdf</span>
          <span>Pg. 4</span>
        </div>
        <p className="mb-2.5 text-[13.5px] leading-[1.65] text-muted-foreground">
          The transition to renewable energy has accelerated over the past decade, driven by falling
          costs and policy support.
        </p>
        <p className="mb-2.5 rounded-sm border-l-2 border-primary bg-primary/10 px-2 py-1.5 text-[13.5px] leading-[1.65] text-foreground">
          Global solar capacity grew by 24% in 2023, reaching a record 1.4 terawatts installed
          worldwide.
        </p>
        <p className="text-[13.5px] leading-[1.65] text-muted-foreground/60">
          Wind power additions followed closely, though offshore deployment remained concentrated in
          Europe and East Asia.
        </p>
      </div>
      <div className="p-6">
        <div className="mb-4 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Answer
        </div>
        <p className="mb-4 text-[14px] leading-[1.7] text-foreground">
          In 2023,{" "}
          <span className="rounded-sm bg-primary/15 px-1 py-0.5 ring-1 ring-primary/30">
            global solar capacity grew 24% to reach 1.4 TW
          </span>{" "}
          installed worldwide — the largest annual jump on record.
        </p>
        <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground/80">
          Source
          <span className="rounded border border-border bg-card px-2 py-1 text-muted-foreground normal-case tracking-normal">
            climate-report.pdf · p.4
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Pull quote ---------- */

function PullQuote() {
  return (
    <section className="border-y border-border">
      <div className="mx-auto max-w-3xl px-6 py-7 text-center">
        <p className="font-serif text-[15px] italic leading-relaxed text-muted-foreground md:text-base">
          "I stopped re-reading 40-page filings twice. DocTalk shows me the line before I even ask
          for it."
        </p>
      </div>
    </section>
  );
}

/* ----------  Walkthrough ---------- */

function Walkthrough() {
  const steps = [
    {
      n: "01",
      title: "Upload your PDF",
      body: "Drop in a report, paper, or contract. Text is chunked page by page.",
    },
    {
      n: "02",
      title: "Ask a real question",
      body: "Ask it the way you'd ask a colleague — no digging through pages yourself.",
    },
    {
      n: "03",
      title: "Verify in one click",
      body: "Every claim links back to its page. No answer without a receipt.",
    },
  ];

  return (
    <section id="how" className="mx-auto max-w-6xl px-6 py-24 scroll-mt-14">
      <p className="text-center font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        How it works
      </p>
      <h2 className="mt-2 text-center font-serif text-[28px] font-medium tracking-tight text-foreground md:text-[32px]">
        From PDF to pinpoint, in <span className="italic text-primary">three steps</span>.
      </h2>
      <div className="relative mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-10 md:grid-cols-3 md:gap-0">
        <div
          aria-hidden
          className="pointer-events-none absolute top-[19px] left-[16%] right-[16%] hidden border-t border-dashed border-border md:block"
        />
        {steps.map((s) => (
          <div key={s.n} className="relative px-4 text-center">
            <div className="relative z-10 mx-auto mb-5 grid h-10 w-10 place-items-center rounded-full border border-border bg-card font-mono text-[12px] text-primary">
              {s.n}
            </div>
            <h3 className="mb-1.5 text-[15px] font-medium text-foreground">{s.title}</h3>
            <p className="text-[13px] leading-[1.65] text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Citations feature ---------- */

function CitationsFeature() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="mx-auto grid max-w-4xl grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
            Exact citations
          </p>
          <h2 className="mb-4 font-serif text-[26px] font-medium leading-[1.3] tracking-tight text-foreground md:text-[30px]">
            Read the answer. <span className="italic text-primary">Trust the footnote.</span>
          </h2>
          <p className="text-[14px] leading-[1.75] text-muted-foreground">
            Most chat tools paraphrase and hope. DocTalk pins each claim to the page it came from,
            so a reviewer can check your work in seconds, not minutes.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground/80">
            master-agreement.pdf · Pg. 12
          </div>
          <p className="text-[12.5px] leading-[1.85] text-muted-foreground">
            Termination requires 90 days written notice.{" "}
            <span className="rounded-sm bg-primary/15 px-1 py-0.5 text-foreground ring-1 ring-primary/25">
              Either party may terminate for cause with immediate effect
              <sup className="ml-0.5 text-primary">1</sup>
            </span>{" "}
            if the other materially breaches this agreement. All notices must be delivered in
            writing to the addresses listed in Schedule A.{" "}
            <span className="rounded-sm bg-primary/10 px-1 py-0.5 text-foreground ring-1 ring-primary/20">
              Liability under this section is capped at fees paid in the prior twelve months
              <sup className="ml-0.5 text-primary/80">2</sup>
            </span>
            .
          </p>
          <div className="mt-4 border-t border-border pt-3 font-mono text-[10.5px] leading-[1.9] text-muted-foreground">
            <div>
              <span className="text-primary">1</span> — master-agreement.pdf, p.12
            </div>
            <div>
              <span className="text-primary/80">2</span> — master-agreement.pdf, p.12
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Feature grid ---------- */

function FeatureGrid() {
  const items = [
    {
      icon: Zap,
      title: "Streaming answers",
      body: "Tokens arrive as they're generated. No spinner.",
      example: "In 2023, global solar\ncapacity grew 24%...",
    },
    {
      icon: Quote,
      title: "Exact citations",
      body: "Every claim links to a page and passage you can verify.",
      example: "climate.pdf · p.4\nclimate.pdf · p.12",
    },
  ];
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 pb-24 scroll-mt-36">
      <p className="text-center font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        What it does
      </p>
      <h2 className="mt-2 text-center font-serif text-[26px] font-medium tracking-tight text-foreground md:text-[30px]">
        Answers you can <span className="italic text-primary">actually check</span>.
      </h2>
      <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2">
        {items.map(({ icon: Icon, title, body, example }) => (
          <div key={title} className="bg-background p-6">
            <Icon className="h-[18px] w-[18px] text-primary" strokeWidth={1.5} />
            <h3 className="mt-3.5 text-[14.5px] font-medium text-foreground">{title}</h3>
            <p className="mb-3.5 mt-1.5 text-[12.5px] leading-[1.6] text-muted-foreground">
              {body}
            </p>
            <pre className="whitespace-pre-wrap rounded-md bg-card px-2.5 py-2 font-mono text-[10.5px] leading-[1.55] text-muted-foreground">
              {example}
            </pre>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Use cases ---------- */

function UseCases() {
  const items = [
    {
      icon: GraduationCap,
      title: "Students",
      body: "Ask your textbook a question instead of skimming for the answer.",
    },
    {
      icon: Search,
      title: "Researchers",
      body: "Pull findings from long papers without losing the source.",
    },
    {
      icon: Briefcase,
      title: "Professionals",
      body: "Check contracts, reports, and filings against the page they came from.",
    },
  ];
  return (
    <section id="use-cases" className="mx-auto max-w-6xl px-6 pb-24 scroll-mt-36">
      <p className="text-center font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        Who it's for
      </p>
      <h2 className="mt-2 text-center font-serif text-[26px] font-medium tracking-tight text-foreground md:text-[30px]">
        Built for the reading that has to <span className="italic text-primary">hold up</span>.
      </h2>
      <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3 md:gap-7">
        {items.map(({ icon: Icon, title, body }) => (
          <div key={title}>
            <Icon className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.5} />
            <h3 className="mt-3 text-[14px] font-medium text-foreground">{title}</h3>
            <p className="mt-1.5 text-[12.5px] leading-[1.7] text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */

function FinalCta() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="font-serif text-[28px] font-medium tracking-tight text-foreground md:text-[32px]">
          Stop taking the answer's <span className="mr-1 italic text-primary">word</span> for it.
        </h2>
        <p className="mt-3 text-[14px] text-muted-foreground">Free to start. No card required.</p>
        <div className="mt-7">
          <Link
            to="/signup"
            className="inline-flex h-10 items-center rounded-md bg-primary px-6 text-[14px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Get started
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="font-serif text-[13px] text-muted-foreground">DocTalk</span>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="text-[12px] text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
