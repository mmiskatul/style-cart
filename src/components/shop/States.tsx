import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export function LoadingSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-sm border border-dashed border-border px-6 py-20 text-center">
      <h2 className="display text-2xl">{title}</h2>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="rounded-sm border border-destructive/30 bg-destructive/5 px-6 py-16 text-center">
      <h2 className="display text-2xl">Something went wrong</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {message ?? "We couldn't load this page. Please try again."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90"
        >
          Try again
        </button>
      )}
    </div>
  );
}
