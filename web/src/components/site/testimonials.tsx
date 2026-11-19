import { Quote } from "lucide-react";
import { testimonialCopy as c } from "@/content/testimonials";
import { getExperienceTestimonials, getPublicTestimonials } from "@/lib/testimonials";
import { cn } from "@/lib/utils";

/**
 * Testimonios publicados (reales, aprobados en el panel). Sin testimonios no se muestra nada:
 * nunca hay textos de relleno.
 */
export async function Testimonials({ slug, tone = "light" }: { slug?: string; tone?: "light" | "dark" }) {
  const items = slug ? await getExperienceTestimonials(slug) : await getPublicTestimonials();
  if (items.length === 0) return null;
  const dark = tone === "dark";
  return (
    <section aria-labelledby="testimonios" className={cn("px-5 py-20 sm:px-8 sm:py-24", dark ? "bg-forest-900 text-white" : "bg-paper text-ink")}>
      <div className="mx-auto max-w-6xl">
        <h2 id="testimonios" className={cn("max-w-2xl font-serif text-4xl text-balance sm:text-5xl", dark ? "text-white" : "text-forest-900")}>
          {slug ? c.section.fromExperience : c.section.title}
        </h2>
        <div className="brand-rule mt-6" />
        <ul className={cn("mt-12 grid gap-6", items.length > 1 && "md:grid-cols-2", items.length > 2 && "lg:grid-cols-3")}>
          {items.map((t) => (
            <li key={t.id}>
              <figure className={cn("flex h-full flex-col rounded-sm p-7", dark ? "bg-forest-800" : "bg-cream")}>
                <Quote aria-hidden className={cn("size-7", dark ? "text-ball" : "text-clay")} />
                <blockquote className={cn("mt-4 flex-1 font-serif text-xl leading-relaxed", dark ? "text-white" : "text-forest-900")}>
                  {t.quote}
                </blockquote>
                <figcaption className={cn("mt-6 text-sm", dark ? "text-white/70" : "text-ink-muted")}>
                  <span className={cn("font-semibold", dark ? "text-white" : "text-forest-900")}>{t.authorName}</span>
                  {t.authorInfo && <>, {t.authorInfo}</>}
                  {!slug && t.experience && <span className="block">{t.experience.title}</span>}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
