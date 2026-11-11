import { describe, expect, it } from "vitest";
import { communitySchema, contactSchema, fieldErrors } from "./validation";

const validCommunity = {
  firstName: "  Ana ",
  lastName: "Pérez",
  email: "  Ana@Example.COM ",
  whatsapp: "11 2345-6789",
  city: "",
  club: "Club Náutico",
  level: "Intermedio",
  gender: "",
  referralSource: "Instagram",
  consent: "on",
};

describe("communitySchema", () => {
  it("normaliza email y recorta espacios; vacíos opcionales → undefined", () => {
    const r = communitySchema.parse(validCommunity);
    expect(r.email).toBe("ana@example.com");
    expect(r.firstName).toBe("Ana");
    expect(r.city).toBeUndefined();
    expect(r.gender).toBeUndefined();
    expect(r.club).toBe("Club Náutico");
  });

  it("exige consentimiento", () => {
    const r = communitySchema.safeParse({ ...validCommunity, consent: undefined });
    expect(r.success).toBe(false);
    if (!r.success) expect(fieldErrors(r.error).consent).toBeDefined();
  });

  it("rechaza WhatsApp con letras o demasiado corto", () => {
    for (const whatsapp of ["abc", "1234", "+54 9 11 2345 6789 1234 5"]) {
      const r = communitySchema.safeParse({ ...validCommunity, whatsapp });
      expect(r.success, whatsapp).toBe(false);
    }
  });

  it("acepta WhatsApp internacional", () => {
    expect(communitySchema.safeParse({ ...validCommunity, whatsapp: "+54 9 11 2390 2736" }).success).toBe(true);
  });

  it("rechaza valores fuera de las listas (nivel, género)", () => {
    expect(communitySchema.safeParse({ ...validCommunity, level: "Pro" }).success).toBe(false);
    expect(communitySchema.safeParse({ ...validCommunity, gender: "X" }).success).toBe(false);
  });

  it("devuelve un mensaje por campo", () => {
    const r = communitySchema.safeParse({ consent: "on" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const errs = fieldErrors(r.error);
      expect(Object.keys(errs)).toEqual(expect.arrayContaining(["firstName", "lastName", "email", "whatsapp"]));
    }
  });
});

describe("contactSchema", () => {
  const valid = { type: "HOTEL", name: "Laura", email: "l@hotel.com", whatsapp: "", message: "Hola", consent: "on" };

  it("WhatsApp es opcional pero, si viene, se valida", () => {
    expect(contactSchema.parse(valid).whatsapp).toBeUndefined();
    expect(contactSchema.safeParse({ ...valid, whatsapp: "xx" }).success).toBe(false);
  });

  it("solo acepta motivos conocidos", () => {
    expect(contactSchema.safeParse({ ...valid, type: "SPAM" }).success).toBe(false);
  });
});
