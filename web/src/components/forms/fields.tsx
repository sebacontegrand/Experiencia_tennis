import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { HONEYPOT_FIELD_NAME } from "@/lib/spam-rules";
import { formCopy } from "@/content/forms";

const controlClass =
  "h-12 rounded-sm border-input bg-white px-3.5 text-base md:text-base focus-visible:border-gold focus-visible:ring-gold/30";

type FieldProps = {
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
};

/** Label + control + ayuda + error, con los atributos ARIA conectados. */
export function Field({ name, label, required, hint, error, className, children }: FieldProps) {
  const id = `f-${name}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-medium text-navy-900">
        {label}
        {required && (
          <span aria-hidden className="ml-0.5 text-gold-deep">
            *
          </span>
        )}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && (
        <p id={hintId} className="text-xs text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

type Common = { name: string; label: string; required?: boolean; hint?: string; error?: string; className?: string };

export function TextField({
  name,
  label,
  required,
  hint,
  error,
  className,
  ...input
}: Common & Omit<ComponentProps<"input">, "name" | "id">) {
  return (
    <Field name={name} label={label} required={required} hint={hint} error={error} className={className}>
      {({ id, describedBy, invalid }) => (
        <Input
          id={id}
          name={name}
          required={required}
          aria-required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={controlClass}
          {...input}
        />
      )}
    </Field>
  );
}

export function TextAreaField({
  name,
  label,
  required,
  hint,
  error,
  className,
  ...textarea
}: Common & Omit<ComponentProps<"textarea">, "name" | "id">) {
  return (
    <Field name={name} label={label} required={required} hint={hint} error={error} className={className}>
      {({ id, describedBy, invalid }) => (
        <Textarea
          id={id}
          name={name}
          required={required}
          aria-required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn(controlClass, "min-h-36 py-3")}
          {...textarea}
        />
      )}
    </Field>
  );
}

/** Select nativo (mejor experiencia en celulares que un combo custom). */
export function SelectField({
  name,
  label,
  required,
  hint,
  error,
  className,
  placeholder,
  options,
  defaultValue,
}: Common & {
  placeholder?: string;
  options: readonly { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    <Field name={name} label={label} required={required} hint={hint} error={error} className={className}>
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          <select
            id={id}
            name={name}
            required={required}
            aria-required={required}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            defaultValue={defaultValue ?? ""}
            className={cn(
              "w-full appearance-none border border-input pr-10 text-ink outline-none focus-visible:ring-3 aria-invalid:border-destructive",
              controlClass,
            )}
          >
            {placeholder !== undefined && <option value="">{placeholder}</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted"
          />
        </div>
      )}
    </Field>
  );
}

export function ConsentField({ error, defaultChecked }: { error?: string; defaultChecked?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <input
          id="f-consent"
          type="checkbox"
          name="consent"
          required
          aria-required
          defaultChecked={defaultChecked}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "f-consent-error" : undefined}
          className="mt-0.5 size-5 shrink-0 accent-navy-900"
        />
        <label htmlFor="f-consent" className="text-sm leading-relaxed text-ink">
          {formCopy.consentLabel}{" "}
          <Link href="/privacidad" className="text-navy-900 underline underline-offset-2" target="_blank">
            {formCopy.consentLink}
          </Link>
          .
        </label>
      </div>
      {error && (
        <p id="f-consent-error" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/** Campo trampa anti-spam: invisible para personas y lectores de pantalla. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor="f-website">No completes este campo</label>
      <input id="f-website" type="text" name={HONEYPOT_FIELD_NAME} tabIndex={-1} autoComplete="off" />
    </div>
  );
}

export function FormAlert({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-sm border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      {message}
    </div>
  );
}

export function SubmitButton({ pending, children }: { pending: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="btn-label inline-flex h-14 w-full items-center justify-center rounded-sm bg-navy-900 px-8 text-white transition hover:bg-navy-800 disabled:opacity-60 sm:w-auto"
    >
      {pending ? formCopy.sending : children}
    </button>
  );
}
