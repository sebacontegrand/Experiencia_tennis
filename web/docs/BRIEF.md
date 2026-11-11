# Prompt maestro para Claude Code — Web Experiencia Tenis

> 

---

Vas a construir la web de **Experiencia Tenis**, un emprendimiento argentino de experiencias de tenis organizadas, dirigido por Gabriela Bruno. Yo (Sebastián) soy el desarrollador. Leé todo este brief antes de escribir código.

## 0. Primeros pasos (hacelos en este orden)

1. Esta carpeta contiene material de referencia del negocio (PDF, DOCX, JPEG). Miralo para tomar textos, tono e identidad visual. **No lo borres ni lo modifiques.**
2. Copiá `logo-gabriela-bruno.png` a `web/public/brand/` (es el logo provisorio). Mové el resto del material a `_material/` y agregá `_material/` al `.gitignore`. Contiene presupuestos de proveedores nada de eso se publica ni se sube al repositorio.
3. Creá la app en la subcarpeta `web/` (el nombre de la carpeta raíz tiene un espacio y no sirve como nombre de paquete).
4. Guardá este brief en `web/docs/BRIEF.md` y creá `web/CLAUDE.md` con el resumen del stack, los comandos y las reglas de la sección 10.
5. Antes de programar, mostrame un plan de la Fase 1 y esperá mi OK.

## 1. El negocio

**Qué es.** Experiencia Tenis no vende "torneos": vende una **experiencia de tenis organizada**, donde el torneo es uno de los componentes. Propuesta de valor: tenis + competencia + encuentro social + gastronomía + bienestar + disfrute. El participante no organiza nada; Experiencia Tenis diseña y coordina todo.

**Estrategia actual (condiciona toda la web).** Primero construir una **comunidad / base de datos propia de jugadores** y **alianzas con clubes y hoteles**; después escalar las experiencias. Los "viajes de tenis" no son el centro del modelo. Por eso el objetivo número uno del sitio es **captar jugadores para la comunidad**, el segundo es **generar contactos de clubes, barrios privados y hoteles**, y el tercero es **inscribir a experiencias concretas**.

**Segmentos.** Mujeres y hombres adultos que juegan al tenis y buscan algo más que competir: grupos de amigos, parejas de tenis, jugadoras de clubes, grupos de profesores, comunidades de clubes y barrios privados. A futuro: empresas (experiencias corporativas).

**Relación con el cliente.** Personalizada y cercana, cupos limitados, seguimiento antes, durante y después del evento. Quien participa tiene que querer volver a la siguiente.

**Canales.** Instagram, WhatsApp, base de datos propia, clubes, profesores, hoteles, sponsors y ahora la web.

**Fuentes de ingreso** (cada una necesita su lugar en el sitio o en el modelo de datos):
1. Inscripción a experiencias
2. Packs con alojamiento
3. Experiencias de un día
4. Eventos privados para clubes
5. Eventos corporativos
6. Sponsors y marcas
7. Diseño y organización de experiencias para clubes y barrios privados

**Socios clave.** Clubes de tenis, hoteles, restaurantes, sponsors y marcas deportivas, agencias de viajes, profesionales de bienestar, gastronomía y entretenimiento.

### Los tres formatos

| Formato | Idea | Incluye |
|---|---|---|
| **Classic** | Un día para jugar, competir y compartir | Partidos organizados por nivel, coordinación profesional, encuentro social y gastronómico, premiación |
| **Gold** | Tenis, descanso y bienestar en una escapada | Torneo o encuentro + una noche de alojamiento con desayuno + bienestar + encuentro gastronómico |
| **Black** | La versión más completa | Dos noches o viaje a destino elegido, jornadas deportivas, gastronomía, bienestar, actividades sociales |

El tercer formato se llama **Black**; el dossier para hoteles lo llama "Premium", ignorá ese nombre. **Guardá los formatos como datos en la base, no como texto fijo en el código.**

### Modelo de alianza (para las páginas B2B)

- **Experiencia Tenis** aporta diseño, convocatoria, inscripciones, cobros, coordinación deportiva y atención al jugador.
- **El hotel** aporta tarifas de grupo, habitaciones, desayuno, gastronomía y bienestar. Gana ocupación en fechas flojas, clientes nuevos, más consumo y posicionamiento.
- **El club o barrio privado** aporta canchas y sede. Gana actividad para sus socios o propietarios, comunidad, y jugadores externos que conocen el lugar con ingreso organizado y cupo acordado.

### Primera experiencia: Villa Gesell (confirmada, formato Black)

Cargala en el seed como BORRADOR; se publica cuando el admin cargue el precio al público.

- Villa Gesell, 11 al 13 de diciembre de 2026, dos noches, cupo aproximado 25 personas
- Alojamiento: Tequendama Spa & Resort, dos categorías de habitación (Suite Resort y Classic Estándar), base single / doble / triple
- Cena grupal el sábado 12/12, con elección de menú entre opciones (hay opción vegetariana)
- Kit de bienvenida: bolsa, botella, toalla, pelota, snack y tarjeta
- Plan de lluvia: salón de usos múltiples

Los importes de los presupuestos en `_material/` son **costos netos de proveedores, no precios al público**. No los uses en el sitio. El precio de venta lo carga el admin; si está vacío se muestra "Consultar".

## 2. Stack

- **Next.js** (última versión estable, App Router, TypeScript estricto, Server Components por defecto, Server Actions para mutaciones)
- **Prisma** + **PostgreSQL** (Neon o Supabase en producción; `DATABASE_URL` por variable de entorno)
- **Tailwind CSS** + **shadcn/ui**
- **Zod** para validar todo lo que entra por formularios, en cliente y en servidor
- **Auth.js** para el panel admin (solo administradores; los jugadores no tienen cuenta en el MVP)
- **Resend** para emails transaccionales
- **Mercado Pago** (Checkout Pro) recién en la fase de pagos; antes, pago por transferencia confirmado a mano desde el admin
- Deploy en **Vercel**

Verificá las versiones actuales y la documentación vigente de cada librería antes de instalar; no asumas APIs de memoria.

## 3. Modelo de datos (Prisma)

Proponé el `schema.prisma` completo a partir de esto y mostrámelo antes de migrar:

- **User** — administradores (email, nombre, rol `ADMIN` | `EDITOR`)
- **Player** — la comunidad, el activo principal. Nombre, apellido, email (único), WhatsApp, ciudad, club o barrio, nivel/categoría, género, cómo nos conoció, consentimiento de comunicaciones (boolean + fecha), notas internas, timestamps
- **ExperienceFormat** — Classic / Gold / Black: slug, nombre, bajada, descripción, lista de beneficios, orden
- **Experience** — slug, título, formato, estado (`BORRADOR` | `PUBLICADA` | `CUPO_COMPLETO` | `FINALIZADA` | `CANCELADA`), fechas inicio/fin, destino, sede (→ Partner), hotel (→ Partner, opcional), cupo, descripción, itinerario por día, qué incluye, qué no incluye, plan de lluvia, fecha límite de inscripción, imagen de portada
- **PriceOption** — por experiencia: etiqueta (ej. "Base doble – Suite", "Sin alojamiento"), precio (nullable), moneda ARS, cupo opcional
- **Registration** — jugador, experiencia, opción de precio, estado (`PENDIENTE` | `SEÑADA` | `CONFIRMADA` | `LISTA_ESPERA` | `CANCELADA`), compañero/a de dobles, con quién comparte habitación, elección de menú, acompañantes, notas
- **Payment** — inscripción, monto, medio (`TRANSFERENCIA` | `EFECTIVO` | `MERCADO_PAGO`), estado, referencia externa, comprobante, fecha
- **Partner** — tipo (`CLUB` | `BARRIO` | `HOTEL` | `SPONSOR` | `GASTRONOMIA` | `BIENESTAR` | `AGENCIA`), nombre, logo, web, ciudad, visible en el sitio (boolean), notas internas
- **Lead** — contactos B2B y consultas: tipo (`CLUB` | `BARRIO` | `HOTEL` | `EMPRESA` | `SPONSOR` | `OTRO`), nombre, organización, email, WhatsApp, mensaje, estado (`NUEVO` | `CONTACTADO` | `EN_CONVERSACION` | `CERRADO`), notas
- **Testimonial** y **GalleryImage** — vinculables a una experiencia, para el contenido post-evento

Reglas: la inscripción hace *upsert* del `Player` por email (cada inscripto entra a la comunidad); el cupo se controla en una transacción y, si está completo, la inscripción queda en lista de espera; los precios se guardan como enteros.

## 4. Sitio público

Idioma: español rioplatense con voseo ("Jugá", "Sumate", "Elegí"). Tono cálido, cercano y cuidado, nunca corporativo.

| Ruta | Contenido | Llamado a la acción |
|---|---|---|
| `/` | Hero con la propuesta de valor → qué es (más que un torneo) → los tres formatos → próxima experiencia → cómo funciona → kit de bienvenida → comunidad y fotos → aliados → franja para clubes y hoteles → formulario de comunidad | Principal: **Sumate a la comunidad**. Secundario: Ver próximas experiencias |
| `/experiencias` | Los tres formatos explicados y comparados | Ver fechas |
| `/calendario` | Experiencias publicadas, próximas y pasadas | Inscribirme |
| `/experiencias/[slug]` | Detalle: fechas, sede, hotel, itinerario, qué incluye, opciones de precio, cupos restantes | Inscribirme / Lista de espera |
| `/experiencias/[slug]/inscripcion` | Formulario de inscripción y pantalla de confirmación con instrucciones de pago | — |
| `/comunidad` | Por qué sumarse + formulario (nombre, WhatsApp, email, ciudad, club, nivel) | Sumarme |
| `/clubes-y-barrios` | Propuesta Classic para clubes y barrios privados: qué ganan, cómo conviven torneo y socios, piloto de una fecha | Quiero ser sede |
| `/hoteles` | Alianza de turismo deportivo: beneficios, modelo de colaboración, piloto Gold | Conversemos |
| `/empresas` | Experiencias corporativas (página breve, "próximamente") | Consultar |
| `/sponsors` | Qué ofrece la comunidad a una marca | Quiero acompañar |
| `/nosotros` | Quiénes somos y Gabriela Bruno, dirección general y deportiva | — |
| `/contacto` | Formulario + botón de WhatsApp + Instagram | — |
| `/privacidad` | Política de privacidad (Ley 25.326 de datos personales) | — |

En todo el sitio: botón flotante de WhatsApp con mensaje prearmado, checkbox de consentimiento en cada formulario, protección anti-spam (honeypot + límite de envíos), metadatos y Open Graph por página, sitemap, y `schema.org/Event` en cada experiencia.

## 5. Panel admin (`/admin`, protegido)

- **Inicio:** jugadores en la comunidad, inscripciones por estado, leads nuevos, cupos de la próxima experiencia
- **Jugadores:** tabla con búsqueda y filtros (ciudad, club, nivel), ficha con historial de experiencias, exportar a CSV
- **Experiencias:** alta, edición, publicar/despublicar, opciones de precio, itinerario
- **Inscripciones:** por experiencia, cambio de estado, registrar pagos, pasar de lista de espera a confirmada, exportar nómina (para el hotel y para el ingreso al barrio)
- **Leads:** bandeja con estados y notas
- **Aliados, testimonios y galería**

Tiene que poder usarlo una persona no técnica desde el celular.

## 6. Identidad visual

La marca es la de **Gabriela Bruno**: monograma "GB" dorado sobre azul marino, con el nombre en mayúsculas espaciadas.

- **Logo:** `web/public/brand/logo-gabriela-bruno.png`. Es una captura de baja resolución para arrancar: usala a través de un componente `<Logo />` para reemplazarla por el vectorial cuando llegue, y no la escales por encima de su tamaño.
- **Colores:** azul marino profundo (aprox. `#041224`) como base, dorado (aprox. `#B98C4A`) como acento, blanco y crema para fondos claros. Definilos como tokens de Tailwind. El dorado va en detalles, líneas y títulos destacados, no en bloques grandes ni en texto chico sobre blanco (no llega a contraste AA).
- **Tipografía:** serif elegante para títulos y sans limpia en mayúsculas espaciadas para rótulos y navegación, con `next/font`.
- **Lema:** "El tenis nos reúne. La experiencia nos conecta." Lema secundario: "Jugá · Conectá · Viví".
- **Estilo:** sobrio y premium, líneas finas doradas como separadores, íconos de línea, mucho aire. Los flyers verdes de `_material/` sirven por sus textos, no por su paleta.
- **Fotos:** todavía no hay fotos reales. Usá imágenes ilustrativas (canchas de polvo de ladrillo, hotel, mesa compartida) centralizadas en un solo archivo de contenido para reemplazarlas después; no uses imágenes con personas que parezcan participantes reales ni testimonios inventados.
- **Marcas de terceros:** Wilson está autorizada (Gabriela es Wilson Advisor). Tequendama, Abril Sur y cualquier otra no se muestran hasta nuevo aviso.
- Mobile first: el tráfico llega de Instagram y WhatsApp.

## 7. Notificaciones

- Email al jugador al sumarse a la comunidad y al inscribirse (con datos de pago)
- Email al admin por cada inscripción y cada lead
- Email al jugador cuando su inscripción pasa a CONFIRMADA
- Enlaces `wa.me` con mensaje prearmado. No integres la API de WhatsApp en el MVP.

## 8. Decisiones ya tomadas

- **Alcance:** el sitio es solo de Experiencia Tenis. No incluye Gabriela Bruno Consulting.
- **Contacto público:** WhatsApp +54 9 11 2390 2736, email gabrielabrunotenis@gmail.com, e Instagram (usuario pendiente: `TODO(negocio)`). Cargalos en un único archivo de configuración.
- **Cobro:** transferencia y Mercado Pago, los dos. Transferencia desde la fase 2 (alias/CBU pendiente: `TODO(negocio)`), Mercado Pago en la fase 5.
- **Dominio:** a definir. Arrancamos con la URL de Vercel; la URL base del sitio sale de una variable de entorno.

## 9. Fases

Trabajamos por fases; **no empieces una fase sin que yo cierre la anterior**.

1. **Base + captación:** scaffold, schema, diseño base, home, `/comunidad`, `/contacto`, `/privacidad`, deploy
2. **Experiencias e inscripción:** formatos, calendario, detalle, inscripción con cupo y lista de espera, emails
3. **Admin:** auth y todo el panel
4. **B2B:** clubes y barrios, hoteles, empresas, sponsors, leads
5. **Pagos:** Mercado Pago con webhook
6. **Comunidad y crecimiento:** galería, testimonios, SEO, analítica, rendimiento

## 10. Reglas de trabajo

- Antes de cada fase mostrame el plan; al terminar, un resumen de lo hecho y cómo probarlo.
- Commits chicos con mensajes claros. Nunca subas `.env` ni `_material/`.
- Mantené `.env.example` al día.
- Todo el texto visible va en español; código, nombres de variables y commits en inglés.
- Los textos del sitio viven en archivos de contenido o en la base, no dispersos en componentes.
- Validación con Zod en el servidor siempre, aunque exista en el cliente.
- Si falta un dato del negocio (precio, logo, texto legal, contacto), **no lo inventes**: dejá un marcador `TODO(negocio)` y sumalo a `docs/PENDIENTES.md`.
- Accesibilidad: contraste AA, foco visible, formularios con labels.
- Tests para la lógica de cupos, lista de espera y estados de pago.
- Al final de cada fase: `lint`, `typecheck` y `build` sin errores.

Empezá por la sección 0.
