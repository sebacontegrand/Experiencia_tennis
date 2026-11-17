import { describe, expect, it } from "vitest";
import { canLeaveTestimonial, suggestedName, testimonialFormSchema } from "./testimonial-rules";

describe("testimonialFormSchema", () => {
  const ok = { authorName: "  Laura   G. ", quote: "Una experiencia hermosa, conocí gente increíble y jugué un montón.", consent: "on" };
  it("limpia espacios y acepta datos válidos", () => {
    const r = testimonialFormSchema.safeParse({ ...ok, authorInfo: "" });
    expect(r.success).toBe(true);
    expect(r.data?.authorName).toBe("Laura G.");
    expect(r.data?.authorInfo).toBeUndefined();
  });
  it("exige permiso y un texto razonable", () => {
    expect(testimonialFormSchema.safeParse({ ...ok, consent: undefined }).success).toBe(false);
    expect(testimonialFormSchema.safeParse({ ...ok, quote: "Lindo" }).success).toBe(false);
    expect(testimonialFormSchema.safeParse({ ...ok, quote: "x".repeat(601) }).success).toBe(false);
    expect(testimonialFormSchema.safeParse({ ...ok, authorName: "L" }).success).toBe(false);
  });
});

describe("helpers", () => {
  it("suggestedName", () => {
    expect(suggestedName("Laura", "gómez")).toBe("Laura G.");
    expect(suggestedName("Laura", "")).toBe("Laura");
  });
  it("canLeaveTestimonial", () => {
    const past = new Date("2026-01-01"), future = new Date("2099-01-01");
    expect(canLeaveTestimonial("CONFIRMADA", past)).toBeNull();
    expect(canLeaveTestimonial("SENADA", past)).toBeNull();
    expect(canLeaveTestimonial("CONFIRMADA", future)).toBe("NOT_YET");
    expect(canLeaveTestimonial("PENDIENTE", past)).toBe("NOT_ALLOWED");
    expect(canLeaveTestimonial("CANCELADA", past)).toBe("NOT_ALLOWED");
  });
});
