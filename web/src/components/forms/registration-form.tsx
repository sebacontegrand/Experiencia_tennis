"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, Hourglass } from "lucide-react";
import { registerAction, type RegistrationFormState } from "@/app/(site)/experiencias/[slug]/inscripcion/actions";
import { experiencesCopy } from "@/content/experiences";
import { communityCopy } from "@/content/pages";
import { formCopy, genderOptions, levelOptions, referralOptions } from "@/content/forms";
import { siteConfig, whatsappLink } from "@/config/site";
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
import { cn } from "@/lib/utils";

const c = experiencesCopy.registration;
const f = communityCopy.form.fields;
const toOptions = (values: readonly string[]) => values.map((v) => ({ value: v, label: v }));

type PriceOptionView = { id: string; label: string; price: string; isFull: boolean };

export function RegistrationForm({
  slug,
  title,
  isFull,
  askGender,
  menuOptions,
  priceOptions,
}: {
  slug: string;
  title: string;
  isFull: boolean;
  askGender: boolean;
  menuOptions: string[];
  priceOptions: PriceOptionView[];
}) {
  const [state, action, pending] = useActionState<RegistrationFormState, FormData>(registerAction.bind(null, slug), {
    status: "idle",
  });
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  useFocusFirstError(formRef, state.status === "error" ? state : { status: "idle" });
  useEffect(() => {
    if (state.status === "registered") {
      doneRef.current?.focus();
      doneRef.current?.scrollIntoView({ block: "start" });
    }
  }, [state]);

  if (state.status === "registered") {
    const waitlist = state.registrationStatus === "LISTA_ESPERA";
    const s = c.success[state.registrationStatus];
    const hasTransfer = Boolean(siteConfig.payments.transferAlias || siteConfig.payments.transferCbu);
    return (
      <div ref={doneRef} tabIndex={-1} role="status" className="scroll-mt-28 outline-none">
        {waitlist ? (
          <Hourglass aria-hidden className="size-10 text-gold-deep" />
        ) : (
          <CheckCircle2 aria-hidden className="size-10 text-gold-deep" />
        )}
        <h2 className="mt-4 font-serif text-4xl text-navy-900">{s.title}</h2>
        <p className="mt-3 text-lg text-ink">{s.text}</p>
        {!waitlist && (
          <div className="mt-8 rounded-sm bg-cream p-6">
            <h3 className="font-serif text-2xl text-navy-900">{c.payment.title}</h3>
            {hasTransfer ? (
              <>
                <p className="mt-2 text-ink">{c.payment.withAlias}</p>
                <dl className="mt-3 space-y-1 text-ink">
                  {siteConfig.payments.transferAlias && (
                    <div>
                      <dt className="inline font-medium">Alias: </dt>
                      <dd className="inline font-mono">{siteConfig.payments.transferAlias}</dd>
                    </div>
                  )}
                  {siteConfig.payments.transferCbu && (
                    <div>
                      <dt className="inline font-medium">CBU: </dt>
                      <dd className="inline font-mono">{siteConfig.payments.transferCbu}</dd>
                    </div>
                  )}
                  {siteConfig.payments.transferHolder && (
                    <div>
                      <dt className="inline font-medium">Titular: </dt>
                      <dd className="inline">{siteConfig.payments.transferHolder}</dd>
                    </div>
                  )}
                </dl>
              </>
            ) : (
              <p className="mt-2 text-ink">{c.payment.withoutAlias}</p>
            )}
          </div>
        )}
        <a
          href={whatsappLink(c.payment.whatsappMessage(title, state.firstName))}
          target="_blank"
          rel="noopener noreferrer"
          className="eyebrow mt-8 inline-flex h-12 items-center rounded-sm bg-navy-900 px-6 text-white transition hover:bg-navy-800"
        >
          {c.payment.whatsappCta}
        </a>
      </div>
    );
  }

  const values = state.status === "error" ? (state.values ?? {}) : {};
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const optionError = errors.priceOptionId;

  return (
    <form
      ref={formRef}
      key={state.status === "error" ? state.nonce : "initial"}
      action={action}
      noValidate
      className="relative flex flex-col gap-10"
    >
      {state.status === "error" && <FormAlert message={state.message} />}

      <fieldset className="flex flex-col gap-5">
        <legend className="font-serif text-3xl text-navy-900">{c.sections.you}</legend>
        <p className="text-xs text-ink-muted">{formCopy.requiredHint}</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="firstName" label={f.firstName} required autoComplete="given-name" defaultValue={values.firstName} error={errors.firstName} />
          <TextField name="lastName" label={f.lastName} required autoComplete="family-name" defaultValue={values.lastName} error={errors.lastName} />
          <TextField name="email" type="email" label={f.email} required autoComplete="email" inputMode="email" defaultValue={values.email} error={errors.email} />
          <TextField name="whatsapp" type="tel" label={f.whatsapp} required autoComplete="tel" inputMode="tel" hint={f.whatsappHint} defaultValue={values.whatsapp} error={errors.whatsapp} />
          <TextField name="city" label={f.city} autoComplete="address-level2" defaultValue={values.city} error={errors.city} />
          <TextField name="club" label={f.club} defaultValue={values.club} error={errors.club} />
          <SelectField name="level" label={f.level} placeholder={f.levelPlaceholder} options={toOptions(levelOptions)} defaultValue={values.level} error={errors.level} />
          {askGender && (
            <SelectField name="gender" label={f.gender} placeholder={f.genderPlaceholder} options={genderOptions} defaultValue={values.gender} error={errors.gender} />
          )}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className="font-serif text-3xl text-navy-900">{c.sections.experience}</legend>
        {priceOptions.length > 0 && (
          <div role="radiogroup" aria-labelledby="price-label" aria-describedby={optionError ? "price-hint price-error" : "price-hint"} aria-invalid={optionError ? true : undefined} className="flex flex-col gap-2">
            <p id="price-label" className="text-sm font-medium text-navy-900">
              {c.fields.priceOptionId}
              <span aria-hidden className="ml-0.5 text-gold-deep">*</span>
            </p>
            <p id="price-hint" className="text-xs text-ink-muted">
              {c.fields.priceOptionHint}
            </p>
            <div className="mt-1 grid gap-2.5 sm:grid-cols-2">
              {priceOptions.map((o) => (
                <label
                  key={o.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-sm border bg-white p-4 transition has-[:checked]:border-navy-900 has-[:checked]:bg-cream has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-gold/40",
                    optionError ? "border-destructive" : "border-input",
                  )}
                >
                  <input
                    type="radio"
                    name="priceOptionId"
                    value={o.id}
                    required
                    defaultChecked={values.priceOptionId === o.id}
                    className="mt-1 size-4 shrink-0 accent-navy-900"
                  />
                  <span className="flex flex-1 flex-col">
                    <span className="text-ink">{o.label}</span>
                    <span className="text-sm font-medium text-navy-900">
                      {o.price}
                      {o.isFull && !isFull && <span className="ml-2 font-normal text-ink-muted">· lista de espera</span>}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            {optionError && (
              <p id="price-error" className="text-sm text-destructive">
                {optionError}
              </p>
            )}
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="doublesPartner" label={c.fields.doublesPartner} hint={c.fields.doublesPartnerHint} defaultValue={values.doublesPartner} error={errors.doublesPartner} />
          <TextField name="roommate" label={c.fields.roommate} hint={c.fields.roommateHint} defaultValue={values.roommate} error={errors.roommate} />
          {menuOptions.length > 0 && (
            <SelectField
              name="menuChoice"
              label={c.fields.menuChoice}
              placeholder={c.fields.menuPlaceholder}
              options={toOptions(menuOptions)}
              defaultValue={values.menuChoice}
              error={errors.menuChoice}
            />
          )}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className="font-serif text-3xl text-navy-900">{c.sections.extra}</legend>
        <SelectField name="referralSource" label={f.referralSource} placeholder={f.referralPlaceholder} options={toOptions(referralOptions)} defaultValue={values.referralSource} error={errors.referralSource} />
        <TextAreaField name="notes" label={c.fields.notes} hint={c.fields.notesHint} defaultValue={values.notes} error={errors.notes} />
        <ConsentField error={errors.consent} defaultChecked={values.consent === "on"} />
      </fieldset>

      <Honeypot />
      <div>
        <SubmitButton pending={pending}>{isFull ? c.submitWaitlist : c.submit}</SubmitButton>
      </div>
    </form>
  );
}
