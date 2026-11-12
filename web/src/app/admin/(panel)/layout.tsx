import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/auth";
import { requireAdmin } from "@/lib/admin";
import { adminCopy } from "@/content/admin";
import { AdminNav, AdminNavView } from "@/components/admin/admin-nav";

/** Todo lo que está en (panel) requiere sesión de administrador. */
export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <header className="border-b border-gold/30 bg-navy-900 text-white">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-6 px-4">
          <Link href="/admin" className="flex items-baseline gap-2">
            <span className="font-serif text-lg text-white">{adminCopy.brand}</span>
            <span className="text-sm text-gold-light">{adminCopy.title}</span>
          </Link>
          <Suspense fallback={<AdminNavView variant="top" pathname="" />}>
            <AdminNav variant="top" />
          </Suspense>
          <div className="ml-auto">
            <Suspense fallback={null}>
              <UserMenu />
            </Suspense>
          </div>
        </div>
      </header>
      <Suspense fallback={<AdminNavView variant="bottom" pathname="" />}>
        <AdminNav variant="bottom" />
      </Suspense>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-8 pb-28 sm:pb-12">
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
      <span className="hidden text-sm text-white/70 lg:inline">{user.name ?? user.email}</span>
      <button type="submit" className="inline-flex h-11 items-center text-sm text-white/90 underline underline-offset-4 hover:text-gold-light">
        {adminCopy.signOut}
      </button>
    </form>
  );
}
