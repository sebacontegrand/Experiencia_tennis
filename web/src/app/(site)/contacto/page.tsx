import type { Metadata } from "next";
import { Suspense } from "react";
import { Mail } from "lucide-react";
import { Section, SectionHeading } from "@/components/site/section";
import { ContactForm } from "@/components/forms/contact-form";
import { InstagramIcon, WhatsappIcon } from "@/components/icons/brand-icons";
import { contactCopy as c } from "@/content/pages";
import { instagramLink, siteConfig, whatsappLink } from "@/config/site";

export const metadata: Metadata = {
  title: c.meta.title,
  description: c.meta.description,
  alternates: { canonical: "/contacto" },
  openGraph: { title: c.meta.title, description: c.meta.description, url: "/contacto" },
};

export default function ContactPage({ searchParams }: PageProps<"/contacto">) {
  const instagram = instagramLink();
  return (
    <>
      <section className="bg-navy-900 px-5 pt-14 pb-16 text-white sm:px-8 sm:pt-20 sm:pb-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading as="h1" tone="navy" eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
        </div>
      </section>
      <Section tone="cream" labelledBy="contact-form-title">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <h2 className="font-serif text-3xl text-navy-900">{c.channels.title}</h2>
            <div className="gold-rule mt-4" />
            <ul className="mt-8 space-y-6">
              <li>
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-4">
                  <WhatsappIcon size={24} className="mt-0.5 text-gold-deep" />
                  <span>
                    <span className="eyebrow block text-ink-muted">{c.channels.whatsapp}</span>
                    <span className="text-lg text-navy-900 group-hover:underline">{siteConfig.contact.whatsappDisplay}</span>
                  </span>
                </a>
              </li>
              <li>
                <a href={`mailto:${siteConfig.contact.email}`} className="group flex items-start gap-4">
                  <Mail aria-hidden className="mt-0.5 size-6 text-gold-deep" />
                  <span>
                    <span className="eyebrow block text-ink-muted">{c.channels.email}</span>
                    <span className="text-lg break-all text-navy-900 group-hover:underline">{siteConfig.contact.email}</span>
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-4">
                <InstagramIcon size={24} className="mt-0.5 text-gold-deep" />
                <span>
                  <span className="eyebrow block text-ink-muted">{c.channels.instagram}</span>
                  {instagram ? (
                    <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-lg text-navy-900 hover:underline">
                      @{siteConfig.contact.instagramUser}
                    </a>
                  ) : (
                    <span className="text-lg text-ink-muted">{c.channels.instagramPending}</span>
                  )}
                </span>
              </li>
            </ul>
          </div>
          <div className="rounded-sm bg-white p-6 sm:p-10">
            <h2 id="contact-form-title" className="font-serif text-3xl text-navy-900">
              {c.form.title}
            </h2>
            <div className="gold-rule mt-4 mb-8" />
            <Suspense fallback={<ContactForm />}>
              <ContactFormWithTopic searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </Section>
    </>
  );
}

/** Lee ?motivo=CLUB|HOTEL|... para preseleccionar el motivo (enlaces desde la home y el pie). */
async function ContactFormWithTopic({ searchParams }: { searchParams: PageProps<"/contacto">["searchParams"] }) {
  const { motivo } = await searchParams;
  return <ContactForm defaultTopic={typeof motivo === "string" ? motivo.toUpperCase() : undefined} />;
}
