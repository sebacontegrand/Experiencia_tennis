"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import { joinCommunity } from "@/app/(site)/comunidad/actions";
import { initialFormState } from "@/lib/form-state";
import { whatsappLink } from "@/config/site";
import { communityCopy } from "@/content/pages";
import { formCopy, genderOptions, levelOptions, referralOptions } from "@/content/forms";
import { ConsentField, FormAlert, Honeypot, SelectField, SubmitButton, TextField } from "@/components/forms/fields";
import { useFocusFirstError } from "@/components/forms/use-focus-first-error";

const toOptions = (values: readonly string[]) => values.map((v) => ({ value: v, label: v }));

export function CommunityForm({ id = "comunidad-form" }: { id?: string }) {
  const [state, action, pending] = useActionState(joinCommunity, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const f = communityCopy.form.fields;

  useFocusFirstError(formRef, state);
  useEffect(() => {
    if (state.status === "success") successRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rounded-sm border border-gold/50 bg-white p-8 text-center outline-none"
      >
        <CheckCircle2 aria-hidden className="mx-auto size-10 text-gold-deep" />
        <h3 className="mt-4 font-serif text-3xl text-navy-900">{communityCopy.form.successTitle}</h3>
        <p className="mx-auto mt-3 max-w-md text-ink-muted">{communityCopy.form.successText}</p>
        <a
          href={whatsappLink("¡Hola! Me acabo de sumar a la comunidad de Experiencia Tenis.")}
          target="_blank"
          rel="noopener noreferrer"
          className="eyebrow mt-6 inline-flex h-12 items-center rounded-sm border border-navy-900 px-6 text-navy-900 transition hover:bg-navy-900 hover:text-white"
        >
          {communityCopy.form.successCta}
        </a>
      </div>
    );
  }

  const values = state.status === "error" ? (state.values ?? {}) : {};
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  return (
    <form
      id={id}
      ref={formRef}
      key={state.status === "error" ? state.nonce : "initial"}
      action={action}
      noValidate
      className="relative flex flex-col gap-5"
    >
      {state.status === "error" && <FormAlert message={state.message} />}
      <p className="text-xs text-ink-muted">{formCopy.requiredHint}</p>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="firstName" label={f.firstName} required autoComplete="given-name" defaultValue={values.firstName} error={errors.firstName} />
        <TextField name="lastName" label={f.lastName} required autoComplete="family-name" defaultValue={values.lastName} error={errors.lastName} />
        <TextField name="email" type="email" label={f.email} required autoComplete="email" inputMode="email" defaultValue={values.email} error={errors.email} />
        <TextField name="whatsapp" type="tel" label={f.whatsapp} required autoComplete="tel" inputMode="tel" hint={f.whatsappHint} defaultValue={values.whatsapp} error={errors.whatsapp} />
        <TextField name="city" label={f.city} autoComplete="address-level2" defaultValue={values.city} error={errors.city} />
        <TextField name="club" label={f.club} defaultValue={values.club} error={errors.club} />
        <SelectField name="level" label={f.level} placeholder={f.levelPlaceholder} options={toOptions(levelOptions)} defaultValue={values.level} error={errors.level} />
        <SelectField name="gender" label={f.gender} placeholder={f.genderPlaceholder} options={genderOptions} defaultValue={values.gender} error={errors.gender} />
        <SelectField name="referralSource" label={f.referralSource} placeholder={f.referralPlaceholder} options={toOptions(referralOptions)} defaultValue={values.referralSource} error={errors.referralSource} className="sm:col-span-2" />
      </div>

      <ConsentField error={errors.consent} defaultChecked={values.consent === "on"} />
      <Honeypot />
      <div>
        <SubmitButton pending={pending}>{communityCopy.form.submit}</SubmitButton>
      </div>
    </form>
  );
}
