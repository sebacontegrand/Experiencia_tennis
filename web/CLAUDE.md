# Experiencia Tenis — web

Sitio y panel admin de **Experiencia Tenis** (Gabriela Bruno). Brief completo: [`docs/BRIEF.md`](docs/BRIEF.md). Datos del negocio faltantes: [`docs/PENDIENTES.md`](docs/PENDIENTES.md).

@AGENTS.md

## Objetivos del sitio (en orden)

1. Captar jugadores para la comunidad (`Player`)
2. Generar contactos B2B: clubes, barrios privados, hoteles (`Lead`)
3. Inscribir a experiencias concretas (`Registration`)

## Stack

- **Next.js 16** (App Router, TypeScript estricto, Server Components por defecto, Server Actions para mutaciones). Antes de usar una API de Next, leé `node_modules/next/dist/docs/`.
- **Prisma** + **PostgreSQL** (Neon en producción, `DATABASE_URL`)
- **Tailwind CSS 4** + **shadcn/ui**
- **Zod** para validar formularios en cliente y servidor
- **Auth.js** (solo administradores) — Fase 3
- **Resend** para emails transaccionales
- **Mercado Pago** Checkout Pro — Fase 5 (antes: transferencia confirmada a mano)
- Deploy en **Vercel**

## Comandos

```bash
npm run dev          # servidor de desarrollo
npm run build        # build de producción
npm run lint         # ESLint
npm run typecheck    # next typegen + tsc --noEmit
npm test             # tests unitarios (Vitest)
npm run test:db      # tests de cupo/concurrencia contra Postgres real (TEST_DATABASE_URL)
npm run admin:add -- email "Nombre"   # habilitar un administrador del panel
npx prisma migrate dev   # aplicar/crear migraciones en local
npx prisma db seed       # cargar datos iniciales (formatos, Villa Gesell en BORRADOR); idempotente
npx prisma studio        # explorar la base
```

## Estructura

- `src/app/(site)` — sitio público
- `src/app/admin` — panel admin (protegido)
- `src/config/site.ts` — contacto, redes, URL base, datos de pago (único lugar)
- `src/content/` — textos e imágenes ilustrativas del sitio
- `src/lib/` — lógica de dominio (cupos, emails, validaciones Zod, rate limit)
- `prisma/` — schema, migraciones y seed

## Reglas de trabajo

- Antes de cada fase, mostrar el plan; al terminar, resumen de lo hecho y cómo probarlo. No empezar una fase sin que Sebastián cierre la anterior.
- Commits chicos con mensajes claros (en inglés). Nunca subir `.env` ni `_material/`.
- Mantener `.env.example` al día.
- Todo el texto visible en español rioplatense con voseo ("Jugá", "Sumate"); código, variables y commits en inglés.
- Los textos del sitio viven en `src/content/` o en la base, no dispersos en componentes.
- Validación con Zod en el servidor siempre, aunque exista en el cliente.
- Si falta un dato del negocio (precio, logo, texto legal, contacto), **no inventarlo**: marcador `TODO(negocio)` y sumarlo a `docs/PENDIENTES.md`.
- Los importes de `_material/` son costos de proveedores: **nunca** se usan en el sitio. Precio vacío → "Consultar".
- Formatos (Classic / Gold / Black) como datos en la base, no hardcodeados. El tercero se llama **Black**, nunca "Premium".
- Marcas de terceros: Wilson en todo el sitio. Tequendama Spa & Resort y Villa Gesell Golf Club solo se nombran dentro de la experiencia de Villa Gesell (sin logos ni franja de aliados; autorizado 11/11). Abril Sur y otras no se muestran.
- Sin fotos de personas que parezcan participantes reales ni testimonios inventados. Hasta tener fotos reales: stock con licencia libre donde las personas no son el foco (`src/content/images.ts`, créditos ahí).
- Precios como enteros (ARS). Inscripción: upsert de `Player` por email; cupo controlado en transacción; si está completo → `LISTA_ESPERA`.
- Accesibilidad: contraste AA (dorado nunca en texto chico sobre blanco), foco visible, formularios con labels.
- Tests para la lógica de cupos, lista de espera y estados de pago.
- Al final de cada fase: `lint`, `typecheck` y `build` sin errores.

## Notas técnicas

- **Prisma 7**: la URL de la base está en `prisma.config.ts`; el cliente se genera en `src/generated/prisma` (gitignored, lo regenera `postinstall`/`build`). Importar desde `@/generated/prisma/client`; usar siempre `db` de `@/lib/db`.
- **Cache Components** activo: las lecturas públicas están en `src/lib/data/public.ts` con `"use cache"` + `cacheTag` (`formats`, `experiences`, `experience:<slug>`, `partners`). Al mutar desde el admin, invalidar con `updateTag(...)`. Las APIs de request (`searchParams`, `headers`) van dentro de `<Suspense>`.
  - `updateTag` desde una acción en *otra* ruta deja que la página entera cacheada de esta ruta se sirva vieja **una vez**. Por eso el detalle y la inscripción hacen `await connection()` (render por request, datos cacheados por tag) y los cupos se leen en vivo con `getLiveAvailability()`.
  - Cambios hechos fuera del admin (seed, SQL a mano) no invalidan el caché: tardan hasta 1 hora en verse.
- **Cupo**: `registerForExperience()` (`src/lib/registrations.ts`) bloquea la fila de la experiencia con `SELECT … FOR UPDATE` dentro de una transacción. Las reglas puras están en `registration-rules.ts`. `npm run test:db` prueba 30 inscripciones simultáneas.
- **Admin**: Auth.js + Google (`src/auth.ts`), sesiones en base. Solo entran emails existentes en `User`. `requireAdmin()` (`src/lib/admin.ts`) en cada página **y** cada Server Action; hace `await connection()` porque Auth.js usa valores aleatorios.
- **Inscripciones desde el panel**: `changeRegistrationStatus()` / `recordPayment()` (`src/lib/registration-admin.ts`) toman el mismo candado de fila que la inscripción pública. Cancelar libera el lugar y reabre una experiencia completa; dar lugar exige cupo. Reglas puras en `registration-admin-rules.ts`.
- **Costos y ganancia** (solo panel): `CostItem`, `PriceOption.cost`, `Experience.earningsPercent/expectedAttendance`. El % es margen sobre el precio final (`src/lib/pricing.ts`). Son datos internos: las lecturas públicas seleccionan campos explícitos (`src/lib/data/public.ts`); no usar `include` completo de `priceOptions` ahí.
- **Panel**: si un botón desaparece al cambiar el estado, su mensaje se pierde: dejar el formulario montado (o uno solo con varios botones, `StatusActions`). Constantes compartidas (clases, etc.) no se exportan desde módulos `"use client"`: llegan a los Server Components como referencia. Ver `src/components/admin/styles.ts`.
- **Formularios**: Server Action + `useActionState`; errores con `formError()` (`src/lib/form-state.ts`) para que el formulario se remonte con lo enviado. Anti-spam: honeypot + `checkRateLimit()` (tabla `RateLimitHit`).
- **Emails**: `sendEmail()` dentro de `after()`; sin `RESEND_API_KEY` se loguean en consola.
- El header no usa `backdrop-filter`: rompería el menú móvil (`position: fixed`).

