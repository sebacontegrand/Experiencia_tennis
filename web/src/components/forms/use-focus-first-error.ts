"use client";

import { useEffect, type RefObject } from "react";
import type { FormState } from "@/lib/form-state";

/** Tras un envío con errores, lleva el foco al primer campo inválido (o al aviso general). */
export function useFocusFirstError(formRef: RefObject<HTMLFormElement | null>, state: FormState) {
  useEffect(() => {
    if (state.status !== "error") return;
    const form = formRef.current;
    if (!form) return;
    const target =
      form.querySelector<HTMLElement>('[aria-invalid="true"]') ?? form.querySelector<HTMLElement>('[role="alert"]');
    if (target) {
      if (target.getAttribute("role") === "alert") target.tabIndex = -1;
      target.focus();
    }
  }, [formRef, state]);
}
