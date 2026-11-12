import "server-only";
import { db } from "@/lib/db";
import type { PlayerSource, Prisma } from "@/generated/prisma/client";
import type { CommunityInput } from "@/lib/validation";
import { buildPlayerUpdate, type PlayerFields } from "@/lib/player-data";

/**
 * Alta o actualización de un jugador por email (la comunidad es el activo principal).
 * No pisa datos existentes con campos vacíos ni cambia el origen original.
 */
export async function upsertPlayer(
  input: PlayerFields,
  source: PlayerSource,
  client: Prisma.TransactionClient = db,
) {
  const now = new Date();
  const existing = await client.player.findUnique({
    where: { email: input.email },
    select: { id: true, marketingConsent: true },
  });

  if (existing) {
    const player = await client.player.update({
      where: { id: existing.id },
      data: buildPlayerUpdate(input, existing.marketingConsent, now),
    });
    return { player, created: false };
  }

  const player = await client.player.create({
    data: {
      ...input,
      source,
      marketingConsent: input.marketingConsent,
      marketingConsentAt: input.marketingConsent ? now : null,
    },
  });
  return { player, created: true };
}

export function communityInputToPlayer(input: CommunityInput): PlayerFields {
  const { consent, ...rest } = input;
  return { ...rest, marketingConsent: consent === "on" };
}
