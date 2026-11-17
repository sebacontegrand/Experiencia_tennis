import {
  Img,
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
import { paymentCopy } from "@/content/payments";

const colors = { forest: "#103C2D", ball: "#D3D93A", clay: "#B6462B", cream: "#EDE9D6", ink: "#1F2A24", muted: "#616160" };

function Layout({ preview, children }: { preview: string; children: ReactNode }) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: colors.cream, fontFamily: "Helvetica, Arial, sans-serif", margin: 0 }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", backgroundColor: "#ffffff" }}>
          <Section style={{ backgroundColor: colors.forest, padding: "24px 32px", textAlign: "center" }}>
            <Img
              src={absoluteUrl("/brand/logo-experiencia-tenis-light.png")}
              alt={siteConfig.name}
              width="150"
              height="93"
              style={{ margin: "0 auto" }}
            />
          </Section>
          <Section style={{ padding: "32px" }}>{children}</Section>
          <Hr style={{ borderColor: colors.clay, margin: "0 32px", width: "auto" }} />
          <Section style={{ padding: "20px 32px 32px" }}>
            <Text style={{ color: colors.muted, fontSize: 12, lineHeight: "18px", margin: 0 }}>
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

const h1 = { color: colors.forest, fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 400, margin: "0 0 16px" };
const p = { color: colors.ink, fontSize: 15, lineHeight: "24px", margin: "0 0 14px" };
const button = {
  backgroundColor: colors.forest,
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
  payUrl,
}: {
  firstName: string;
  status: "PENDIENTE" | "LISTA_ESPERA";
  title: string;
  dates: string;
  optionLabel?: string;
  price?: string;
  payment: PaymentInfo;
  whatsappHref: string;
  /** Link de pago con Mercado Pago (si está habilitado). */
  payUrl?: string;
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
      {status === "PENDIENTE" && payUrl && (
        <Section style={{ margin: "8px 0 20px" }}>
          <Text style={p}>{c.payOnline}</Text>
          <Button href={payUrl} style={button}>
            {paymentCopy.payCta}
          </Button>
        </Section>
      )}
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

export function PaymentApprovedEmail({
  firstName,
  title,
  dates,
  amount,
  operation,
  confirmed,
  whatsappHref,
  remaining,
  payUrl,
}: {
  firstName: string;
  title: string;
  dates: string;
  amount: string;
  operation: string;
  confirmed: boolean;
  whatsappHref: string;
  /** Saldo pendiente (pago en cuotas o seña) y link para pagarlo. */
  remaining?: string;
  payUrl?: string;
}) {
  const c = paymentCopy.email;
  return (
    <Layout preview={c.preview}>
      <Heading style={h1}>{emailCopy.registration.heading(firstName)}</Heading>
      <Text style={p}>{confirmed ? c.intro(title) : c.introPartial(title)}</Text>
      <Section style={{ backgroundColor: colors.cream, padding: "16px 20px", margin: "8px 0 20px" }}>
        <Text style={{ ...p, margin: "0 0 4px" }}>
          <strong>{emailCopy.registration.rows.dates}:</strong> {dates}
        </Text>
        <Text style={{ ...p, margin: "0 0 4px" }}>
          <strong>{c.rows.amount}:</strong> {amount}
        </Text>
        <Text style={{ ...p, margin: 0 }}>
          <strong>{c.rows.operation}:</strong> {operation}
        </Text>
      </Section>
      {!confirmed && remaining && (
        <Section style={{ margin: "8px 0 20px" }}>
          <Text style={p}>{c.remaining(remaining)}</Text>
          {payUrl && (
            <Button href={payUrl} style={{ ...button, backgroundColor: colors.clay }}>
              {c.payRest}
            </Button>
          )}
        </Section>
      )}
      <Section style={{ margin: "24px 0 8px" }}>
        <Button href={whatsappHref} style={button}>
          {c.cta}
        </Button>
      </Section>
    </Layout>
  );
}

export function ThankYouEmail({
  firstName,
  title,
  albumUrl,
  testimonialUrl,
  upcoming,
  calendarUrl,
}: {
  firstName: string;
  title: string;
  albumUrl?: string;
  testimonialUrl?: string;
  /** Solo para quienes aceptaron novedades. */
  upcoming: { title: string; dates: string; url: string }[];
  calendarUrl: string;
}) {
  const c = emailCopy.thankYou;
  return (
    <Layout preview={c.preview}>
      <Heading style={h1}>{emailCopy.registration.heading(firstName)}</Heading>
      <Text style={p}>{c.intro(title)}</Text>
      {albumUrl && (
        <Section style={{ margin: "8px 0 20px" }}>
          <Text style={p}>{c.photos}</Text>
          <Button href={albumUrl} style={button}>
            {c.photosCta}
          </Button>
        </Section>
      )}
      {testimonialUrl && (
        <Section style={{ margin: "8px 0 20px" }}>
          <Text style={p}>{c.testimonial}</Text>
          <Button href={testimonialUrl} style={{ ...button, backgroundColor: colors.clay }}>
            {c.testimonialCta}
          </Button>
        </Section>
      )}
      {upcoming.length > 0 && (
        <Section style={{ backgroundColor: colors.cream, padding: "16px 20px", margin: "8px 0 20px" }}>
          <Text style={{ ...p, fontWeight: 600, margin: "0 0 8px" }}>{c.upcoming}</Text>
          {upcoming.map((u) => (
            <Text key={u.url} style={{ ...p, margin: "0 0 6px" }}>
              <a href={u.url} style={{ color: colors.forest, fontWeight: 600 }}>
                {u.title}
              </a>{" "}
              · {u.dates}
            </Text>
          ))}
          <Text style={{ ...p, margin: "8px 0 0" }}>
            <a href={calendarUrl} style={{ color: colors.forest }}>
              {c.upcomingCta}
            </a>
          </Text>
        </Section>
      )}
      <Text style={p}>{c.signature}</Text>
    </Layout>
  );
}

export function PaymentReminderEmail({ firstName, title, deadline, balance, payUrl }: { firstName: string; title: string; deadline: string; balance: string; payUrl: string }) {
  const c = paymentCopy.reminder;
  return (
    <Layout preview={c.preview}>
      <Heading style={h1}>{emailCopy.registration.heading(firstName)}</Heading>
      <Text style={p}>{c.intro(title, deadline)}</Text>
      <Text style={{ ...p, fontWeight: 600 }}>{c.balance(balance)}</Text>
      <Section style={{ margin: "8px 0 20px" }}>
        <Button href={payUrl} style={button}>
          {c.cta}
        </Button>
      </Section>
      <Text style={{ ...p, fontSize: 13, color: colors.muted }}>{c.help}</Text>
    </Layout>
  );
}
