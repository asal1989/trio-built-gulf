"use client";

import { createContext, useActionState, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { button } from "./ui";

/* Client-side form + feedback primitives for the admin panel. */

export type ActionState = { error?: string; ok?: string; fieldErrors?: Record<string, string>; id?: string } | undefined;

/* ----------------------------- Toasts ---------------------------------- */

type Toast = { id: number; kind: "success" | "error"; text: string };
const ToastCtx = createContext<(kind: Toast["kind"], text: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((kind: Toast["kind"], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-[min(92vw,22rem)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto rounded-lg border px-4 py-3 text-sm font-medium shadow-lg ${
              t.kind === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ----------------------------- Buttons --------------------------------- */

export function SubmitButton({
  children,
  pendingText = "Saving…",
  variant = "primary",
  small = false,
  className = "",
}: {
  children: ReactNode;
  pendingText?: string;
  variant?: "primary" | "teal" | "gold" | "secondary" | "danger" | "ghost";
  small?: boolean;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${button(variant, small)} ${className}`}>
      {pending ? pendingText : children}
    </button>
  );
}

/* ------------------------------ Forms ---------------------------------- */

export function Field({
  label,
  hint,
  error,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-navy/65">{label}</span>
      {children}
      {hint && !error ? <span className="mt-1 block text-xs text-navy/50">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}

/**
 * A <form> wired to a Server Action with inline error text and a toast on
 * success. Children render inside the form; use <SubmitButton/> to submit.
 */
export function ActionForm({
  action,
  children,
  className = "",
  successMessage,
  resetOnSuccess = false,
  onSuccess,
  encType,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: ReactNode;
  className?: string;
  successMessage?: string;
  resetOnSuccess?: boolean;
  onSuccess?: (state: NonNullable<ActionState>) => void;
  encType?: "multipart/form-data";
}) {
  const [state, formAction] = useActionState(action, undefined);
  const toast = useToast();
  const ref = useRef<HTMLFormElement>(null);
  const last = useRef<ActionState>(undefined);

  useEffect(() => {
    if (!state || state === last.current) return;
    last.current = state;
    if (state.ok) {
      toast("success", successMessage ?? state.ok);
      if (resetOnSuccess) ref.current?.reset();
      onSuccess?.(state);
    } else if (state.error) {
      toast("error", state.error);
    }
  }, [state, toast, successMessage, resetOnSuccess, onSuccess]);

  return (
    <form ref={ref} action={formAction} encType={encType} className={className}>
      {state?.error ? (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {children}
    </form>
  );
}

/** Field-level error lookup helper for ActionForm state. */
export const fieldError = (state: ActionState, name: string) => state?.fieldErrors?.[name];

/* ------------------------- Confirm + modal ----------------------------- */

export function ConfirmForm({
  action,
  message,
  title = "Are you sure?",
  confirmLabel = "Confirm",
  children,
  hidden,
  buttonClassName,
  danger = true,
}: {
  action: (formData: FormData) => Promise<void>;
  message: string;
  title?: string;
  confirmLabel?: string;
  children: ReactNode;
  /** Hidden inputs the action needs (id, etc.). */
  hidden?: Record<string, string>;
  buttonClassName?: string;
  danger?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" onClick={() => dialog.current?.showModal()} className={buttonClassName ?? button("danger", true)}>
        {children}
      </button>
      <dialog
        ref={dialog}
        className="w-[min(92vw,26rem)] rounded-xl border border-line bg-white p-0 text-navy shadow-2xl backdrop:bg-navy-950/50"
      >
        <form action={action} onSubmit={() => dialog.current?.close()} className="p-6">
          {Object.entries(hidden ?? {}).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <h3 className="font-display text-lg font-bold">{title}</h3>
          <p className="mt-2 text-sm text-navy/70">{message}</p>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => dialog.current?.close()} className={button("secondary", true)}>
              Cancel
            </button>
            <button type="submit" className={button(danger ? "danger" : "primary", true)}>
              {confirmLabel}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

export function Modal({
  trigger,
  title,
  children,
  triggerClassName,
  wide = false,
}: {
  trigger: ReactNode;
  title: string;
  children: (close: () => void) => ReactNode;
  triggerClassName?: string;
  wide?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = () => dialog.current?.close();
  return (
    <>
      <button type="button" onClick={() => dialog.current?.showModal()} className={triggerClassName ?? button("secondary", true)}>
        {trigger}
      </button>
      <dialog
        ref={dialog}
        className={`${wide ? "w-[min(94vw,42rem)]" : "w-[min(92vw,30rem)]"} max-h-[90vh] overflow-y-auto rounded-xl border border-line bg-white p-0 text-navy shadow-2xl backdrop:bg-navy-950/50`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h3 className="font-display text-base font-bold">{title}</h3>
          <button type="button" onClick={close} aria-label="Close" className="rounded p-1 text-navy/50 hover:bg-mist hover:text-navy">
            ✕
          </button>
        </div>
        <div className="p-5">{children(close)}</div>
      </dialog>
    </>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-navy/8 ${className}`} />;
}
