import { NextResponse, type NextRequest } from "next/server";
import { sendPaymentReminders } from "@/lib/payment-reminders";

/** Cron diario de Vercel (vercel.json). Vercel manda `Authorization: Bearer <CRON_SECRET>`. */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await sendPaymentReminders();
  return NextResponse.json(result);
}
