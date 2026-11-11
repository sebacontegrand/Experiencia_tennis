"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import { sendContact } from "@/app/(site)/contacto/actions";
import { initialFormState } from "@/lib/form-state";
import { contactCopy } from "@/content/pages";
import { contactTopicOptions, contactTopicValues, formCopy } from "@/content/forms";
import {
  ConsentField,
  FormAlert,
  Honeypot,
  SelectField,
  SubmitButton,
  TextAreaField,
  TextField,
} from "@/components/forms/fields";
import { useFocusFirstError } from "@/components/forms/use-focus-first-error";

export function ContactForm({ defaultTopic }: { defaultTopic?: string }) {
  const [state, action, pending] = useActionState(sendContact, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const f = contactCopy.form.fields;

  useFocusFirstError(formRef, state);
  useEffect(() => {
    if (state.status === "success") successRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className="rounded-sm border border-gold/50 bg-white p-8 text-center outline-none">
        <CheckCircle2 aria-hidden className="mx-auto size-10 text-gold-deep" />
        <h3 className="mt-4 font-serif text-3xl text-navy-900">{contactCopy.form.successTitle}</h3>
        <p className="mx-auto mt-3 max-w-md text-ink-muted">{contactCopy.form.successText}</p>
      </div>
    );
  }

  const values = state.status === "error" ? (state.values ?? {}) : {};
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const topic =
    values.type ??
    ((contactTopicValues as readonly string[]).includes(defaultTopic ?? "") ? defaultTopic : "OTRO");

  return (
    <form
      ref={formRef}
      key={state.status === "error" ? state.nonce : `initial-${topic}`}
      action={action}
      noValidate
      className="relative flex flex-col gap-5"
    >
      {state.status === "error" && <FormAlert message={state.message} />}
      <p className="text-xs text-ink-muted">{formCopy.requiredHint}</p>

      <SelectField name="type" label={f.type} required options={contactTopicOptions} defaultValue={topic} error={errors.type} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="name" label={f.name} required autoComplete="name" defaultValue={values.name} error={errors.name} />
        <TextField name="organization" label={f.organization} hint={f.organizationHint} autoComplete="organization" defaultValue={values.organization} error={errors.organization} />
        <TextField name="email" type="email" label={f.email} required autoComplete="email" inputMode="email" defaultValue={values.email} error={errors.email} />
        <TextField name="whatsapp" type="tel" label={f.whatsapp} hint={f.whatsappHint} autoComplete="tel" inputMode="tel" defaultValue={values.whatsapp} error={errors.whatsapp} />
      </div>
      <TextAreaField name="message" label={f.message} required defaultValue={values.message} error={errors.message} />

      <ConsentField error={errors.consent} defaultChecked={values.consent === "on"} />
      <Honeypot />
      <div>
        <SubmitButton pending={pending}>{contactCopy.form.submit}</SubmitButton>
      </div>
    </form>
  );
}
