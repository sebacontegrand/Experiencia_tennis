import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, CloudRain, Hotel, MapPin, Trophy, Users, X } from "lucide-react";
import { getLiveAvailability, type ExperienceDetail as Detail } from "@/lib/data/public";
import { experiencesCopy } from "@/content/experiences";
import { formatDate, formatDateRange, formatPrice } from "@/lib/format";
import { parseItinerary } from "@/lib/itinerary";
import { absoluteUrl, siteConfig, whatsappLink } from "@/config/site";
import { cn } from "@/lib/utils";
import { WhatsappIcon } from "@/components/icons/brand-icons";

const c = experiencesCopy.detail;

/**
 * Detalle de una experiencia. Lo usan la página pública y la vista previa del admin
 * (`preview`: muestra borradores y desactiva la inscripción).
 *
 * El contenido viene cacheado; lo que depende de los cupos (lugares, botón, opciones completas)
 * se renderiza en vivo dentro de <Suspense> con getLiveAvailability.
 */
export function ExperienceDetailView({ experience: e, preview = false }: { experience: Detail; preview?: boolean }) {
  const canRegister = !e.closedReason;
  const itinerary = parseItinerary(e.itinerary);
  const live = { experienceId: e.id };

  return (
    <>
      {!preview && (
        <Suspense fallback={null}>
          <EventJsonLd experience={e} />
        </Suspense>
      )}
      <section className="bg-navy-900 px-5 pt-12 pb-16 text-white sm:px-8 sm:pt-16 sm:pb-20">
        <div className="mx-auto max-w-6xl">
          <Link href="/calendario" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-gold-light">
            <ArrowLeft aria-hidden className="size-4" /> {c.back}
          </Link>
          <p className="eyebrow mt-8 text-gold">Experiencia {e.format.name}</p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.05] font-medium text-balance sm:text-6xl">{e.title}</h1>
          <div className="gold-rule mt-6" />
          {e.summary && <p className="mt-6 max-w-2xl text-lg text-white/80">{e.summary}</p>}

          <dl className="mt-10 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            <Fact icon={<CalendarDays />} label={c.when} value={formatDateRange(e.startDate, e.endDate)} />
            <Fact icon={<MapPin />} label={c.where} value={e.destination} />
            {e.venue && <Fact icon={<Trophy />} label={c.venue} value={e.venue.name} />}
            {e.hotel && <Fact icon={<Hotel />} label={c.hotel} value={e.hotel.name} />}
            <Fact
              icon={<Users />}
              label={c.capacity}
              value={
                <>
                  {c.capacityValue(e.capacity)}
                  {e.audience && <> · {experiencesCopy.audience[e.audience]}</>}
                  <Suspense fallback={<span className="mt-1 block h-5" />}>
                    <SeatsLine {...live} />
                  </Suspense>
                </>
              }
            />
          </dl>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            {canRegister ? (
              <Suspense fallback={<RegisterButton slug={e.slug} label={c.register} preview={preview} />}>
                <LiveRegisterButton slug={e.slug} preview={preview} {...live} />
              </Suspense>
            ) : (
              <p className="text-white/80">{c.closed}</p>
            )}
            <a
              href={whatsappLink(c.askMessage(e.title))}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-label inline-flex h-14 items-center justify-center rounded-sm border border-white/30 px-8 text-white transition hover:border-gold-light hover:text-gold-light"
            >
              {c.ask}
            </a>
          </div>
          {e.registrationDeadline && canRegister && (
            <p className="mt-4 text-sm text-white/70">{c.deadline(formatDate(e.registrationDeadline))}</p>
          )}
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-16">
            <p className="text-lg leading-relaxed text-ink">{e.description}</p>

            {itinerary.length > 0 && (
              <div>
                <SectionTitle>{c.itinerary}</SectionTitle>
                <ol className="mt-8 space-y-10">
                  {itinerary.map((day) => (
                    <li key={day.day}>
                      <h3 className="font-serif text-2xl text-navy-900">
                        {day.day}
                        {day.title && <span className="ml-3 font-sans text-sm text-ink-muted">{day.title}</span>}
                      </h3>
                      <ul className="mt-4 border-l border-gold/60">
                        {day.items.map((item) => (
                          <li key={item.text} className="relative py-2.5 pl-6 sm:flex sm:gap-6">
                            <span aria-hidden className="absolute top-[1.15rem] -left-[4px] size-[7px] rounded-full bg-gold" />
                            {item.time && (
                              <span className="block shrink-0 text-sm font-semibold text-gold-deep sm:w-28">{item.time}</span>
                            )}
                            <span className="text-ink">{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {(e.includes.length > 0 || e.excludes.length > 0) && (
              <div className="grid gap-10 sm:grid-cols-2">
                {e.includes.length > 0 && (
                  <List title={c.includes} items={e.includes} icon={<Check className="text-gold-deep" />} />
                )}
                {e.excludes.length > 0 && <List title={c.excludes} items={e.excludes} icon={<X className="text-ink-muted" />} />}
              </div>
            )}

            {e.rainPlan && (
              <div className="flex gap-4 rounded-sm bg-cream p-6">
                <CloudRain aria-hidden className="size-6 shrink-0 text-gold-deep" />
                <div>
                  <h2 className="font-serif text-2xl text-navy-900">{c.rainPlan}</h2>
                  <p className="mt-1 text-ink">{e.rainPlan}</p>
                </div>
              </div>
            )}
          </div>

          {e.priceOptions.length > 0 && (
            <aside aria-labelledby="precios" className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-sm border border-border p-7">
                <h2 id="precios" className="font-serif text-3xl text-navy-900">
                  {c.prices}
                </h2>
                <ul className="mt-6 divide-y divide-border">
                  {e.priceOptions.map((o) => (
                    <li key={o.id} className="flex items-baseline justify-between gap-4 py-3.5">
                      <span className="text-ink">{o.label}</span>
                      <span className="shrink-0 text-right font-medium text-navy-900">
                        <Suspense fallback={formatPrice(o.price)}>
                          <LiveOptionPrice optionId={o.id} price={o.price} {...live} />
                        </Suspense>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-ink-muted">{c.pricesNote}</p>
                {canRegister && !preview && (
                  <Suspense fallback={<RegisterButton slug={e.slug} label={c.register} variant="dark" />}>
                    <LiveRegisterButton slug={e.slug} variant="dark" {...live} />
                  </Suspense>
                )}
              </div>
            </aside>
          )}
        </div>
      </section>

      {canRegister && !preview && <StickyRegisterBar experience={e} />}
    </>
  );
}

/**
 * Barra fija en el celular: precio "desde", inscripción y WhatsApp siempre a mano mientras se lee.
 * Reemplaza al botón flotante de WhatsApp en esta página (ver globals.css).
 */
function StickyRegisterBar({ experience: e }: { experience: Detail }) {
  const prices = e.priceOptions.map((o) => o.price).filter((p): p is number => p != null);
  const from = prices.length > 0 ? Math.min(...prices) : null;
  return (
    <>
      {/* Espacio para que la barra no tape el final de la página */}
      <div aria-hidden className="h-24 bg-navy-950 md:hidden" />
      <div
        data-sticky-cta
        className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/30 bg-navy-900 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-white md:hidden"
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-white/70">{from == null ? c.priceAsk : c.priceFrom}</p>
            <p className="truncate font-semibold">{from == null ? formatPrice(null) : formatPrice(from)}</p>
          </div>
          <a
            href={whatsappLink(c.askMessage(e.title))}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${c.ask} (se abre en una nueva pestaña)`}
            className="inline-flex size-12 shrink-0 items-center justify-center rounded-sm border border-white/30 text-gold-light"
          >
            <WhatsappIcon size={22} />
          </a>
          <Suspense
            fallback={
              <Link href={`/experiencias/${e.slug}/inscripcion`} className={barButton}>
                {c.register}
              </Link>
            }
          >
            <LiveBarButton slug={e.slug} experienceId={e.id} />
          </Suspense>
        </div>
      </div>
    </>
  );
}

const barButton =
  "btn-label inline-flex h-12 shrink-0 items-center justify-center rounded-sm bg-gold px-5 text-navy-900 transition hover:bg-gold-light";

async function LiveBarButton({ slug, experienceId }: { slug: string; experienceId: string }) {
  const a = await getLiveAvailability(experienceId);
  return (
    <Link href={`/experiencias/${slug}/inscripcion`} className={barButton}>
      {a.isFull ? c.waitlistShort : c.register}
    </Link>
  );
}

type Live = { experienceId: string };

async function SeatsLine({ experienceId }: Live) {
  const a = await getLiveAvailability(experienceId);
  return <span className="mt-1 block text-sm text-gold-light">{a.isFull ? c.full : c.seatsLeft(a.left)}</span>;
}

async function LiveRegisterButton({
  slug,
  experienceId,
  preview,
  variant,
}: Live & { slug: string; preview?: boolean; variant?: "dark" }) {
  const a = await getLiveAvailability(experienceId);
  return <RegisterButton slug={slug} label={a.isFull ? c.waitlist : c.register} preview={preview} variant={variant} />;
}

function RegisterButton({ slug, label, preview, variant }: { slug: string; label: string; preview?: boolean; variant?: "dark" }) {
  if (preview) {
    return (
      <span className="btn-label inline-flex h-14 items-center justify-center rounded-sm border border-dashed border-gold px-8 text-gold-light">
        {label} (vista previa)
      </span>
    );
  }
  return (
    <Link
      href={`/experiencias/${slug}/inscripcion`}
      className={cn(
        "btn-label inline-flex items-center justify-center gap-2 rounded-sm transition",
        variant === "dark"
          ? "mt-6 flex h-12 bg-navy-900 text-white hover:bg-navy-800"
          : "h-14 bg-gold px-8 text-navy-900 hover:bg-gold-light",
      )}
    >
      {label} {variant !== "dark" && <ArrowRight aria-hidden className="size-4" />}
    </Link>
  );
}

async function LiveOptionPrice({ optionId, price, experienceId }: Live & { optionId: string; price: number | null }) {
  const a = await getLiveAvailability(experienceId);
  return a.fullOptionIds.includes(optionId) ? <span className="text-ink-muted">{c.optionFull}</span> : <>{formatPrice(price)}</>;
}

function Fact({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex gap-4">
      <span aria-hidden className="mt-0.5 text-gold [&_svg]:size-5">
        {icon}
      </span>
      <div>
        <dt className="eyebrow text-white/60">{label}</dt>
        <dd className="mt-1.5 text-lg text-white">{value}</dd>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <>
      <h2 className="font-serif text-3xl text-navy-900 sm:text-4xl">{children}</h2>
      <div className="gold-rule mt-4" />
    </>
  );
}

function List({ title, items, icon }: { title: string; items: string[]; icon: ReactNode }) {
  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-ink">
            <span aria-hidden className="mt-0.5 shrink-0 [&_svg]:size-5">
              {icon}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Datos estructurados schema.org/SportsEvent para buscadores (disponibilidad en vivo). */
async function EventJsonLd({ experience: e }: { experience: Detail }) {
  const a = await getLiveAvailability(e.id);
  const isFull = a.isFull;
  const url = absoluteUrl(`/experiencias/${e.slug}`);
  const priced = e.priceOptions.filter((o) => o.price != null);
  const data = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: e.title,
    description: e.summary ?? e.description,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate.toISOString(),
    eventStatus: e.status === "CANCELADA" ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    sport: "Tenis",
    url,
    location: {
      "@type": "Place",
      name: e.venue?.name ?? e.destination,
      address: { "@type": "PostalAddress", addressLocality: e.destination, addressCountry: "AR" },
    },
    organizer: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    ...(priced.length > 0 && {
      offers: priced.map((o) => ({
        "@type": "Offer",
        name: o.label,
        price: o.price,
        priceCurrency: o.currency,
        url,
        availability:
          isFull || a.fullOptionIds.includes(o.id) ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      })),
    }),
  };
  return (
    <script
      type="application/ld+json"
      // JSON serializado por nosotros; se escapa "<" para que no pueda cerrar el <script>.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
