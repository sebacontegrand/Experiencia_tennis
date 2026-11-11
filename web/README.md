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

1. **Vercel → Add New → Project**, importar el repo y poner **Root Directory = `web`**.
2. **Storage → Create Database → Neon** (Marketplace). Región: São Paulo si está disponible (la más cercana a Argentina).
3. **Connect Project**: marcar Development, Preview y Production. En *Create database branch for deployment* marcar **Preview** (cada preview usa su propia rama de la base). Sin prefijo.
   Esto carga `DATABASE_URL` (con pool) y `DATABASE_URL_UNPOOLED` (directa).
4. **Settings → Environment Variables**, agregar:

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Opcional: solo cuando haya dominio propio (si falta, se usa la URL de producción de Vercel) |
| `RATE_LIMIT_SALT` | String aleatorio largo (`openssl rand -hex 24`) |
| `RESEND_API_KEY` | API key de Resend (sin ella los emails solo se loguean) |
| `EMAIL_FROM` | Remitente verificado en Resend |
| `ADMIN_NOTIFY_EMAIL` | Casilla(s) para avisos, separadas por coma |

5. Redeploy. El script `vercel-build` corre `prisma migrate deploy` antes del build, así que las tablas se crean solas.
6. **Una sola vez**, cargar los datos iniciales en producción desde tu máquina:

```bash
DATABASE_URL="<DATABASE_URL_UNPOOLED de Neon>" npx prisma db seed
```
