import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/auth";
import { requireAdmin } from "@/lib/admin";
import { adminCopy } from "@/content/admin";

/** Todo lo que está en (panel) requiere sesión de administrador. */
export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <header className="border-b border-gold/30 bg-navy-900 text-white">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-4 px-4">
          <Link href="/admin/experiencias" className="eyebrow text-gold-light">
            {adminCopy.title} · Experiencia Tenis
          </Link>
          <Suspense fallback={null}>
            <UserMenu />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <Suspense fallback={<p className="text-ink-muted">Cargando…</p>}>
          <Gate>{children}</Gate>
        </Suspense>
      </main>
    </>
  );
}

async function Gate({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}

async function UserMenu() {
  const user = await requireAdmin();
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/admin/ingresar" });
      }}
      className="flex items-center gap-3"
    >
      <span className="hidden text-sm text-white/70 sm:inline">{user.name ?? user.email}</span>
      <button type="submit" className="text-sm text-white/90 underline underline-offset-4 hover:text-gold-light">
        {adminCopy.signOut}
      </button>
    </form>
  );
}
