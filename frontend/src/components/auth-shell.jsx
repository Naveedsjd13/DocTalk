import { Link } from "react-router-dom";

export const AuthShell = ({
  title,
  subtitle,
  children,
  footer,
}) => (
  <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
    <div className="w-full max-w-sm">
      <Link to="/" className="mb-8 flex items-center justify-center gap-2">
        <div className="h-2 w-2 rounded-sm bg-primary" />
        <span className="font-display text-base font-semibold tracking-tight text-foreground">
          DocTalk
        </span>
      </Link>
      <div className="rounded-lg border border-border bg-card p-6 sm:p-7">
        <h1 className="font-display text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
      <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
    </div>
  </div>
);

export const FieldLabel = ({ children }) => (
  <span className="text-xs font-medium text-foreground">{children}</span>
);

export const TextInput = ({
  error,
  ...props
}) => (
  <>
    <input
      {...props}
      aria-invalid={error ? true : undefined}
      className="mt-1.5 h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 aria-[invalid=true]:border-destructive"
    />
    {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
  </>
);

export const PrimaryButton = ({
  children,
  ...rest
}) => (
  <button
    {...rest}
    className="mt-2 h-10 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
  >
    {children}
  </button>
);
