import type { Metadata } from "next";
import { Suspense } from "react";
import { signIn } from "@/auth";
import { adminCopy } from "@/content/admin";

export const metadata: Metadata = { title: "Ingresar" };

const c = adminCopy.login;

export default function LoginPage({ searchParams }: PageProps<"/admin/ingresar">) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-sm bg-white p-8 text-center shadow-sm">
        <p className="eyebrow text-gold-deep">Experiencia Tenis</p>
        <h1 className="mt-3 font-serif text-4xl text-navy-900">{c.title}</h1>
        <p className="mt-3 text-sm text-ink-muted">{c.text}</p>
        <Suspense fallback={null}>
          <LoginError searchParams={searchParams} />
        </Suspense>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/admin" });
          }}
          className="mt-8"
        >
          <button
            type="submit"
            className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-sm bg-navy-900 text-sm font-semibold text-white transition hover:bg-navy-800"
          >
            <GoogleMark /> {c.button}
          </button>
        </form>
      </div>
    </main>
  );
}

async function LoginError({ searchParams }: Pick<PageProps<"/admin/ingresar">, "searchParams">) {
  const { error } = await searchParams;
  if (!error) return null;
  return (
    <p role="alert" className="mt-6 rounded-sm border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
      {error === "AccessDenied" ? c.denied : c.error}
    </p>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-5">
      <path fill="#fff" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" />
      <path fill="#fff" opacity=".8" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" />
      <path fill="#fff" opacity=".6" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2z" />
      <path fill="#fff" opacity=".9" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.7 9.4 6 12 6z" />
    </svg>
  );
}
