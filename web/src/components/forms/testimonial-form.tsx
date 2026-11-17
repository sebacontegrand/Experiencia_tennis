"use client";

import { useActionState, useEffect, useRef } from "react";
import { Heart } from "lucide-react";
import { submitTestimonial, type TestimonialFormState } from "@/app/(site)/opinar/[token]/actions";
import { testimonialCopy } from "@/content/testimonials";
import { formCopy } from "@/content/forms";
import { FormAlert, Honeypot, SubmitButton, TextAreaField, TextField } from "@/components/forms/fields";
import { useFocusFirstError } from "@/components/forms/use-focus-first-error";
import { track } from "@/lib/analytics";

const c = testimonialCopy.form;

export function TestimonialForm({
  token,
  defaults,
}: {
  token: string;
  defaults: { authorName: string; authorInfo?: string | null; quote?: string | null };
}) {
  const [state, action, pending] = useActionState<TestimonialFormState, FormData>(submitTestimonial.bind(null, token), { status: "idle" });
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  useFocusFirstError(formRef, state.status === "error" ? state : { status: "idle" });
  useEffect(() => {
    if (state.status === "sent") {
      doneRef.current?.focus();
      track("testimonial_sent");
    }
  }, [state]);

  if (state.status === "sent") {
    return (
      <div ref={doneRef} tabIndex={-1} role="status" className="outline-none">
        <Heart aria-hidden className="size-10 text-clay-deep" />
        <h2 className="mt-4 font-serif text-4xl text-forest-900">{c.sent.title}</h2>
        <p className="mt-3 text-lg text-ink">{c.sent.text}</p>
        {state.updated && <p className="mt-2 text-sm text-ink-muted">{c.updated}</p>}
      </div>
    );
  }

  const values = state.status === "error" ? (state.values ?? {}) : {};
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  return (
    <form ref={formRef} key={state.status === "error" ? state.nonce : "initial"} action={action} noValidate className="flex flex-col gap-5">
      {state.status === "error" && <FormAlert message={state.message} />}
      <p className="text-xs text-ink-muted">{formCopy.requiredHint}</p>
      <TextAreaField
        name="quote"
        label={c.quote}
        required
        maxLength={600}
        placeholder={c.quotePlaceholder}
        defaultValue={values.quote ?? defaults.quote ?? ""}
        error={errors.quote}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="authorName" label={c.name} hint={c.nameHint} required maxLength={60} defaultValue={values.authorName ?? defaults.authorName} error={errors.authorName} />
        <TextField name="authorInfo" label={c.info} placeholder={c.infoPlaceholder} maxLength={80} defaultValue={values.authorInfo ?? defaults.authorInfo ?? ""} error={errors.authorInfo} />
      </div>
      <label className="flex items-start gap-3 text-[0.9375rem] text-ink">
        <input type="checkbox" name="consent" required defaultChecked={values.consent === "on"} aria-invalid={errors.consent ? true : undefined} className="mt-1 size-5 shrink-0 accent-forest-900" />
        <span>
          {c.consent}
          {errors.consent && <span className="mt-1 block text-sm text-destructive">{errors.consent}</span>}
        </span>
      </label>
      <Honeypot />
      <div>
        <SubmitButton pending={pending}>{c.submit}</SubmitButton>
      </div>
    </form>
  );
}
