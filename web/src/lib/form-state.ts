/** Estado que devuelven las Server Actions de formularios públicos a useActionState. */
export type FormErrorState = {
  status: "error";
  message: string;
  fieldErrors?: Record<string, string>;
  /** Valores enviados, para no vaciar el formulario si hay error. */
  values?: Record<string, string>;
  /** Cambia en cada envío fallido: el formulario se remonta con los valores enviados. */
  nonce: string;
};

export type FormState = { status: "idle" } | { status: "success"; message?: string } | FormErrorState;

export const initialFormState: FormState = { status: "idle" };

export function formValues(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$ACTION") && key !== "website") out[key] = value;
  }
  return out;
}

export function formError(
  message: string,
  values?: Record<string, string>,
  fieldErrors?: Record<string, string>,
): FormErrorState {
  return { status: "error", message, values, fieldErrors, nonce: crypto.randomUUID() };
}
