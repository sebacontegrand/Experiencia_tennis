import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/auth";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { adminCopy } from "@/content/admin";
import { AdminNav, AdminNavView } from "@/components/admin/admin-nav";

/** Todo lo que está en (panel) requiere sesión de administrador. */
export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <header className="border-b border-gold/30 bg-navy-900 text-white">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-6 px-4">
          <Link href="/admin" className="flex shrink-0 items-baseline gap-2 whitespace-nowrap">
            <span className="font-serif text-lg text-white md:max-lg:hidden">{adminCopy.brand}</span>
            <span className="text-sm text-gold-light">{adminCopy.title}</span>
          </Link>
          <Suspense fallback={<AdminNavView variant="top" pathname="" />}>
            <NavWithBadges variant="top" />
          </Suspense>
          <div className="ml-auto">
            <Suspense fallback={null}>
              <UserMenu />
            </Suspense>
          </div>
        </div>
      </header>
      <Suspense fallback={<AdminNavView variant="bottom" pathname="" />}>
        <NavWithBadges variant="bottom" />
      </Suspense>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-8 pb-28 md:pb-12">
        <Suspense fallback={<p className="text-ink-muted">Cargando…</p>}>
          <Gate>{children}</Gate>
        </Suspense>
      </main>
    </>
  );
}

/** La barra con la burbuja de consultas sin responder (se actualiza con cada navegación o acción). */
async function NavWithBadges({ variant }: { variant: "top" | "bottom" }) {
  await requireAdmin();
  const leads = await db.lead.count({ where: { status: "NUEVO" } });
  return <AdminNav variant={variant} badges={{ leads }} />;
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
      <span className="hidden text-sm text-white/70 lg:inline">{user.name ?? user.email}</span>
      <button type="submit" className="inline-flex h-11 items-center text-sm text-white/90 underline underline-offset-4 hover:text-gold-light">
        {adminCopy.signOut}
      </button>
    </form>
  );
}
