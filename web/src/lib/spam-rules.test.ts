import { describe, expect, it } from "vitest";
import { exceedsLimit, isHoneypotFilled } from "./spam-rules";

describe("anti-spam", () => {
  it("honeypot vacío pasa, completo se bloquea", () => {
    const ok = new FormData();
    ok.set("website", "");
    const bot = new FormData();
    bot.set("website", "http://spam.example");
    expect(isHoneypotFilled(ok)).toBe(false);
    expect(isHoneypotFilled(bot)).toBe(true);
  });

  it("límite de envíos", () => {
    const opts = { limit: 5, windowMs: 1000 };
    expect(exceedsLimit(4, opts)).toBe(false);
    expect(exceedsLimit(5, opts)).toBe(true);
  });
});
