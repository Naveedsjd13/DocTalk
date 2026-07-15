import { TopBar } from "@/components/top-bar";
import { useState } from "react";
import { User, Palette, CreditCard, Shield, Check, Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "billing", label: "Pricing & Billing", icon: CreditCard },
  { id: "account", label: "Account", icon: Shield },
];

export default function SettingsPage() {
  const [tab, setTab] = useState("profile");

  return (
    <>
      <TopBar title="Settings" />
      <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
          <aside className="flex flex-row gap-1 overflow-x-auto md:flex-col">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-accent text-primary" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" /> {t.label}
                </button>
              );
            })}
          </aside>
          <div className="min-w-0">
            {tab === "profile" && <ProfileTab />}
            {tab === "appearance" && <AppearanceTab />}
            {tab === "billing" && <BillingTab />}
            {tab === "account" && <AccountTab />}
          </div>
        </div>
      </main>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        defaultValue={value}
        className="mt-1.5 h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}

function ProfileTab() {
  return (
    <Section title="Profile">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full name" value="Naveed Ahmed" />
        <Field label="Email" value="naveed@example.com" />
      </div>
      <button className="mt-6 rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground">
        Save changes
      </button>
    </Section>
  );
}

function AppearanceTab() {
  const { theme, toggle } = useTheme();
  return (
    <Section title="Appearance">
      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-primary">
            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">
              {theme === "dark" ? "Dark" : "Light"} mode
            </div>
            <div className="text-xs text-muted-foreground">
              {theme === "dark" ? "Easier on the eyes for long reading sessions." : "Bright and crisp for daytime use."}
            </div>
          </div>
        </div>
        <button
          onClick={toggle}
          role="switch"
          aria-checked={theme === "dark"}
          className={cn(
            "relative h-6 w-11 cursor-pointer rounded-full transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            theme === "dark" ? "bg-primary" : "bg-secondary",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
              theme === "dark" ? "translate-x-5" : "translate-x-0",
            )}
          />
        </button>
      </div>
    </Section>
  );
}

function BillingTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-foreground">Choose your plan</h2>
        <p className="mt-1 text-sm text-muted-foreground">Upgrade anytime. Cancel anytime.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <PlanCard
          name="Free"
          price="$0"
          features={["3 documents", "50 questions / month", "Standard model", "Email support"]}
          current
        />
        <PlanCard
          name="Pro"
          price="$5"
          highlight
          features={[
            "Unlimited documents",
            "Unlimited questions",
            "Priority model & speed",
            "Multi-document chat",
            "Priority support",
          ]}
        />
      </div>
    </div>
  );
}

function PlanCard({
  name,
  price,
  features,
  highlight,
  current,
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-card p-6",
        highlight ? "border-primary/60 shadow-glow" : "border-border",
      )}
    >
      {highlight && (
        <span className="absolute -top-3 right-6 rounded-full gradient-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
          Most popular
        </span>
      )}
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-semibold text-foreground">{name}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold tracking-tight text-foreground">{price}</span>
        <span className="text-sm text-muted-foreground">/month</span>
      </div>
      <ul className="mt-5 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-foreground">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {f}
          </li>
        ))}
      </ul>
      <button
        disabled={current}
        className={cn(
          "mt-6 h-10 rounded-lg text-sm font-medium transition-colors",
          current
            ? "cursor-not-allowed border border-border text-muted-foreground"
            : highlight
              ? "gradient-primary text-primary-foreground shadow-glow hover:brightness-110"
              : "border border-border text-foreground hover:bg-accent",
        )}
      >
        {current ? "Current plan" : `Upgrade to ${name}`}
      </button>
    </div>
  );
}

function AccountTab() {
  return (
    <Section title="Account">
      <p className="text-sm text-muted-foreground">
        Manage sign-in, password, and data export. Delete your account permanently below.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
          Change password
        </button>
        <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
          Export data
        </button>
        <button className="rounded-lg border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10">
          Delete account
        </button>
      </div>
    </Section>
  );
}
