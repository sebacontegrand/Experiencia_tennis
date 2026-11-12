import "server-only";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import type { ExperienceStatus } from "@/generated/prisma/client";
import { upsertPlayer } from "@/lib/players";
import type { PlayerFields } from "@/lib/player-data";
import {
  SEAT_HOLDING_STATUSES,
  decideStatus,
  fillsCapacity,
  registrationClosedReason,
  type ClosedReason,
} from "@/lib/registration-rules";

export type RegistrationRequest = {
  experienceSlug: string;
  player: PlayerFields;
  priceOptionId?: string;
  doublesPartner?: string;
  roommate?: string;
  menuChoice?: string;
  notes?: string;
};

export type RegistrationResult =
  | {
      ok: true;
      registrationId: string;
      status: "PENDIENTE" | "LISTA_ESPERA";
      playerCreated: boolean;
      experience: { id: string; slug: string; title: string; startDate: Date; endDate: Date };
      priceOption: { label: string; price: number | null } | null;
      filledCapacity: boolean;
    }
  | { ok: false; reason: "NOT_FOUND" | "INVALID_OPTION" | "INVALID_MENU" | ClosedReason }
  | { ok: false; reason: "DUPLICATE"; status: string };

type LockedExperience = {
  id: string;
  slug: string;
  title: string;
  status: ExperienceStatus;
  capacity: number;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date | null;
  menuOptions: string[];
};

/**
 * Inscribe a una persona respetando el cupo, aun con envíos simultáneos.
 *
 * Cómo: dentro de una transacción se bloquea la fila de la experiencia (SELECT … FOR UPDATE).
 * Una segunda inscripción a la misma experiencia espera ese bloqueo hasta el commit de la primera,
 * así que el conteo de lugares ocupados siempre ve las inscripciones anteriores.
 * Inscripciones a experiencias distintas no se bloquean entre sí.
 */
export async function registerForExperience(req: RegistrationRequest, now = new Date()): Promise<RegistrationResult> {
  return db.$transaction(
    async (tx) => {
      const [exp] = await tx.$queryRaw<LockedExperience[]>`
        SELECT id, slug, title, status, capacity, "startDate", "endDate", "registrationDeadline", "menuOptions"
        FROM "Experience"
        WHERE slug = ${req.experienceSlug}
        FOR UPDATE`;
      if (!exp) return { ok: false, reason: "NOT_FOUND" } as const;

      const closed = registrationClosedReason(exp, now);
      if (closed) return { ok: false, reason: closed } as const;

      // Opción de precio: obligatoria si la experiencia tiene opciones.
      const options = await tx.priceOption.findMany({
        where: { experienceId: exp.id },
        select: { id: true, label: true, price: true, capacity: true },
      });
      const option = req.priceOptionId ? options.find((o) => o.id === req.priceOptionId) : undefined;
      if ((options.length > 0 && !option) || (req.priceOptionId && !option)) {
        return { ok: false, reason: "INVALID_OPTION" } as const;
      }
      if (req.menuChoice && !exp.menuOptions.includes(req.menuChoice)) {
        return { ok: false, reason: "INVALID_MENU" } as const;
      }

      const { player, created } = await upsertPlayer(req.player, "INSCRIPCION", tx);

      const previous = await tx.registration.findUnique({
        where: { playerId_experienceId: { playerId: player.id, experienceId: exp.id } },
        select: { id: true, status: true },
      });
      if (previous && previous.status !== "CANCELADA") {
        return { ok: false, reason: "DUPLICATE", status: previous.status } as const;
      }

      const holding = { in: [...SEAT_HOLDING_STATUSES] };
      const taken = await tx.registration.count({ where: { experienceId: exp.id, status: holding } });
      const optionTaken =
        option?.capacity != null
          ? await tx.registration.count({ where: { priceOptionId: option.id, status: holding } })
          : 0;

      const status = decideStatus({
        taken,
        capacity: exp.capacity,
        optionTaken,
        optionCapacity: option?.capacity,
      });

      const data = {
        status,
        priceOptionId: option?.id ?? null,
        doublesPartner: req.doublesPartner ?? null,
        roommate: req.roommate ?? null,
        menuChoice: req.menuChoice ?? null,
        notes: req.notes ?? null,
      };
      // Una inscripción cancelada se reutiliza (la restricción única es persona + experiencia).
      const registration = previous
        ? await tx.registration.update({ where: { id: previous.id }, data, select: { id: true } })
        : await tx.registration.create({
            data: { ...data, playerId: player.id, experienceId: exp.id },
            select: { id: true },
          });

      const filledCapacity = status === "PENDIENTE" && fillsCapacity(taken, exp.capacity);
      if (filledCapacity && exp.status === "PUBLICADA") {
        await tx.experience.update({ where: { id: exp.id }, data: { status: "CUPO_COMPLETO" } });
      }

      return {
        ok: true,
        registrationId: registration.id,
        status,
        playerCreated: created,
        experience: { id: exp.id, slug: exp.slug, title: exp.title, startDate: exp.startDate, endDate: exp.endDate },
        priceOption: option ? { label: option.label, price: option.price } : null,
        filledCapacity,
      } as const;
    },
    { maxWait: 10_000, timeout: 15_000 },
  );
}

/** ¿El error es una violación de restricción única (p. ej. dos altas simultáneas del mismo email nuevo)? */
export function isUniqueViolation(err: unknown) {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}
