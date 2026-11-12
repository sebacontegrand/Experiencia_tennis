# Pendientes del negocio

Datos que faltan para completar el sitio. En el código aparecen como `TODO(negocio)`.
No se inventan: hasta que lleguen, el sitio muestra un marcador neutro o "Consultar".

| # | Dato | Dónde impacta | Estado |
|---|---|---|---|
| 1 | Precio al público de Villa Gesell por tipo de habitación y base | Se carga desde el panel: `/admin/experiencias` → Opciones y precios. Vacío = «Consultar». Costos del presupuesto del 12/11 listos para cargar en Costos y ganancia (20 %, precio sugerido) | Pendiente (lo carga Sebastián/Gabriela en el panel) |
| 2 | ¿Villa Gesell es solo para mujeres o mixta? | Se elige en el panel (Datos → Para quién es). «Solo mujeres» oculta la pregunta de género | Pendiente (lo define Gabriela) |
| 3 | Usuario de Instagram | `src/config/site.ts` | ✅ `gabibruno_todotenis` (11/11) |
| 4 | Alias o CBU para transferencias (y titular) | `src/config/site.ts`, email de inscripción, pantalla de confirmación | Pendiente |
| 5 | Logo vectorial (SVG) o PNG de alta resolución | `public/brand/`, componente `<Logo />`. El actual mide 195×79 px | Pendiente |
| 6 | Confirmar que el email (gabrielabrunotenis@gmail.com) es el de esta web. WhatsApp: +54 9 11 5736 4407 (de Gabriela, confirmado 12/11) | `src/config/site.ts` | Email pendiente |
| 7 | Texto de "Quiénes somos" y foto de Gabriela | `/nosotros` | Pendiente |
| 8 | Condiciones de inscripción, seña y cancelación | Detalle de experiencia, inscripción, emails | Pendiente |
| 9 | Responsable de la base de datos para la política de privacidad (nombre/razón social, CUIT, domicilio) e inscripción ante la AAIP | `/privacidad` | Pendiente |
| 10 | Fotos reales de experiencias | `src/content/images.ts` | Pendiente |
| 11 | Email remitente y dominio verificado en Resend | Variables `EMAIL_FROM`, `RESEND_API_KEY` | Pendiente |
| 12 | Villa Gesell: qué **no** incluye (traslados, otras comidas…) y opciones exactas del menú de la cena. El cronograma ya está cargado (flyer del 11/11) | `prisma/seed.ts` / admin (Fase 3) | Pendiente |
| 13 | Casilla que recibe los avisos de nuevas altas y consultas | Variable `ADMIN_NOTIFY_EMAIL` | Pendiente |
| 14 | Emails de Google de quienes administran el panel | `npm run admin:add` contra la base de producción | ✅ Sebastián y Gabriela (12/11) |
| 15 | Villa Gesell: montos de los costos sin cifra en el presupuesto del 12/11 (seguro de accidente, profes, sonido, trofeos, banners y gota, tubos de pelotas, página web, Instagram) | Panel → Costos y ganancia. Mientras falten, el precio sugerido queda corto | Pendiente |
