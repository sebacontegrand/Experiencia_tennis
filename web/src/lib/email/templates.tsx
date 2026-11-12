import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";
import { siteConfig, whatsappLink, absoluteUrl } from "@/config/site";
import { emailCopy } from "@/content/emails";

const colors = { navy: "#041224", gold: "#B98C4A", cream: "#F7F3EC", ink: "#1E2A3A" };

function Layout({ preview, children }: { preview: string; children: ReactNode }) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: colors.cream, fontFamily: "Helvetica, Arial, sans-serif", margin: 0 }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", backgroundColor: "#ffffff" }}>
          <Section style={{ backgroundColor: colors.navy, padding: "28px 32px", textAlign: "center" }}>
            <Text
              style={{ color: colors.gold, letterSpacing: "0.3em", fontSize: 13, margin: 0, textTransform: "uppercase" }}
            >
              {siteConfig.name}
            </Text>
          </Section>
          <Section style={{ padding: "32px" }}>{children}</Section>
          <Hr style={{ borderColor: colors.gold, margin: "0 32px" }} />
          <Section style={{ padding: "20px 32px 32px" }}>
            <Text style={{ color: "#5B6573", fontSize: 12, lineHeight: "18px", margin: 0 }}>
              {siteConfig.tagline}
              <br />
              WhatsApp {siteConfig.contact.whatsappDisplay} · {siteConfig.contact.email}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const h1 = { color: colors.navy, fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 400, margin: "0 0 16px" };
const p = { color: colors.ink, fontSize: 15, lineHeight: "24px", margin: "0 0 14px" };
const button = {
  backgroundColor: colors.navy,
  color: "#ffffff",
  padding: "12px 22px",
  borderRadius: 6,
  fontSize: 14,
  textDecoration: "none",
};

export function WelcomeEmail({ firstName }: { firstName: string }) {
  const c = emailCopy.welcome;
  return (
    <Layout preview={c.preview}>
      <Heading style={h1}>{c.heading(firstName)}</Heading>
      {c.body.map((line) => (
        <Text key={line} style={p}>
          {line}
        </Text>
      ))}
      <Section style={{ margin: "24px 0 8px" }}>
        <Button href={whatsappLink(c.whatsappMessage)} style={button}>
          {c.cta}
        </Button>
      </Section>
      <Text style={{ ...p, fontSize: 12, color: "#5B6573", marginTop: 24 }}>
        {c.unsubscribe} <a href={absoluteUrl("/privacidad")}>{c.privacy}</a>.
      </Text>
    </Layout>
  );
}

export function AdminNoticeEmail({ title, rows }: { title: string; rows: [string, string | undefined | null][] }) {
  return (
    <Layout preview={title}>
      <Heading style={{ ...h1, fontSize: 22 }}>{title}</Heading>
      {rows
        .filter(([, v]) => v)
        .map(([k, v]) => (
          <Text key={k} style={{ ...p, margin: "0 0 6px" }}>
            <strong>{k}:</strong> {v}
          </Text>
        ))}
    </Layout>
  );
}

export function ContactReceivedEmail({ name }: { name: string }) {
  const c = emailCopy.contactReceived;
  return (
    <Layout preview={c.preview}>
      <Heading style={h1}>{c.heading(name)}</Heading>
      {c.body.map((line) => (
        <Text key={line} style={p}>
          {line}
        </Text>
      ))}
    </Layout>
  );
}

type PaymentInfo = { alias: string | null; cbu: string | null; holder: string | null };

export function RegistrationEmail({
  firstName,
  status,
  title,
  dates,
  optionLabel,
  price,
  payment,
  whatsappHref,
}: {
  firstName: string;
  status: "PENDIENTE" | "LISTA_ESPERA";
  title: string;
  dates: string;
  optionLabel?: string;
  price?: string;
  payment: PaymentInfo;
  whatsappHref: string;
}) {
  const c = emailCopy.registration;
  const hasTransfer = Boolean(payment.alias || payment.cbu);
  return (
    <Layout preview={c.preview[status]}>
      <Heading style={h1}>{c.heading(firstName)}</Heading>
      <Text style={p}>{c.intro[status](title)}</Text>
      <Section style={{ backgroundColor: colors.cream, padding: "16px 20px", margin: "8px 0 20px" }}>
        <Text style={{ ...p, fontWeight: 600, margin: "0 0 8px" }}>{c.summary}</Text>
        <Text style={{ ...p, margin: "0 0 4px" }}>
          <strong>{c.rows.dates}:</strong> {dates}
        </Text>
        {optionLabel && (
          <Text style={{ ...p, margin: "0 0 4px" }}>
            <strong>{c.rows.option}:</strong> {optionLabel}
          </Text>
        )}
        {price && (
          <Text style={{ ...p, margin: 0 }}>
            <strong>{c.rows.price}:</strong> {price}
          </Text>
        )}
      </Section>
      {status === "PENDIENTE" &&
        (hasTransfer ? (
          <>
            <Text style={p}>{c.paymentWithAlias}</Text>
            <Text style={{ ...p, margin: "0 0 4px" }}>
              {payment.alias && <>Alias: <strong>{payment.alias}</strong><br /></>}
              {payment.cbu && <>CBU: <strong>{payment.cbu}</strong><br /></>}
              {payment.holder && <>Titular: {payment.holder}</>}
            </Text>
          </>
        ) : (
          <Text style={p}>{c.paymentWithoutAlias}</Text>
        ))}
      <Section style={{ margin: "24px 0 8px" }}>
        <Button href={whatsappHref} style={button}>
          {c.cta}
        </Button>
      </Section>
    </Layout>
  );
}
