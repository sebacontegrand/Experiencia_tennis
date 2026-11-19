import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { TestimonialForm } from "@/components/forms/testimonial-form";
import { testimonialCopy as c } from "@/content/testimonials";
import { getTestimonialContext } from "@/lib/testimonials";
import { canLeaveTestimonial, suggestedName } from "@/lib/testimonial-rules";
import { isPayToken } from "@/lib/mercadopago-rules";

// Link personal (mismo token que el pago): se prerenderiza solo un casco y no se indexa.
export function generateStaticParams() {
  return [{ token: "__casco__" }];
}

export const metadata: Metadata = { title: c.form.title, robots: { index: false, follow: false } };

export default function OpinarPage({ params }: PageProps<"/opinar/[token]">) {
  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-cream" />}>
      <Opinar params={params} />
    </Suspense>
  );
}

async function Opinar({ params }: Pick<PageProps<"/opinar/[token]">, "params">) {
  await connection();
  const { token } = await params;
  if (!isPayToken(token)) notFound();
  const reg = await getTestimonialContext(token);
  if (!reg) notFound();
  const blocked = canLeaveTestimonial(reg.status, reg.experience.startDate);

  return (
    <section className="bg-cream px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-serif text-5xl leading-[1.02] font-light text-forest-900 sm:text-6xl">{blocked ? c.form[blocked === "NOT_YET" ? "notYet" : "notAllowed"].title : c.form.title}</h1>
        <div className="brand-rule mt-6" />
        {blocked ? (
          <p className="mt-6 text-lg text-ink">{c.form[blocked === "NOT_YET" ? "notYet" : "notAllowed"].text}</p>
        ) : (
          <>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink">{c.form.lead(reg.experience.title)}</p>
            <div className="mt-10 rounded-sm bg-paper p-6 sm:p-10">
              <TestimonialForm
                token={token}
                defaults={{
                  authorName: reg.testimonial?.authorName ?? suggestedName(reg.player.firstName, reg.player.lastName),
                  authorInfo: reg.testimonial?.authorInfo,
                  quote: reg.testimonial?.quote,
                }}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
