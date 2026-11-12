/**
 * Da de alta (o actualiza) un administrador del panel.
 *   npm run admin:add -- gabriela@gmail.com "Gabriela Bruno"
 * Contra producción: anteponer DATABASE_URL="<url de Neon>".
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const [emailArg, ...nameParts] = process.argv.slice(2);
const email = emailArg?.trim().toLowerCase();
if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error('Uso: npm run admin:add -- email@dominio.com "Nombre Apellido"');
  process.exit(1);
}
const name = nameParts.join(" ").trim() || null;

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

db.user
  .upsert({ where: { email }, update: { role: "ADMIN", ...(name && { name }) }, create: { email, name, role: "ADMIN" } })
  .then((u) => console.log(`Administrador listo: ${u.email}${u.name ? ` (${u.name})` : ""}. Ya puede entrar con Google en /admin.`))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
