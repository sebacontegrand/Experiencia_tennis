# Experiencia Tenis — web

Sitio público y (desde la Fase 3) panel admin de Experiencia Tenis. Contexto y reglas: [`CLAUDE.md`](CLAUDE.md), brief completo en [`docs/BRIEF.md`](docs/BRIEF.md), datos del negocio que faltan en [`docs/PENDIENTES.md`](docs/PENDIENTES.md).

## Puesta en marcha local

Requisitos: Node 22 y PostgreSQL (por ejemplo `brew install postgresql@16`).

```bash
createdb experiencia_tenis
cp .env.example .env          # completar DATABASE_URL y RATE_LIMIT_SALT
npm install                   # también genera el cliente de Prisma
npx prisma migrate dev        # crea las tablas
npx prisma db seed            # formatos + Villa Gesell en BORRADOR
npm run dev                   # http://localhost:3000
```

Sin `RESEND_API_KEY`, los emails no se envían: se loguean en la consola como `[email:dev]`.

## Calidad

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

## Deploy (Vercel + Neon)

Variables de entorno en Vercel (ver `.env.example`):

| Variable | Valor |
|---|---|
| `DATABASE_URL` | URL de Neon (con `?sslmode=require`) |
| `NEXT_PUBLIC_SITE_URL` | URL del deploy, sin barra final |
| `RESEND_API_KEY` | API key de Resend |
| `EMAIL_FROM` | Remitente verificado en Resend |
| `ADMIN_NOTIFY_EMAIL` | Casilla(s) para avisos, separadas por coma |
| `RATE_LIMIT_SALT` | String aleatorio largo |

Las migraciones en producción se aplican con `npx prisma migrate deploy` (y una vez `npx prisma db seed`) apuntando a la base de Neon.
